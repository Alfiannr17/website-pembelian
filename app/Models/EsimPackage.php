<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EsimPackage extends Model
{
    // Tambahkan fillable sesuai migrasi agar data bisa disimpan
    protected $fillable = [
        'package_code',
        'slug',
        'location_code',
        'location_name',
        'name',
        'description',
        'price',
        'data_volume',
        'duration',
        'duration_unit',
        'data_type',
        'image',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relasi ke EsimOrder.
     * hasMany(Model, 'foreign_key_di_tabel_anak', 'local_key_di_tabel_ini')
     */
    public function orders()
    {
        return $this->hasMany(EsimOrder::class, 'esim_package_code', 'package_code');
    }
}