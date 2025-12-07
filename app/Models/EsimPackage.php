<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EsimPackage extends Model
{
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

    public function orders()
    {
        return $this->hasMany(EsimOrder::class, 'esim_package_code', 'package_code');
    }
}