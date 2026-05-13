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
                'color'  => '#E30613',
                'departamentos' => ['Tumbes','Piura','Lambayeque','La Libertad','Cajamarca','Amazonas','San Martín','Loreto','Áncash'],
            ],
            [
                'nombre' => 'Sur',
                'color'  => '#16A34A',
                'departamentos' => ['Ica','Arequipa','Moquegua','Tacna','Puno','Cusco','Apurímac','Madre de Dios','Ayacucho'],
            ],
            [
                'nombre' => 'Centro',
                'color'  => '#2563EB',
                'departamentos' => ['Huánuco','Pasco','Junín','Huancavelica','Ucayali'],
            ],
            [
                'nombre' => 'Lima',
                'color'  => '#7C3AED',
                'departamentos' => ['Lima','Callao'],
            ],
        ];

        foreach ($zonas as $z) {
            Zona::updateOrCreate(['nombre' => $z['nombre']], $z);
        }
    }
}
