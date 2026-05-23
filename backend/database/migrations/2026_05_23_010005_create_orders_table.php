<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_amount', 15, 2);
            $table->string('payment_method');
            $table->string('payment_transaction_id')->nullable()->unique();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();
            $table->index('status', 'idx_orders_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
