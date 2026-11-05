<?php

namespace Database\Seeders;

use App\Models\Zona;
use App\Models\ZonaCobertura;
use Illuminate\Database\Seeder;

class ZonaCoberturaSeeder extends Seeder
{
    public function run(): void
    {
        $zoneNames = [
            'CENTRO' => 'Centro',
            'LIMA' => 'Lima',
            'LIMA PROVINCIAS' => 'Lima Provincias',
            'NORTE' => 'Norte',
            'SUR' => 'Sur',
        ];

        $coverage = [
            ['CENTRO', 'Ayacucho', 'Huamanga', 'Ayacucho'],
            ['CENTRO', 'Callao', 'Callao', 'Bellavista'],
            ['CENTRO', 'Huánuco', 'Huánuco', 'Huánuco'],
            ['CENTRO', 'Ica', 'Ica', 'Ica'],
            ['CENTRO', 'Junín', 'Huancayo', 'Huancayo'],
            ['CENTRO', 'Junín', 'Tarma', 'Tarma'],
            ['CENTRO', 'Loreto', 'Maynas', 'Iquitos'],
            ['CENTRO', 'Ucayali', 'Coronel Portillo', 'Callería'],
            ['LIMA PROVINCIAS', 'Lima', 'Huaral', 'Huaral'],
            ['LIMA PROVINCIAS', 'Lima', 'Huaura', 'Huacho'],
            ['LIMA', 'Callao', 'Callao', 'Callao'],
            ['LIMA', 'Lima', 'Lima', 'Ancón'],
            ['LIMA', 'Lima', 'Lima', 'Ate'],
            ['LIMA', 'Lima', 'Lima', 'Chorrillos'],
            ['LIMA', 'Lima', 'Lima', 'Comas'],
            ['LIMA', 'Lima', 'Lima', 'El Agustino'],
            ['LIMA', 'Lima', 'Lima', 'Independencia'],
            ['LIMA', 'Lima', 'Lima', 'Jesús María'],
            ['LIMA', 'Lima', 'Lima', 'La Molina'],
            ['LIMA', 'Lima', 'Lima', 'La Victoria'],
            ['LIMA', 'Lima', 'Lima', 'Lince'],
            ['LIMA', 'Lima', 'Lima', 'Los Olivos'],
            ['LIMA', 'Lima', 'Lima', 'Lurín'],
            ['LIMA', 'Lima', 'Lima', 'Miraflores'],
            ['LIMA', 'Lima', 'Lima', 'Pachacámac'],
            ['LIMA', 'Lima', 'Lima', 'Pueblo Libre'],
            ['LIMA', 'Lima', 'Lima', 'Puente Piedra'],
            ['LIMA', 'Lima', 'Lima', 'Rímac'],
            ['LIMA', 'Lima', 'Lima', 'San Borja'],
            ['LIMA', 'Lima', 'Lima', 'San Isidro'],
            ['LIMA', 'Lima', 'Lima', 'San Juan de Lurigancho'],
            ['LIMA', 'Lima', 'Lima', 'San Juan de Miraflores'],
            ['LIMA', 'Lima', 'Lima', 'San Martín de Porres'],
            ['LIMA', 'Lima', 'Lima', 'San Miguel'],
            ['LIMA', 'Lima', 'Lima', 'Santa Anita'],
            ['LIMA', 'Lima', 'Lima', 'Surquillo'],
            ['LIMA', 'Lima', 'Lima', 'Villa El Salvador'],
            ['LIMA', 'Lima', 'Lima', 'Villa María del Triunfo'],
            ['NORTE', 'Áncash', 'Huaraz', 'Huaraz'],
            ['NORTE', 'Cajamarca', 'Cajamarca', 'Cajamarca'],
            ['NORTE', 'La Libertad', 'Trujillo', 'Trujillo'],
            ['NORTE', 'Lambayeque', 'Chiclayo', 'Chiclayo'],
            ['NORTE', 'Lambayeque', 'Lambayeque', 'Lambayeque'],
            ['NORTE', 'Piura', 'Piura', 'Piura'],
            ['NORTE', 'Piura', 'Sullana', 'Sullana'],
            ['NORTE', 'Tumbes', 'Tumbes', 'Tumbes'],
            ['SUR', 'Arequipa', 'Arequipa', 'Arequipa'],
            ['SUR', 'Cusco', 'Cusco', 'Cusco'],
            ['SUR', 'Moquegua', 'Mariscal Nieto', 'Moquegua'],
            ['SUR', 'Puno', 'Puno', 'Puno'],
            ['SUR', 'Tacna', 'Tacna', 'Tacna'],
        ];

        $zoneIds = Zona::query()->pluck('id', 'nombre');

        foreach ($coverage as [$zoneKey, $department, $province, $district]) {
            ZonaCobertura::updateOrCreate(
                [
                    'departamento' => $department,
                    'provincia' => $province,
                    'distrito' => $district,
                ],
                ['zona_id' => $zoneIds[$zoneNames[$zoneKey]]]
            );
        }
    }
}
