<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->unsignedTinyInteger('filas')->nullable()->after('tamanio');
            $table->unsignedTinyInteger('columnas')->nullable()->after('filas');
        });

        Schema::create('componentes_pantalla', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pantalla_id')->constrained('pantallas')->cascadeOnDelete();
            $table->string('serie')->unique();
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->unsignedTinyInteger('tamanio')->nullable();
            $table->unsignedTinyInteger('fila');
            $table->unsignedTinyInteger('columna');
            $table->string('estado')->default('Operativa');
            $table->boolean('activo')->default(true);
            $table->date('fecha_instalacion')->nullable();
            $table->date('fecha_retiro')->nullable();
            $table->timestamps();

            $table->index(['pantalla_id', 'activo']);
            $table->unique(['pantalla_id', 'fila', 'columna'], 'componentes_posicion_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('componentes_pantalla');

        Schema::table('pantallas', function (Blueprint $table) {
            $table->dropColumn(['filas', 'columnas']);
        });
    }
};
