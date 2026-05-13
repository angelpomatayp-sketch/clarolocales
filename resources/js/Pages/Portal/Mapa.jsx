import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Loader } from '@googlemaps/js-api-loader';
import {
    TIPO_COLORS,
    ESTADO_LOCAL_COLORS as ESTADO_COLORS,
    ZONA_COLORS,
    ESTADO_PANTALLA_COLOR as ESTADOS_PANTALLA_COLORS,
    ESTADO_PANTALLA_SVG,
    ESTADO_LOCAL_DOT as ESTADO_DOT,
    esc,
} from '@/constants/shared';

const GOOGLE_MAPS_KEY   = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';

function buildPinMap(base) {
    return Object.fromEntries(
        Object.entries(ESTADO_PANTALLA_SVG).map(([estado, file]) => [estado, base + '/' + file])
    );
}

function infoWindowContent(local) {
    const zonaColor = ZONA_COLORS[local.zona] || '#9CA3AF';
    const estadoColor = ESTADO_DOT[local.estado] || '#9CA3AF';
    const tipoStyle = local.tipo === 'DAC'
        ? 'background:#EFF6FF;color:#1D4ED8'
        : local.tipo === 'CAC'
            ? 'background:#F5F3FF;color:#7C3AED'
            : 'background:#FFF7ED;color:#C2410C';
    const ubicacion = [local.distrito, local.provincia, local.departamento].filter(Boolean).map(esc).join(' · ');
    const contacto = local.contacto_nombre
        ? `<p style="font-size:11px;color:#6B7280;margin:6px 0 0">👤 ${esc(local.contacto_nombre)}${local.contacto_celular ? ' · ' + esc(local.contacto_celular) : ''}</p>`
        : '';

    return `
        <div style="min-width:220px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;padding:2px 0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;${tipoStyle}">${esc(local.tipo)}</span>
                <span style="font-size:11px;color:#9CA3AF;font-family:monospace">${esc(local.codigo)}</span>
            </div>
            <p style="font-weight:700;font-size:14px;margin:0 0 3px;color:#111827;line-height:1.3">${esc(local.nombre)}</p>
            <p style="font-size:11px;color:#6B7280;margin:0 0 6px">${ubicacion}</p>
            ${local.direccion ? `<p style="font-size:11px;color:#9CA3AF;margin:0 0 8px;line-height:1.4">${esc(local.direccion)}</p>` : ''}
            <div style="display:flex;align-items:center;gap:8px;padding-top:6px;border-top:1px solid #F3F4F6">
                <span style="display:flex;align-items:center;gap:4px">
                    <span style="width:8px;height:8px;border-radius:50%;background:${zonaColor};display:inline-block"></span>
                    <span style="font-size:11px;color:#374151;font-weight:600">${esc(local.zona)}</span>
                </span>
                <span style="margin-left:auto;display:flex;align-items:center;gap:4px">
                    <span style="width:7px;height:7px;border-radius:50%;background:${estadoColor};display:inline-block"></span>
                    <span style="font-size:11px;color:#374151">${esc(local.estado)}</span>
                </span>
                ${local.pantallas_count != null ? `<span style="font-size:11px;color:#9CA3AF;margin-left:4px">· ${local.pantallas_count} pantalla${local.pantallas_count !== 1 ? 's' : ''}</span>` : ''}
            </div>
            ${contacto}
        </div>
    `;
}

export default function Mapa({ locales = [], assetBase = '' }) {
    const ESTADO_PANTALLA_PIN = buildPinMap(assetBase);
    const mapRef        = useRef(null);
    const mapInstance   = useRef(null);
    const markersRef    = useRef({});
    const infoWindowRef = useRef(null);
    const googleRef     = useRef(null);

    const [selectedId,  setSelectedId]  = useState(null);
    const [search,      setSearch]      = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mapReady,    setMapReady]    = useState(false);
    const [loadError,   setLoadError]   = useState(false);

    const mappableLocales = useMemo(() => locales.filter(l => l.lat && l.lng), [locales]);

    const filteredList = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return locales;
        return locales.filter(l =>
            l.nombre?.toLowerCase().includes(q) ||
            l.codigo?.toLowerCase().includes(q) ||
            l.zona?.toLowerCase().includes(q) ||
            l.departamento?.toLowerCase().includes(q)
        );
    }, [locales, search]);

    // Inicializar Google Maps
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        if (!GOOGLE_MAPS_KEY) {
            setLoadError(true);
            return;
        }

        const loader = new Loader({
            apiKey: GOOGLE_MAPS_KEY,
            version: 'weekly',
        });

        loader.load().then(async google => {
            if (mapInstance.current) return;

            googleRef.current = google;

            // Cargar librería de marcadores avanzados
            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

            const pinMap = buildPinMap(assetBase);

            const map = new google.maps.Map(mapRef.current, {
                center:  { lat: -9.19, lng: -75.01 },
                zoom:    6,
                mapId:   GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
                mapTypeId: 'roadmap',
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style:    google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.TOP_RIGHT,
                },
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl:       true,
                zoomControlOptions:       { position: google.maps.ControlPosition.RIGHT_CENTER },
                streetViewControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
            });

            mapInstance.current = map;
            infoWindowRef.current = new google.maps.InfoWindow({
                maxWidth: 280,
                pixelOffset: new google.maps.Size(0, -10),
            });

            function makeImg(estado, size = 40) {
                const img = document.createElement('img');
                img.src    = pinMap[estado] || pinMap['Operativa'];
                img.width  = size;
                img.height = size;
                img.style.cssText = 'display:block;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35);';
                return img;
            }

            // Crear marcadores con AdvancedMarkerElement
            locales.forEach(local => {
                if (!local.lat || !local.lng) return;

                const marker = new AdvancedMarkerElement({
                    position: { lat: parseFloat(local.lat), lng: parseFloat(local.lng) },
                    map,
                    content:  makeImg(local.estado_pantalla),
                    title:    local.nombre,
                });

                marker.addListener('click', () => {
                    setSelectedId(local.id);
                    infoWindowRef.current.setContent(infoWindowContent(local));
                    infoWindowRef.current.open(map, marker);
                });

                markersRef.current[local.id] = { marker, local, makeImg };
            });

            setMapReady(true);
        }).catch((err) => { console.error('Google Maps load failed:', err); setLoadError(true); });

        return () => {
            if (infoWindowRef.current) infoWindowRef.current.close();
            Object.values(markersRef.current).forEach(({ marker }) => marker.setMap(null));
            markersRef.current = {};
            mapInstance.current = null;
        };
    }, []);

    // Enfocar local seleccionado
    useEffect(() => {
        if (!mapReady || !selectedId || !googleRef.current) return;

        const google = googleRef.current;
        const all    = Object.values(markersRef.current);

        // Resetear todos los marcadores
        all.forEach(({ marker, local, makeImg: mk }) => {
            if (mk) marker.content = mk(local.estado_pantalla, 40);
            marker.zIndex = 1;
        });

        // Destacar el seleccionado
        const entry = markersRef.current[selectedId];
        if (entry) {
            const { marker, local, makeImg: mk } = entry;
            if (mk) marker.content = mk(local.estado_pantalla, 54);
            marker.zIndex = 999;
            mapInstance.current.panTo({ lat: parseFloat(local.lat), lng: parseFloat(local.lng) });
            mapInstance.current.setZoom(15);
            infoWindowRef.current.setContent(infoWindowContent(local));
            infoWindowRef.current.open(mapInstance.current, marker);
        }
    }, [selectedId, mapReady]);

    const selectedLocal = useMemo(
        () => locales.find(l => l.id === selectedId) || null,
        [locales, selectedId]
    );

    return (
        <>
            <Head title="Mapa — ClaroLocales" />

            <div className="h-screen flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 flex-shrink-0 z-30 h-14 flex items-center px-4 gap-3">
                    <Link href="/directorio" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E30613' }}>
                            <span className="text-white font-black text-sm">C</span>
                        </div>
                        <span className="text-sm text-gray-700">Claro<span className="font-black text-gray-900">Locales</span></span>
                    </Link>

                    <div className="h-5 w-px bg-gray-200" />

                    <div className="relative flex-1 max-w-xs">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar local..."
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-300 bg-gray-50"
                        />
                    </div>

                    <div className="flex items-center gap-1 ml-auto">
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"/>
                            </svg>
                            {sidebarOpen ? 'Ocultar lista' : 'Ver lista'}
                        </button>
                        <Link href="/directorio" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                            </svg>
                            Directorio
                        </Link>
                    </div>
                </header>

                {/* Main area */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar */}
                    {sidebarOpen && (
                        <aside className="w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
                            {/* Stats */}
                            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    <strong className="text-gray-800">{filteredList.length}</strong> locales
                                </span>
                                <span className="text-xs text-gray-400">{mappableLocales.length} en mapa</span>
                            </div>

                            {/* Leyenda estados pantalla */}
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Estado de pantallas</p>
                                <div className="space-y-1.5">
                                    {Object.entries(ESTADOS_PANTALLA_COLORS).map(([estado, color]) => (
                                        <span key={estado} className="flex items-center gap-2 text-xs text-gray-700">
                                            <span className="w-3 h-3 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ backgroundColor: color }} />
                                            {estado}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Lista */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredList.length === 0 ? (
                                    <p className="text-center text-xs text-gray-400 py-8">Sin resultados</p>
                                ) : (
                                    filteredList.map(local => {
                                        const isSelected = selectedId === local.id;
                                        const hasCoords  = local.lat && local.lng;
                                        return (
                                            <button
                                                key={local.id}
                                                onClick={() => hasCoords && setSelectedId(local.id)}
                                                disabled={!hasCoords}
                                                className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                                        : hasCoords
                                                            ? 'hover:bg-gray-50'
                                                            : 'opacity-40 cursor-not-allowed'
                                                }`}
                                            >
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                                                    style={{ backgroundColor: ZONA_COLORS[local.zona] || '#9CA3AF' }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{local.nombre}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">
                                                        {local.codigo} · {local.distrito || local.departamento}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${TIPO_COLORS[local.tipo] || 'bg-gray-100 text-gray-600'}`}>
                                                            {local.tipo}
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ESTADO_COLORS[local.estado] || 'bg-gray-100 text-gray-600'}`}>
                                                            {local.estado}
                                                        </span>
                                                        {!hasCoords && <span className="text-[10px] text-gray-300 italic">Sin coordenadas</span>}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Mapa */}
                    <div className="flex-1 relative bg-gray-100">
                        <div ref={mapRef} className="absolute inset-0" />

                        {/* No API Key */}
                        {loadError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md text-center">
                                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2">API Key de Google Maps requerida</h3>
                                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                        Agrega tu clave en el archivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code>:
                                    </p>
                                    <div className="bg-gray-900 rounded-lg px-4 py-3 text-left mb-4">
                                        <p className="text-green-400 font-mono text-sm">VITE_GOOGLE_MAPS_KEY=<span className="text-yellow-300">tu_api_key_aquí</span></p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Luego ejecuta <code className="bg-gray-100 px-1 rounded font-mono">node node_modules/vite/bin/vite.js build</code>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
