<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Media (Cloudinary public ids / urls)
            $table->string('logo')->nullable();
            $table->string('cover')->nullable();

            // Contact
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();

            // Location
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country', 2)->default('SN');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Config
            $table->string('timezone')->default('Africa/Dakar');
            $table->string('currency', 3)->default('XOF');
            $table->json('opening_hours')->nullable();  // { mon: [{open,close}], ... }
            $table->json('services')->nullable();        // ["dine_in","takeaway","delivery"]

            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
