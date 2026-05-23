<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_giftcodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->string('giftcode_string'); // Chuỗi mã redeem nhận quà
            $table->enum('status', ['available', 'sold', 'hidden'])->default('available');
            $table->timestamps();
            $table->softDeletes();
            $table->index('status', 'idx_giftcodes_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_giftcodes');
    }
};
