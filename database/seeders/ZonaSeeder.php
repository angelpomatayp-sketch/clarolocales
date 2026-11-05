<?php

namespace Database\Seeders;

use App\Models\Zona;
use Illuminate\Database\Seeder;

class ZonaSeeder extends Seeder
{
    public function run(): void
    {
        $zonas = [
            [
                'nombre' => 'Norte',
                'color' => '#E30613',
                'departamentos' => ['Áncash', 'Cajamarca', 'La Libertad', 'Lambayeque', 'Piura', 'Tumbes'],
            ],
            [
                'nombre' => 'Sur',
                'color' => '#16A34A',
                'departamentos' => ['Arequipa', 'Cusco', 'Moquegua', 'Puno', 'Tacna'],
            ],
            [
                'nombre' => 'Centro',
                'color' => '#2563EB',
                'departamentos' => ['Ayacucho', 'Huánuco', 'Ica', 'Junín', 'Loreto', 'Ucayali'],
            ],
            [
                'nombre' => 'Lima',
                'color' => '#7C3AED',
                'departamentos' => ['Lima', 'Callao'],
            ],
            [
                'nombre' => 'Lima Provincias',
                'color' => '#EA580C',
                'departamentos' => [],
            ],
        ];

        foreach ($zonas as $z) {
            Zona::updateOrCreate(['nombre' => $z['nombre']], $z);
        }
    }
}
