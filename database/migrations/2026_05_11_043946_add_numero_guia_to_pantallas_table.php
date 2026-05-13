<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->string('numero_guia')->nullable()->after('serie');
        });
    }

    public function down(): void
    {
        Schema::table('pantallas', function (Blueprint $table) {
            $table->dropColumn('numero_guia');
        });
    }
};
