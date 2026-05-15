<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locales', function (Blueprint $table) {
            $table->index('departamento', 'locales_departamento_index');
            $table->index('provincia', 'locales_provincia_index');
            $table->index(['zona', 'departamento', 'provincia'], 'locales_zona_departamento_provincia_index');
        });

        Schema::table('pantallas', function (Blueprint $table) {
            $table->index('estado', 'pantallas_estado_index');
            $table->index('modelo', 'pantallas_modelo_index');
        });
    }

    public function down(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->dropIndex('pantallas_estado_index');
            $table->dropIndex('pantallas_modelo_index');
        });

        Schema::table('locales', function (Blueprint $table) {
            $table->dropIndex('locales_departamento_index');
            $table->dropIndex('locales_provincia_index');
            $table->dropIndex('locales_zona_departamento_provincia_index');
        });
    }
};
