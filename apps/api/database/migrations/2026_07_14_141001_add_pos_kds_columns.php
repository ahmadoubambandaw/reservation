<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Link cash payments to a register session (POS).
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('cash_session_id')->nullable()->after('restaurant_id')
                ->constrained('cash_sessions')->nullOnDelete();
        });

        // Per-item preparation status for the Kitchen Display System.
        Schema::table('order_items', function (Blueprint $table) {
            $table->enum('status', ['pending', 'preparing', 'ready', 'served'])
                ->default('pending')->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cash_session_id');
        });
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
