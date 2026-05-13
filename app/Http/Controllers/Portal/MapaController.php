<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Local;
use Inertia\Inertia;

class MapaController extends Controller
{
    const ESTADO_PRIORIDAD = [
        'Avería', 'Sin señal', 'En mantenimiento',
        'Trasladada', 'Retirada', 'Dada de baja',
        'En almacén', 'Operativa',
    ];

    public function index()
    {
        $user = request()->user();

        $locales = Local::whereNotNull('lat')->whereNotNull('lng')
            ->when($user?->rol === 'regional', fn($q) => $q->where('zona', $user->zona))
            ->orderBy('nombre')
            ->with(['pantallas' => fn($q) => $q->select('id', 'local_id', 'estado')])
            ->get(['id','codigo','nombre','tipo','estado','zona','departamento','provincia','distrito','direccion','lat','lng'])
            ->map(function ($local) {
                $estados = $local->pantallas->pluck('estado')->unique()->toArray();
                $top     = collect(self::ESTADO_PRIORIDAD)->first(fn($e) => in_array($e, $estados));
                $arr     = $local->only(['id','codigo','nombre','tipo','estado','zona','departamento','provincia','distrito','direccion','lat','lng']);
                $arr['estado_pantalla']  = $top;
                $arr['pantallas_count']  = count($estados) > 0 ? $local->pantallas->count() : 0;
                return $arr;
            });

        return Inertia::render('Portal/Mapa', [
            'locales'   => $locales,
            'assetBase' => request()->root(),
        ]);
    }
}
