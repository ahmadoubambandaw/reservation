<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->string('name');                  // "Table 1", "Terrasse A"
            $table->unsignedInteger('capacity')->default(2);
            $table->string('location')->nullable();  // indoor | terrace | vip
            $table->enum('status', ['available', 'occupied', 'reserved', 'out_of_service'])->default('available');
            $table->string('qr_code')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_tables');
    }
};
