<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // ──────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────

    public function gameAccounts()
    {
        return $this->hasMany(GameAccount::class, 'seller_id');
    }

    public function gameCards()
    {
        return $this->hasMany(GameCard::class, 'seller_id');
    }

    public function gameGiftcodes()
    {
        return $this->hasMany(GameGiftcode::class, 'seller_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function carts()
    {
        return $this->hasMany(Cart::class, 'user_id');
    }

    // ──────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }
}
