<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number', 
        'user_id', 
        'game_id', 
        'item_id',
        'game_user_id', 
        'email', 
        'amount', 
        'payment_method',
        'status', 
        'midtrans_order_id', 'midtrans_response', 'paid_at'
    ];

    protected $casts = [
        'midtrans_response' => 'array', 
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}