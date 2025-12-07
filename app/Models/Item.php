<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'game_id', 'name', 'description', 'price', 'stock', 'is_active', 'api_code'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}