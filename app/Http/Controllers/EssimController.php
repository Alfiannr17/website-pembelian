<?php
// app/Http/Controllers/EsimController.php

namespace App\Http\Controllers;

use App\Models\EsimPackage;
use App\Models\EsimOrder;
use App\Models\EsimProfile;
use App\Services\EsimAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Config;
use Midtrans\CoreApi;

class EssimController extends Controller
{
    protected $esimService;

    public function __construct(EsimAccessService $esimService)
    {
        $this->esimService = $esimService;
    }

    /**
     * Display eSIM packages
     */
    public function index()
    {
        // Ambil data dari Service/API
        $result = $this->esimService->getPackages('ID');

        if (!$result['success']) {
            return Inertia::render('Essim/Index', ['packages' => []]);
        }

        // --- EDIT DISINI: KONVERSI KE RUPIAH ---
        $packages = collect($result['packages'])->map(function ($pkg) {
            // Ambil harga USD (dari API biasanya dikali 10000, jadi kita bagi dulu)
            $priceUsd = ($pkg['price'] ?? 0) / 10000; 
            
            // Konversi ke Rupiah (Misal kurs 16.000)
            $pkg['price_idr'] = ceil($priceUsd * 16000); 
            
            return $pkg;
        });

        return Inertia::render('Essim/Index', [
            'packages' => $packages // Kirim data yang sudah ada price_idr
        ]);
    }

    /**
     * Show package details
     */
    public function showPackage($packageCode, EsimAccessService $esim)
    {
        $result = $esim->getPackages('ID');
        $packages = $result['packages'] ?? [];

        $package = collect($packages)->firstWhere('packageCode', $packageCode);

        if (!$package) {
            abort(404, "Package tidak ditemukan");
        }

        // --- EDIT DISINI: KONVERSI KE RUPIAH JUGA ---
        $priceUsd = ($package['price'] ?? 0) / 10000;
        $package['price_idr'] = ceil($priceUsd * 16000);

        return Inertia::render('Essim/Show', [
            'package' => $package
        ]);
    }

    /**
     * Process eSIM order
     */
  // App/Http/Controllers/EssimController.php

public function processOrder(Request $request)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'package_code'   => 'required|string',
            'email'          => 'required|email',
            'payment_method' => 'required|string',
            'phone'          => 'nullable|string',
        ]);

        $exchangeRate = 16000; 

        // 2. CEK DI DATABASE LOKAL DULU
        $localPackage = EsimPackage::where('package_code', $validated['package_code'])->first();
        
        // --- LOGIKA BARU: AUTO-SAVE DARI API JIKA DB KOSONG ---
        if (!$localPackage) {
            // Log untuk debugging
            \Log::info("Paket {$validated['package_code']} tidak ada di DB. Mencari ke API...");

            // Ambil semua paket dari API
            $apiResult = $this->esimService->getPackages('ID'); 

            if ($apiResult['success']) {
                // Cari paket spesifik dari list API
                $apiPackage = collect($apiResult['packages'])->firstWhere('packageCode', $validated['package_code']);

                if ($apiPackage) {
                    // KETEMU DI API! SEKARANG SIMPAN KE DATABASE
                    $localPackage = EsimPackage::create([
                        'package_code'  => $apiPackage['packageCode'],
                        'slug'          => Str::slug($apiPackage['name']),
                        'location_code' => $apiPackage['locationCode'],
                        'location_name' => $apiPackage['locationName'] ?? 'Indonesia',
                        'name'          => $apiPackage['name'],
                        'description'   => $apiPackage['description'] ?? null,
                        'price'         => ($apiPackage['price'] ?? 0) / 10000, 
                        'data_volume'   => $apiPackage['volume'] ?? 0,
                        'duration'      => $apiPackage['duration'] ?? 0,
                        'duration_unit' => $apiPackage['durationUnit'] ?? 'DAY',
                        'data_type'     => $apiPackage['dataType'] ?? 1,
                        'metadata'      => $apiPackage
                    ]);
                    
                    \Log::info("Sukses Auto-Save Paket ke Database: " . $localPackage->id);
                }
            }
        }
        // -------------------------------------------------------------

        // Jika setelah dicari ke API tetap tidak ada (memang kode ngawur), baru error
        if (!$localPackage) {
            return back()->withErrors(['package' => 'Paket tidak ditemukan di Database maupun API.']);
        }

        // 3. Lanjut Proses Order Seperti Biasa
        $amountIDR = ceil($localPackage->price * $exchangeRate); 

        $invoiceNumber = 'ESIM-' . strtoupper(Str::random(10));
        $transactionId = $invoiceNumber; 

        $order = EsimOrder::create([
            'invoice_number'    => $invoiceNumber,
            'transaction_id'    => $transactionId,
            'user_id'           => auth()->id(),
            'esim_package_code' => $localPackage->package_code,
            'email'             => $validated['email'],
            'phone'             => $validated['phone'] ?? null,
            'amount'            => $amountIDR, 
            'payment_method'    => $validated['payment_method'],
            'payment_status'    => 'pending',
            'order_status'      => 'pending',
        ]);

        $this->processMidtransPayment($order);

        return to_route('essim.invoice', ['invoice_number' => $order->invoice_number]);
    }
    /**
     * Show invoice
     */
    public function invoice($invoiceNumber)
    {
        $order = EsimOrder::with(['package', 'profiles'])
            ->where('invoice_number', $invoiceNumber)
            ->firstOrFail();

        $paymentInfo = $order->midtrans_response;

        return Inertia::render('Essim/Invoice', [
            'order' => $order,
            'paymentInfo' => $paymentInfo
        ]);
    }

    /**
     * My eSIMs - Show user's purchased eSIMs
     */
    public function myEsims()
    {
        $orders = EsimOrder::with(['package', 'profiles'])
            ->where('user_id', auth()->id())
            ->orWhere('email', auth()->user()->email ?? request()->input('email'))
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Essim/MyEsims', [
            'orders' => $orders
        ]);
    }

    /**
     * Show eSIM details
     */
    public function esimDetails($id)
    {
        $order = EsimOrder::with(['package', 'profiles'])
            ->findOrFail($id);

        // Check if user has access
        if ($order->user_id && $order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access');
        }

        // Refresh usage data if profiles exist
        if ($order->profiles->count() > 0) {
            $this->refreshUsageData($order);
        }

        return Inertia::render('Essim/Details', [
            'order' => $order->load('profiles')
        ]);
    }

    /**
     * Check transaction by invoice number
     */
    /**
     * Check transaction & Usage by Invoice OR eSIM Transaction No
     */
    public function checkTransaction(Request $request)
    {
        $validated = $request->validate([
            'invoice_number' => 'required|string',
        ]);

        $search = $validated['invoice_number'];
        $usageData = [];
        $orderInfo = null;

        // -----------------------------------------------------------
        // LANGKAH 1: CARI DI DATABASE (INVOICE ATAU ESIM TRAN NO)
        // -----------------------------------------------------------
        
        // A. Coba cari berdasarkan Invoice Number
        $order = EsimOrder::with(['package', 'profiles'])
            ->where('invoice_number', $search)
            ->first();

        // B. Jika tidak ketemu, Coba cari berdasarkan eSIM Transaction No di tabel profiles
        if (!$order) {
            $profile = EsimProfile::with('order.package')
                ->where('esim_tran_no', $search)
                ->first();
            
            if ($profile) {
                // Jika ketemu profilnya, ambil parent order-nya
                $order = $profile->order;
                // Load relasi yang dibutuhkan
                if ($order) $order->load(['package', 'profiles']);
            }
        }

        // -----------------------------------------------------------
        // LANGKAH 2: PROSES DATA JIKA KETEMU DI DATABASE
        // -----------------------------------------------------------
        if ($order) {
            $orderInfo = $order;
            
            // Fix: Jika status Paid tapi belum ada profile, coba fetch (Sync)
            if ($order->payment_status === 'paid' && $order->profiles->count() === 0) {
                $this->fetchEsimProfiles($order);
                $order->refresh();
            }

            // Ambil nomor eSIM untuk cek kuota ke API
            $tranNos = $order->profiles->pluck('esim_tran_no')->filter()->toArray();
            
            if (!empty($tranNos)) {
                // Tembak API Check Usage
                $apiResult = $this->esimService->checkUsage($tranNos);
                
                if ($apiResult['success']) {
                    $usageData = $apiResult['usageList'];
                }
            }
        } 
        // -----------------------------------------------------------
        // LANGKAH 3: JIKA TIDAK ADA DI DB, CEK LANGSUNG API (GUEST MODE)
        // -----------------------------------------------------------
        else {
            // Asumsi input adalah esim_tran_no yang belum tersync ke DB lokal
            $apiResult = $this->esimService->checkUsage([$search]);
            
            if ($apiResult['success'] && !empty($apiResult['usageList'])) {
                $usageData = $apiResult['usageList'];
            } else {
                return back()->withErrors(['invoice_number' => 'Data tidak ditemukan (Bukan Invoice valid atau eSIM ID tidak terdaftar).']);
            }
        }

        return Inertia::render('Essim/Check', [
            'result' => [
                'order' => $orderInfo,
                'usages' => $usageData
            ]
        ]);
    }
    /**
     * Sync packages from API
     */
    public function syncPackages()
    {
        $result = $this->esimService->getPackages('ID');

        if (!$result['success']) {
            return back()->with('error', 'Failed to sync packages: ' . $result['error']);
        }

        $synced = 0;
        foreach ($result['packages'] as $pkg) {
            EsimPackage::updateOrCreate(
                ['package_code' => $pkg['packageCode']],
                [
                    'slug' => Str::slug($pkg['name']),
                    'location_code' => $pkg['locationCode'],
                    'location_name' => $pkg['locationName'] ?? 'Indonesia',
                    'name' => $pkg['name'],
                    'description' => $pkg['description'] ?? null,
                    'price' => ($pkg['price'] ?? 0) / 10000, // Convert from API format
                    'data_volume' => $pkg['volume'] ?? 0,
                    'duration' => $pkg['duration'] ?? 0,
                    'duration_unit' => $pkg['durationUnit'] ?? 'DAY',
                    'data_type' => $pkg['dataType'] ?? 1,
                    'metadata' => $pkg
                ]
            );
            $synced++;
        }

        return back()->with('success', "Synced {$synced} packages successfully");
    }

    /**
     * Private: Process Midtrans payment
     */
    /**
     * Private: Process Midtrans payment
     */
    private function processMidtransPayment($order)
    {
        // 1. Setup Config
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        if (empty(Config::$serverKey)) {
            \Log::error('Midtrans Error: Server Key is missing');
            return;
        }

        // 2. Siapkan Item Name (Max 50 chars)
        $itemName = substr($order->package->name, 0, 49);

        // 3. Susun Parameter Midtrans
        $params = [
            'payment_type' => $this->getPaymentType($order->payment_method),
            'transaction_details' => [
                'order_id' => $order->invoice_number,
                'gross_amount' => (int) $order->amount, // Pastikan integer
            ],
            'customer_details' => [
                'email' => $order->email,
                'first_name' => $order->user->name ?? 'Guest',
                'phone' => $order->phone ?? '', 
            ],
            'item_details' => [[
                'id' => $order->esim_package_code, 
                'price' => (int) $order->amount,
                'quantity' => 1,
                'name' => $itemName,
            ]],
        ];

        $params = array_merge($params, $this->getPaymentSpecificParams($order->payment_method));

        try {
        // 4. Request ke Midtrans
        $response = CoreApi::charge($params);
        
        // 5. Simpan Response
        // PERBAIKAN: Hapus json_encode(), karena Model sudah punya $casts 'array'
        // Kita ubah response object jadi array agar aman
        $order->update([
            'midtrans_response' => (array) $response, 
        ]);
            
        } catch (\Exception $e) {
            \Log::error('Midtrans Charge Error: ' . $e->getMessage());
            // Jangan ubah status jadi failed dulu agar user bisa coba lagi
            // atau biarkan pending.
        }
    }

    private function getPaymentType($method)
    {
        if ($method == 'qris') return 'qris';
        if (in_array($method, ['bca_va', 'bni_va', 'bri_va'])) return 'bank_transfer';
        if (in_array($method, ['alfamart', 'indomaret'])) return 'cstore';
        return 'gopay';
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
                return ['cstore' => ['store' => 'alfamart', 'message' => 'eSIM Purchase']];
            case 'indomaret':
                return ['cstore' => ['store' => 'indomaret', 'message' => 'eSIM Purchase']];
            default:
                return [];
        }
    }

    /**
     * Fetch eSIM profiles from API after payment
     */
    public function fetchEsimProfiles($order)
    {
        if (!$order->api_order_no) {
            // Create order in eSIM API first
            $result = $this->esimService->orderEsim(
                $order->transaction_id,
                $order->package->package_code,
                1,
                $order->amount
            );

            if (!$result['success']) {
                \Log::error('Failed to create eSIM order', ['error' => $result['error']]);
                return false;
            }

            $order->update([
                'api_order_no' => $result['orderNo'],
                'order_status' => 'processing'
            ]);
        }

        // Query profiles
        $result = $this->esimService->queryByOrderNo($order->api_order_no);

        if (!$result['success']) {
            \Log::error('Failed to fetch eSIM profiles', ['error' => $result['error']]);
            return false;
        }

        // Save profiles
        foreach ($result['profiles'] as $profile) {
            EsimProfile::updateOrCreate(
                ['esim_tran_no' => $profile['esimTranNo']],
                [
                    'esim_order_id' => $order->id,
                    'iccid' => $profile['iccid'] ?? null,
                    'imsi' => $profile['imsi'] ?? null,
                    'msisdn' => $profile['msisdn'] ?? null,
                    'activation_code' => $profile['ac'],
                    'qr_code_url' => $profile['qrCodeUrl'] ?? null,
                    'active_type' => $profile['activeType'] ?? 1,
                    'smdp_status' => $profile['smdpStatus'] ?? 'RELEASED',
                    'esim_status' => $profile['esimStatus'] ?? 'GOT_RESOURCE',
                    'eid' => $profile['eid'] ?? null,
                    'total_volume' => $profile['totalVolume'] ?? 0,
                    'order_usage' => $profile['orderUsage'] ?? 0,
                    'total_duration' => $profile['totalDuration'] ?? 0,
                    'duration_unit' => $profile['durationUnit'] ?? 'DAY',
                    'pin' => $profile['pin'] ?? null,
                    'puk' => $profile['puk'] ?? null,
                    'apn' => $profile['apn'] ?? null,
                    'sms_status' => $profile['smsStatus'] ?? 0,
                    'data_type' => $profile['dataType'] ?? 1,
                    'expired_time' => $profile['expiredTime'] ?? null,
                    'raw_data' => $profile
                ]
            );
        }

        $order->update(['order_status' => 'completed']);
        return true;
    }

    /**
     * Refresh usage data for profiles
     */
    private function refreshUsageData($order)
    {
        $esimTranNos = $order->profiles->pluck('esim_tran_no')->toArray();
        
        if (empty($esimTranNos)) {
            return;
        }

        $result = $this->esimService->checkUsage($esimTranNos);

        if ($result['success']) {
            foreach ($result['usageList'] as $usage) {
                $profile = EsimProfile::where('esim_tran_no', $usage['esimTranNo'])->first();
                if ($profile) {
                    $profile->update([
                        'order_usage' => $usage['dataUsage'] ?? 0,
                        'last_usage_check' => now()
                    ]);
                }
            }
        }
    }



    
}