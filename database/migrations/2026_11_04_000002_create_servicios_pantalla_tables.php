<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios_pantalla', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->enum('tipo', ['instalacion', 'mantenimiento']);
            $table->enum('estado', ['pendiente', 'en_curso', 'en_revision', 'observado', 'finalizado', 'cancelado'])->default('pendiente');
            $table->foreignId('local_id')->constrained('locales')->restrictOnDelete();
            $table->foreignId('pantalla_id')->nullable()->constrained('pantallas')->nullOnDelete();
            $table->foreignId('operador_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('revisado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->date('fecha_programada');
            $table->timestamp('iniciado_at')->nullable();
            $table->timestamp('enviado_revision_at')->nullable();
            $table->timestamp('finalizado_at')->nullable();
            $table->string('numero_solicitud')->nullable();
            $table->text('instrucciones')->nullable();
            $table->text('informe_tecnico')->nullable();
            $table->text('observaciones')->nullable();
            $table->string('persona_recepcion')->nullable();
            $table->string('estado_resultante')->nullable();
            $table->json('datos_equipo')->nullable();
            $table->text('motivo_observacion')->nullable();
            $table->timestamps();

            $table->index(['operador_id', 'estado']);
            $table->index(['local_id', 'fecha_programada']);
            $table->index(['tipo', 'estado']);
        });

        Schema::create('evidencias_servicio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->constrained('servicios_pantalla')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('tipo', ['documento', 'serie', 'inicial', 'resultado', 'adicional']);
            $table->string('ruta');
            $table->string('nombre_original');
            $table->string('mime', 100);
            $table->unsignedBigInteger('tamanio');
            $table->unsignedTinyInteger('orden')->default(0);
            $table->timestamps();

            $table->index(['servicio_id', 'tipo']);
        });

        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->foreignId('servicio_id')->nullable()->after('pantalla_id')
                ->constrained('servicios_pantalla')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->dropConstrainedForeignId('servicio_id');
        });
        Schema::dropIfExists('evidencias_servicio');
        Schema::dropIfExists('servicios_pantalla');
    }
};
