<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');                         // Free | Basic | Pro | Enterprise
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 3)->default('XOF');
            $table->enum('billing_period', ['monthly', 'yearly'])->default('monthly');
            $table->unsignedInteger('trial_days')->default(0);
            $table->json('features')->nullable();           // ["reservations","crm",...]
            $table->json('limits')->nullable();             // { tables: 10, employees: 5, menu_items: 50 }
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
