<?php

namespace Database\Seeders;

use App\Models\Local;
use Illuminate\Database\Seeder;

class LocalSeeder extends Seeder
{
    public function run(): void
    {
        $locales = [
            // ZONA NORTE
            ['codigo'=>'DAC-001','nombre'=>'CONTEL SAC','tipo'=>'DAC','estado'=>'Activo','zona'=>'Norte','departamento'=>'Tumbes','provincia'=>'Tumbes','distrito'=>'Tumbes','direccion'=>'AV. TUMBES NORTE 345','lat'=>-3.5669,'lng'=>-80.4515,'fecha_apertura'=>'2021-03-15'],
            ['codigo'=>'DAC-002','nombre'=>'NFOCENTRO SRL','tipo'=>'DAC','estado'=>'Activo','zona'=>'Norte','departamento'=>'Piura','provincia'=>'Piura','distrito'=>'Piura','direccion'=>'JR. LORETO 891 - PIURA','lat'=>-5.1945,'lng'=>-80.6328,'fecha_apertura'=>'2020-07-20'],
            ['codigo'=>'DAC-003','nombre'=>'MAHADI SAC','tipo'=>'DAC','estado'=>'Activo','zona'=>'Norte','departamento'=>'Lambayeque','provincia'=>'Chiclayo','distrito'=>'Chiclayo','direccion'=>'AV. BALTA 623 - CHICLAYO','lat'=>-6.7714,'lng'=>-79.8409,'fecha_apertura'=>'2019-05-10'],
            ['codigo'=>'DAC-004','nombre'=>'NOVA SMART SAC','tipo'=>'DAC','estado'=>'Activo','zona'=>'Norte','departamento'=>'La Libertad','provincia'=>'Trujillo','distrito'=>'Trujillo','direccion'=>'JR. PIZARRO 456 - TRUJILLO','lat'=>-8.1091,'lng'=>-79.0215,'fecha_apertura'=>'2020-11-05'],
            ['codigo'=>'DAC-005','nombre'=>'DISTRIBUIDORA NORTE DIGITAL','tipo'=>'DAC','estado'=>'Activo','zona'=>'Norte','departamento'=>'Cajamarca','provincia'=>'Cajamarca','distrito'=>'Cajamarca','direccion'=>'JR. DEL COMERCIO 782 - CAJAMARCA','lat'=>-7.1617,'lng'=>-78.5128,'fecha_apertura'=>'2022-01-18'],
            // ZONA SUR
            ['codigo'=>'CAC-001','nombre'=>'CAC MADRE DE DIOS','tipo'=>'CAC','estado'=>'Activo','zona'=>'Sur','departamento'=>'Madre de Dios','provincia'=>'Tambopata','distrito'=>'Tambopata','direccion'=>'AV. 28 DE JULIO 1245 - PUERTO MALDONADO','lat'=>-12.5931,'lng'=>-69.1890,'fecha_apertura'=>'2021-08-22'],
            ['codigo'=>'DAC-006','nombre'=>'COMSURPE EIRL','tipo'=>'DAC','estado'=>'Activo','zona'=>'Sur','departamento'=>'Arequipa','provincia'=>'Arequipa','distrito'=>'Arequipa','direccion'=>'AV. LA MARINA 201 - AREQUIPA','lat'=>-16.4090,'lng'=>-71.5375,'fecha_apertura'=>'2020-04-12'],
            ['codigo'=>'DAC-007','nombre'=>'IMPORTACIONES GROUP CELL','tipo'=>'DAC','estado'=>'En remodelación','zona'=>'Sur','departamento'=>'Cusco','provincia'=>'Cusco','distrito'=>'Cusco','direccion'=>'AV. EL SOL 789 - CUSCO','lat'=>-13.5319,'lng'=>-71.9675,'fecha_apertura'=>'2021-06-30'],
            ['codigo'=>'DAC-008','nombre'=>'TECNO CELL AREQUIPA','tipo'=>'DAC','estado'=>'Activo','zona'=>'Sur','departamento'=>'Arequipa','provincia'=>'Arequipa','distrito'=>'Cayma','direccion'=>'AV. CAYMA 445 - AREQUIPA','lat'=>-16.3853,'lng'=>-71.5450,'fecha_apertura'=>'2022-09-14'],
            // ZONA CENTRO
            ['codigo'=>'CAC-002','nombre'=>'CAC HUANUCO','tipo'=>'CAC','estado'=>'Activo','zona'=>'Centro','departamento'=>'Huánuco','provincia'=>'Huánuco','distrito'=>'Huánuco','direccion'=>'JR. GENERAL PRADO 652 - HUANUCO','lat'=>-9.9306,'lng'=>-76.2422,'fecha_apertura'=>'2020-02-28'],
            ['codigo'=>'DAC-009','nombre'=>'CELL SHOP SELVA SA','tipo'=>'DAC','estado'=>'Activo','zona'=>'Centro','departamento'=>'Ucayali','provincia'=>'Coronel Portillo','distrito'=>'Callería','direccion'=>'JR. PROGRESO 234 - PUCALLPA','lat'=>-8.3791,'lng'=>-74.5539,'fecha_apertura'=>'2022-03-10'],
            ['codigo'=>'CAC-003','nombre'=>'CAC HUANCAYO','tipo'=>'CAC','estado'=>'Activo','zona'=>'Centro','departamento'=>'Junín','provincia'=>'Huancayo','distrito'=>'Huancayo','direccion'=>'AV. GIRÁLDEZ 589 - HUANCAYO','lat'=>-12.0651,'lng'=>-75.2049,'fecha_apertura'=>'2020-06-15'],
            ['codigo'=>'DAC-010','nombre'=>'DOBLE S COMUNICACIONES SRL','tipo'=>'DAC','estado'=>'Suspendido','zona'=>'Centro','departamento'=>'Ayacucho','provincia'=>'Huamanga','distrito'=>'Ayacucho','direccion'=>'JR. LIMA 234 - AYACUCHO','lat'=>-13.1588,'lng'=>-74.2236,'fecha_apertura'=>'2021-09-01'],
            // ZONA LIMA
            ['codigo'=>'DAC-011','nombre'=>'LUATEL SAC','tipo'=>'DAC','estado'=>'Activo','zona'=>'Lima','departamento'=>'Lima','provincia'=>'Lima','distrito'=>'San Borja','direccion'=>'AV. SAN LUIS 2312 - SAN BORJA','lat'=>-12.1057,'lng'=>-76.9997,'fecha_apertura'=>'2020-01-15'],
            ['codigo'=>'DAC-012','nombre'=>'DISTRIBUIDORA TECNO MOVIL','tipo'=>'DAC','estado'=>'Activo','zona'=>'Lima','departamento'=>'Lima','provincia'=>'Lima','distrito'=>'Miraflores','direccion'=>'AV. LARCO 1156 - MIRAFLORES','lat'=>-12.1211,'lng'=>-77.0282,'fecha_apertura'=>'2020-03-20'],
            ['codigo'=>'CAC-004','nombre'=>'CAC SAN ISIDRO','tipo'=>'CAC','estado'=>'Activo','zona'=>'Lima','departamento'=>'Lima','provincia'=>'Lima','distrito'=>'San Isidro','direccion'=>'AV. RIVERA NAVARRETE 765 - SAN ISIDRO','lat'=>-12.0977,'lng'=>-77.0366,'fecha_apertura'=>'2019-11-01'],
            ['codigo'=>'DAC-013','nombre'=>'CELULARES EXPRESS EIRL','tipo'=>'DAC','estado'=>'Activo','zona'=>'Lima','departamento'=>'Lima','provincia'=>'Lima','distrito'=>'Los Olivos','direccion'=>'AV. UNIVERSITARIA 4586 - LOS OLIVOS','lat'=>-11.9986,'lng'=>-77.0720,'fecha_apertura'=>'2021-05-10'],
            ['codigo'=>'DAC-014','nombre'=>'MEGA CELULAR PERU SAC','tipo'=>'DAC','estado'=>'Nuevo local','zona'=>'Lima','departamento'=>'Lima','provincia'=>'Lima','distrito'=>'Villa El Salvador','direccion'=>'AV. CENTRAL MZ. B - LT. 14 - VILLA EL SALVADOR','lat'=>-12.2139,'lng'=>-76.9319,'fecha_apertura'=>'2023-01-20'],
        ];

        foreach ($locales as $l) {
            Local::updateOrCreate(['codigo' => $l['codigo']], $l);
        }
    }
}
