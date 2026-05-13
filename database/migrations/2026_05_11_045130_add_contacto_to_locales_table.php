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
        Schema::table('locales', function (Blueprint $table) {
            $table->string('contacto_nombre')->nullable()->after('correo');
            $table->string('contacto_celular')->nullable()->after('contacto_nombre');
        });
    }

    public function down(): void
    {
        Schema::table('locales', function (Blueprint $table) {
            $table->dropColumn(['contacto_nombre', 'contacto_celular']);
        });
    }
};
