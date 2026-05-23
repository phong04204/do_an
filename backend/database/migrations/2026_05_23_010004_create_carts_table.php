<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('cartable_type'); // App\Models\GameAccount | App\Models\GameCard | App\Models\GameGiftcode
            $table->unsignedBigInteger('cartable_id');
            $table->timestamps();
            $table->index(['cartable_type', 'cartable_id'], 'idx_carts_morph');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
