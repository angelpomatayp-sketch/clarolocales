<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }
        DB::statement('ALTER TABLE servicios_pantalla MODIFY tipo VARCHAR(30) NOT NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }
        DB::statement("ALTER TABLE servicios_pantalla MODIFY tipo ENUM('instalacion', 'mantenimiento') NOT NULL");
    }
};
