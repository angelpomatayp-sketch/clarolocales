<?php

namespace Database\Seeders;

use App\Models\Local;
use App\Models\MovimientoLocal;
use App\Models\User;
use Illuminate\Database\Seeder;

class MovimientoLocalSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('rol', 'admin')->first();
        $sup   = User::where('rol', 'supervisor')->first();
        $oper  = User::where('rol', 'operativo')->first();

        $movimientos = [
            'DAC-001' => [
                ['tipo' => 'Apertura', 'descripcion' => 'Local inaugurado con 2 pantallas instaladas.', 'user' => $admin, 'days' => 900],
                ['tipo' => 'Actualización', 'descripcion' => 'Cambio de dirección interna. Actualización de datos.', 'user' => $sup, 'days' => 400],
                ['tipo' => 'Revisión', 'descripcion' => 'Visita de supervisión. Estado óptimo.', 'user' => $oper, 'days' => 30],
            ],
            'DAC-002' => [
                ['tipo' => 'Apertura', 'descripcion' => 'Local aperturado por primera vez.', 'user' => $admin, 'days' => 1200],
                ['tipo' => 'Revisión', 'descripcion' => 'Revisión anual de equipos y estado.', 'user' => $oper, 'days' => 90],
            ],
            'DAC-007' => [
                ['tipo' => 'Apertura', 'descripcion' => 'Local aperturado con una pantalla LED.', 'user' => $admin, 'days' => 700],
                ['tipo' => 'Remodelación', 'descripcion' => 'Inicio de obras de remodelación. Local temporalmente cerrado.', 'user' => $sup, 'days' => 60],
                ['tipo' => 'Revisión', 'descripcion' => 'Supervisión de avance de obras. 70% completado.', 'user' => $oper, 'days' => 14],
            ],
            'DAC-010' => [
                ['tipo' => 'Apertura', 'descripcion' => 'Local aperturado en zona Ayacucho.', 'user' => $admin, 'days' => 800],
                ['tipo' => 'Suspensión', 'descripcion' => 'Suspensión por incumplimiento contractual. En proceso de evaluación.', 'user' => $sup, 'days' => 45],
            ],
            'DAC-011' => [
                ['tipo' => 'Apertura', 'descripcion' => 'Local aperturado en San Borja.', 'user' => $admin, 'days' => 1500],
                ['tipo' => 'Actualización', 'descripcion' => 'Actualización de datos de contacto.', 'user' => $oper, 'days' => 200],
                ['tipo' => 'Revisión', 'descripcion' => 'Visita mensual de supervisión. Todo en orden.', 'user' => $oper, 'days' => 10],
            ],
            'CAC-004' => [
                ['tipo' => 'Apertura', 'descripcion' => 'CAC San Isidro aperturado.', 'user' => $admin, 'days' => 1600],
                ['tipo' => 'Actualización', 'descripcion' => 'Renovación de equipos de pantalla.', 'user' => $sup, 'days' => 120],
            ],
            'DAC-014' => [
                ['tipo' => 'Apertura', 'descripcion' => 'Nuevo local registrado en Villa El Salvador.', 'user' => $admin, 'days' => 100],
                ['tipo' => 'Revisión', 'descripcion' => 'Primera visita post-apertura. Todo operativo.', 'user' => $oper, 'days' => 30],
            ],
        ];

        foreach ($movimientos as $codigo => $items) {
            $local = Local::where('codigo', $codigo)->first();
            if (!$local) continue;

            foreach ($items as $item) {
                MovimientoLocal::updateOrCreate(
                    ['local_id' => $local->id, 'tipo' => $item['tipo']],
                    [
                        'user_id'     => $item['user']?->id,
                        'descripcion' => $item['descripcion'],
                        'created_at'  => now()->subDays($item['days']),
                        'updated_at'  => now()->subDays($item['days']),
                    ]
                );
            }
        }
    }
}
