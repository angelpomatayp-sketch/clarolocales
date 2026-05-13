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
        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->foreignId('local_anterior_id')->nullable()->after('user_id')
                  ->constrained('locales')->nullOnDelete();
            $table->foreignId('local_nuevo_id')->nullable()->after('local_anterior_id')
                  ->constrained('locales')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('movimientos_pantalla', function (Blueprint $table) {
            $table->dropForeign(['local_anterior_id']);
            $table->dropForeign(['local_nuevo_id']);
            $table->dropColumn(['local_anterior_id', 'local_nuevo_id']);
        });
    }
};
