import { useState, useMemo } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'regional', label: 'Regional' },
    { value: 'operativo', label: 'Operativo' },
    { value: 'usuario', label: 'Usuario' },
];

const ZONAS = ['Norte', 'Sur', 'Centro', 'Lima'];

const ROL_COLORS = {
    admin: 'bg-red-100 text-red-800',
    supervisor: 'bg-orange-100 text-orange-800',
    regional: 'bg-blue-100 text-blue-800',
    operativo: 'bg-green-100 text-green-800',
    usuario: 'bg-gray-100 text-gray-700',
};

const ROL_LABELS = {
    admin: 'Admin',
    supervisor: 'Supervisor',
    regional: 'Regional',
    operativo: 'Operativo',
    usuario: 'Usuario',
};

function Modal({ open, onClose, title, children, size = 'lg' }) {
    if (!open) return null;
    const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };
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

function UsuarioForm({ form, isEdit, onSubmit }) {
    const { data, setData, errors, processing } = form;

    const inputClass = (err) =>
        `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            err ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'
        }`;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <FieldGroup label="Nombre completo" error={errors.name}>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Juan García"
                    className={inputClass(errors.name)}
                />
            </FieldGroup>

            <FieldGroup label="Correo electrónico" error={errors.email}>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="juan@claro.com.pe"
                    className={inputClass(errors.email)}
                />
            </FieldGroup>

            <FieldGroup label={isEdit ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'} error={errors.password}>
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder={isEdit ? '••••••••' : 'Mínimo 8 caracteres'}
                    className={inputClass(errors.password)}
                    autoComplete="new-password"
                />
            </FieldGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Rol" error={errors.rol}>
                    <select
                        value={data.rol}
                        onChange={(e) => setData('rol', e.target.value)}
                        className={inputClass(errors.rol) + ' bg-white'}
                    >
                        <option value="">Seleccionar rol</option>
                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                </FieldGroup>

                {data.rol === 'regional' ? (
                    <FieldGroup label="Zona" error={errors.zona}>
                        <select
                            value={data.zona}
                            onChange={(e) => setData('zona', e.target.value)}
                            className={inputClass(errors.zona) + ' bg-white'}
                        >
                            <option value="">Seleccionar zona</option>
                            {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
                        </select>
                    </FieldGroup>
                ) : (
                    <div />
                )}
            </div>

            {/* Activo toggle */}
            <div className="flex items-center justify-between py-2 px-3.5 border border-gray-200 rounded-lg">
                <div>
                    <p className="text-sm font-medium text-gray-700">Usuario activo</p>
                    <p className="text-xs text-gray-400">Los usuarios inactivos no pueden ingresar al sistema</p>
                </div>
                <button
                    type="button"
                    onClick={() => setData('activo', !data.activo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.activo ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${data.activo ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
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
                    {isEdit ? 'Guardar cambios' : 'Crear usuario'}
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

function Avatar({ name }) {
    const initials = name
        ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
        : 'U';
    return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-gray-600">{initials}</span>
        </div>
    );
}

const EMPTY_FORM = { name: '', email: '', password: '', rol: '', zona: '', activo: true };

export default function UsuariosIndex({ usuarios = [] }) {
    const user = usePage().props.auth?.user || {};
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editUsuario, setEditUsuario] = useState(null);
    const [deleteUsuario, setDeleteUsuario] = useState(null);

    const createForm = useForm({ ...EMPTY_FORM });
    const editForm = useForm({ ...EMPTY_FORM });

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return usuarios;
        return usuarios.filter(
            (u) =>
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.rol?.toLowerCase().includes(q) ||
                u.zona?.toLowerCase().includes(q)
        );
    }, [usuarios, search]);

    const openEdit = (usuario) => {
        editForm.setData({
            name: usuario.name || '',
            email: usuario.email || '',
            password: '',
            rol: usuario.rol || '',
            zona: usuario.zona || '',
            activo: !!usuario.activo,
        });
        setEditUsuario(usuario);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/usuarios', {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editForm.put('/admin/usuarios/' + editUsuario.id, {
            onSuccess: () => setEditUsuario(null),
        });
    };

    const handleDelete = () => {
        router.delete('/admin/usuarios/' + deleteUsuario.id, {
            onSuccess: () => setDeleteUsuario(null),
        });
    };

    const toggleActivo = (usuario) => {
        router.put('/admin/usuarios/' + usuario.id, {
            ...usuario,
            activo: !usuario.activo,
        });
    };

    return (
        <AdminLayout title="Usuarios">
            <Head title="Usuarios" />

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
                        placeholder="Buscar por nombre, email, rol, zona..."
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
                    Nuevo usuario
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zona</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Creado</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                                        {search ? 'No se encontraron resultados.' : 'No hay usuarios registrados.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((usuario) => (
                                    <tr key={usuario.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={usuario.name} />
                                                <div>
                                                    <p className="font-medium text-gray-900">{usuario.name}</p>
                                                    <p className="text-xs text-gray-400">{usuario.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROL_COLORS[usuario.rol] || 'bg-gray-100 text-gray-700'}`}>
                                                {ROL_LABELS[usuario.rol] || usuario.rol}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {usuario.zona || <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => toggleActivo(usuario)}
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                    usuario.activo
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            >
                                                {usuario.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(usuario.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(usuario)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {usuario.id !== user.id && (
                                                    <button
                                                        onClick={() => setDeleteUsuario(usuario)}
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
                    <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
                        {filtered.length} de {usuarios.length} usuarios
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo usuario">
                <UsuarioForm form={createForm} isEdit={false} onSubmit={handleCreate} />
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!editUsuario} onClose={() => setEditUsuario(null)} title={`Editar: ${editUsuario?.name || ''}`}>
                {editUsuario && (
                    <UsuarioForm form={editForm} isEdit onSubmit={handleEdit} />
                )}
            </Modal>

            {/* Delete Confirm */}
            <Modal open={!!deleteUsuario} onClose={() => setDeleteUsuario(null)} title="Eliminar usuario" size="sm">
                {deleteUsuario && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            ¿Eliminar el usuario <strong>{deleteUsuario.name}</strong> ({deleteUsuario.email})?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteUsuario(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
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
