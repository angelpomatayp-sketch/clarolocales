// ── Estados de local ──────────────────────────────────────────────────────────

export const ESTADO_LOCAL_DOT = {
    'Activo':               '#16A34A',
    'Cerrado':              '#DC2626',
    'En remodelación':      '#D97706',
    'Trasladado':           '#EA580C',
    'Nuevo local':          '#059669',
    'Suspendido':           '#9CA3AF',
    'Pendiente validación': '#0EA5E9',
};

export const ESTADO_LOCAL_COLORS = {
    'Activo':               'bg-green-100 text-green-800',
    'Cerrado':              'bg-red-100 text-red-800',
    'En remodelación':      'bg-yellow-100 text-yellow-800',
    'Trasladado':           'bg-orange-100 text-orange-800',
    'Nuevo local':          'bg-emerald-100 text-emerald-800',
    'Suspendido':           'bg-gray-100 text-gray-700',
    'Pendiente validación': 'bg-sky-100 text-sky-800',
};

// ── Zonas ─────────────────────────────────────────────────────────────────────

export const ZONA_COLORS = {
    Norte:         '#2563EB',
    Sur:           '#16A34A',
    Centro:        '#7C3AED',
    Lima:          '#E30613',
    'Sin asignar': '#9CA3AF',
};

// ── Tipos de local ────────────────────────────────────────────────────────────

export const TIPO_BADGE = {
    DAC:    { bg: '#EFF6FF', color: '#1D4ED8', label: 'DAC' },
    CAC:    { bg: '#F5F3FF', color: '#7C3AED', label: 'CAC' },
    CADENA: { bg: '#FFF7ED', color: '#C2410C', label: 'CADENA' },
};

export const TIPO_COLORS = {
    DAC:    'bg-blue-100 text-blue-800',
    CAC:    'bg-purple-100 text-purple-800',
    CADENA: 'bg-orange-100 text-orange-800',
};

// ── Estados de pantalla ───────────────────────────────────────────────────────

export const ESTADOS_PANTALLA = [
    'En almacén',
    'Operativa',
    'En mantenimiento',
    'Avería',
    'Sin señal',
    'Trasladada',
    'Retirada',
    'Dada de baja',
];

export const ESTADO_PANTALLA_COLOR = {
    'Operativa':        '#76B82A',
    'En almacén':       '#005CA9',
    'En mantenimiento': '#EF7D00',
    'Avería':           '#E30613',
    'Sin señal':        '#7E3910',
    'Trasladada':       '#9F4C97',
    'Retirada':         '#EB5E9D',
    'Dada de baja':     '#6B7280',
};

export const ESTADO_PANTALLA_BADGE = {
    'En almacén':       'bg-gray-100 text-gray-700',
    'Operativa':        'bg-green-100 text-green-800',
    'En mantenimiento': 'bg-blue-100 text-blue-800',
    'Avería':           'bg-red-100 text-red-800',
    'Sin señal':        'bg-orange-100 text-orange-800',
    'Trasladada':       'bg-purple-100 text-purple-800',
    'Retirada':         'bg-pink-100 text-pink-800',
    'Dada de baja':     'bg-gray-200 text-gray-500',
};

// ── SVG markers de pantalla ───────────────────────────────────────────────────

export const ESTADO_PANTALLA_SVG = {
    'Operativa':        'claro-estado-operativa.svg',
    'En almacén':       'claro-estado-almacen.svg',
    'En mantenimiento': 'claro-estado-mantenimiento.svg',
    'Avería':           'claro-estado-averia.svg',
    'Sin señal':        'claro-estado-sinsenal.svg',
    'Trasladada':       'claro-estado-trasladada.svg',
    'Retirada':         'claro-estado-retirada.svg',
    'Dada de baja':     'claro-estado-baja.svg',
};

// ── HTML escaping (para info windows de Google Maps) ──────────────────────────

export function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
