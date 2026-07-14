<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The employees table is the tenant-membership pivot: it links a global
     * user to a restaurant with a role. This is the backbone of both
     * multi-tenancy (which restaurants a user belongs to) and RBAC (with
     * which role).
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->restrictOnDelete();
            $table->string('job_title')->nullable();
            $table->decimal('salary', 12, 2)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->date('hired_at')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
