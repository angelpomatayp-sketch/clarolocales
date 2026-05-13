import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function Modal({ open, onClose, title, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}

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
            onSuccess: () => setDeleteTipo(null),
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
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Estado</th>
                            <th className="px-4 py-3 w-24" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tipos.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-14 text-sm text-gray-400">
                                    No hay tipos de pantalla registrados. Crea el primero.
                                </td>
                            </tr>
                        ) : tipos.map((tipo, idx) => (
                            <tr key={tipo.id} className={`transition-colors hover:bg-gray-50 ${!tipo.activo ? 'opacity-50' : ''}`}>
                                <td className="px-5 py-3 text-xs text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                    <span className="font-semibold text-gray-900">{tipo.nombre}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{tipo.descripcion || <span className="italic text-gray-300">Sin descripción</span>}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                        tipo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${tipo.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {tipo.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => openEdit(tipo)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                            title="Editar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        {canDelete && (
                                            <button
                                                onClick={() => setDeleteTipo(tipo)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Eliminar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
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
                            <button onClick={() => setDeleteTipo(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
                                Eliminar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
