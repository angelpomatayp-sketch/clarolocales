<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UsuarioController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => User::orderBy('name')->get(['id','name','email','rol','zona','activo','created_at']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string', 'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6', 'rol' => 'required|in:admin,supervisor,regional,operativo,usuario',
            'zona' => 'required_if:rol,regional|nullable|string', 'activo' => 'boolean',
        ]);
        if (($data['rol'] ?? null) !== 'regional') {
            $data['zona'] = null;
        }
        $data['password'] = Hash::make($data['password']);
        User::create($data);
        return back();
    }

    public function update(Request $request, User $usuario)
    {
        $data = $request->validate([
            'name' => 'required|string', 'email' => 'required|email|unique:users,email,'.$usuario->id,
            'rol' => 'required|in:admin,supervisor,regional,operativo,usuario',
            'zona' => 'required_if:rol,regional|nullable|string', 'activo' => 'boolean',
            'password' => 'nullable|string|min:6',
        ]);

        if (($data['rol'] ?? null) !== 'regional') {
            $data['zona'] = null;
        }
        if ($usuario->id === auth()->id() && array_key_exists('activo', $data) && ! $data['activo']) {
            return back()->withErrors(['usuario' => 'No puedes desactivar tu propia cuenta.']);
        }
        if ($this->wouldLeaveNoActiveAdmin($usuario, $data)) {
            return back()->withErrors(['usuario' => 'Debe existir al menos un administrador activo.']);
        }

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            unset($data['password']);
        }
        $usuario->update($data);
        return back();
    }

    public function destroy(User $usuario)
    {
        abort_unless(auth()->user()?->rol === 'admin', 403, 'Sin permisos para eliminar usuarios.');

        if ($usuario->id === auth()->id()) {
            return back()->withErrors(['usuario' => 'No puedes eliminar tu propia cuenta.']);
        }
        if ($usuario->rol === 'admin' && $usuario->activo && User::where('rol', 'admin')->where('activo', true)->count() <= 1) {
            return back()->withErrors(['usuario' => 'Debe existir al menos un administrador activo.']);
        }
        $usuario->delete();
        return back();
    }

    private function wouldLeaveNoActiveAdmin(User $usuario, array $data): bool
    {
        if ($usuario->rol !== 'admin' || ! $usuario->activo) {
            return false;
        }

        $willRemainActiveAdmin = ($data['rol'] ?? $usuario->rol) === 'admin'
            && (bool) ($data['activo'] ?? $usuario->activo);

        return ! $willRemainActiveAdmin
            && User::where('rol', 'admin')->where('activo', true)->count() <= 1;
    }
}
