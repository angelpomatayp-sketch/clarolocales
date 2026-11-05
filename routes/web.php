<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LocalController;
use App\Http\Controllers\Admin\PantallaController;
use App\Http\Controllers\Admin\ReporteController;
use App\Http\Controllers\Admin\ServicioPantallaController;
use App\Http\Controllers\Admin\TipoPantallaController;
use App\Http\Controllers\Admin\UsuarioController;
use App\Http\Controllers\Admin\ZonaController;
use App\Http\Controllers\Portal\DirectorioController;
use App\Http\Controllers\Portal\MapaController;
use Illuminate\Support\Facades\Route;

// ─── Raíz ────────────────────────────────────────────────────────────────────
Route::get('/', function () {
    $user = request()->user();

    if (! $user) {
        return redirect()->route('login');
    }

    if (in_array($user->rol, ['regional', 'usuario'], true)) {
        return redirect()->route('directorio');
    }

    if ($user->rol === 'operativo') {
        return redirect()->route('admin.servicios.index');
    }

    return redirect()->route('admin.dashboard');
});

// ─── Portal (requiere autenticación) ─────────────────────────────────────────
Route::middleware(['auth'])->group(function () {
    Route::get('/directorio', [DirectorioController::class, 'index'])->name('directorio');
    Route::get('/mapa',       [MapaController::class,       'index'])->name('mapa');
});

// ─── Admin (según rol) ────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin,supervisor,operativo'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', fn() => redirect()->route(
        request()->user()?->rol === 'operativo' ? 'admin.servicios.index' : 'admin.dashboard'
    ));

    Route::get('/servicios', [ServicioPantallaController::class, 'index'])->name('servicios.index');
    Route::post('/servicios/{servicio}/iniciar', [ServicioPantallaController::class, 'start'])->name('servicios.start');
    Route::post('/servicios/{servicio}/enviar', [ServicioPantallaController::class, 'submit'])->name('servicios.submit');
    Route::get('/servicios/{servicio}/evidencias/{evidencia}', [ServicioPantallaController::class, 'evidence'])
        ->name('servicios.evidencias.show');

    Route::get('/pantallas', [PantallaController::class, 'index'])->name('pantallas.index');

    Route::middleware('role:admin,supervisor')->group(function () {
        Route::post('/pantallas', [PantallaController::class, 'store'])->name('pantallas.store');
        Route::put('/pantallas/{pantalla}', [PantallaController::class, 'update'])->name('pantallas.update');
        Route::post('/servicios', [ServicioPantallaController::class, 'store'])->name('servicios.store');
        Route::put('/servicios/{servicio}', [ServicioPantallaController::class, 'update'])->name('servicios.update');
        Route::post('/servicios/{servicio}/revisar', [ServicioPantallaController::class, 'review'])->name('servicios.review');
        Route::post('/servicios/{servicio}/actualizar-direccion', [ServicioPantallaController::class, 'updateLocalAddress'])->name('servicios.update-address');
        Route::post('/servicios/{servicio}/cancelar', [ServicioPantallaController::class, 'cancel'])->name('servicios.cancel');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('locales', LocalController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['locales' => 'local']);
        Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
        Route::get('/reportes/exportar', [ReporteController::class, 'exportar'])->name('reportes.exportar');
        Route::resource('zonas', ZonaController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('tipos-pantalla', TipoPantallaController::class)->except(['show', 'create', 'edit']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::delete('/pantallas/{pantalla}', [PantallaController::class, 'destroy'])
            ->name('pantallas.destroy');
        Route::post('/usuarios/{usuario}/reset-2fa', [UsuarioController::class, 'resetTwoFactor'])
            ->name('usuarios.reset-2fa');
        Route::resource('usuarios', UsuarioController::class)->only(['index', 'store', 'update', 'destroy']);
    });
});

require __DIR__.'/auth.php';
