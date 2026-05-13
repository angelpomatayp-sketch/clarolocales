<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Usuarios ────────────────────────────────────────────────────────
        $users = [
            ['name' => 'Admin WOW',          'email' => 'admin@wowtech.pe',      'password' => Hash::make('admin123'),  'rol' => 'admin',      'zona' => null,      'activo' => true],
            ['name' => 'Sofía Montoya',       'email' => 's.montoya@claro.pe',    'password' => Hash::make('super123'),  'rol' => 'supervisor', 'zona' => null,      'activo' => true],
            ['name' => 'Carlos Mendoza',      'email' => 'c.mendoza@wowtech.pe',  'password' => Hash::make('oper123'),   'rol' => 'operativo',  'zona' => null,      'activo' => true],
            ['name' => 'Patricia Salas',      'email' => 'p.salas@wowtech.pe',    'password' => Hash::make('oper123'),   'rol' => 'operativo',  'zona' => null,      'activo' => true],
            ['name' => 'Rodrigo Norte',       'email' => 'r.norte@wowtech.pe',    'password' => Hash::make('reg123'),    'rol' => 'regional',   'zona' => 'Norte',   'activo' => true],
            ['name' => 'Lucía Sur',           'email' => 'l.sur@wowtech.pe',      'password' => Hash::make('reg123'),    'rol' => 'regional',   'zona' => 'Sur',     'activo' => true],
            ['name' => 'Jorge Centro',        'email' => 'j.centro@wowtech.pe',   'password' => Hash::make('reg123'),    'rol' => 'regional',   'zona' => 'Centro',  'activo' => true],
            ['name' => 'Ana Lima',            'email' => 'a.lima@wowtech.pe',     'password' => Hash::make('reg123'),    'rol' => 'regional',   'zona' => 'Lima',    'activo' => true],
            ['name' => 'Marco Huanca',        'email' => 'm.huanca@claro.pe',     'password' => Hash::make('user123'),   'rol' => 'usuario',    'zona' => null,      'activo' => true],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], $u);
        }

        $this->call([ZonaSeeder::class, LocalSeeder::class, PantallaSeeder::class, MovimientoLocalSeeder::class]);
    }
}
