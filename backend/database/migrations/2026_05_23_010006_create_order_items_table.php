<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('price', 15, 2);
            $table->string('purchasable_type'); // App\Models\GameAccount | GameCard | GameGiftcode
            $table->unsignedBigInteger('purchasable_id');
            $table->json('delivered_data'); // Bản sao lưu chuỗi bí mật bảo vệ lịch sử đơn hàng
            $table->timestamps();
            $table->index(['purchasable_type', 'purchasable_id'], 'idx_order_items_morph');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
