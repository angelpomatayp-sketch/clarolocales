<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicios_pantalla', function (Blueprint $table) {
            $table->index(['estado', 'fecha_programada', 'id'], 'servicios_estado_fecha_id_index');
        });

        Schema::table('movimientos_local', function (Blueprint $table) {
            $table->index(['local_id', 'created_at'], 'movimientos_local_local_fecha_index');
            $table->index('created_at', 'movimientos_local_fecha_index');
        });

        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->index(['pantalla_id', 'created_at'], 'movimientos_pantalla_pantalla_fecha_index');
            $table->index('created_at', 'movimientos_pantalla_fecha_index');
        });
    }

    public function down(): void
    {
        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->dropIndex('movimientos_pantalla_pantalla_fecha_index');
            $table->dropIndex('movimientos_pantalla_fecha_index');
        });

        Schema::table('movimientos_local', function (Blueprint $table) {
            $table->dropIndex('movimientos_local_local_fecha_index');
            $table->dropIndex('movimientos_local_fecha_index');
        });

        Schema::table('servicios_pantalla', function (Blueprint $table) {
            $table->dropIndex('servicios_estado_fecha_id_index');
        });
    }
};
