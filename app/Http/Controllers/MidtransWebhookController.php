<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\EsimOrder; 
use App\Services\EsimAccessService;
use App\Services\VipResellerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request, EsimAccessService $esimService, VipResellerService $vipService)
    {
        $serverKey = config('services.midtrans.server_key');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashed !== $request->signature_key) {
            return response()->json(['message' => 'Invalid Signature'], 403);
        }

        try {
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            $notification = new \Midtrans\Notification();

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            
            Log::info('Midtrans Webhook Received', ['order_id' => $orderId, 'status' => $transactionStatus]);

            if (Str::startsWith($orderId, 'ESIM-')) {
                return $this->handleEsimOrder($notification, $esimService);
            } else {
                return $this->handleGameTransaction($notification, $vipService); 
            }

        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Error', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Logic Khusus eSIM
     */
    private function handleEsimOrder($notification, EsimAccessService $esimService)
    {
        $order = EsimOrder::with('package')->where('invoice_number', $notification->order_id)->first();

        if (!$order) {
            return response()->json(['message' => 'Esim Order not found'], 404);
        }

        $status = $notification->transaction_status;
        $type = $notification->payment_type;
        $fraud = $notification->fraud_status ?? null;

        $finalStatus = null;
        if ($status == 'capture') {
            $finalStatus = ($fraud == 'challenge') ? 'pending' : 'paid';
        } elseif ($status == 'settlement') {
            $finalStatus = 'paid';
        } elseif ($status == 'pending') {
            $finalStatus = 'pending';
        } elseif (in_array($status, ['deny', 'expire', 'cancel'])) {
            $finalStatus = 'failed';
        }

        if ($finalStatus) {
            $updateData = [
                'payment_status' => $finalStatus, 
                'payment_method' => $type,
                'midtrans_response' => json_decode(json_encode($notification->getResponse()), true)
            ];

            if ($finalStatus == 'paid') {
                $updateData['paid_at'] = now();
            }

            $order->update($updateData);

            if ($finalStatus == 'paid' && empty($order->api_order_no)) {
                $originalPrice = $order->package->price; 
                
                $apiResult = $esimService->orderEsim(
                    $order->invoice_number . '-' . time(),
                    $order->esim_package_code,
                    1,
                    $originalPrice 
                );

                if ($apiResult['success']) {
                    $order->update([
                        'api_order_no' => $apiResult['orderNo'],
                        'order_status' => 'processing'
                    ]);
                    Log::info("eSIM Ordered Successfully: " . $apiResult['orderNo']);
                } else {
                    Log::error("Failed to buy eSIM from API: " . ($apiResult['error'] ?? 'Unknown'));
                }
            }
        }

        return response()->json(['message' => 'eSIM Notification processed']);
    }

    /**
     * Logic Khusus Game Top Up 
     */
    private function handleGameTransaction($notification, VipResellerService $vipService)
    {
        $transaction = Transaction::with('item')->where('invoice_number', $notification->order_id)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Game Transaction not found'], 404);
        }

        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status ?? null;
        $paymentType = $notification->payment_type;

        $newStatus = null;
        if ($transactionStatus == 'capture') {
            $newStatus = ($fraudStatus == 'challenge') ? 'pending' : 'paid';
        } elseif ($transactionStatus == 'settlement') {
            $newStatus = 'paid';
        } elseif ($transactionStatus == 'pending') {
            $newStatus = 'pending';
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $newStatus = 'failed';
        }

        if ($newStatus) {
            
            $updateData = [
                'status' => $newStatus,
                'payment_method' => $paymentType,
                'midtrans_order_id' => $notification->transaction_id,
                'midtrans_response' => json_decode(json_encode($notification->getResponse()), true),
            ];

            if ($newStatus === 'paid') {
                $updateData['paid_at'] = now();
            }

            $transaction->update($updateData);
            if ($newStatus == 'paid' && empty($transaction->api_trx_id)) {
                
                Log::info("Game Paid ({$transaction->invoice_number}). Ordering to VIP...");

                $item = $transaction->item;

                if ($item && $item->api_code) {
         
                    $vipResult = $vipService->placeOrder(
                        $item->api_code,       
                        $transaction->game_user_id, 
                        $transaction->game_zone_id 
                    );

                    if (($vipResult['result'] ?? false) == true) {
                
                        $transaction->update([
                            'status' => 'processing',
                            'api_trx_id' => $vipResult['data']['trxid'],
                            'api_note' => $vipResult['message'] ?? 'Proses API Berhasil'
                        ]);
                        Log::info("VIP Order Success: " . $vipResult['data']['trxid']);
                    } else {
                 
                        $errorMsg = $vipResult['message'] ?? 'Unknown Error';
                        Log::error("VIP Order Failed: " . $errorMsg);
                        $transaction->update(['api_note' => "API Error: $errorMsg"]);
                    }
                } else {
                    Log::warning("Skipping VIP Order: Item/API Code missing.");
                }
            }
        }

        return response()->json(['message' => 'Game Notification processed']);
    }


    private function updateTransaction($transaction, $status, $notification, $paymentType)
    {
        $updateData = [
            'status' => $status,
            'payment_method' => $paymentType,
            'midtrans_order_id' => $notification->transaction_id,
            'midtrans_response' => json_encode($notification->getResponse()), 
        ];

        if ($status === 'paid') {
            $updateData['paid_at'] = now();
        }

        $transaction->update($updateData);
    }
}