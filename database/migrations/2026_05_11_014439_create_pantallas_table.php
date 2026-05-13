<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pantallas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('serie')->unique();
            $table->string('modelo');
            $table->string('posicion')->default('');
            $table->string('estado')->default('En almacén');
            $table->foreignId('local_id')->nullable()->constrained('locales')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pantallas');
    }
};
