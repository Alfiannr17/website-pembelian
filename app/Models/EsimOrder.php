<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EsimOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'transaction_id',
        'user_id',
        'esim_package_code',
        'email',
        'phone',
        'amount',
        'payment_method',
        'payment_status',
        'order_status',
        'midtrans_response', // Pastikan ini ada
        'api_order_no',
        'api_response',
        'paid_at'
    ];

    // ==========================================
    // TAMBAHKAN BAGIAN INI (CASTING)
    // ==========================================
    protected $casts = [
        'midtrans_response' => 'array', // Otomatis convert JSON DB <-> Array PHP
        'api_response' => 'array',
        'amount' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function package()
    {
        return $this->belongsTo(EsimPackage::class, 'esim_package_code', 'package_code');
    }

    public function profiles()
    {
        return $this->hasMany(EsimProfile::class, 'esim_order_id');
    }
}