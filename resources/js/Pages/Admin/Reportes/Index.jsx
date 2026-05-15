import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const REPORTES = [
    { value: 'pantallas', label: 'Inventario de pantallas' },
    { value: 'locales', label: 'Locales' },
    { value: 'movimientos', label: 'Historial de movimientos' },
];

const HEADERS = {
    pantallas: [
        ['serie', 'Serie'],
        ['estado', 'Estado'],
        ['modelo', 'Tipo pantalla'],
        ['tamanio', 'Tamaño'],
        ['local_nombre', 'Local'],
        ['local_tipo', 'Tipo local'],
        ['zona', 'Zona'],
        ['departamento', 'Departamento'],
        ['provincia', 'Provincia'],
        ['distrito', 'Distrito'],
        ['direccion', 'Dirección'],
    ],
    locales: [
        ['codigo', 'Código'],
        ['nombre', 'Nombre'],
        ['tipo', 'Tipo'],
        ['estado', 'Estado'],
        ['zona', 'Zona'],
        ['departamento', 'Departamento'],
        ['provincia', 'Provincia'],
        ['pantallas', 'Pantallas'],
    ],
    movimientos: [
        ['fecha', 'Fecha'],
        ['origen', 'Origen'],
        ['codigo', 'Código'],
        ['nombre', 'Nombre / Serie'],
        ['tipo', 'Movimiento'],
        ['descripcion', 'Detalle'],
        ['motivo', 'Motivo'],
        ['usuario', 'Usuario'],
        ['zona', 'Zona'],
        ['departamento', 'Departamento'],
    ],
};

function Select({ label, value, onChange, options, placeholder }) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</span>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            >
                <option value="">{placeholder}</option>
                {(options || []).map((option) => {
                    const value = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    return <option key={value} value={value}>{optionLabel}</option>;
                })}
            </select>
        </label>
    );
}

function DateInput({ label, value, onChange }) {
    return (
        <label className="block">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</span>
            <input
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            />
        </label>
    );
}

export default function ReportesIndex({ filters = {}, options = {}, summary = {}, preview = [] }) {
    const [form, setForm] = useState({
        reporte: filters.reporte || 'pantallas',
        zona: filters.zona || '',
        departamento: filters.departamento || '',
        provincia: filters.provincia || '',
        tipo_local: filters.tipo_local || '',
        estado_local: filters.estado_local || '',
        estado_pantalla: filters.estado_pantalla || '',
        fecha_desde: filters.fecha_desde || '',
        fecha_hasta: filters.fecha_hasta || '',
    });
    const [filtering, setFiltering] = useState(false);

    const headers = HEADERS[form.reporte] || HEADERS.pantallas;

    const params = useMemo(() => {
        const clean = {};
        Object.entries(form).forEach(([key, value]) => {
            if (value) clean[key] = value;
        });
        return clean;
    }, [form]);

    const cleanParams = (values) => {
        const clean = {};
        Object.entries(values).forEach(([key, value]) => {
            if (value) clean[key] = value;
        });
        return clean;
    };

    const update = (key, value) => {
        setForm((current) => {
            const next = { ...current, [key]: value };
            if (key === 'zona') {
                next.departamento = '';
                next.provincia = '';
            }
            if (key === 'departamento') {
                next.provincia = '';
            }
            if (key === 'reporte') {
                router.get('/admin/reportes', cleanParams(next), {
                    preserveScroll: true,
                    preserveState: true,
                    onStart: () => setFiltering(true),
                    onFinish: () => setFiltering(false),
                });
            }
            return next;
        });
    };

    const applyFilters = () => {
        router.get('/admin/reportes', params, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setFiltering(true),
            onFinish: () => setFiltering(false),
        });
    };

    const clearFilters = () => {
        const clean = {
            reporte: form.reporte,
            zona: '',
            departamento: '',
            provincia: '',
            tipo_local: '',
            estado_local: '',
            estado_pantalla: '',
            fecha_desde: '',
            fecha_hasta: '',
        };
        setForm(clean);
        router.get('/admin/reportes', { reporte: form.reporte }, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setFiltering(true),
            onFinish: () => setFiltering(false),
        });
    };

    const exportUrl = `/admin/reportes/exportar?${new URLSearchParams(params).toString()}`;

    return (
        <AdminLayout title="Reportes">
            <Head title="Reportes" />

            <div className="space-y-5">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Exportación de información</h2>
                            <p className="text-sm text-gray-400 mt-1">Los filtros se aplican en todos los registros antes de generar el archivo.</p>
                        </div>
                        <a
                            href={exportUrl}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m4 7H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2z" />
                            </svg>
                            Exportar Excel
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <Select
                            label="Reporte"
                            value={form.reporte}
                            onChange={(value) => update('reporte', value || 'pantallas')}
                            options={REPORTES}
                            placeholder="Seleccionar reporte"
                        />
                        <Select label="Zona" value={form.zona} onChange={(value) => update('zona', value)} options={options.zonas} placeholder="Todas las zonas" />
                        <Select label="Departamento" value={form.departamento} onChange={(value) => update('departamento', value)} options={options.departamentos} placeholder="Todos los departamentos" />
                        <Select label="Provincia" value={form.provincia} onChange={(value) => update('provincia', value)} options={options.provincias} placeholder="Todas las provincias" />
                        <Select label="Tipo local" value={form.tipo_local} onChange={(value) => update('tipo_local', value)} options={options.tiposLocal} placeholder="Todos los tipos" />
                        <Select label="Estado local" value={form.estado_local} onChange={(value) => update('estado_local', value)} options={options.estadosLocal} placeholder="Todos los estados" />
                        <Select label="Estado pantalla" value={form.estado_pantalla} onChange={(value) => update('estado_pantalla', value)} options={options.estadosPantalla} placeholder="Todos los estados" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DateInput label="Desde" value={form.fecha_desde} onChange={(value) => update('fecha_desde', value)} />
                            <DateInput label="Hasta" value={form.fecha_hasta} onChange={(value) => update('fecha_hasta', value)} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-5">
                        <button
                            onClick={applyFilters}
                            disabled={filtering}
                            className="px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {filtering ? 'Aplicando...' : 'Aplicar filtros'}
                        </button>
                        <button
                            onClick={clearFilters}
                            disabled={filtering}
                            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">Registros encontrados</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total ?? 0}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
                        <p className="text-sm text-gray-500">Formato de descarga</p>
                        <p className="text-sm text-gray-900 mt-1">Archivo Excel .xlsx con logo, título dinámico y filtros aplicados.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900 text-sm">Vista previa</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {headers.map(([, label]) => (
                                        <th key={label} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.length === 0 ? (
                                    <tr>
                                        <td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-gray-400">
                                            No hay registros para mostrar.
                                        </td>
                                    </tr>
                                ) : (
                                    preview.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                                            {headers.map(([key]) => (
                                                <td key={key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                                                    {row[key] || <span className="text-gray-300">—</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {preview.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                            Mostrando hasta 10 registros de vista previa.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
