<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->string('motivo')->nullable()->after('descripcion');
        });
        Schema::table('movimientos_local', function (Blueprint $table) {
            $table->string('motivo')->nullable()->after('descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->dropColumn('motivo');
        });
        Schema::table('movimientos_local', function (Blueprint $table) {
            $table->dropColumn('motivo');
        });
    }
};
