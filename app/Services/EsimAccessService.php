<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EsimAccessService
{
    private $apiKey;
    private $accessCode;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.esim_access.api_key');
        $this->accessCode = config('services.esim_access.access_code');
        $this->baseUrl = rtrim(config('services.esim_access.base_url', 'https://api.esimaccess.com/api/v1/open'), '/');
    }

    private function headers()
    {
        return [
            'Content-Type' => 'application/json',
            'apiKey' => $this->apiKey,
            'RT-AccessCode' => $this->accessCode,  // PENTING → wajib untuk semua open API
        ];
    }

    /**
     * ============================================================
     * GET ALL PACKAGES
     * ============================================================
     */
    public function getPackages($locationCode = 'ID')
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . '/package/list', [
                    'locationCode' => $locationCode
                ]);

            $data = $response->json();

            Log::info("PACKAGE LIST RESPONSE", $data);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => $response->body(),
                ];
            }

            if (($data['success'] ?? false) === true) {
                return [
                    'success' => true,
                    'packages' => $data['obj']['packageList'] ?? []
                ];
            }

            return [
                'success' => false,
                'error' => $data['errorMsg'] ?? 'Unknown error'
            ];
        } catch (\Exception $e) {
            Log::error("PACKAGE LIST ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * ============================================================
     * ORDER ESIM PROFILE
     * ============================================================
     */
    public function orderEsim($transactionId, $packageCode, $count = 1, $price = null)
{
    // API URL dari dokumentasi
    $url = $this->baseUrl . '/esim/order';

    // Siapkan Item Paket
    $packageItem = [
        'packageCode' => $packageCode,
        'count'       => $count
    ];

    // Jika ada harga (opsional tapi disarankan untuk validasi saldo)
    // Ingat: 10000 = $1.00. Jadi jika price 0.7, dikali 10000 = 7000.
    if ($price !== null) {
        $priceInApiFormat = (int)($price * 16000);
        $packageItem['price'] = $priceInApiFormat;
    }

    // Siapkan Payload Utama
    $payload = [
        'transactionId'   => $transactionId,
        'packageInfoList' => [$packageItem]
    ];

    // Tambahkan total amount jika price ada
    if ($price !== null) {
        $payload['amount'] = $packageItem['price'] * $count;
    }

    // Kirim Request
    try {
        $response = Http::withHeaders($this->headers())->post($url, $payload);
        $data = $response->json();

        Log::info("API ORDER ESIM REQUEST", ['payload' => $payload]);
        Log::info("API ORDER ESIM RESPONSE", $data);

        if (($data['success'] ?? false) === true) {
            return [
                'success' => true,
                'orderNo' => $data['obj']['orderNo'] // Ambil OrderNo dari API
            ];
        }

        return [
            'success' => false,
            'error'   => $data['errorMsg'] ?? 'Gagal order ke API Provider'
        ];

    } catch (\Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

    /**
     * ============================================================
     * QUERY ORDER (GET ESIM LIST BY ORDER NO)
     * ============================================================
     */
    public function queryByOrderNo($orderNo, $pageNum = 1, $pageSize = 50)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . '/esim/query', [
                    'orderNo' => $orderNo,
                    'pager' => [
                        'pageNum' => $pageNum,
                        'pageSize' => $pageSize
                    ]
                ]);

            $data = $response->json();
            Log::info("QUERY ORDER RESPONSE", $data);

            if ($data['success'] ?? false) {
                return [
                    'success' => true,
                    'profiles' => $data['obj']['esimList'] ?? [],
                    'pager' => $data['obj']['pager'] ?? []
                ];
            }

            return [
                'success' => false,
                'error' => $data['errorMsg'] ?? 'Query failed'
            ];
        } catch (\Exception $e) {
            Log::error("QUERY ORDER ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * ============================================================
     * QUERY BY ICCID
     * ============================================================
     */
    public function queryByIccid($iccid)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . '/esim/query', [
                    'iccid' => $iccid,
                    'pager' => [
                        'pageNum' => 1,
                        'pageSize' => 1
                    ]
                ]);

            $data = $response->json();

            if ($data['success'] ?? false) {
                return [
                    'success' => true,
                    'profile' => $data['obj']['esimList'][0] ?? null
                ];
            }

            return [
                'success' => false,
                'error' => $data['errorMsg'] ?? 'Profile not found'
            ];
        } catch (\Exception $e) {
            Log::error("QUERY ICCID ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * ============================================================
     * CHECK DATA USAGE
     * ============================================================
     */
    public function checkUsage(array $esimTranNoList)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . '/esim/usage/query', [
                    'esimTranNoList' => $esimTranNoList
                ]);

            $data = $response->json();

            Log::info("USAGE RESPONSE", $data);

            if ($data['success'] ?? false) {
                return [
                    'success' => true,
                    'usageList' => $data['obj']['usageList'] ?? []
                ];
            }

            return [
                'success' => false,
                'error' => $data['errorMsg'] ?? 'Failed to check usage'
            ];
        } catch (\Exception $e) {
            Log::error("USAGE ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
