<?php

namespace App\Application\Servicios;

use App\Models\ServicioPantalla;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubmitService
{
    public function __construct(
        private readonly EquipmentSeriesValidator $seriesValidator,
        private readonly ServiceEvidenceManager $evidenceManager,
    ) {}

    public function handle(Request $request, ServicioPantalla $service, array $data): void
    {
        abort_unless(in_array($service->estado, ['en_curso', 'observado'], true), 422, 'El servicio no está disponible para completar.');

        $this->evidenceManager->assertRequired($request, $service);
        if ($service->tipo === 'instalacion') {
            $this->seriesValidator->validateSubmitted($request, $service, $data['equipos']);
        }

        $storedPaths = [];
        try {
            DB::transaction(function () use ($request, $service, $data, &$storedPaths) {
                $service->update([
                    'numero_solicitud' => $data['numero_solicitud'],
                    'informe_tecnico' => $data['informe_tecnico'],
                    'observaciones' => $data['observaciones'] ?? null,
                    'persona_recepcion' => $data['persona_recepcion'],
                    'estado_resultante' => $service->tipo === 'instalacion' ? null : $data['estado_resultante'],
                    'datos_equipo' => null,
                    'estado' => 'en_revision',
                    'enviado_revision_at' => now(),
                    'motivo_observacion' => null,
                ]);

                if ($service->tipo === 'instalacion') {
                    $this->storeEquipmentResults($request, $service, $data['equipos'], $storedPaths);
                }

                $this->storeGeneralEvidence($request, $service, $storedPaths);
            });
        } catch (\Throwable $exception) {
            $this->evidenceManager->rollbackFiles($storedPaths);
            throw $exception;
        }
    }

    private function storeEquipmentResults(Request $request, ServicioPantalla $service, array $equipmentData, array &$storedPaths): void
    {
        $equipmentKeys = [
            'serie', 'marca', 'modelo', 'modelo_equipo',
            'tamanio', 'filas', 'columnas', 'componentes',
        ];

        foreach ($equipmentData as $index => $itemData) {
            $item = $service->equipos()->findOrFail($itemData['id']);
            $installed = $itemData['resultado'] === 'instalado';
            $item->update([
                'resultado' => $itemData['resultado'],
                'estado_resultante' => $installed ? $itemData['estado_resultante'] : null,
                'datos_equipo' => $installed ? collect($itemData)->only($equipmentKeys)->all() : null,
                'motivo_no_instalado' => $installed ? null : $itemData['motivo_no_instalado'],
            ]);

            if ($request->hasFile("equipos.$index.evidencia_serie")) {
                $this->evidenceManager->store(
                    $request->file("equipos.$index.evidencia_serie"),
                    $service,
                    'serie',
                    $request->user()->id,
                    $storedPaths,
                    $item,
                );
            }
        }
    }

    private function storeGeneralEvidence(Request $request, ServicioPantalla $service, array &$storedPaths): void
    {
        $uploads = [
            'evidencia_documento' => 'documento',
            'evidencia_serie' => 'serie',
            'evidencia_inicial' => 'inicial',
            'evidencia_resultado' => 'resultado',
        ];

        foreach ($uploads as $field => $type) {
            if ($request->hasFile($field)) {
                $this->evidenceManager->store(
                    $request->file($field),
                    $service,
                    $type,
                    $request->user()->id,
                    $storedPaths,
                );
            }
        }

        foreach ($request->file('evidencias_adicionales', []) as $file) {
            $this->evidenceManager->store($file, $service, 'adicional', $request->user()->id, $storedPaths);
        }
    }
}
