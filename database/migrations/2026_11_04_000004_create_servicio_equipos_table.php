<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicio_equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('servicios_pantalla')->cascadeOnDelete();
            $table->foreignId('pantalla_id')->nullable()->constrained('pantallas')->nullOnDelete();
            $table->unsignedTinyInteger('orden');
            $table->string('tipo_esperado')->nullable();
            $table->enum('resultado', ['pendiente', 'instalado', 'no_instalado'])->default('pendiente');
            $table->string('estado_resultante')->nullable();
            $table->json('datos_equipo')->nullable();
            $table->text('motivo_no_instalado')->nullable();
            $table->timestamps();

            $table->unique(['servicio_id', 'orden']);
            $table->index(['servicio_id', 'resultado']);
        });

        Schema::table('evidencias_servicio', function (Blueprint $table) {
            $table->foreignId('servicio_equipo_id')->nullable()->after('servicio_id')
                ->constrained('servicio_equipos')->cascadeOnDelete();
        });

        foreach (DB::table('servicios_pantalla')->where('tipo', 'instalacion')->get() as $servicio) {
            DB::table('servicio_equipos')->insert([
                'servicio_id' => $servicio->id,
                'pantalla_id' => $servicio->pantalla_id,
                'orden' => 1,
                'tipo_esperado' => $servicio->datos_equipo
                    ? (json_decode($servicio->datos_equipo, true)['modelo'] ?? null)
                    : null,
                'resultado' => $servicio->estado === 'finalizado' ? 'instalado' : 'pendiente',
                'estado_resultante' => $servicio->estado_resultante,
                'datos_equipo' => $servicio->datos_equipo,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('evidencias_servicio', function (Blueprint $table) {
            $table->dropConstrainedForeignId('servicio_equipo_id');
        });
        Schema::dropIfExists('servicio_equipos');
    }
};
