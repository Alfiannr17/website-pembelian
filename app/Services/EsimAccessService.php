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
            'RT-AccessCode' => $this->accessCode, 
        ];
    }

    public function getPackages($locationCode = 'ID')
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . '/package/list', [
                    'locationCode' => $locationCode
                ]);

            $data = $response->json();

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
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function orderEsim($transactionId, $packageCode, $count = 1, $price = null)
{
    $url = $this->baseUrl . '/esim/order';

    $packageItem = [
        'packageCode' => $packageCode,
        'count'       => $count
    ];

    if ($price !== null) {
        $priceInApiFormat = (int)($price * 10000);
        $packageItem['price'] = $priceInApiFormat;
    }

    $payload = [
        'transactionId'   => $transactionId,
        'packageInfoList' => [$packageItem]
    ];

    if ($price !== null) {
        $payload['amount'] = $packageItem['price'] * $count;
    }

    try {
        $response = Http::withHeaders($this->headers())->post($url, $payload);
        $data = $response->json();

        if (($data['success'] ?? false) === true) {
            return [
                'success' => true,
                'orderNo' => $data['obj']['orderNo'] 
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
           
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

 
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
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }


    public function checkUsage(array $esimTranNoList)
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post($this->baseUrl . '/esim/usage/query', [
                    'esimTranNoList' => $esimTranNoList
                ]);

            $data = $response->json();

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
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
