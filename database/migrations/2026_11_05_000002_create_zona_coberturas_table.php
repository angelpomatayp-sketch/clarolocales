<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zona_coberturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zona_id')->constrained('zonas')->cascadeOnDelete();
            $table->string('departamento');
            $table->string('provincia');
            $table->string('distrito');
            $table->timestamps();

            $table->unique(['departamento', 'provincia', 'distrito'], 'zona_coberturas_ubicacion_unique');
            $table->index(['zona_id', 'departamento', 'provincia'], 'zona_coberturas_filtro_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zona_coberturas');
    }
};
