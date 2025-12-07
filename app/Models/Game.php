<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'name', 
        'slug', 
        'description', 
        'image', 
        'category', 
        'is_active',

        'api_brand', 
        'provider', 
        'is_zone_id_required'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}