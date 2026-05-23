<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GameCard extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'price',
        'card_serial',
        'card_code',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    // Ẩn mã thẻ khi trả về public API
    protected $hidden = [
        'card_serial',
        'card_code',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function orderItems()
    {
        return $this->morphMany(OrderItem::class, 'purchasable');
    }

    public function carts()
    {
        return $this->morphMany(Cart::class, 'cartable');
    }
}
