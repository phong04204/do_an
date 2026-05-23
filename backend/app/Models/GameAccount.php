<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GameAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'price',
        'images',
        'account_username',
        'account_password',
        'status',
    ];

    protected $casts = [
        'images' => 'array',  // JSON → PHP array tự động
        'price'  => 'decimal:2',
    ];

    // Ẩn thông tin đăng nhập khi trả về public API
    protected $hidden = [
        'account_username',
        'account_password',
    ];

    // ──────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────

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
