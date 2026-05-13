<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Local;
use App\Models\Zona;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ZonaController extends Controller
{
    public function index()
    {
        $zonas   = Zona::orderBy('nombre')->get();
        $deptoConZona = $zonas->flatMap(fn($z) => collect($z->departamentos)->mapWithKeys(fn($d) => [$d => $z->nombre]))->toArray();
        return Inertia::render('Admin/Zonas/Index', ['zonas' => $zonas, 'deptoConZona' => $deptoConZona]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['nombre' => 'required|string|unique:zonas,nombre', 'color' => 'required|string', 'departamentos' => 'array']);
        $this->reasignarDeptos($data['departamentos'] ?? [], null);
        Zona::create($data);
        return back();
    }

    public function update(Request $request, Zona $zona)
    {
        $data = $request->validate(['nombre' => 'required|string|unique:zonas,nombre,'.$zona->id, 'color' => 'required|string', 'departamentos' => 'array']);
        $this->reasignarDeptos($data['departamentos'] ?? [], $zona->id);
        $zona->update($data);
        return back();
    }

    public function destroy(Zona $zona)
    {
        abort_unless(auth()->user()?->rol === 'admin', 403, 'Sin permisos para eliminar zonas.');

        if (Local::where('zona', $zona->nombre)->exists()) {
            return back()->withErrors(['zona' => 'No se puede eliminar: hay locales asignados a esta zona.']);
        }
        $zona->delete();
        return back();
    }

    private function reasignarDeptos(array $deptos, ?int $excludeId): void
    {
        if (empty($deptos)) return;
        $query = Zona::query();
        if ($excludeId) $query->where('id', '!=', $excludeId);
        foreach ($query->get() as $otra) {
            $nuevos = array_values(array_diff($otra->departamentos, $deptos));
            if (count($nuevos) !== count($otra->departamentos)) {
                $otra->update(['departamentos' => $nuevos]);
            }
        }
    }
}
