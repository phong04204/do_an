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

    public function getImagesAttribute($value): array
    {
        if (is_null($value)) {
            return [];
        }
        if (is_array($value)) {
            $result = [];
            foreach ($value as $item) {
                if (is_string($item) && (str_starts_with($item, '[') || str_starts_with($item, '{'))) {
                    $sub = json_decode($item, true);
                    if (is_array($sub)) {
                        $result = array_merge($result, $sub);
                        continue;
                    }
                }
                if (is_string($item) && !empty(trim($item))) {
                    $result[] = trim($item);
                }
            }
            return array_values($result);
        }
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded) || is_string($decoded)) {
                return $this->getImagesAttribute($decoded);
            }
            return !empty(trim($value)) ? [trim($value)] : [];
        }
        return [];
    }

    public function setImagesAttribute($value): void
    {
        if (is_array($value)) {
            $this->attributes['images'] = json_encode(array_values($value), JSON_UNESCAPED_SLASHES);
        } elseif (is_string($value)) {
            $decoded = json_decode($value, true);
            $this->attributes['images'] = is_array($decoded)
                ? json_encode(array_values($decoded), JSON_UNESCAPED_SLASHES)
                : json_encode(array_values(array_filter([trim($value)])), JSON_UNESCAPED_SLASHES);
        } else {
            $this->attributes['images'] = json_encode([]);
        }
    }

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
