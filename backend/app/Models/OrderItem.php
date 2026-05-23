<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'price',
        'purchasable_type',
        'purchasable_id',
        'delivered_data',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'delivered_data' => 'array',  // JSON → PHP array
    ];

    // ──────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Polymorphic: GameAccount | GameCard | GameGiftcode
     */
    public function purchasable()
    {
        return $this->morphTo();
    }
}
