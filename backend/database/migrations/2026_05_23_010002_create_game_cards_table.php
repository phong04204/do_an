<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->string('card_serial');
            $table->string('card_code'); // Mã nạp bí mật
            $table->enum('status', ['available', 'sold', 'hidden'])->default('available');
            $table->timestamps();
            $table->softDeletes();
            $table->index('status', 'idx_cards_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_cards');
    }
};
