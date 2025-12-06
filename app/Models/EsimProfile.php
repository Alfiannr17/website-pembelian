<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EsimProfile extends Model
{
    protected $fillable = [
        'esim_order_id',
        'esim_tran_no',
        'iccid',
        'imsi',
        'msisdn',
        'activation_code',
        'qr_code_url',
        'active_type',
        'smdp_status',
        'esim_status',
        'eid',
        'total_volume',
        'order_usage',
        'total_duration',
        'duration_unit',
        'pin',
        'puk',
        'apn',
        'sms_status',
        'data_type',
        'expired_time',
        'last_usage_check',
        'raw_data',
    ];

    protected $casts = [
        'raw_data' => 'array',
        'expired_time' => 'datetime',
        'last_usage_check' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(EsimOrder::class, 'esim_order_id');
    }
}