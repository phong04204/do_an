<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GameGiftcode extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'price',
        'giftcode_string',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    // Ẩn mã giftcode khi trả về public API
    protected $hidden = [
        'giftcode_string',
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
