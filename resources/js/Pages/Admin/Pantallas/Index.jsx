import { useState, useMemo, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ESTADOS_PANTALLA, ESTADO_PANTALLA_BADGE as ESTADO_COLORS } from '@/constants/shared';

// tipos se reciben como prop desde el controlador

function Modal({ open, onClose, title, children, size = 'lg' }) {
    if (!open) return null;
    const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
            </div>
        </div>
    );
}

function FieldGroup({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function PantallaForm({ form, locales, tipos, isEdit, onSubmit }) {
    const { data, setData, errors, processing } = form;

    const inputClass = (err) =>
        `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            err ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'
        }`;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {!isEdit && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-xs text-gray-400">Código</span>
                    <span className="text-xs font-mono text-gray-500 ml-auto">Se asignará automáticamente</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="N° de Serie" error={errors.serie}>
                    <input
                        type="text"
                        value={data.serie}
                        onChange={(e) => setData('serie', e.target.value)}
                        placeholder="SN-XXXXXXXX"
                        className={inputClass(errors.serie)}
                    />
                </FieldGroup>
                <FieldGroup label="N° Guía" error={errors.numero_guia}>
                    <input
                        type="text"
                        value={data.numero_guia}
                        onChange={(e) => setData('numero_guia', e.target.value)}
                        placeholder="GR-XXXXXXXX"
                        className={inputClass(errors.numero_guia)}
                    />
                </FieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Marca" error={errors.marca}>
                    <input
                        type="text"
                        value={data.marca}
                        onChange={(e) => setData('marca', e.target.value)}
                        placeholder="LG, Samsung, Philips..."
                        className={inputClass(errors.marca)}
                    />
                </FieldGroup>
                <FieldGroup label="Tamaño (pulgadas)" error={errors.tamanio}>
                    <input
                        type="number"
                        value={data.tamanio}
                        onChange={(e) => setData('tamanio', e.target.value)}
                        placeholder="55"
                        min="1"
                        max="255"
                        className={inputClass(errors.tamanio)}
                    />
                </FieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Tipo de pantalla" error={errors.modelo}>
                    <select
                        value={data.modelo}
                        onChange={(e) => setData('modelo', e.target.value)}
                        className={inputClass(errors.modelo) + ' bg-white'}
                    >
                        <option value="">Seleccionar tipo</option>
                        {(tipos || []).map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </FieldGroup>
                <FieldGroup label="Modelo del equipo" error={errors.modelo_equipo}>
                    <input
                        type="text"
                        value={data.modelo_equipo}
                        onChange={(e) => setData('modelo_equipo', e.target.value)}
                        placeholder="QM75C, QH55B..."
                        className={inputClass(errors.modelo_equipo)}
                    />
                </FieldGroup>
            </div>

            <FieldGroup label="Posición" error={errors.posicion}>
                <input
                    type="text"
                    value={data.posicion}
                    onChange={(e) => setData('posicion', e.target.value)}
                    placeholder="Ventana 1, Entrada..."
                    className={inputClass(errors.posicion)}
                />
            </FieldGroup>

            <FieldGroup label="Estado" error={errors.estado}>
                <select
                    value={data.estado}
                    onChange={(e) => setData('estado', e.target.value)}
                    className={inputClass(errors.estado) + ' bg-white'}
                >
                    <option value="">Seleccionar estado</option>
                    {ESTADOS_PANTALLA.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
            </FieldGroup>

            <FieldGroup label="Fecha de registro" error={errors.fecha_registro}>
                <input
                    type="date"
                    value={data.fecha_registro}
                    onChange={(e) => setData('fecha_registro', e.target.value)}
                    className={inputClass(errors.fecha_registro)}
                />
            </FieldGroup>

            <FieldGroup label="Local asignado" error={errors.local_id}>
                <select
                    value={data.local_id}
                    onChange={(e) => setData('local_id', e.target.value)}
                    className={inputClass(errors.local_id) + ' bg-white'}
                >
                    <option value="">Sin asignar</option>
                    {locales.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.codigo} — {l.nombre}
                        </option>
                    ))}
                </select>
            </FieldGroup>

            {isEdit && (
                <>
                    <div className="flex items-center gap-2.5 pt-1 pb-1">
                        <div
                            onClick={() => setData('registrar_historial', !data.registrar_historial)}
                            className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors flex-shrink-0 ${data.registrar_historial ? 'bg-red-600' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.registrar_historial ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-xs text-gray-600 select-none cursor-pointer" onClick={() => setData('registrar_historial', !data.registrar_historial)}>
                            Registrar cambio en historial
                        </span>
                    </div>
                    {data.registrar_historial && (
                        <FieldGroup label="Motivo del cambio" error={errors.motivo}>
                            <input
                                type="text"
                                value={data.motivo}
                                onChange={(e) => setData('motivo', e.target.value)}
                                placeholder="Ej: Traslado por cierre de tienda, corrección de estado..."
                                className={inputClass(errors.motivo)}
                            />
                        </FieldGroup>
                    )}
                    <div className="flex items-center gap-2.5 pt-1 pb-1">
                        <div
                            onClick={() => setData('registrar_mantenimiento', !data.registrar_mantenimiento)}
                            className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors flex-shrink-0 ${data.registrar_mantenimiento ? 'bg-red-600' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.registrar_mantenimiento ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-xs text-gray-600 select-none cursor-pointer" onClick={() => setData('registrar_mantenimiento', !data.registrar_mantenimiento)}>
                            Registrar mantenimiento realizado
                        </span>
                    </div>
                    {data.registrar_mantenimiento && (
                        <div className="grid grid-cols-1 gap-4">
                            <FieldGroup label="Fecha del mantenimiento" error={errors.mantenimiento_fecha}>
                                <input
                                    type="date"
                                    value={data.mantenimiento_fecha}
                                    onChange={(e) => setData('mantenimiento_fecha', e.target.value)}
                                    className={inputClass(errors.mantenimiento_fecha)}
                                />
                            </FieldGroup>
                            <FieldGroup label="Motivo o detalle del mantenimiento" error={errors.mantenimiento_motivo}>
                                <input
                                    type="text"
                                    value={data.mantenimiento_motivo}
                                    onChange={(e) => setData('mantenimiento_motivo', e.target.value)}
                                    placeholder="Ej: Limpieza, revisión de conexión y validación de señal"
                                    className={inputClass(errors.mantenimiento_motivo)}
                                />
                            </FieldGroup>
                        </div>
                    )}
                </>
            )}

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
                    {isEdit ? 'Guardar cambios' : 'Registrar pantalla'}
                </button>
            </div>
        </form>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

const today = () => new Date().toISOString().slice(0, 10);

const PAGE_SIZE = 10;

const EMPTY_FORM = {
    codigo: '',
    serie: '',
    numero_guia: '',
    marca: '',
    modelo: '',
    modelo_equipo: '',
    tamanio: '',
    posicion: '',
    estado: '',
    fecha_registro: '',
    local_id: '',
    motivo: '',
    registrar_historial: false,
    registrar_mantenimiento: false,
    mantenimiento_fecha: today(),
    mantenimiento_motivo: '',
};

export default function PantallasIndex({ pantallas = [], locales = [], tipos = [] }) {
    const user = usePage().props.auth?.user || {};
    const canDelete = user.rol === 'admin';
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [editPantalla, setEditPantalla] = useState(null);
    const [deletePantalla, setDeletePantalla] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const createForm = useForm({ ...EMPTY_FORM });
    const editForm = useForm({ ...EMPTY_FORM });

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return pantallas;
        return pantallas.filter(
            (p) =>
                p.serie?.toLowerCase().includes(q) ||
                p.codigo?.toLowerCase().includes(q) ||
                p.modelo?.toLowerCase().includes(q) ||
                p.local?.nombre?.toLowerCase().includes(q)
        );
    }, [pantallas, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * PAGE_SIZE;
    const pageEnd = pageStart + PAGE_SIZE;
    const paginated = filtered.slice(pageStart, pageEnd);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const openEdit = (pantalla) => {
        editForm.setData({
            serie:               pantalla.serie || '',
            numero_guia:         pantalla.numero_guia || '',
            marca:               pantalla.marca || '',
            modelo:              pantalla.modelo || '',
            modelo_equipo:       pantalla.modelo_equipo || '',
            tamanio:             pantalla.tamanio ? String(pantalla.tamanio) : '',
            posicion:            pantalla.posicion || '',
            estado:              pantalla.estado || '',
            fecha_registro:      pantalla.fecha_registro || '',
            local_id:            pantalla.local_id ? String(pantalla.local_id) : '',
            motivo:              '',
            registrar_historial: false,
            registrar_mantenimiento: false,
            mantenimiento_fecha: today(),
            mantenimiento_motivo: '',
        });
        setEditPantalla(pantalla);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/pantallas', {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put('/admin/pantallas/' + editPantalla.id, {
            onSuccess: () => setEditPantalla(null),
        });
    };

    const handleDelete = () => {
        router.delete('/admin/pantallas/' + deletePantalla.id, {
            onStart: () => setDeleteProcessing(true),
            onSuccess: () => setDeletePantalla(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AdminLayout title="Pantallas">
            <Head title="Pantallas" />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por serie, código, modelo, local..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    />
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#E30613' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva pantalla
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Serie</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Guía</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo / Modelo</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Local / Posición</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registrado</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                                        {search ? 'No se encontraron resultados.' : 'No hay pantallas registradas.'}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((pantalla) => (
                                    <tr key={pantalla.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{pantalla.codigo}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{pantalla.serie}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{pantalla.numero_guia || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{pantalla.modelo || '—'}</p>
                                            {pantalla.modelo_equipo && (
                                                <p className="text-xs font-mono text-gray-500">{pantalla.modelo_equipo}</p>
                                            )}
                                            {(pantalla.marca || pantalla.tamanio) && (
                                                <p className="text-xs text-gray-400">
                                                    {[pantalla.marca, pantalla.tamanio ? `${pantalla.tamanio}"` : null].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {pantalla.local ? (
                                                <div>
                                                    <p className="font-medium text-gray-900 text-xs">{pantalla.local.codigo} — {pantalla.local.nombre}</p>
                                                    {pantalla.posicion && (
                                                        <p className="text-xs text-gray-400">{pantalla.posicion}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[pantalla.estado] || 'bg-gray-100 text-gray-700'}`}>
                                                {pantalla.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(pantalla.fecha_registro)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(pantalla)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => setDeletePantalla(pantalla)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {filtered.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-400">
                        <span>
                            Mostrando {pageStart + 1}-{Math.min(pageEnd, filtered.length)} de {filtered.length} pantallas
                            {filtered.length !== pantallas.length ? ` filtradas de ${pantallas.length}` : ''}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                                    disabled={safePage === 1}
                                    className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-8 h-8 px-2 rounded-lg border text-xs font-medium ${
                                            page === safePage
                                                ? 'bg-red-600 text-white border-red-600'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                                    disabled={safePage === totalPages}
                                    className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva pantalla">
                <PantallaForm form={createForm} locales={locales} tipos={tipos} isEdit={false} onSubmit={handleCreate} />
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!editPantalla} onClose={() => setEditPantalla(null)} title={`Editar: ${editPantalla?.codigo || ''}`}>
                {editPantalla && (
                    <PantallaForm form={editForm} locales={locales} tipos={tipos} isEdit onSubmit={handleEdit} />
                )}
            </Modal>

            {/* Delete Confirm */}
            <Modal open={!!deletePantalla} onClose={() => setDeletePantalla(null)} title="Eliminar pantalla" size="sm">
                {deletePantalla && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            ¿Eliminar la pantalla <strong>{deletePantalla.codigo}</strong> (serie: {deletePantalla.serie})?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletePantalla(null)}
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
