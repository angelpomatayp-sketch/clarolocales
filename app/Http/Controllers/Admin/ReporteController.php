<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Local;
use App\Models\MovimientoLocal;
use App\Models\MovimientoPantalla;
use App\Models\Pantalla;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteController extends Controller
{
    private const TIPOS_REPORTE = ['pantallas', 'locales', 'movimientos'];

    public function index(Request $request)
    {
        $filters = $this->filters($request);
        $tipo = $filters['reporte'];

        return Inertia::render('Admin/Reportes/Index', [
            'filters' => $filters,
            'options' => $this->options(),
            'summary' => [
                'total' => $this->countFor($tipo, $filters),
            ],
            'preview' => $this->previewFor($tipo, $filters),
        ]);
    }

    public function exportar(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $tipo = $filters['reporte'];
        $filename = 'reporte_' . $tipo . '_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function () use ($tipo, $filters) {
            $spreadsheet = $this->buildSpreadsheet($tipo, $filters);
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function filters(Request $request): array
    {
        $reporte = $request->string('reporte')->toString() ?: 'pantallas';

        return [
            'reporte' => in_array($reporte, self::TIPOS_REPORTE, true) ? $reporte : 'pantallas',
            'zona' => $request->string('zona')->toString(),
            'departamento' => $request->string('departamento')->toString(),
            'provincia' => $request->string('provincia')->toString(),
            'tipo_local' => $request->string('tipo_local')->toString(),
            'estado_local' => $request->string('estado_local')->toString(),
            'estado_pantalla' => $request->string('estado_pantalla')->toString(),
            'fecha_desde' => $request->string('fecha_desde')->toString(),
            'fecha_hasta' => $request->string('fecha_hasta')->toString(),
        ];
    }

    private function options(): array
    {
        return [
            'zonas' => Local::whereNotNull('zona')->distinct()->orderBy('zona')->pluck('zona'),
            'departamentos' => Local::whereNotNull('departamento')->distinct()->orderBy('departamento')->pluck('departamento'),
            'provincias' => Local::whereNotNull('provincia')->distinct()->orderBy('provincia')->pluck('provincia'),
            'tiposLocal' => ['DAC', 'CAC', 'CADENA'],
            'estadosLocal' => Local::whereNotNull('estado')->distinct()->orderBy('estado')->pluck('estado'),
            'estadosPantalla' => Pantalla::whereNotNull('estado')->distinct()->orderBy('estado')->pluck('estado'),
        ];
    }

    private function countFor(string $tipo, array $filters): int
    {
        return match ($tipo) {
            'locales' => $this->localesQuery($filters)->count(),
            'movimientos' => $this->movimientosRows($filters)->count(),
            default => $this->pantallasQuery($filters)->count(),
        };
    }

    private function previewFor(string $tipo, array $filters): array
    {
        return match ($tipo) {
            'locales' => $this->localesQuery($filters)->limit(10)->get()->map(fn($local) => $this->localRow($local))->values()->all(),
            'movimientos' => $this->movimientosRows($filters)->take(10)->values()->all(),
            default => $this->pantallasQuery($filters)->limit(10)->get()->map(fn($pantalla) => $this->pantallaRow($pantalla))->values()->all(),
        };
    }

    private function pantallasQuery(array $filters): Builder
    {
        return Pantalla::query()
            ->with('local')
            ->when($filters['estado_pantalla'], fn($q, $estado) => $q->where('estado', $estado))
            ->when($this->hasLocalFilters($filters), fn($q) => $q->whereHas('local', fn($localQuery) => $this->applyLocalFilters($localQuery, $filters)))
            ->orderBy('codigo');
    }

    private function localesQuery(array $filters): Builder
    {
        $query = Local::query()->withCount('pantallas');
        $this->applyLocalFilters($query, $filters);

        return $query->orderBy('codigo');
    }

    private function applyLocalFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['zona'], fn($q, $value) => $q->where('zona', $value))
            ->when($filters['departamento'], fn($q, $value) => $q->where('departamento', $value))
            ->when($filters['provincia'], fn($q, $value) => $q->where('provincia', $value))
            ->when($filters['tipo_local'], fn($q, $value) => $q->where('tipo', $value))
            ->when($filters['estado_local'], fn($q, $value) => $q->where('estado', $value));
    }

    private function hasLocalFilters(array $filters): bool
    {
        return (bool) ($filters['zona'] || $filters['departamento'] || $filters['provincia'] || $filters['tipo_local'] || $filters['estado_local']);
    }

    private function applyDateFilters(Builder $query, array $filters): void
    {
        $query
            ->when($filters['fecha_desde'], fn($q, $value) => $q->whereDate('created_at', '>=', $value))
            ->when($filters['fecha_hasta'], fn($q, $value) => $q->whereDate('created_at', '<=', $value));
    }

    private function movimientosRows(array $filters)
    {
        $locales = MovimientoLocal::query()
            ->with(['local', 'usuario:id,name'])
            ->when($this->hasLocalFilters($filters), fn($q) => $q->whereHas('local', fn($localQuery) => $this->applyLocalFilters($localQuery, $filters)))
            ->when($filters['fecha_desde'], fn($q, $value) => $q->whereDate('created_at', '>=', $value))
            ->when($filters['fecha_hasta'], fn($q, $value) => $q->whereDate('created_at', '<=', $value))
            ->get()
            ->map(fn($movimiento) => [
                'fecha' => optional($movimiento->created_at)->format('d/m/Y H:i'),
                'origen' => 'Local',
                'codigo' => $movimiento->local?->codigo,
                'nombre' => $movimiento->local?->nombre,
                'tipo' => $movimiento->tipo,
                'descripcion' => $movimiento->descripcion,
                'motivo' => $movimiento->motivo,
                'usuario' => $movimiento->usuario?->name,
                'zona' => $movimiento->local?->zona,
                'departamento' => $movimiento->local?->departamento,
            ]);

        $pantallas = MovimientoPantalla::query()
            ->with(['pantalla.local', 'usuario:id,name'])
            ->when($filters['estado_pantalla'], fn($q, $estado) => $q->whereHas('pantalla', fn($pq) => $pq->where('estado', $estado)))
            ->when($this->hasLocalFilters($filters), fn($q) => $q->whereHas('pantalla.local', fn($localQuery) => $this->applyLocalFilters($localQuery, $filters)))
            ->when($filters['fecha_desde'], fn($q, $value) => $q->whereDate('created_at', '>=', $value))
            ->when($filters['fecha_hasta'], fn($q, $value) => $q->whereDate('created_at', '<=', $value))
            ->get()
            ->map(fn($movimiento) => [
                'fecha' => optional($movimiento->created_at)->format('d/m/Y H:i'),
                'origen' => 'Pantalla',
                'codigo' => $movimiento->pantalla?->codigo,
                'nombre' => $movimiento->pantalla?->serie,
                'tipo' => $movimiento->tipo,
                'descripcion' => $movimiento->descripcion,
                'motivo' => $movimiento->motivo,
                'usuario' => $movimiento->usuario?->name,
                'zona' => $movimiento->pantalla?->local?->zona,
                'departamento' => $movimiento->pantalla?->local?->departamento,
            ]);

        return $locales->concat($pantallas)->sortByDesc('fecha')->values();
    }

    private function buildSpreadsheet(string $tipo, array $filters): Spreadsheet
    {
        [$headers, $rows] = match ($tipo) {
            'locales' => [$this->localesHeaders(), $this->localesRows($filters)],
            'movimientos' => [$this->movimientosHeaders(), $this->movimientosRows($filters)->all()],
            default => [$this->pantallasHeaders(), $this->pantallasRows($filters)],
        };

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($this->sheetTitle($tipo));

        $lastColumn = $this->columnLetter(count($headers));
        $sheet->mergeCells("A1:{$lastColumn}1");
        $sheet->mergeCells("A2:{$lastColumn}2");
        $sheet->mergeCells("A3:{$lastColumn}3");
        $sheet->setCellValue('A1', $this->reportTitle($tipo, $filters));
        $sheet->setCellValue('A2', 'ClaroLocales');
        $sheet->setCellValue('A3', 'Generado: ' . now()->format('d/m/Y H:i'));

        $logo = public_path('logoplantilla.png');
        if (is_file($logo)) {
            $drawing = new Drawing();
            $drawing->setName('Claro');
            $drawing->setPath($logo);
            $drawing->setHeight(44);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(10);
            $drawing->setOffsetY(4);
            $drawing->setWorksheet($sheet);
            $sheet->getRowDimension(1)->setRowHeight(46);
        }

        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '111827']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('A2:A3')->applyFromArray([
            'font' => ['size' => 10, 'color' => ['rgb' => '6B7280']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        $headerRow = 5;
        foreach ($headers as $index => $header) {
            $sheet->setCellValue($this->columnLetter($index + 1) . $headerRow, $header);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E30613']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        $rowNumber = $headerRow + 1;
        foreach ($rows as $row) {
            foreach (array_values($row) as $index => $value) {
                $cell = $this->columnLetter($index + 1) . $rowNumber;
                $sheet->setCellValueExplicit($cell, (string) ($value ?? ''), DataType::TYPE_STRING);
            }
            $rowNumber++;
        }

        if ($rowNumber > $headerRow + 1) {
            $sheet->getStyle("A" . ($headerRow + 1) . ":{$lastColumn}" . ($rowNumber - 1))->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E5E7EB']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_TOP],
            ]);
        }

        $sheet->freezePane('A6');
        $sheet->setAutoFilter("A{$headerRow}:{$lastColumn}{$headerRow}");
        foreach (range(1, count($headers)) as $index) {
            $sheet->getColumnDimension($this->columnLetter($index))->setAutoSize(true);
        }

        return $spreadsheet;
    }

    private function pantallasHeaders(): array
    {
        return ['Serie', 'N° guía', 'Marca', 'Tipo pantalla', 'Modelo equipo', 'Tamaño', 'Estado pantalla', 'Fecha registro', 'Local', 'Tipo local', 'Estado local', 'Zona', 'Departamento', 'Provincia', 'Distrito', 'Dirección'];
    }

    private function localesHeaders(): array
    {
        return ['Código', 'Nombre', 'Tipo', 'Estado', 'Zona', 'Departamento', 'Provincia', 'Distrito', 'Dirección', 'Contacto', 'Celular', 'Pantallas', 'Latitud', 'Longitud'];
    }

    private function movimientosHeaders(): array
    {
        return ['Fecha', 'Origen', 'Código', 'Nombre / Serie', 'Movimiento', 'Detalle', 'Motivo', 'Usuario', 'Zona', 'Departamento'];
    }

    private function pantallasRows(array $filters): array
    {
        return $this->pantallasQuery($filters)->get()->map(function ($pantalla) {
            $row = $this->pantallaRow($pantalla);

            return [
                $row['serie'],
                $row['numero_guia'],
                $row['marca'],
                $row['modelo'],
                $row['modelo_equipo'],
                $row['tamanio'],
                $row['estado'],
                $row['fecha_registro'],
                $row['local_nombre'],
                $row['local_tipo'],
                $row['local_estado'],
                $row['zona'],
                $row['departamento'],
                $row['provincia'],
                $row['distrito'],
                $row['direccion'],
            ];
        })->all();
    }

    private function localesRows(array $filters): array
    {
        return $this->localesQuery($filters)->get()->map(fn($local) => array_values($this->localRow($local)))->all();
    }

    private function pantallaRow(Pantalla $pantalla): array
    {
        return [
            'codigo' => $pantalla->codigo,
            'serie' => $pantalla->serie,
            'numero_guia' => $pantalla->numero_guia,
            'marca' => $pantalla->marca,
            'modelo' => $pantalla->modelo,
            'modelo_equipo' => $pantalla->modelo_equipo,
            'tamanio' => $pantalla->tamanio,
            'estado' => $pantalla->estado,
            'fecha_registro' => $this->formatDate($pantalla->fecha_registro),
            'local_codigo' => $pantalla->local?->codigo,
            'local_nombre' => $pantalla->local?->nombre,
            'local_tipo' => $pantalla->local?->tipo,
            'local_estado' => $pantalla->local?->estado,
            'zona' => $pantalla->local?->zona,
            'departamento' => $pantalla->local?->departamento,
            'provincia' => $pantalla->local?->provincia,
            'distrito' => $pantalla->local?->distrito,
            'direccion' => $pantalla->local?->direccion,
        ];
    }

    private function localRow(Local $local): array
    {
        return [
            'codigo' => $local->codigo,
            'nombre' => $local->nombre,
            'tipo' => $local->tipo,
            'estado' => $local->estado,
            'zona' => $local->zona,
            'departamento' => $local->departamento,
            'provincia' => $local->provincia,
            'distrito' => $local->distrito,
            'direccion' => $local->direccion,
            'contacto_nombre' => $local->contacto_nombre,
            'contacto_celular' => $local->contacto_celular,
            'pantallas' => $local->pantallas_count,
            'lat' => $local->lat,
            'lng' => $local->lng,
        ];
    }

    private function formatDate($value): ?string
    {
        if (!$value) {
            return null;
        }

        return Carbon::parse($value)->format('d/m/Y');
    }

    private function reportTitle(string $tipo, array $filters): string
    {
        $base = match ($tipo) {
            'locales' => 'Reporte de locales',
            'movimientos' => 'Reporte de historial de movimientos',
            default => 'Reporte de inventario de pantallas',
        };

        $parts = [];
        foreach ([
            'zona' => 'Zona',
            'departamento' => 'Departamento',
            'provincia' => 'Provincia',
            'tipo_local' => 'Tipo local',
            'estado_local' => 'Estado local',
            'estado_pantalla' => 'Estado pantalla',
            'fecha_desde' => 'Desde',
            'fecha_hasta' => 'Hasta',
        ] as $key => $label) {
            if (!empty($filters[$key])) {
                $parts[] = $label . ': ' . $filters[$key];
            }
        }

        return $base . ' - ' . (count($parts) ? implode(' | ', $parts) : 'Todos los registros');
    }

    private function sheetTitle(string $tipo): string
    {
        return match ($tipo) {
            'locales' => 'Locales',
            'movimientos' => 'Movimientos',
            default => 'Pantallas',
        };
    }

    private function columnLetter(int $index): string
    {
        $letter = '';

        while ($index > 0) {
            $mod = ($index - 1) % 26;
            $letter = chr(65 + $mod) . $letter;
            $index = intdiv($index - $mod, 26);
        }

        return $letter;
    }
}
