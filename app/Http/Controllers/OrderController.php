<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\CoreApi;

class OrderController extends Controller
{
  
    public function show(Game $game)
    {
        $game->load(['items' => function($query) {
            $query->where('is_active', true)->where('stock', '>', 0);
        }]);

        return Inertia::render('Order/Show', [
            'game' => $game,
        ]);
    }

    public function process(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'item_id' => 'required|exists:items,id',
            'game_user_id' => 'required|string',
            'email' => 'required|email',
            'payment_method' => 'required|string',
        ]);

        $item = \App\Models\Item::findOrFail($validated['item_id']);

        $invoice_number = 'INV-' . strtoupper(Str::random(10));

 
        $transaction = Transaction::create([
            'invoice_number' => $invoice_number,
            'user_id' => auth()->id(),
            'game_id' => $validated['game_id'],
            'item_id' => $validated['item_id'],
            'game_user_id' => $validated['game_user_id'],
            'email' => $validated['email'],
            'amount' => $item->price,
            'payment_method' => $validated['payment_method'],
            'status' => 'pending',
        ]);

  
        $this->processMidtransCoreApi($transaction);

        return redirect()->route('invoice.show', $invoice_number);
    }

    public function invoice($invoice_number)
    {
        $transaction = Transaction::with(['game', 'item'])
            ->where('invoice_number', $invoice_number)
            ->firstOrFail();


        $payment_info = $transaction->midtrans_response;

        return Inertia::render('Order/Invoice', [
            'transaction' => $transaction,
            'paymentInfo' => $payment_info, 
        ]);
    }

    private function processMidtransCoreApi($transaction)
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $params = [
            'payment_type' => $this->getPaymentType($transaction->payment_method),
            'transaction_details' => [
                'order_id' => $transaction->invoice_number,
                'gross_amount' => (int) $transaction->amount,
            ],
            'customer_details' => [
                'email' => $transaction->email,
                'first_name' => $transaction->user->name ?? 'Guest',
            ],
            'item_details' => [[
                'id' => $transaction->item_id,
                'price' => (int) $transaction->amount,
                'quantity' => 1,
                'name' => $transaction->item->name,
            ]],
        ];

        $params = array_merge($params, $this->getPaymentSpecificParams($transaction->payment_method));

        try {
            $response = CoreApi::charge($params);
            
            $transaction->update([
                'midtrans_response' => $response,
           
            ]);
            
        } catch (\Exception $e) {
  
            $transaction->update(['status' => 'failed']);
        }
    }

    private function getPaymentType($method)
    {
        if ($method == 'qris') return 'qris';
        if (in_array($method, ['bca_va', 'bni_va', 'bri_va'])) return 'bank_transfer';
        if (in_array($method, ['alfamart', 'indomaret'])) return 'cstore';
        return 'gopay'; // default fallback
    }

    private function getPaymentSpecificParams($method)
    {
        switch ($method) {
            case 'qris':
                return ['qris' => ['acquirer' => 'gopay']];
            case 'bca_va':
                return ['bank_transfer' => ['bank' => 'bca']];
            case 'bni_va':
                return ['bank_transfer' => ['bank' => 'bni']];
            case 'bri_va':
                return ['bank_transfer' => ['bank' => 'bri']];
            case 'alfamart':
                return ['cstore' => ['store' => 'alfamart', 'message' => 'Topup Game']];
            case 'indomaret':
                return ['cstore' => ['store' => 'indomaret', 'message' => 'Topup Game']];
            default:
                return [];
        }
    }


    public function checkTransaction()
{
    return Inertia::render('Transaction/Check');
}

public function processCheckTransaction(Request $request)
{
    $request->validate([
        'invoice_number' => 'required|string',
    ]);

   
    $exists = Transaction::where('invoice_number', $request->invoice_number)->exists();

    if ($exists) {
      
        return redirect()->route('invoice.show', $request->invoice_number);
    }

    return back()->withErrors(['invoice_number' => 'Nomor Transaksi tidak ditemukan!']);
}
}