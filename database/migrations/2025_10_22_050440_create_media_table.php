<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['image', 'video', 'gif']);
            $table->string('url');
            $table->string('thumbnail_url')->nullable(); // untuk video
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('duration')->nullable(); // untuk video (dalam detik)
            $table->integer('size')->nullable(); // ukuran file dalam bytes
            $table->string('alt_text')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('post_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};