<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update any existing seller users to buyer before changing the enum
        DB::table('users')->where('role', 'seller')->update(['role' => 'buyer']);

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'buyer') NOT NULL DEFAULT 'buyer'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'seller', 'buyer') NOT NULL DEFAULT 'buyer'");
    }
};
