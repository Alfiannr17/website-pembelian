<?php
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
        $result = $this->esimService->getPackages('ID');

        if (!$result['success']) {
            return Inertia::render('Essim/Index', ['packages' => []]);
        }

        $packages = collect($result['packages'])->map(function ($pkg) {

            $priceUsd = ($pkg['price'] ?? 0) / 10000; 
            
            $pkg['price_idr'] = ceil($priceUsd * 16000); 
            
            return $pkg;
        });

        return Inertia::render('Essim/Index', [
            'packages' => $packages 
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

        $priceUsd = ($package['price'] ?? 0) / 10000;
        $package['price_idr'] = ceil($priceUsd * 16000);

        return Inertia::render('Essim/Show', [
            'package' => $package
        ]);
    }

    /**
     * Process eSIM order
     */
    public function processOrder(Request $request)
    {
        $validated = $request->validate([
            'package_code'   => 'required|string',
            'email'          => 'required|email',
            'payment_method' => 'required|in:qris,bca_va,bni_va,bri_va,alfamart,indomaret,gopay',
            'phone'          => 'nullable|string',
        ]);

        $exchangeRate = 16000;

        $localPackage = EsimPackage::where('package_code', $validated['package_code'])->first();

        if (!$localPackage) {
            \Log::info("Paket {$validated['package_code']} tidak ada di DB. Mencari ke API...");

            $apiResult = $this->esimService->getPackages('ID');

            if ($apiResult['success']) {
                $apiPackage = collect($apiResult['packages'])->firstWhere('packageCode', $validated['package_code']);

                if ($apiPackage) {
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

        if (!$localPackage) {
            return back()->withErrors(['package' => 'Paket tidak ditemukan di Database maupun API.'])->withInput();
        }

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

        $paymentOk = $this->processMidtransPayment($order);

        if (!$paymentOk) {
            return back()->withErrors([
                'payment_method' => 'Gagal memproses pembayaran, silakan coba lagi.'
            ])->withInput();
        }

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

        if ($order->user_id && $order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access');
        }

        if ($order->profiles->count() > 0) {
            $this->refreshUsageData($order);
        }

        return Inertia::render('Essim/Details', [
            'order' => $order->load('profiles')
        ]);
    }

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
        $order = EsimOrder::with(['package', 'profiles'])
            ->where('invoice_number', $search)
            ->first();

        if (!$order) {
            $profile = EsimProfile::with('order.package')
                ->where('esim_tran_no', $search)
                ->first();
            
            if ($profile) {
                $order = $profile->order;

                if ($order) $order->load(['package', 'profiles']);
            }
        }

        if ($order) {
            $orderInfo = $order;

            if ($order->payment_status === 'paid' && $order->profiles->count() === 0) {
                $this->fetchEsimProfiles($order);
                $order->refresh();
            }

            $tranNos = $order->profiles->pluck('esim_tran_no')->filter()->toArray();

            if (!empty($tranNos)) {
                $apiResult = $this->esimService->checkUsage($tranNos);

                if ($apiResult['success']) {
                    $usageData = $apiResult['usageList'];
                }
            }
        } else {
            $apiResult = $this->esimService->checkUsage([$search]);

            if ($apiResult['success'] && !empty($apiResult['usageList'])) {
                $usageData = $apiResult['usageList'];
            } else {
                return back()->withErrors([
                    'invoice_number' => 'Data tidak ditemukan (Bukan Invoice valid atau eSIM ID tidak terdaftar).'
                ]);
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
                    'price' => ($pkg['price'] ?? 0) / 10000,
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
    private function processMidtransPayment(EsimOrder $order): bool
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;

        if (empty(Config::$serverKey)) {
            \Log::error('Midtrans Error: Server Key is missing');
            $order->update(['payment_status' => 'failed']);

            return false;
        }

        $order->loadMissing('package', 'user');

        if (!$order->package) {
            \Log::error('Midtrans Error: Package relation missing for order ' . $order->id);
            $order->update(['payment_status' => 'failed']);

            return false;
        }

        $itemName = substr($order->package->name, 0, 49);

        $params = [
            'payment_type' => $this->getPaymentType($order->payment_method),
            'transaction_details' => [
                'order_id' => $order->invoice_number,
                'gross_amount' => (int) $order->amount, 
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
            $response = CoreApi::charge($params);

            $order->update([
                'midtrans_response' => (array) $response,
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Midtrans Charge Error: ' . $e->getMessage());

            $order->update(['payment_status' => 'failed']);

            return false;
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

        $result = $this->esimService->queryByOrderNo($order->api_order_no);

        if (!$result['success']) {
            \Log::error('Failed to fetch eSIM profiles', ['error' => $result['error']]);
            return false;
        }

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