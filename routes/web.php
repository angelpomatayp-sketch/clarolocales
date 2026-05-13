<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LocalController;
use App\Http\Controllers\Admin\PantallaController;
use App\Http\Controllers\Admin\ReporteController;
use App\Http\Controllers\Admin\TipoPantallaController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Admin\ZonaController;
use App\Http\Controllers\Portal\DirectorioController;
use App\Http\Controllers\Portal\MapaController;
use Illuminate\Support\Facades\Route;

// ─── Raíz ────────────────────────────────────────────────────────────────────
Route::get('/', fn() => redirect()->route('login'));

// ─── Portal (requiere autenticación) ─────────────────────────────────────────
Route::middleware(['auth'])->group(function () {
    Route::get('/directorio', [DirectorioController::class, 'index'])->name('directorio');
    Route::get('/mapa',       [MapaController::class,       'index'])->name('mapa');
});

// ─── Admin (según rol) ────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin,supervisor,operativo'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/',          fn() => redirect()->route('admin.dashboard'));
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('locales',   LocalController::class)->except(['show'])->parameters(['locales' => 'local']);
    Route::resource('pantallas',      PantallaController::class)->except(['show']);
    Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
    Route::get('/reportes/exportar', [ReporteController::class, 'exportar'])->name('reportes.exportar');

    Route::middleware('role:admin,supervisor')->group(function () {
        Route::resource('zonas', ZonaController::class)->except(['show']);
        Route::resource('tipos-pantalla', TipoPantallaController::class)->except(['show', 'create', 'edit']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::resource('usuarios', UsuarioController::class)->except(['show']);
    });
});

require __DIR__.'/auth.php';
