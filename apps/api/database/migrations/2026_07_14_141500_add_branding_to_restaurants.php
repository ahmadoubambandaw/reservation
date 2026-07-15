<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('theme', 16)->default('system');       // light | dark | system
            $table->string('primary_color', 9)->default('#111827');
            $table->string('secondary_color', 9)->default('#f59e0b');
            $table->string('custom_domain')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['theme', 'primary_color', 'secondary_color', 'custom_domain']);
        });
    }
};
