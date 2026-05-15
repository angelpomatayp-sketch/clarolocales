import { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Loader } from '@googlemaps/js-api-loader';
import {
    TIPO_BADGE,
    ESTADO_LOCAL_DOT as ESTADO_DOT,
    ZONA_COLORS as ZONA_COLORS_MAP,
    ESTADO_PANTALLA_COLOR as ESTADOS_PANTALLA_COLORS,
    ESTADO_PANTALLA_COLOR as ESTADO_DOT_COLOR,
    ESTADO_PANTALLA_SVG as ESTADO_PANTALLA_PIN_NAMES,
    esc,
} from '@/constants/shared';

const GOOGLE_MAPS_KEY    = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';

function tipoBadge(tipo) {
    const s = TIPO_BADGE[tipo] || { bg: '#F3F4F6', color: '#6B7280', label: tipo };
    return (
        <span
            className="px-2 py-0.5 rounded text-[11px] font-bold"
            style={{ backgroundColor: s.bg, color: s.color }}
        >
            {s.label}
        </span>
    );
}

function estadoDot(estado) {
    return (
        <span className="flex items-center gap-1">
            <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ESTADO_DOT[estado] || '#9CA3AF' }}
            />
            <span className="text-[11px] text-gray-600">{estado}</span>
        </span>
    );
}

// ─── Íconos inline ────────────────────────────────────────────────────────────

const IcoSearch  = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>;
const IcoSerie   = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IcoLista   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>;
const IcoMapa    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>;
const IcoUser    = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcoChevron = ({ open }) => <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>;
const IcoPhone   = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
const IcoMail    = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IcoPin     = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IcoGlobe   = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoScreen  = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IcoClock   = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoPerson  = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function osmEmbedUrl(lat, lng) {
    const delta = 0.008;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`;
}

function gmapsEmbedUrl(lat, lng) {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=${lat},${lng}&zoom=16`;
}

function gmapsUrl(lat, lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function MiniMapa({ lat, lng }) {
    if (!lat || !lng) return null;
    const src = GOOGLE_MAPS_KEY ? gmapsEmbedUrl(lat, lng) : osmEmbedUrl(lat, lng);
    return (
        <iframe
            src={src}
            className="w-full h-full border-0"
            title="Ubicación"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
        />
    );
}

// ─── Sidebar compartido (4 niveles: Zona → Dept → Provincia → Distrito) ──────

function Sidebar({
    locales, zonas,
    activeZona, activeDept, activeProv, activeDist,
    onSelectZona, onSelectDept, onSelectProv, onSelectDist,
    showCounts = false,
    user = {},
}) {
    // Jerarquía: zona → dept → provincia → { distrito: count }
    const hierarchy = useMemo(() => {
        const h = {};
        locales.forEach(l => {
            if (!h[l.zona]) h[l.zona] = {};
            if (!h[l.zona][l.departamento]) h[l.zona][l.departamento] = {};
            if (!h[l.zona][l.departamento][l.provincia]) h[l.zona][l.departamento][l.provincia] = {};
            const d = l.distrito || '—';
            h[l.zona][l.departamento][l.provincia][d] = (h[l.zona][l.departamento][l.provincia][d] || 0) + 1;
        });
        return h;
    }, [locales]);

    const zonaList = zonas.length > 0
        ? zonas.map(z => z.nombre).filter(n => hierarchy[n])
        : Object.keys(hierarchy).sort();

    const countDepts = (deptMap) =>
        Object.values(deptMap).reduce((a, provs) =>
            a + Object.values(provs).reduce((b, dists) =>
                b + Object.values(dists).reduce((c, n) => c + n, 0), 0), 0);

    const countProvs = (provMap) =>
        Object.values(provMap).reduce((a, dists) =>
            a + Object.values(dists).reduce((b, n) => b + n, 0), 0);

    const hasAnyFilter = activeZona || activeDept || activeProv || activeDist;

    return (
        <aside className="h-full w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="flex-1 overflow-y-auto">
                <p className="px-4 pt-5 pb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Regiones
                </p>

            {showCounts && (
                <button
                    onClick={() => onSelectZona(null)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                        !activeZona ? 'font-semibold text-gray-900' : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                    <span className="flex-1">Todos</span>
                    <span className="text-xs text-gray-400">{locales.length}</span>
                </button>
            )}

            {zonaList.map(zonaNombre => {
                const zona    = zonas.find(z => z.nombre === zonaNombre);
                const color   = zona?.color || '#E30613';
                const deptMap = hierarchy[zonaNombre] || {};
                const total   = countDepts(deptMap);
                const isOpenZ = activeZona === zonaNombre;

                return (
                    <div key={zonaNombre}>
                        {/* ── Zona ── */}
                        <button
                            onClick={() => onSelectZona(isOpenZ ? null : zonaNombre)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors
                                ${isOpenZ ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                            {showCounts && (
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            )}
                            <span className="flex-1">{zonaNombre}</span>
                            {showCounts && <span className="text-xs text-gray-400 font-normal">{total}</span>}
                            <IcoChevron open={isOpenZ} />
                        </button>

                        {isOpenZ && Object.entries(deptMap).sort().map(([deptNombre, provMap]) => {
                            const deptTotal  = countProvs(provMap);
                            const isOpenD    = activeDept === deptNombre;
                            const hasProvs   = Object.keys(provMap).length > 0;

                            return (
                                <div key={deptNombre}>
                                    {/* ── Departamento ── */}
                                    <button
                                        onClick={() => onSelectDept(zonaNombre, isOpenD ? null : deptNombre)}
                                        className={`w-full flex items-center gap-2 pl-8 pr-4 py-1.5 text-xs text-left transition-colors
                                            ${isOpenD ? 'text-red-600 font-semibold bg-red-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                                    >
                                        <span className="flex-1">{deptNombre}</span>
                                        {showCounts && <span className="text-[10px] text-gray-400 mr-1">{deptTotal}</span>}
                                        {hasProvs && <IcoChevron open={isOpenD} />}
                                    </button>

                                    {isOpenD && Object.entries(provMap).sort().map(([provNombre, distMap]) => {
                                        const provTotal = Object.values(distMap).reduce((a, n) => a + n, 0);
                                        const isOpenP   = activeProv === provNombre;
                                        const hasDists  = Object.keys(distMap).length > 1;

                                        return (
                                            <div key={provNombre}>
                                                {/* ── Provincia ── */}
                                                <button
                                                    onClick={() => onSelectProv(zonaNombre, deptNombre, isOpenP ? null : provNombre)}
                                                    className={`w-full flex items-center gap-2 pl-14 pr-4 py-1.5 text-xs text-left transition-colors
                                                        ${isOpenP ? 'text-red-600 font-semibold bg-red-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}
                                                >
                                                    <span className="flex-1">{provNombre}</span>
                                                    {showCounts && <span className="text-[10px] text-gray-400 mr-1">{provTotal}</span>}
                                                    {hasDists && <IcoChevron open={isOpenP} />}
                                                </button>

                                                {isOpenP && hasDists && Object.entries(distMap).sort().map(([distNombre, count]) => {
                                                    const isActiveD2 = activeDist === distNombre;
                                                    return (
                                                        <button
                                                            key={distNombre}
                                                            onClick={() => onSelectDist(zonaNombre, deptNombre, provNombre, isActiveD2 ? null : distNombre)}
                                                            className={`w-full flex items-center gap-2 pl-20 pr-4 py-1 text-xs text-left transition-colors
                                                                ${isActiveD2 ? 'text-red-600 font-semibold bg-red-50' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                                                        >
                                                            <span className="flex-1 truncate">{distNombre}</span>
                                                            {showCounts && <span className="text-[10px] text-gray-400">{count}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                );
            })}

                {hasAnyFilter && (
                    <button
                        onClick={() => onSelectZona(null)}
                        className="mx-4 mt-3 mb-4 text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        Limpiar filtro
                    </button>
                )}
            </div>

            <div className="border-t border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-700 truncate">{user.name || 'Usuario'}</p>
                <p className="text-[11px] text-gray-400 truncate mb-3">{user.email || ''}</p>
                <button
                    onClick={() => router.post('/logout')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}

// ─── Tarjeta de local ─────────────────────────────────────────────────────────

function LocalCard({ local, isSelected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left bg-white rounded-xl border-2 transition-all p-4 flex flex-col gap-2 hover:shadow-md
                ${isSelected ? 'border-red-500 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
        >
            <div className="flex items-start justify-between">
                {tipoBadge(local.tipo)}
                {estadoDot(local.estado)}
            </div>

            <div>
                <p className="text-sm font-bold text-gray-900 leading-snug">{local.nombre}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {[local.direccion, local.distrito, local.departamento].filter(Boolean).join(', ')}
                </p>
            </div>

            <div className="flex items-center gap-4 pt-1 border-t border-gray-100 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                    <IcoPerson />
                    <span>{local.codigo}</span>
                </span>
                <span className="flex items-center gap-1">
                    <IcoScreen />
                    <span>{local.pantallas_count ?? 0} pantalla{local.pantallas_count !== 1 ? 's' : ''}</span>
                </span>
            </div>
        </button>
    );
}

// ─── Panel de detalle ─────────────────────────────────────────────────────────

const ESTADO_PANTALLA_DOT = {
    'Operativa':            'bg-green-500',
    'En almacén':           'bg-gray-400',
    'En mantenimiento':     'bg-orange-400',
    'Avería':               'bg-red-500',
    'Sin señal':            'bg-red-400',
    'Trasladada':           'bg-purple-400',
    'Retirada':             'bg-gray-500',
    'Dada de baja':         'bg-gray-600',
};

function DetailPanel({ local, onClose, onVerMapa, pantallaBuscada }) {
    const pantallaDeLLocal = pantallaBuscada?.local?.id === local.id ? pantallaBuscada : null;
    const [tab, setTab]                   = useState(pantallaDeLLocal ? 'historial' : 'info');
    const [pantallasOpen, setPantallasOpen] = useState(false);

    const pantallasConMovs = (local.pantallas || [])
        .map(p => ({
            ...p,
            movimientos: (pantallaBuscada?.id === p.id ? pantallaBuscada.movimientos : p.movimientos) ?? [],
        }))
        .filter(p => p.movimientos.length > 0);
    const tieneHistorialEquipos = pantallasConMovs.length > 0;
    const tieneHistorialLocal   = (local.movimientos?.length ?? 0) > 0;

    return (
        <aside className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden md:relative md:inset-auto md:z-auto md:w-80 md:flex-shrink-0 md:border-l md:border-gray-200">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-gray-100">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {tipoBadge(local.tipo)}
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 leading-tight">{local.nombre}</h2>
                    <div className="mt-1">{estadoDot(local.estado)}</div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 flex-shrink-0">
                {[['info', 'Información'], ['historial', 'Historial']].map(([t, label]) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                            tab === t
                                ? 'text-red-600 border-red-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto">
                {tab === 'info' ? (
                    <>
                        {/* Mini mapa */}
                        <div className="relative h-40 bg-gray-100 flex-shrink-0">
                            {local.lat && local.lng ? (
                                <>
                                    <MiniMapa lat={local.lat} lng={local.lng} />
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                                        <a
                                            href={gmapsUrl(local.lat, local.lng)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 bg-white rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow hover:shadow-md border border-gray-100"
                                        >
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                            Google Maps
                                        </a>
                                        <button
                                            onClick={onVerMapa}
                                            className="flex items-center gap-1 bg-white rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow hover:shadow-md border border-gray-100"
                                        >
                                            <IcoMapa />
                                            Ver en mapa
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-xs text-gray-400">Sin coordenadas</p>
                                </div>
                            )}
                        </div>

                        {/* Campos */}
                        <div className="px-4 py-3 space-y-3">
                            {local.contacto_nombre && (
                                <Row icon={<IcoPerson />} label="Encargado" value={local.contacto_nombre} />
                            )}
                            {local.contacto_celular && (
                                <Row icon={<IcoPhone />} label="Celular" value={local.contacto_celular} />
                            )}
                            {local.direccion && (
                                <Row icon={<IcoPin />} label="Dirección"
                                    value={[local.direccion, local.distrito, local.provincia, local.departamento].filter(Boolean).join(', ')} />
                            )}
                            {local.fecha_apertura && (
                                <Row icon={<IcoClock />} label="Apertura" value={fmtDate(local.fecha_apertura)} />
                            )}
                            <Row icon={<IcoGlobe />} label="Región"
                                value={[local.zona, local.departamento].filter(Boolean).join(' · ')} />
                            {/* Pantallas expandible */}
                            <div>
                                <button
                                    onClick={() => setPantallasOpen(p => !p)}
                                    className="w-full flex items-start gap-2.5 group"
                                >
                                    <span className="text-gray-400 mt-0.5 flex-shrink-0"><IcoScreen /></span>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Pantallas instaladas</p>
                                        <p className="text-xs text-gray-800 leading-snug flex items-center gap-1.5">
                                            <span className="font-medium">{local.pantallas_count ?? 0}</span>
                                            {(local.pantallas_count ?? 0) > 0 && (
                                                <span className="text-gray-400 text-[10px]">
                                                    {pantallasOpen ? '▲ ocultar' : '▼ ver detalle'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </button>

                                {pantallasOpen && (local.pantallas || []).length > 0 && (
                                    <div className="mt-2 ml-6 rounded-lg border border-gray-100 overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">Serie</th>
                                                    <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">Tipo</th>
                                                    <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(local.pantallas || []).map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 font-mono text-gray-700 text-[11px]">{p.serie}</td>
                                                        <td className="px-3 py-2 text-gray-600">
                                                            {p.modelo || '—'}
                                                            {p.modelo_equipo && <span className="ml-1 font-mono text-gray-400 text-[10px]">({p.modelo_equipo})</span>}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span className="flex items-center gap-1">
                                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ESTADO_PANTALLA_DOT[p.estado] || 'bg-gray-400'}`} />
                                                                <span className="text-gray-500 text-[10px] leading-none">{p.estado}</span>
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="px-4 py-3 space-y-5">
                        {/* Historial de equipos (todos los que tengan movimientos) */}
                        {pantallasConMovs.map(p => {
                            const isDestacada = pantallaBuscada?.id === p.id;
                            return (
                                <div key={p.id} className={isDestacada ? 'rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-2 -mx-3' : ''}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <IcoScreen />
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            {p.codigo} — {p.serie}
                                        </p>
                                    </div>
                                    <ol className="relative border-l-2 border-blue-200 ml-2 space-y-4">
                                        {p.movimientos.map((m, i) => {
                                            const cfg = TIPO_MOV_COLOR[m.tipo] || { dot: '#9CA3AF', text: 'text-gray-600' };
                                            return (
                                                <li key={m.id ?? i} className="ml-4">
                                                    <span
                                                        className="absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white"
                                                        style={{ backgroundColor: cfg.dot }}
                                                    />
                                                    <p className={`text-xs font-semibold ${cfg.text}`}>{m.tipo}</p>
                                                    {m.tipo === 'Traslado' ? (
                                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                                            {m.local_anterior
                                                                ? <><strong>{m.local_anterior.codigo}</strong> {m.local_anterior.nombre}</>
                                                                : 'Sin local anterior'}
                                                            {' → '}
                                                            {m.local_nuevo
                                                                ? <><strong>{m.local_nuevo.codigo}</strong> {m.local_nuevo.nombre}</>
                                                                : 'Sin local'}
                                                        </p>
                                                    ) : (
                                                        m.descripcion && <p className="text-[11px] text-gray-500 mt-0.5">{m.descripcion}</p>
                                                    )}
                                                    {m.motivo && <p className="text-[11px] text-amber-600 italic mt-0.5">Motivo: {m.motivo}</p>}
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                                        {m.usuario?.name && <span>{m.usuario.name}</span>}
                                                        {m.created_at && <span>{fmtDate(m.created_at)}</span>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </div>
                            );
                        })}

                        {/* Divisor entre equipos y local */}
                        {tieneHistorialEquipos && tieneHistorialLocal && (
                            <div className="border-t border-gray-100" />
                        )}

                        {/* Historial del local */}
                        {tieneHistorialLocal ? (
                            <>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Historial del local
                                </p>
                                <ol className="relative border-l-2 border-gray-200 ml-2 space-y-4">
                                    {local.movimientos.map((m, i) => (
                                        <li key={m.id ?? i} className="ml-4">
                                            <span
                                                className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white ${
                                                    i === 0 ? 'bg-red-600' : 'bg-gray-300'
                                                }`}
                                            />
                                            <p className={`text-xs font-semibold ${i === 0 ? 'text-red-700' : 'text-gray-700'}`}>
                                                {m.tipo}
                                            </p>
                                            {m.descripcion && (
                                                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{m.descripcion}</p>
                                            )}
                                            {m.motivo && <p className="text-[11px] text-amber-600 italic mt-0.5">Motivo: {m.motivo}</p>}
                                            <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                                                {m.usuario?.name && <span>{m.usuario.name}</span>}
                                                {m.created_at && <span>{fmtDate(m.created_at)}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </>
                        ) : !tieneHistorialEquipos && (
                            <p className="text-xs text-gray-400 text-center py-8">Sin historial registrado</p>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}

function Row({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                <p className="text-xs text-gray-800 leading-snug break-words">{value}</p>
            </div>
        </div>
    );
}

// ─── Banner de búsqueda por serie ─────────────────────────────────────────────

const TIPO_MOV_COLOR = {
    'Traslado':          { dot: '#3B82F6', text: 'text-blue-700' },
    'Cambio de estado':  { dot: '#F59E0B', text: 'text-yellow-700' },
    'Cambio de ubicación': { dot: '#8B5CF6', text: 'text-purple-700' },
    'Mantenimiento':     { dot: '#10B981', text: 'text-emerald-700' },
};

function SerieBanner({ pantalla, serie, onVer }) {
    const [histOpen, setHistOpen] = useState(false);
    if (!serie) return null;

    const movimientos = pantalla?.movimientos ?? [];

    return (
        <div className={`border-b text-xs ${
            pantalla ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
            {/* Fila principal */}
            <div className={`flex items-center gap-3 px-4 py-2.5 ${pantalla ? 'text-green-800' : 'text-red-700'}`}>
                {pantalla ? (
                    <>
                        <svg className="w-4 h-4 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className="flex-1">
                            Equipo <strong>{pantalla.codigo}</strong> ({[pantalla.modelo_equipo, pantalla.modelo].filter(Boolean).join(' · ') || pantalla.serie}) —{' '}
                            {pantalla.local ? <>ubicado en <strong>{pantalla.local.nombre}</strong></> : 'sin local asignado'}
                            {' · '}
                            <span className={`font-medium ${
                                pantalla.estado === 'Operativa' ? 'text-green-700' : 'text-yellow-700'
                            }`}>{pantalla.estado}</span>
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {movimientos.length > 0 && (
                                <button
                                    onClick={() => setHistOpen(o => !o)}
                                    className="text-green-700 font-semibold hover:underline"
                                >
                                    {histOpen ? 'Ocultar historial' : `Historial (${movimientos.length})`}
                                </button>
                            )}
                            {pantalla.local && (
                                <button onClick={() => onVer(pantalla.local)} className="font-semibold hover:underline whitespace-nowrap">
                                    Ver local →
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>No se encontró ningún equipo con serie <strong className="font-mono">"{serie}"</strong></span>
                        <button
                            onClick={() => router.get('/directorio', {}, { preserveState: false })}
                            className="font-semibold hover:underline"
                        >
                            Limpiar
                        </button>
                    </>
                )}
            </div>

            {/* Historial desplegable */}
            {histOpen && movimientos.length > 0 && (
                <div className="px-5 pb-4 pt-1 border-t border-green-200 bg-white/60">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Historial del equipo
                    </p>
                    <ol className="relative border-l-2 border-gray-200 ml-2 space-y-3">
                        {movimientos.map((m, i) => {
                            const cfg = TIPO_MOV_COLOR[m.tipo] || { dot: '#9CA3AF', text: 'text-gray-600' };
                            return (
                                <li key={m.id ?? i} className="ml-4">
                                    <span
                                        className="absolute -left-[9px] w-4 h-4 rounded-full border-2 border-white"
                                        style={{ backgroundColor: cfg.dot }}
                                    />
                                    <p className={`font-semibold ${cfg.text}`}>{m.tipo}</p>
                                    {m.tipo === 'Traslado' ? (
                                        <p className="text-gray-500 mt-0.5">
                                            {m.local_anterior
                                                ? <><strong>{m.local_anterior.codigo}</strong> — {m.local_anterior.nombre}</>
                                                : 'Sin local anterior'}
                                            {' → '}
                                            {m.local_nuevo
                                                ? <><strong>{m.local_nuevo.codigo}</strong> — {m.local_nuevo.nombre}</>
                                                : 'Sin local'}
                                        </p>
                                    ) : (
                                        m.descripcion && <p className="text-gray-500 mt-0.5">{m.descripcion}</p>
                                    )}
                                    {m.motivo && <p className="text-[11px] text-amber-600 italic mt-0.5">Motivo: {m.motivo}</p>}
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                        {m.usuario?.name && <span>{m.usuario.name}</span>}
                                        {m.created_at && <span>{fmtDate(m.created_at)}</span>}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            )}
        </div>
    );
}

// ─── Vista de mapa (Google Maps) ─────────────────────────────────────────────

function gmapsPinSvg(color, active = false) {
    const size = active ? 38 : 30;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.35)}" viewBox="0 0 30 40">
        <circle cx="15" cy="15" r="13" fill="${color}" stroke="white" stroke-width="2.5" filter="drop-shadow(0 2px 3px rgba(0,0,0,.4))"/>
        <polygon points="15,38 9,23 21,23" fill="${color}"/>
        <circle cx="15" cy="15" r="${active ? 6 : 4}" fill="white" opacity="${active ? 1 : 0.85}"/>
    </svg>`;
}

function gmapsInfoHtml(local) {
    const tipoBg    = local.tipo === 'DAC' ? '#EFF6FF' : local.tipo === 'CAC' ? '#F5F3FF' : '#FFF7ED';
    const tipoColor = local.tipo === 'DAC' ? '#1D4ED8' : local.tipo === 'CAC' ? '#7C3AED'  : '#C2410C';
    const pantallas = local.pantallas || [];
    const rows = pantallas.map(p => {
        const dot = ESTADO_DOT_COLOR[p.estado] || '#9CA3AF';
        return `<tr>
            <td style="padding:4px 8px;font-size:11px;color:#374151">${esc(p.modelo) || '—'}</td>
            <td style="padding:4px 8px">
                <span style="display:inline-flex;align-items:center;gap:4px">
                    <span style="width:7px;height:7px;border-radius:50%;background:${dot};flex-shrink:0;display:inline-block"></span>
                    <span style="font-size:11px;color:#6B7280">${esc(p.estado)}</span>
                </span>
            </td>
        </tr>`;
    }).join('');

    return `<div style="min-width:200px;max-width:260px;font-family:system-ui,sans-serif;padding:2px 0">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;background:${tipoBg};color:${tipoColor}">${esc(local.tipo)}</span>
        </div>
        <p style="font-weight:700;font-size:13px;margin:0 0 8px;color:#111827;line-height:1.3">${esc(local.nombre)}</p>
        ${pantallas.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #F3F4F6">
            <thead>
                <tr style="background:#F9FAFB">
                    <th style="padding:4px 8px;text-align:left;font-size:10px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em">Tipo monitor</th>
                    <th style="padding:4px 8px;text-align:left;font-size:10px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em">Estado</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>` : `<p style="font-size:11px;color:#9CA3AF;margin:0;padding-top:6px;border-top:1px solid #F3F4F6">Sin pantallas registradas</p>`}
    </div>`;
}

function MapaView({ locales, zonas, activeZona, activeDept, activeProv, activeDist, onSelectZona, onSelectDept, onSelectProv, onSelectDist, focusLocal, assetBase }) {
    const user = usePage().props.auth?.user || {};
    const mapRef      = useRef(null);
    const mapInst     = useRef(null);
    const markersRef  = useRef({});
    const infoWinRef  = useRef(null);
    const googleRef   = useRef(null);
    const [hoverId,   setHoverId]  = useState(null);
    const [mapReady,  setMapReady] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const zonaColors = useMemo(() => {
        const m = {};
        zonas.forEach(z => { m[z.nombre] = z.color || ZONA_COLORS_MAP[z.nombre] || '#E30613'; });
        return m;
    }, [zonas]);

    const filtered = useMemo(() => {
        let r = locales.filter(l => l.lat && l.lng);
        if (activeZona) r = r.filter(l => l.zona === activeZona);
        if (activeDept) r = r.filter(l => l.departamento === activeDept);
        if (activeProv) r = r.filter(l => l.provincia === activeProv);
        if (activeDist) r = r.filter(l => (l.distrito || '—') === activeDist);
        return r;
    }, [locales, activeZona, activeDept, activeProv, activeDist]);

    // Init Google Maps
    useEffect(() => {
        if (!mapRef.current || mapInst.current || !GOOGLE_MAPS_KEY) return;

        const pinMap = {};
        Object.entries(ESTADO_PANTALLA_PIN_NAMES).forEach(([estado, file]) => {
            pinMap[estado] = assetBase + '/' + file;
        });

        function makeImg(estado, size = 36) {
            const img = document.createElement('img');
            img.src = pinMap[estado] || (assetBase + '/claro-estado-operativa.svg');
            img.width = size;
            img.height = size;
            img.style.cssText = 'display:block;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35);';
            return img;
        }

        const loader = new Loader({ apiKey: GOOGLE_MAPS_KEY, version: 'weekly' });
        loader.load().then(async google => {
            if (mapInst.current) return;
            googleRef.current = google;

            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

            const map = new google.maps.Map(mapRef.current, {
                center:           { lat: -9.19, lng: -75.01 },
                zoom:             6,
                mapId:            GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
                mapTypeControl:   true,
                streetViewControl:false,
                fullscreenControl:true,
                zoomControl:      true,
                zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
            });

            mapInst.current  = map;
            infoWinRef.current = new google.maps.InfoWindow({ maxWidth: 260 });

            locales.filter(l => l.lat && l.lng).forEach(local => {
                const marker = new AdvancedMarkerElement({
                    position: { lat: parseFloat(local.lat), lng: parseFloat(local.lng) },
                    map,
                    content:  makeImg(local.estado_pantalla),
                    title:    local.nombre,
                });
                marker.addListener('click', () => {
                    infoWinRef.current.setContent(gmapsInfoHtml(local));
                    infoWinRef.current.open(map, marker);
                    setHoverId(local.id);
                });
                markersRef.current[local.id] = { marker, local, makeImg };
            });

            setMapReady(true);
        });

        return () => {
            if (infoWinRef.current) infoWinRef.current.close();
            Object.values(markersRef.current).forEach(({ marker }) => marker.map = null);
            markersRef.current = {};
            mapInst.current = null;
        };
    }, []);

    // Hover desde lista lateral → solo resalta marcador, sin panear
    useEffect(() => {
        if (!mapReady) return;
        Object.entries(markersRef.current).forEach(([id, { marker, local, makeImg }]) => {
            const isHover = String(id) === String(hoverId);
            marker.content = makeImg(local.estado_pantalla, isHover ? 50 : 36);
            marker.zIndex  = isHover ? 999 : 1;
        });
    }, [hoverId, mapReady]);

    // Click desde lista lateral → centrar y abrir info
    function focusMarker(local) {
        if (!mapReady || !local.lat || !local.lng) return;
        mapInst.current.panTo({ lat: parseFloat(local.lat), lng: parseFloat(local.lng) });
        mapInst.current.setZoom(14);
        const entry = markersRef.current[local.id];
        if (entry) {
            infoWinRef.current.setContent(gmapsInfoHtml(local));
            infoWinRef.current.open(mapInst.current, entry.marker);
        }
        setHoverId(local.id);
    }

    // focusLocal → centrar desde panel detalle
    useEffect(() => {
        if (!mapReady || !focusLocal?.lat || !focusLocal?.lng) return;
        mapInst.current.panTo({ lat: parseFloat(focusLocal.lat), lng: parseFloat(focusLocal.lng) });
        mapInst.current.setZoom(15);
        const entry = markersRef.current[focusLocal.id];
        if (entry) {
            entry.marker.content = entry.makeImg(focusLocal.estado_pantalla, 50);
            entry.marker.zIndex  = 999;
            infoWinRef.current.setContent(gmapsInfoHtml(focusLocal));
            infoWinRef.current.open(mapInst.current, entry.marker);
        }
    }, [mapReady, focusLocal]);

    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block">
                <Sidebar
                    locales={locales} zonas={zonas}
                    activeZona={activeZona} activeDept={activeDept} activeProv={activeProv} activeDist={activeDist}
                    onSelectZona={onSelectZona} onSelectDept={onSelectDept} onSelectProv={onSelectProv} onSelectDist={onSelectDist}
                    showCounts={true}
                    user={user}
                />
            </div>

            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
                        <Sidebar
                            locales={locales} zonas={zonas}
                            activeZona={activeZona} activeDept={activeDept} activeProv={activeProv} activeDist={activeDist}
                            onSelectZona={(zona) => { onSelectZona(zona); setMobileFiltersOpen(false); }}
                            onSelectDept={(zona, dept) => { onSelectDept(zona, dept); setMobileFiltersOpen(false); }}
                            onSelectProv={(zona, dept, prov) => { onSelectProv(zona, dept, prov); setMobileFiltersOpen(false); }}
                            onSelectDist={(zona, dept, prov, dist) => { onSelectDist(zona, dept, prov, dist); setMobileFiltersOpen(false); }}
                            showCounts={true}
                            user={user}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 relative bg-gray-100">
                    <div ref={mapRef} className="absolute inset-0 z-0" />

                    {/* Sin API Key */}
                    {!GOOGLE_MAPS_KEY && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 max-w-sm text-center">
                                <p className="text-sm font-semibold text-gray-800 mb-1">Google Maps API Key requerida</p>
                                <p className="text-xs text-gray-500">Agrega <code className="bg-gray-100 px-1 rounded font-mono">VITE_GOOGLE_MAPS_KEY</code> en el archivo <code className="bg-gray-100 px-1 rounded font-mono">.env</code></p>
                            </div>
                        </div>
                    )}

                    {/* Contador */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileFiltersOpen(true)}
                            className="md:hidden bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm"
                        >
                            Filtros
                        </button>
                        <span className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                            {filtered.length} locales
                        </span>
                    </div>

                    {/* Leyenda estados pantalla */}
                    <div className="hidden sm:block absolute bottom-4 left-3 z-10 bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Estado de pantallas</p>
                        <div className="space-y-1.5">
                            {Object.entries(ESTADOS_PANTALLA_COLORS).map(([estado, color]) => (
                                <div key={estado} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ backgroundColor: color }} />
                                    <span className="text-xs text-gray-700">{estado}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <style>{`.gm-style-iw-d { overflow: hidden !important; } .gm-style-iw { border-radius: 12px !important; } .gm-style-iw-t::after { display:none; }`}</style>
                </div>

                {/* Lista lateral */}
                <div className="hidden lg:block w-64 bg-white border-l border-gray-200 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600">{filtered.length} local{filtered.length !== 1 ? 'es' : ''}</p>
                    </div>
                    {filtered.map(local => (
                        <button
                            key={local.id}
                            onMouseEnter={() => setHoverId(local.id)}
                            onMouseLeave={() => setHoverId(null)}
                            onClick={() => focusMarker(local)}
                            className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${hoverId === local.id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: zonaColors[local.zona] || '#E30613' }} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{local.nombre}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{local.codigo} · {local.distrito || local.departamento}</p>
                                    <div className="mt-1">{tipoBadge(local.tipo)}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Directorio({ locales = [], zonas = [], pantallaBuscada, serieBuscada, assetBase = '' }) {
    const user = usePage().props.auth?.user || {};
    const canAccessAdmin = ['admin', 'supervisor', 'operativo'].includes(user.rol);
    const [view, setView]             = useState('list');
    const [search, setSearch]         = useState('');
    const [serieInput, setSerieInput] = useState(serieBuscada || '');
    const [activeZona, setActiveZona] = useState(null);
    const [activeDept, setActiveDept] = useState(null);
    const [selectedLocal, setSelected] = useState(pantallaBuscada?.local ?? null);
    const [activeTipos, setActiveTipos] = useState([]);
    const [activeProv, setActiveProv]   = useState(null);
    const [activeDist, setActiveDist]   = useState(null);
    const [focusLocal, setFocusLocal]   = useState(null);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const handleSerieSubmit = (e) => {
        e.preventDefault();
        if (!serieInput.trim()) return;
        router.get('/directorio', { serie: serieInput.trim() }, { preserveState: true });
    };

    const handleSelectZona = (zona) => {
        setActiveZona(zona); setActiveDept(null); setActiveProv(null); setActiveDist(null); setSelected(null);
    };
    const handleSelectDept = (zona, dept) => {
        setActiveZona(zona); setActiveDept(dept); setActiveProv(null); setActiveDist(null); setSelected(null);
    };
    const handleSelectProv = (zona, dept, prov) => {
        setActiveZona(zona); setActiveDept(dept); setActiveProv(prov); setActiveDist(null); setSelected(null);
    };
    const handleSelectDist = (zona, dept, prov, dist) => {
        setActiveZona(zona); setActiveDept(dept); setActiveProv(prov); setActiveDist(dist); setSelected(null);
    };

    const TIPOS = ['CAC', 'DAC', 'CADENA'];

    const filtered = useMemo(() => {
        // Si hay una pantalla encontrada por serie, mostrar solo su local
        if (pantallaBuscada?.local) {
            return locales.filter(l => l.id === pantallaBuscada.local.id);
        }
        let r = locales;
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(l =>
                l.nombre?.toLowerCase().includes(q) ||
                l.codigo?.toLowerCase().includes(q) ||
                l.departamento?.toLowerCase().includes(q) ||
                l.provincia?.toLowerCase().includes(q) ||
                l.distrito?.toLowerCase().includes(q) ||
                l.direccion?.toLowerCase().includes(q)
            );
        }
        if (activeZona)  r = r.filter(l => l.zona === activeZona);
        if (activeDept)  r = r.filter(l => l.departamento === activeDept);
        if (activeProv)  r = r.filter(l => l.provincia === activeProv);
        if (activeDist)  r = r.filter(l => (l.distrito || '—') === activeDist);
        if (activeTipos.length > 0) r = r.filter(l => activeTipos.includes(l.tipo));
        return r;
    }, [locales, search, activeZona, activeDept, activeProv, activeDist, activeTipos, pantallaBuscada]);

    const toggleTipo = (tipo) =>
        setActiveTipos(p => p.includes(tipo) ? p.filter(t => t !== tipo) : [...p, tipo]);

    const breadcrumb = [activeZona, activeDept, activeProv, activeDist].filter(Boolean);

    return (
        <>
            <Head title="Directorio Locales" />

            {/* ── Barra de navegación ────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 flex flex-wrap items-center px-3 sm:px-4 py-2 gap-2 sticky top-0 z-40 flex-shrink-0 md:h-14 md:flex-nowrap">
                {/* Logo */}
                <Link href="/directorio" className="flex items-center gap-2 flex-shrink-0">
                    <img src="/claro-estado-averia.svg" alt="Claro" className="w-8 h-8" />
                    <span className="text-sm text-gray-700 hidden sm:inline">
                        Claro<span className="font-black text-gray-900">Locales</span>
                    </span>
                </Link>

                {/* Búsquedas (centro) */}
                <div className="order-3 flex w-full items-center justify-center gap-2 md:order-none md:flex-1 md:max-w-xl md:mx-auto">
                    <div className="relative min-w-0 flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><IcoSearch /></span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar local por nombre o dirección..."
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-300 bg-gray-50"
                        />
                    </div>
                    <form onSubmit={handleSerieSubmit} className="relative min-w-0 flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><IcoSerie /></span>
                        <input
                            type="text"
                            value={serieInput}
                            onChange={e => setSerieInput(e.target.value)}
                            placeholder="N° de serie pantalla..."
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-300 bg-gray-50"
                        />
                    </form>
                </div>

                {/* Derecha: Lista / Mapa / Administración */}
                <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(true)}
                        className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100"
                    >
                        Filtros
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <IcoLista /> Lista
                    </button>
                    <button
                        onClick={() => setView('map')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            view === 'map' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <IcoMapa /> Mapa
                    </button>
                    {canAccessAdmin && (
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            <IcoUser /> <span className="hidden sm:inline">Administración</span>
                        </Link>
                    )}
                </div>
            </header>


            {/* ── Cuerpo ─────────────────────────────────────────────────── */}
            <div className={`flex overflow-hidden ${serieBuscada ? 'h-[calc(100vh-132px)] md:h-[calc(100vh-92px)]' : 'h-[calc(100vh-104px)] md:h-[calc(100vh-56px)]'}`}>

                {mobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
                        <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
                            <Sidebar
                                locales={locales}
                                zonas={zonas}
                                activeZona={activeZona}
                                activeDept={activeDept}
                                activeProv={activeProv}
                                activeDist={activeDist}
                                onSelectZona={(zona) => { handleSelectZona(zona); setMobileFiltersOpen(false); }}
                                onSelectDept={(zona, dept) => { handleSelectDept(zona, dept); setMobileFiltersOpen(false); }}
                                onSelectProv={(zona, dept, prov) => { handleSelectProv(zona, dept, prov); setMobileFiltersOpen(false); }}
                                onSelectDist={(zona, dept, prov, dist) => { handleSelectDist(zona, dept, prov, dist); setMobileFiltersOpen(false); }}
                                showCounts={false}
                                user={user}
                            />
                        </div>
                    </div>
                )}

                {view === 'map' ? (
                    <MapaView
                        locales={locales}
                        zonas={zonas}
                        activeZona={activeZona}
                        activeDept={activeDept}
                        activeProv={activeProv}
                        activeDist={activeDist}
                        onSelectZona={handleSelectZona}
                        onSelectDept={handleSelectDept}
                        onSelectProv={handleSelectProv}
                        onSelectDist={handleSelectDist}
                        focusLocal={focusLocal}
                        assetBase={assetBase}
                    />
                ) : (
                    <>
                        {/* Sidebar lista */}
                        <div className="hidden h-full md:block">
                            <Sidebar
                                locales={locales}
                                zonas={zonas}
                                activeZona={activeZona}
                                activeDept={activeDept}
                                activeProv={activeProv}
                                activeDist={activeDist}
                                onSelectZona={handleSelectZona}
                                onSelectDept={handleSelectDept}
                                onSelectProv={handleSelectProv}
                                onSelectDist={handleSelectDist}
                                showCounts={false}
                                user={user}
                            />
                        </div>

                        {/* Contenido principal */}
                        <main className="flex-1 overflow-y-auto bg-gray-50">
                            {/* Encabezado de sección */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between px-4 sm:px-5 pt-5 pb-3 bg-white border-b border-gray-100">
                                <div>
                                    <h1 className="text-base font-bold text-gray-900">
                                        {breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : 'Todos los locales'}
                                    </h1>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {filtered.length} local{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                {/* Filtros de tipo */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {TIPOS.map(tipo => {
                                        const s = TIPO_BADGE[tipo] || { bg: '#F3F4F6', color: '#6B7280' };
                                        const active = activeTipos.includes(tipo);
                                        return (
                                            <button
                                                key={tipo}
                                                onClick={() => toggleTipo(tipo)}
                                                className="px-3 py-1 rounded-full text-[11px] font-bold border-2 transition-all"
                                                style={active
                                                    ? { backgroundColor: s.color, color: 'white', borderColor: s.color }
                                                    : { backgroundColor: s.bg, color: s.color, borderColor: s.bg }
                                                }
                                            >
                                                {tipo}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Grilla de tarjetas */}
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                    </svg>
                                    <p className="text-sm font-medium text-gray-500">No se encontraron locales</p>
                                    <p className="text-xs text-gray-400 mt-1">Prueba con otros filtros o términos</p>
                                </div>
                            ) : (
                                <div className={`p-3 sm:p-4 grid gap-3 ${
                                    selectedLocal
                                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                                }`}>
                                    {filtered.map(local => (
                                        <LocalCard
                                            key={local.id}
                                            local={local}
                                            isSelected={selectedLocal?.id === local.id}
                                            onClick={() => setSelected(selectedLocal?.id === local.id ? null : local)}
                                        />
                                    ))}
                                </div>
                            )}
                        </main>

                        {/* Panel detalle */}
                        {selectedLocal && (
                            <DetailPanel
                                local={selectedLocal}
                                onClose={() => setSelected(null)}
                                onVerMapa={() => {
                                    setFocusLocal(selectedLocal);
                                    setView('map');
                                }}
                                pantallaBuscada={pantallaBuscada}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
}
