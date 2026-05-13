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
        DB::table('pantallas')
            ->where('estado', 'Pendiente instalación')
            ->update(['estado' => 'En almacén']);
    }

    public function down(): void
    {
        // irreversible data migration
    }
};
