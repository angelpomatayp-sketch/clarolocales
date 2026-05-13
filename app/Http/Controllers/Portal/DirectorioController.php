<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Local;
use App\Models\Pantalla;
use App\Models\Zona;
use Inertia\Inertia;

class DirectorioController extends Controller
{
    const ESTADO_PRIORIDAD = [
        'Avería', 'Sin señal', 'En mantenimiento',
        'Trasladada', 'Retirada', 'Dada de baja',
        'En almacén', 'Operativa',
    ];

    public function index()
    {
        $user = request()->user();

        $localesQuery = Local::query();
        if ($user?->rol === 'regional') {
            $localesQuery->where('zona', $user->zona);
        }

        $locales = $localesQuery->withCount(['pantallas', 'movimientos'])
            ->with([
                'movimientos' => fn($q) => $q->latest()->limit(8)->with('usuario:id,name'),
                'pantallas'   => fn($q) => $q->select('id', 'local_id', 'codigo', 'serie', 'modelo', 'posicion', 'estado')
                                            ->orderBy('codigo')
                                            ->with(['movimientos' => fn($mq) => $mq->latest()->limit(10)->with('usuario:id,name')]),
            ])
            ->orderBy('zona')
            ->orderBy('nombre')
            ->get()
            ->each(function ($local) {
                $estados = $local->pantallas->pluck('estado')->unique()->toArray();
                $local->estado_pantalla = collect(self::ESTADO_PRIORIDAD)
                    ->first(fn($e) => in_array($e, $estados));
            });

        $zonas = Zona::when($user?->rol === 'regional', fn($q) => $q->where('nombre', $user->zona))
            ->orderBy('nombre')
            ->get(['nombre', 'color', 'departamentos']);

        $pantallaBuscada = null;
        if ($serie = request('serie')) {
            $pantallaBuscada = Pantalla::with([
                'local',
                'movimientos' => fn($q) => $q->latest()->limit(10)->with([
                    'usuario:id,name',
                    'localAnterior:id,codigo,nombre',
                    'localNuevo:id,codigo,nombre',
                ]),
            ])
                ->where(function ($q) use ($serie) {
                    $q->where('serie', 'like', "%{$serie}%")
                        ->orWhere('codigo', 'like', "%{$serie}%");
                })
                ->when($user?->rol === 'regional', fn($q) => $q->whereHas('local', fn($lq) => $lq->where('zona', $user->zona)))
                ->first();
        }

        return Inertia::render('Portal/Directorio', [
            'locales'         => $locales,
            'zonas'           => $zonas,
            'pantallaBuscada' => $pantallaBuscada,
            'serieBuscada'    => request('serie'),
            'assetBase'       => request()->root(),
        ]);
    }
}
