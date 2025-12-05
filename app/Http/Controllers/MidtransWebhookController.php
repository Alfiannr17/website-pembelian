<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{


 
    public function handle(Request $request)
    
    {

        $serverKey = config('services.midtrans.server_key');
$hashed = hash("sha512", $request->order_id.$request->status_code.$request->gross_amount.$serverKey);

if ($hashed !== $request->signature_key) {
    return response()->json(['message' => 'Invalid Signature'], 403);
}

        try {
            // Set Midtrans configuration
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');

            // Create notification object
            $notification = new \Midtrans\Notification();

            // Log webhook received
            Log::info('Midtrans Webhook Received', [
                'order_id' => $notification->order_id,
                'transaction_status' => $notification->transaction_status,
                'payment_type' => $notification->payment_type,
                'fraud_status' => $notification->fraud_status ?? null,
            ]);

            // Get transaction from database
            $transaction = Transaction::where('invoice_number', $notification->order_id)->first();

            if (!$transaction) {
                Log::error('Transaction not found', ['order_id' => $notification->order_id]);
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Get transaction status
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status ?? null;
            $paymentType = $notification->payment_type;



            // Handle different transaction statuses
            switch ($transactionStatus) {
                case 'capture':
                    if ($fraudStatus == 'challenge') {
                        // Challenge by FDS, mark as pending
                        $this->updateTransaction($transaction, 'pending', $notification, $paymentType);
                    } else if ($fraudStatus == 'accept') {
                        // Captured and verified
                        $this->updateTransaction($transaction, 'paid', $notification, $paymentType);
                    }
                    break;

                case 'settlement':
                    // Transaction settled/completed
                    $this->updateTransaction($transaction, 'paid', $notification, $paymentType);
                    break;

                case 'pending':
                    // Transaction pending
                    $this->updateTransaction($transaction, 'pending', $notification, $paymentType);
                    break;

                case 'deny':
                    // Transaction denied
                    $this->updateTransaction($transaction, 'failed', $notification, $paymentType);
                    break;

                case 'expire':
                    // Transaction expired
                    $this->updateTransaction($transaction, 'expired', $notification, $paymentType);
                    break;

                case 'cancel':
                    // Transaction cancelled
                    $this->updateTransaction($transaction, 'failed', $notification, $paymentType);
                    break;

                default:
                    Log::warning('Unknown transaction status', [
                        'status' => $transactionStatus,
                        'order_id' => $notification->order_id
                    ]);
                    break;
            }

            return response()->json(['message' => 'Notification processed successfully']);

        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error processing notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update transaction with new status
     */
   private function updateTransaction($transaction, $status, $notification, $paymentType)
{
    $oldStatus = $transaction->status;

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

    Log::info('Transaction updated', [
        'invoice_number' => $transaction->invoice_number,
        'old_status' => $oldStatus,
        'new_status' => $status,
        'payment_type' => $paymentType,
    ]);
}

}