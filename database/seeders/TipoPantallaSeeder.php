<?php

namespace Database\Seeders;

use App\Models\TipoPantalla;
use Illuminate\Database\Seeder;

class TipoPantallaSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Minitotem',  'descripcion' => 'Pantalla pequeña tipo kiosko de sobremesa'],
            ['nombre' => 'Parante',    'descripcion' => 'Pantalla vertical sobre soporte de pie'],
            ['nombre' => 'Totem',      'descripcion' => 'Pantalla vertical de gran formato autosoportada'],
            ['nombre' => 'Display',    'descripcion' => 'Pantalla plana de pared o mostrador'],
            ['nombre' => 'LED Outdoor','descripcion' => 'Pantalla LED para uso exterior'],
        ];

        foreach ($tipos as $t) {
            TipoPantalla::updateOrCreate(['nombre' => $t['nombre']], $t + ['activo' => true]);
        }
    }
}
