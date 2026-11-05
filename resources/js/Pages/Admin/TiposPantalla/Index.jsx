import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/AppModal';
import EmptyState from '@/Components/EmptyState';
import { RowAction, RowActions } from '@/Components/RowActions';
import AdminLayout from '@/Layouts/AdminLayout';

function TipoForm({ form, submitLabel, onSubmit }) {
    const { data, setData, errors, processing } = form;
    const inputClass = (err) =>
        `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            err ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-100'
        }`;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input
                    type="text"
                    value={data.nombre}
                    onChange={e => setData('nombre', e.target.value)}
                    className={inputClass(errors.nombre)}
                    placeholder="ej. Totem, Minitotem, Display..."
                    autoFocus
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                <input
                    type="text"
                    value={data.descripcion}
                    onChange={e => setData('descripcion', e.target.value)}
                    className={inputClass(errors.descripcion)}
                    placeholder="Descripción breve del tipo de pantalla"
                />
                {errors.descripcion && <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p>}
            </div>

            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                        onClick={() => setData('activo', !data.activo)}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${data.activo ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.activo ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm text-gray-700">{data.activo ? 'Activo' : 'Inactivo'}</span>
                </label>
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

export default function TiposPantallaIndex({ tipos = [] }) {
    const user = usePage().props.auth?.user || {};
    const canDelete = user.rol === 'admin';
    const [createOpen, setCreateOpen]   = useState(false);
    const [editTipo, setEditTipo]       = useState(null);
    const [deleteTipo, setDeleteTipo]   = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const createForm = useForm({ nombre: '', descripcion: '', activo: true });
    const editForm   = useForm({ nombre: '', descripcion: '', activo: true });

    const openEdit = (tipo) => {
        editForm.setData({ nombre: tipo.nombre, descripcion: tipo.descripcion || '', activo: tipo.activo });
        setEditTipo(tipo);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/tipos-pantalla', {
            onSuccess: () => { setCreateOpen(false); createForm.reset(); },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put('/admin/tipos-pantalla/' + editTipo.id, {
            onSuccess: () => setEditTipo(null),
        });
    };

    const handleDelete = () => {
        router.delete('/admin/tipos-pantalla/' + deleteTipo.id, {
            onStart: () => setDeleteProcessing(true),
            onSuccess: () => setDeleteTipo(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    const activos   = tipos.filter(t => t.activo);
    const inactivos = tipos.filter(t => !t.activo);

    return (
        <AdminLayout title="Tipos de Pantalla">
            <Head title="Tipos de Pantalla" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">
                    Gestión de tipos o modelos de pantallas disponibles para asignar a equipos
                </p>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: '#E30613' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo tipo
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="hidden text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8 sm:table-cell">#</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                            <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide md:table-cell">Descripción</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Estado</th>
                            <th className="px-4 py-3 w-24" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tipos.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <EmptyState compact title="No hay tipos de pantalla" description="Crea el primer tipo para utilizarlo en inventario e instalaciones." actionLabel="Crear tipo" onAction={() => setCreateOpen(true)} />
                                </td>
                            </tr>
                        ) : tipos.map((tipo, idx) => (
                            <tr key={tipo.id} className={`transition-colors hover:bg-gray-50 ${!tipo.activo ? 'opacity-50' : ''}`}>
                                <td className="hidden px-5 py-3 text-xs text-gray-400 sm:table-cell">{idx + 1}</td>
                                <td className="px-4 py-3">
                                    <span className="font-semibold text-gray-900">{tipo.nombre}</span>
                                </td>
                                <td className="hidden px-4 py-3 text-gray-500 text-xs md:table-cell">{tipo.descripcion || <span className="italic text-gray-300">Sin descripción</span>}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        tipo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${tipo.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {tipo.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        <RowActions label={`Acciones de ${tipo.nombre}`}>
                                            <RowAction onClick={() => openEdit(tipo)}>Editar</RowAction>
                                        {canDelete && (
                                            <RowAction
                                                onClick={() => setDeleteTipo(tipo)}
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

                {/* Footer con resumen */}
                {tipos.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-xs text-gray-500">
                        <span><strong className="text-gray-700">{tipos.length}</strong> tipos en total</span>
                        <span><strong className="text-green-700">{activos.length}</strong> activos</span>
                        {inactivos.length > 0 && (
                            <span><strong className="text-gray-500">{inactivos.length}</strong> inactivos</span>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Crear */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo tipo de pantalla">
                <TipoForm form={createForm} submitLabel="Crear tipo" onSubmit={handleCreate} />
            </Modal>

            {/* Modal Editar */}
            <Modal open={!!editTipo} onClose={() => setEditTipo(null)} title="Editar tipo de pantalla">
                {editTipo && (
                    <TipoForm form={editForm} submitLabel="Guardar cambios" onSubmit={handleEdit} />
                )}
            </Modal>

            {/* Modal Eliminar */}
            <Modal open={!!deleteTipo} onClose={() => setDeleteTipo(null)} title="Eliminar tipo">
                {deleteTipo && (
                    <div>
                        <p className="text-sm text-gray-600 mb-1">
                            ¿Seguro que deseas eliminar el tipo <strong>"{deleteTipo.nombre}"</strong>?
                        </p>
                        <p className="text-xs text-gray-400 mb-5">
                            Las pantallas que usen este tipo mantendrán el valor como texto pero ya no aparecerá en el selector.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTipo(null)}
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
