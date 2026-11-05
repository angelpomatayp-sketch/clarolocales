<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movimientos_local', function (Blueprint $table) {
            $table->foreignId('servicio_id')->nullable()->after('local_id')
                ->constrained('servicios_pantalla')->nullOnDelete();
            $table->json('datos_anteriores')->nullable()->after('motivo');
            $table->json('datos_nuevos')->nullable()->after('datos_anteriores');
        });
    }

    public function down(): void
    {
        Schema::table('movimientos_local', function (Blueprint $table) {
            $table->dropConstrainedForeignId('servicio_id');
            $table->dropColumn(['datos_anteriores', 'datos_nuevos']);
        });
    }
};
