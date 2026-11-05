<?php

namespace Database\Seeders;

use App\Models\Local;
use App\Models\Pantalla;
use Illuminate\Database\Seeder;

class PantallaSeeder extends Seeder
{
    public function run(): void
    {
        $pantallas = [
            ['codigo' => 'PAN-001', 'serie' => '0560H', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'DAC-001'],
            ['codigo' => 'PAN-002', 'serie' => '1214F', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-001'],
            ['codigo' => 'PAN-003', 'serie' => '0350L', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'DAC-002'],
            ['codigo' => 'PAN-004', 'serie' => '0892K', 'modelo' => 'Minitotem', 'estado' => 'En mantenimiento', 'local' => 'DAC-002'],
            ['codigo' => 'PAN-005', 'serie' => '1456G', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-003'],
            ['codigo' => 'PAN-006', 'serie' => '2103B', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'DAC-004'],
            ['codigo' => 'PAN-007', 'serie' => '2104C', 'modelo' => 'Parante',  'estado' => 'Avería', 'local' => 'DAC-004'],
            ['codigo' => 'PAN-008', 'serie' => '3012E', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'DAC-005'],
            ['codigo' => 'PAN-009', 'serie' => '0721A', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'CAC-001'],
            ['codigo' => 'PAN-010', 'serie' => '0722D', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'CAC-001'],
            ['codigo' => 'PAN-011', 'serie' => '1890J', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-006'],
            ['codigo' => 'PAN-012', 'serie' => '0445M', 'modelo' => 'Minitotem', 'estado' => 'Sin señal', 'local' => 'DAC-007'],
            ['codigo' => 'PAN-013', 'serie' => '2567N', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'DAC-008'],
            ['codigo' => 'PAN-014', 'serie' => '2568P', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-008'],
            ['codigo' => 'PAN-015', 'serie' => '1102Q', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'CAC-002'],
            ['codigo' => 'PAN-016', 'serie' => '1103R', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'CAC-002'],
            ['codigo' => 'PAN-017', 'serie' => '3341S', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-009'],
            ['codigo' => 'PAN-018', 'serie' => '0651T', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'CAC-003'],
            ['codigo' => 'PAN-019', 'serie' => '0652U', 'modelo' => 'Totem',    'estado' => 'En mantenimiento', 'local' => 'CAC-003'],
            ['codigo' => 'PAN-020', 'serie' => '0653V', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'CAC-003'],
            ['codigo' => 'PAN-021', 'serie' => '2290W', 'modelo' => 'Minitotem', 'estado' => 'Sin señal', 'local' => 'DAC-010'],
            ['codigo' => 'PAN-022', 'serie' => '1780X', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'DAC-011'],
            ['codigo' => 'PAN-023', 'serie' => '1781Y', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'DAC-011'],
            ['codigo' => 'PAN-024', 'serie' => '0981Z', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-012'],
            ['codigo' => 'PAN-025', 'serie' => '0320AA', 'modelo' => 'Totem',    'estado' => 'Operativa', 'local' => 'CAC-004'],
            ['codigo' => 'PAN-026', 'serie' => '0321BB', 'modelo' => 'Minitotem', 'estado' => 'Operativa', 'local' => 'CAC-004'],
            ['codigo' => 'PAN-027', 'serie' => '1560CC', 'modelo' => 'Parante',  'estado' => 'Operativa', 'local' => 'DAC-013'],
            ['codigo' => 'PAN-028', 'serie' => '9900DD', 'modelo' => 'Totem',    'estado' => 'Pendiente instalación', 'local' => 'DAC-014'],
            ['codigo' => 'PAN-029', 'serie' => 'SN20241XB7891011', 'modelo' => 'Display', 'estado' => 'En almacén', 'local' => null],
        ];

        $localesMap = Local::pluck('id', 'codigo')->toArray();

        foreach ($pantallas as $p) {
            $localId = $p['local'] ? ($localesMap[$p['local']] ?? null) : null;
            Pantalla::updateOrCreate(['codigo' => $p['codigo']], [
                'serie' => $p['serie'],
                'modelo' => $p['modelo'],
                'estado' => $p['estado'],
                'local_id' => $localId,
            ]);
        }
    }
}
