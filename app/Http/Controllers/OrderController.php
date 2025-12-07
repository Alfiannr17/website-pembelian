<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Item;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\CoreApi;
use App\Services\VipResellerService;
use Illuminate\Support\Facades\Log; 
use App\Models\EsimOrder;


class OrderController extends Controller
{
    public function show(Game $game)
    {
        $game->load(['items' => function($query) {
            $query->where('is_active', true);
        }]);

        return Inertia::render('Order/Show', [
            'game' => $game,
        ]);
    }

    /**
     * CEK ID GAME (AJAX)
     */
    public function checkGameId(Request $request, VipResellerService $vip)
    {
        $request->validate([
            'game_id' => 'required',
            'user_id' => 'required',
        ]);

        $game = Game::find($request->game_id);
        
        $gameCode = $game->category;
        
        if (empty($gameCode)) {
            return response()->json(['status' => 'error', 'message' => 'Konfigurasi Game belum lengkap (Kode API kosong).']);
        }
       
        $res = $vip->checkNickname(
            $gameCode,      
            $request->user_id,
            $request->zone_id ?? null
        );

        if (($res['result'] ?? false) == true) {
            return response()->json([
                'status' => 'success',
                'nickname' => $res['data']
            ]);
        }

        return response()->json(['status' => 'error', 'message' => $res['message'] ?? 'ID Tidak Ditemukan']);
    }

    /**
     * PROSES ORDER GAME (SIMPAN DB & REQUEST MIDTRANS)
     */
    public function process(Request $request)
    {
        $request->validate([
            'game_id' => 'required',
            'item_id' => 'required',
            'game_user_id' => 'required',
            'payment_method' => 'required',
            'email' => 'required|email',
        ]);

        $item = Item::findOrFail($request->item_id);

        $transaction = Transaction::create([
            'invoice_number' => 'TRX-' . strtoupper(Str::random(10)),
            'user_id' => auth()->id(),
            'game_id' => $request->game_id,
            'item_id' => $request->item_id,
            
            'game_user_id' => $request->game_user_id,
            'game_zone_id' => $request->game_zone_id ?? null,
            
            'amount' => $item->price,
            'payment_method' => $request->payment_method,
            'status' => 'pending',
            'email' => $request->email
        ]);

        $this->processMidtransCoreApi($transaction);

        return redirect()->route('invoice.show', $transaction->invoice_number);
    }

    /**
     * HALAMAN INVOICE (MENAMPILKAN VA/QR)
     */
    public function invoice($invoice_number)
    {
        $transaction = Transaction::with(['game', 'item'])
            ->where('invoice_number', $invoice_number)
            ->firstOrFail();

        $isEsim = !is_null($transaction->esim_package_code);

        return Inertia::render('Order/Invoice', [
            'transaction' => $transaction,
            'paymentInfo' => $transaction->midtrans_response, 
            'isEsim' => $isEsim,
        ]);
    }


    private function processMidtransCoreApi($transaction)
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        Log::info("Processing Midtrans: " . $transaction->invoice_number);
        Log::info("Environment: " . (Config::$isProduction ? 'PRODUCTION' : 'SANDBOX'));

        $params = [
            'payment_type' => $this->getPaymentType($transaction->payment_method),
            'transaction_details' => [
                'order_id' => $transaction->invoice_number,
                'gross_amount' => (int) $transaction->amount,
            ],
            'customer_details' => [
                'email' => $transaction->email,
                'first_name' => $transaction->user->name ?? 'Guest',
                'phone' => '08123456789', 
            ],
            'item_details' => [[
                'id' => $transaction->item_id,
                'price' => (int) $transaction->amount,
                'quantity' => 1,
                'name' => substr($transaction->item->name ?? 'Item', 0, 49), 
            ]],
        ];
        $params = array_merge($params, $this->getPaymentSpecificParams($transaction->payment_method));

        try {
            $response = CoreApi::charge($params);
            
            $transaction->update([
                'midtrans_response' => (array) $response,
                'midtrans_order_id' => $transaction->invoice_number
            ]);
            
            Log::info("Midtrans Success for {$transaction->invoice_number}");

        } catch (\Exception $e) {
            Log::error("Midtrans Failed for {$transaction->invoice_number}: " . $e->getMessage());
     
        }
    }

    private function getPaymentType($method)
    {
        if ($method == 'qris') return 'qris';
        if (in_array($method, ['bca_va', 'bni_va', 'bri_va', 'permata_va'])) return 'bank_transfer';
        if (in_array($method, ['alfamart', 'indomaret'])) return 'cstore';
        return 'gopay'; 
    }

    private function getPaymentSpecificParams($method)
    {
        switch ($method) {
            case 'qris': return ['qris' => ['acquirer' => 'gopay']];
            case 'bca_va': return ['bank_transfer' => ['bank' => 'bca']];
            case 'bni_va': return ['bank_transfer' => ['bank' => 'bni']];
            case 'bri_va': return ['bank_transfer' => ['bank' => 'bri']];
            case 'permata_va': return ['bank_transfer' => ['bank' => 'permata']];
            case 'alfamart': return ['cstore' => ['store' => 'alfamart', 'message' => 'Topup Game']];
            case 'indomaret': return ['cstore' => ['store' => 'indomaret', 'message' => 'Topup Game']];
            default: return [];
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

    $invoice = $request->invoice_number;

    // 🔎 1. Cek di transaksi topup game
    $game = Transaction::where('invoice_number', $invoice)->first();

    if ($game) {
        return redirect()->route('invoice.show', $invoice);
    }

    // 🔎 2. Cek di pesanan eSIM
    $esim = EsimOrder::where('invoice_number', $invoice)->first();

    if ($esim) {
        return redirect()->route('essim.invoice', $invoice);
    }

    // ❌ Tidak ada di dua tabel
    return back()->withErrors([
        'invoice_number' => 'Nomor Transaksi tidak ditemukan!',
    ]);
}



}