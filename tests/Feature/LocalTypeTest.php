<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Zona;
use App\Models\ZonaCobertura;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocalTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_cav_and_caa_local_types_can_be_registered_with_their_own_codes(): void
    {
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin-local-types@test.local',
            'password' => 'password',
            'rol' => 'admin',
            'activo' => true,
        ]);

        foreach (['CAV', 'CAA'] as $type) {
            $response = $this->actingAs($admin)->post(route('admin.locales.store'), [
                'nombre' => "Local {$type}",
                'tipo' => $type,
                'estado' => 'Activo',
                'zona' => 'Lima',
                'departamento' => 'Lima',
                'provincia' => 'Lima',
                'distrito' => 'Miraflores',
                'direccion' => "Av. Prueba {$type}",
            ]);

            $response->assertSessionHasNoErrors();
            $this->assertDatabaseHas('locales', [
                'codigo' => "{$type}-001",
                'tipo' => $type,
            ]);
        }
    }

    public function test_zone_is_assigned_from_the_exact_geographic_coverage(): void
    {
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin-zone-coverage@test.local',
            'password' => 'password',
            'rol' => 'admin',
            'activo' => true,
        ]);
        $limaProvincias = Zona::create([
            'nombre' => 'Lima Provincias',
            'color' => '#EA580C',
            'departamentos' => [],
        ]);
        ZonaCobertura::create([
            'zona_id' => $limaProvincias->id,
            'departamento' => 'Lima',
            'provincia' => 'Huaral',
            'distrito' => 'Huaral',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.locales.store'), [
            'nombre' => 'Local Huaral',
            'tipo' => 'DAC',
            'estado' => 'Activo',
            'zona' => 'Lima',
            'departamento' => 'Lima',
            'provincia' => 'Huaral',
            'distrito' => 'Huaral',
            'direccion' => 'Av. Principal 123',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('locales', [
            'nombre' => 'Local Huaral',
            'zona' => 'Lima Provincias',
        ]);
    }
}
