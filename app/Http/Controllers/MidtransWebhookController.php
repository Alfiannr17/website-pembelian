<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\EsimOrder; // Import Model eSIM
use App\Services\EsimAccessService; // Import Service eSIM
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request, EsimAccessService $esimService)
    {
        $serverKey = config('services.midtrans.server_key');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashed !== $request->signature_key) {
            return response()->json(['message' => 'Invalid Signature'], 403);
        }

        try {
            // Set Config
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            $notification = new \Midtrans\Notification();

            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type;

            Log::info('Midtrans Webhook Received', ['order_id' => $orderId, 'status' => $transactionStatus]);

            // ========================================================
            // LOGIC CABANG: CEK APAKAH INI ESIM ATAU GAME?
            // ========================================================
            
            if (Str::startsWith($orderId, 'ESIM-')) {
                // --- HANDLE ESIM ORDER ---
                return $this->handleEsimOrder($notification, $esimService);
            } else {
                // --- HANDLE GAME TOP UP (Existing Logic) ---
                return $this->handleGameTransaction($notification);
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

        // 1. Tentukan Status Pembayaran
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
            // 2. Update Status Pembayaran di DB
            $updateData = [
                'payment_status' => $finalStatus,
                'payment_method' => $type,
                'midtrans_response' => (array)$notification->getResponse() // Cast ke array
            ];

            if ($finalStatus == 'paid') {
                $updateData['paid_at'] = now();
            }

            $order->update($updateData);

            // 3. LOGIC BELI KE API (JIKA PAID & BELUM BELI)
            if ($finalStatus == 'paid' && empty($order->api_order_no)) {
                Log::info("eSIM Paid ($order->invoice_number). Buying from API...");

                $apiTxId = $order->invoice_number . '-' . time();

                // PERBAIKAN UTAMA DISINI:
                // Gunakan $order->package->price (0.7), JANGAN $order->amount (11200)
                $apiResult = $esimService->orderEsim(
                    $apiTxId,
                    $order->esim_package_code,
                    1,
                    $order->package->price // <--- INI KUNCINYA (USD)
                );

                if ($apiResult['success']) {
                    $order->update([
                        'api_order_no' => $apiResult['orderNo'],
                        'order_status' => 'processing'
                    ]);
                    Log::info("eSIM Ordered Successfully via Webhook: " . $apiResult['orderNo']);
                } else {
                    Log::error("Failed to buy eSIM API: " . ($apiResult['error'] ?? 'Unknown'));
                }
            }
        }

        return response()->json(['message' => 'eSIM Notification processed']);
    }

    /**
     * Logic Khusus Game Top Up (Kode Lama Anda dipindah ke sini)
     */
    private function handleGameTransaction($notification)
    {
        $transaction = Transaction::where('invoice_number', $notification->order_id)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Game Transaction not found'], 404);
        }

        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status ?? null;
        $paymentType = $notification->payment_type;

        switch ($transactionStatus) {
            case 'capture':
                if ($fraudStatus == 'challenge') {
                    $this->updateTransaction($transaction, 'pending', $notification, $paymentType);
                } else if ($fraudStatus == 'accept') {
                    $this->updateTransaction($transaction, 'paid', $notification, $paymentType);
                }
                break;
            case 'settlement':
                $this->updateTransaction($transaction, 'paid', $notification, $paymentType);
                break;
            case 'pending':
                $this->updateTransaction($transaction, 'pending', $notification, $paymentType);
                break;
            case 'deny':
            case 'cancel':
                $this->updateTransaction($transaction, 'failed', $notification, $paymentType);
                break;
            case 'expire':
                $this->updateTransaction($transaction, 'expired', $notification, $paymentType);
                break;
        }

        return response()->json(['message' => 'Game Notification processed']);
    }

    private function updateTransaction($transaction, $status, $notification, $paymentType)
    {
        $updateData = [
            'status' => $status,
            'payment_method' => $paymentType,
            'midtrans_order_id' => $notification->transaction_id,
            'midtrans_response' => $notification->getResponse(),
        ];

        if ($status === 'paid') {
            $updateData['paid_at'] = now();
        }

        $transaction->update($updateData);
    }
}