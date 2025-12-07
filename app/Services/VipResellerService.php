<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VipResellerService
{
    protected $apiId;
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiId = config('services.vip.api_id');
        $this->apiKey = config('services.vip.api_key');
        $this->baseUrl = 'https://vip-reseller.co.id/api/game-feature';
    }

    private function getSign()
    {
        return md5($this->apiId . $this->apiKey);
    }

    public function getServices()
    {
        $response = Http::asForm()->post($this->baseUrl, [
            'key'  => $this->apiId,
            'sign' => $this->apiKey,
            'type' => 'services',
            'filter_status' => 'available'
        ]);

        return $response->json();
    }

    public function checkNickname($gameCode, $userId, $zoneId = null)
    {
        $payload = [
            'key'    => $this->apiId,
            'sign'   => $this->apiKey,
            'type'   => 'get-nickname',
            'code'   => $gameCode,
            'target' => $userId,
        ];

        if ($zoneId) {
            $payload['additional_target'] = $zoneId;
        }

        $response = Http::asForm()->post($this->baseUrl, $payload);
        return $response->json();
    }

    public function placeOrder($serviceCode, $userId, $zoneId = null)
    {
        $payload = [
            'key'     => $this->apiId,
            'sign'    => $this->apiKey,
            'type'    => 'order',
            'service' => $serviceCode,
            'data_no' => $userId,
        ];

        if ($zoneId) {
            $payload['data_zone'] = $zoneId;
        }

        $response = Http::asForm()->post($this->baseUrl, $payload);
        return $response->json();
    }
}