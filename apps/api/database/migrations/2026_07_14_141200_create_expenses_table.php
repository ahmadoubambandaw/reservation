<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category')->default('other');   // rent, salaries, supplies, utilities...
            $table->string('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('XOF');
            $table->date('spent_at');
            $table->timestamps();

            $table->index(['restaurant_id', 'spent_at']);
            $table->index(['restaurant_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
