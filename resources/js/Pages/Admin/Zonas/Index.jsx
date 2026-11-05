import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/AppModal';
import EmptyState from '@/Components/EmptyState';
import { RowAction, RowActions } from '@/Components/RowActions';
import AdminLayout from '@/Layouts/AdminLayout';

const PERU_DEPARTAMENTOS = [
    'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
    'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
    'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
    'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
    'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
];

const COLOR_SWATCHES = [
    '#E30613', '#16A34A', '#2563EB', '#7C3AED',
    '#EA580C', '#0891B2', '#BE185D', '#65A30D',
];

function coverageSummary(coverages = []) {
    const groups = new Map();

    coverages.forEach(({ departamento, provincia }) => {
        const key = `${departamento}|${provincia}`;
        groups.set(key, (groups.get(key) || 0) + 1);
    });

    return [...groups.entries()].map(([key, districtCount]) => {
        const [departamento, provincia] = key.split('|');
        return { key, departamento, provincia, districtCount };
    });
}

function ZonaForm({ form, otherZonaDeptos, submitLabel, onSubmit }) {
    const { data, setData, errors, processing } = form;

    const toggleDepto = (depto) => {
        const current = data.departamentos || [];
        if (current.includes(depto)) {
            setData('departamentos', current.filter((d) => d !== depto));
        } else {
            setData('departamentos', [...current, depto]);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la zona</label>
                <input
                    type="text"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${errors.nombre ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'}`}
                    placeholder="ej. Norte, Sur, Lima..."
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
            </div>

            {/* Color */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setData('color', color)}
                            className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
                            style={{
                                backgroundColor: color,
                                borderColor: data.color === color ? '#111827' : 'transparent',
                            }}
                        >
                            {data.color === color && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
                {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color}</p>}
            </div>

            {/* Departamentos */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamentos asignados
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {PERU_DEPARTAMENTOS.map((depto) => {
                        const occupiedBy = otherZonaDeptos[depto];
                        const isOccupied = !!occupiedBy;
                        const isSelected = (data.departamentos || []).includes(depto);
                        return (
                            <label
                                key={depto}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                                    isOccupied
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-red-50 text-red-800'
                                        : 'hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isOccupied}
                                    onChange={() => !isOccupied && toggleDepto(depto)}
                                    className="w-3.5 h-3.5 rounded border-gray-300"
                                />
                                <span className="truncate">{depto}</span>
                                {isOccupied && (
                                    <span className="text-xs text-gray-400 ml-auto truncate">{occupiedBy}</span>
                                )}
                            </label>
                        );
                    })}
                </div>
                {errors.departamentos && <p className="mt-1 text-xs text-red-600">{errors.departamentos}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
                    style={{ backgroundColor: '#E30613' }}
                >
                    {processing && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    )}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

export default function ZonasIndex({ zonas = [], deptoConZona = {} }) {
    const user = usePage().props.auth?.user || {};
    const canDelete = user.rol === 'admin';
    const [createOpen, setCreateOpen] = useState(false);
    const [editZona, setEditZona] = useState(null);
    const [deleteZona, setDeleteZona] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const createForm = useForm({ nombre: '', color: COLOR_SWATCHES[0], departamentos: [] });
    const editForm = useForm({ nombre: '', color: '', departamentos: [] });

    // Build map of depto -> zona name excluding current edit zone
    const buildOtherZonaDeptos = (excludeId = null) => {
        const map = {};
        zonas.forEach((z) => {
            if (z.id === excludeId) return;
            (z.departamentos || []).forEach((d) => {
                map[d] = z.nombre;
            });
        });
        return map;
    };

    // Departments without any zone
    const assignedDeptos = new Set(zonas.flatMap((z) => z.departamentos || []));
    const unassignedDeptos = PERU_DEPARTAMENTOS.filter((d) => !assignedDeptos.has(d));

    const openEdit = (zona) => {
        editForm.setData({
            nombre: zona.nombre,
            color: zona.color,
            departamentos: zona.departamentos || [],
        });
        setEditZona(zona);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/zonas', {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put('/admin/zonas/' + editZona.id, {
            onSuccess: () => setEditZona(null),
        });
    };

    const handleDelete = () => {
        router.delete('/admin/zonas/' + deleteZona.id, {
            onStart: () => setDeleteProcessing(true),
            onSuccess: () => setDeleteZona(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AdminLayout title="Zonas">
            <Head title="Zonas" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm text-gray-500 mt-0.5">Gestión de zonas geográficas y asignación de departamentos</p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: '#E30613' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva zona
                </button>
            </div>

            {/* Tabla de zonas */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="hidden text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8 sm:table-cell">#</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zona</th>
                            <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide md:table-cell">Departamentos y provincias cargadas</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Ubic.</th>
                            <th className="px-4 py-3 w-24" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {zonas.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <EmptyState compact title="No hay zonas registradas" description="Crea una zona y asigna su cobertura geográfica." actionLabel="Crear zona" onAction={() => setCreateOpen(true)} />
                                </td>
                            </tr>
                        ) : zonas.map((zona, idx) => (
                            <tr key={zona.id} className="hover:bg-gray-50 transition-colors">
                                <td className="hidden px-5 py-3 text-xs text-gray-400 sm:table-cell">{idx + 1}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: zona.color }} />
                                        <span className="font-semibold text-gray-900">{zona.nombre}</span>
                                    </div>
                                </td>
                                <td className="hidden px-4 py-3 md:table-cell">
                                    <div className="flex flex-wrap gap-1.5">
                                        {(zona.coberturas || []).length === 0 ? (
                                            <span className="text-xs text-gray-400 italic">Sin asignar</span>
                                        ) : coverageSummary(zona.coberturas).map((coverage) => (
                                            <span
                                                key={coverage.key}
                                                className="rounded-md border px-2 py-1 text-xs text-gray-700"
                                                style={{ borderColor: `${zona.color}55`, backgroundColor: `${zona.color}0D` }}
                                            >
                                                <strong>{coverage.departamento}</strong> · {coverage.provincia} ({coverage.districtCount})
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                                    {(zona.coberturas || []).length}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <RowActions label={`Acciones de ${zona.nombre}`}>
                                            <RowAction onClick={() => openEdit(zona)}>Editar</RowAction>
                                        {canDelete && (
                                            <RowAction
                                                onClick={() => setDeleteZona(zona)}
                                                danger
                                            >
                                                Eliminar
                                            </RowAction>
                                        )}
                                        </RowActions>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sin zona asignada */}
            {unassignedDeptos.length > 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 overflow-hidden">
                    <div className="h-1 bg-gray-300" />
                    <div className="p-4">
                        <h3 className="font-medium text-gray-500 mb-3 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Sin zona asignada ({unassignedDeptos.length})
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {unassignedDeptos.map((d) => (
                                <span key={d} className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva zona">
                <ZonaForm
                    form={createForm}
                    otherZonaDeptos={buildOtherZonaDeptos()}
                    submitLabel="Crear zona"
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!editZona} onClose={() => setEditZona(null)} title="Editar zona">
                {editZona && (
                    <ZonaForm
                        form={editForm}
                        otherZonaDeptos={buildOtherZonaDeptos(editZona.id)}
                        submitLabel="Guardar cambios"
                        onSubmit={handleEdit}
                    />
                )}
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal open={!!deleteZona} onClose={() => setDeleteZona(null)} title="Eliminar zona">
                {deleteZona && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            ¿Estás seguro de que deseas eliminar la zona <strong>{deleteZona.nombre}</strong>?
                            Los departamentos asignados quedarán sin zona.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteZona(null)}
                                disabled={deleteProcessing}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteProcessing}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {deleteProcessing ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
