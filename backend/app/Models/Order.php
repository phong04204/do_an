<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'total_amount',
        'payment_method',
        'payment_transaction_id',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    // ──────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
