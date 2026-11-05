<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->dropColumn('posicion');
        });
    }

    public function down(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->string('posicion')->default('')->after('columnas');
        });
    }
};
