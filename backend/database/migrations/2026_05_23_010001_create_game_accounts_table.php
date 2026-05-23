<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->json('images')->nullable(); // Mảng link ảnh công khai
            $table->string('account_username');
            $table->text('account_password'); // TEXT vì chuỗi mã hóa AES dài
            $table->enum('status', ['available', 'sold', 'hidden'])->default('available');
            $table->timestamps();
            $table->softDeletes();
            $table->index('status', 'idx_accounts_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_accounts');
    }
};
