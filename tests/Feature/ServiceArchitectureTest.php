<?php

namespace Tests\Feature;

use App\Application\Servicios\ReviewService;
use App\Application\Servicios\ServiceOrderManager;
use App\Application\Servicios\SubmitService;
use App\Application\Servicios\UpdateServiceLocation;
use App\Models\Local;
use App\Models\MovimientoLocal;
use App\Models\MovimientoPantalla;
use App\Models\Pantalla;
use App\Models\ServicioPantalla;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServiceArchitectureTest extends TestCase
{
    use RefreshDatabase;

    private User $coordinator;

    private User $operator;

    private Local $local;

    protected function setUp(): void
    {
        parent::setUp();

        $this->coordinator = User::create([
            'name' => 'Supervisor Prueba',
            'email' => 'supervisor@test.local',
            'password' => 'password',
            'rol' => 'supervisor',
            'activo' => true,
        ]);
        $this->operator = User::create([
            'name' => 'Operador Prueba',
            'email' => 'operador@test.local',
            'password' => 'password',
            'rol' => 'operativo',
            'activo' => true,
        ]);
        $this->local = Local::create([
            'codigo' => 'DAC-TEST',
            'nombre' => 'Local de prueba',
            'tipo' => 'DAC',
            'estado' => 'Activo',
            'zona' => 'Lima',
            'departamento' => 'Lima',
            'provincia' => 'Lima',
            'distrito' => 'Miraflores',
            'direccion' => 'Av. Prueba 100',
        ]);
    }

    public function test_order_manager_creates_an_installation_with_multiple_equipment_items(): void
    {
        $service = app(ServiceOrderManager::class)->create([
            'tipo' => 'instalacion',
            'local_id' => $this->local->id,
            'pantalla_id' => null,
            'operador_id' => $this->operator->id,
            'fecha_programada' => '2026-11-04',
            'instrucciones' => 'Instalar dos equipos.',
            'equipos_plan' => [
                ['tipo_esperado' => 'LED'],
                ['tipo_esperado' => 'Video Wall'],
            ],
        ], $this->coordinator);

        $this->assertSame('pendiente', $service->estado);
        $this->assertCount(2, $service->equipos);
        $this->assertSame([1, 2], $service->equipos->pluck('orden')->all());
    }

    public function test_review_service_creates_inventory_and_traceability_per_installed_item(): void
    {
        $service = ServicioPantalla::create([
            'codigo' => 'SER-TEST-1',
            'tipo' => 'instalacion',
            'estado' => 'en_revision',
            'local_id' => $this->local->id,
            'operador_id' => $this->operator->id,
            'creado_por' => $this->coordinator->id,
            'fecha_programada' => '2026-11-04',
            'numero_solicitud' => 'SOL-TEST-1',
            'informe_tecnico' => 'Instalación realizada.',
        ]);
        $service->equipos()->create([
            'orden' => 1,
            'tipo_esperado' => 'LED',
            'resultado' => 'instalado',
            'estado_resultante' => 'Operativa',
            'datos_equipo' => ['serie' => 'LED-TEST-1', 'modelo' => 'LED'],
        ]);
        $wall = $service->equipos()->create([
            'orden' => 2,
            'tipo_esperado' => 'Video Wall',
            'resultado' => 'instalado',
            'estado_resultante' => 'Operativa',
            'datos_equipo' => [
                'serie' => 'VW-TEST-1', 'modelo' => 'Video Wall',
                'filas' => 2, 'columnas' => 1,
                'componentes' => [
                    ['serie' => 'VW-PANEL-A', 'fila' => 1, 'columna' => 1],
                    ['serie' => 'VW-PANEL-B', 'fila' => 2, 'columna' => 1],
                ],
            ],
        ]);
        $service->equipos()->create([
            'orden' => 3,
            'tipo_esperado' => 'LED',
            'resultado' => 'no_instalado',
            'motivo_no_instalado' => 'Sin punto eléctrico.',
        ]);

        app(ReviewService::class)->handle($service, ['decision' => 'aprobar'], $this->coordinator);

        $this->assertSame('finalizado', $service->fresh()->estado);
        $this->assertSame(2, $service->equipos()->whereNotNull('pantalla_id')->count());
        $this->assertSame(2, $wall->fresh()->pantalla->componentes()->count());
        $this->assertSame(2, MovimientoPantalla::where('servicio_id', $service->id)->count());
    }

    public function test_location_update_keeps_before_after_history_linked_to_service(): void
    {
        $screen = Pantalla::create([
            'codigo' => 'PAN-TEST',
            'serie' => 'SCREEN-TEST',
            'modelo' => 'LED',
            'estado' => 'Operativa',
            'local_id' => $this->local->id,
        ]);
        $service = ServicioPantalla::create([
            'codigo' => 'SER-TEST-2',
            'tipo' => 'mantenimiento',
            'estado' => 'en_revision',
            'local_id' => $this->local->id,
            'pantalla_id' => $screen->id,
            'operador_id' => $this->operator->id,
            'creado_por' => $this->coordinator->id,
            'fecha_programada' => '2026-11-04',
        ]);

        app(UpdateServiceLocation::class)->handle($service, [
            'zona' => 'Lima',
            'departamento' => 'Lima',
            'provincia' => 'Lima',
            'distrito' => 'San Isidro',
            'direccion' => 'Av. Prueba 200',
            'motivo' => 'Cambio reportado en campo.',
        ], $this->coordinator);

        $movement = MovimientoLocal::where('servicio_id', $service->id)->firstOrFail();
        $this->assertSame('Av. Prueba 100', $movement->datos_anteriores['direccion']);
        $this->assertSame('Av. Prueba 200', $movement->datos_nuevos['direccion']);
        $this->assertSame('Av. Prueba 200', $this->local->fresh()->direccion);
    }

    public function test_operator_submission_stores_required_maintenance_evidence(): void
    {
        Storage::fake('local');

        $screen = Pantalla::create([
            'codigo' => 'PAN-MAINTENANCE',
            'serie' => 'SCREEN-MAINTENANCE',
            'modelo' => 'LED',
            'estado' => 'Operativa',
            'local_id' => $this->local->id,
        ]);
        $service = ServicioPantalla::create([
            'codigo' => 'SER-TEST-3',
            'tipo' => 'mantenimiento',
            'estado' => 'en_curso',
            'local_id' => $this->local->id,
            'pantalla_id' => $screen->id,
            'operador_id' => $this->operator->id,
            'creado_por' => $this->coordinator->id,
            'fecha_programada' => '2026-11-04',
        ]);

        $data = [
            'numero_solicitud' => 'SOL-MAINTENANCE',
            'informe_tecnico' => 'Limpieza y verificacion realizadas.',
            'observaciones' => 'Sin novedades.',
            'persona_recepcion' => 'Responsable del local',
            'estado_resultante' => 'Operativa',
        ];
        $files = [
            'evidencia_documento' => UploadedFile::fake()->image('documento.jpg'),
            'evidencia_serie' => UploadedFile::fake()->image('serie.jpg'),
            'evidencia_inicial' => UploadedFile::fake()->image('inicial.jpg'),
            'evidencia_resultado' => UploadedFile::fake()->image('resultado.jpg'),
        ];
        $request = Request::create('/servicios/enviar', 'POST', $data, [], $files);
        $request->setUserResolver(fn () => $this->operator);

        app(SubmitService::class)->handle($request, $service, $data);

        $this->assertSame('en_revision', $service->fresh()->estado);
        $this->assertSame(4, $service->evidencias()->count());
        foreach ($service->evidencias as $evidence) {
            Storage::disk('local')->assertExists($evidence->ruta);
        }
    }

    public function test_service_listing_is_paginated_in_groups_of_fifteen(): void
    {
        foreach (range(1, 16) as $index) {
            ServicioPantalla::create([
                'codigo' => 'SER-PAGE-'.str_pad((string) $index, 2, '0', STR_PAD_LEFT),
                'tipo' => 'mantenimiento',
                'estado' => 'pendiente',
                'local_id' => $this->local->id,
                'operador_id' => $this->operator->id,
                'creado_por' => $this->coordinator->id,
                'fecha_programada' => '2026-11-04',
            ]);
        }

        $this->actingAs($this->coordinator)
            ->get(route('admin.servicios.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Servicios/Index')
                ->has('servicios.data', 15)
                ->where('servicios.per_page', 15)
                ->where('servicios.total', 16));
    }
}
