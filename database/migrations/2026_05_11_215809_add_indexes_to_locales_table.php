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
            $table->index('zona');
            $table->index('tipo');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::table('locales', function (Blueprint $table) {
            $table->dropIndex(['zona']);
            $table->dropIndex(['tipo']);
            $table->dropIndex(['estado']);
        });
    }
};
