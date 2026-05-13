<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('rol')->default('operativo')->after('email');
            $table->string('zona')->nullable()->after('rol');
            $table->boolean('activo')->default(true)->after('zona');
            $table->dropColumn('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rol', 'zona', 'activo']);
            $table->timestamp('email_verified_at')->nullable();
        });
    }
};
