<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cartable_type',
        'cartable_id',
    ];

    // ──────────────────────────────────────
    // Relationships
    // ──────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic: GameAccount | GameCard | GameGiftcode
     */
    public function cartable()
    {
        return $this->morphTo();
    }
}
