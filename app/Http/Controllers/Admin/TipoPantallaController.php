<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TipoPantalla;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TipoPantallaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/TiposPantalla/Index', [
            'tipos' => TipoPantalla::orderBy('nombre')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'      => 'required|string|max:80|unique:tipos_pantalla,nombre',
            'descripcion' => 'nullable|string|max:200',
            'activo'      => 'boolean',
        ]);
        TipoPantalla::create($data);
        return back();
    }

    public function update(Request $request, TipoPantalla $tiposPantalla)
    {
        $data = $request->validate([
            'nombre'      => 'required|string|max:80|unique:tipos_pantalla,nombre,' . $tiposPantalla->id,
            'descripcion' => 'nullable|string|max:200',
            'activo'      => 'boolean',
        ]);
        $tiposPantalla->update($data);
        return back();
    }

    public function destroy(TipoPantalla $tiposPantalla)
    {
        abort_unless(auth()->user()?->rol === 'admin', 403, 'Sin permisos para eliminar tipos de pantalla.');

        $tiposPantalla->delete();
        return back();
    }
}
