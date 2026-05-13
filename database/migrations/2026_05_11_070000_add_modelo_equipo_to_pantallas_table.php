<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->string('modelo_equipo')->nullable()->after('modelo');
        });
    }

    public function down(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->dropColumn('modelo_equipo');
        });
    }
};
