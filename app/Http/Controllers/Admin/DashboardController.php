<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Local;
use App\Models\Pantalla;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $ls = Local::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN tipo = 'CAC' THEN 1 ELSE 0 END) as cac,
            SUM(CASE WHEN tipo = 'DAC' THEN 1 ELSE 0 END) as dac,
            SUM(CASE WHEN tipo = 'CADENA' THEN 1 ELSE 0 END) as cadena
        ")->first();

        $ps = Pantalla::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Operativa' THEN 1 ELSE 0 END) as operativas
        ")->first();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'locales'    => (int) $ls->total,
                'activos'    => (int) $ls->activos,
                'pantallas'  => (int) $ps->total,
                'operativas' => (int) $ps->operativas,
                'cac'        => (int) $ls->cac,
                'dac'        => (int) $ls->dac,
                'cadena'     => (int) $ls->cadena,
            ],
            'pantallasPorZona' => Pantalla::leftJoin('locales', 'pantallas.local_id', '=', 'locales.id')
                                        ->selectRaw("COALESCE(locales.zona, 'Sin asignar') as zona, count(pantallas.id) as total")
                                        ->groupBy('locales.zona')
                                        ->orderBy('locales.zona')
                                        ->get(),
            'pantallasPorDepartamento' => Pantalla::leftJoin('locales', 'pantallas.local_id', '=', 'locales.id')
                                        ->selectRaw("COALESCE(locales.departamento, 'Sin asignar') as departamento, count(pantallas.id) as total")
                                        ->groupBy('locales.departamento')
                                        ->orderBy('locales.departamento')
                                        ->get(),
        ]);
    }
}
