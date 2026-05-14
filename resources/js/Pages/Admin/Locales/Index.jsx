import { useState, useMemo, useEffect, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { getDepartamentos, getProvincias, getDistritos } from '@/data/ubigeo';
import { Loader } from '@googlemaps/js-api-loader';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TIPOS = ['DAC', 'CAC', 'CADENA'];
const ESTADOS = [
    'Activo', 'Cerrado', 'En remodelación', 'Trasladado',
    'Nuevo local', 'Suspendido', 'Pendiente validación',
];

const TIPO_COLORS = {
    DAC:    'bg-blue-100 text-blue-800',
    CAC:    'bg-purple-100 text-purple-800',
    CADENA: 'bg-orange-100 text-orange-800',
};

const ESTADO_COLORS = {
    'Activo': 'bg-green-100 text-green-800',
    'Cerrado': 'bg-red-100 text-red-800',
    'En remodelación': 'bg-yellow-100 text-yellow-800',
    'Trasladado': 'bg-orange-100 text-orange-800',
    'Nuevo local': 'bg-emerald-100 text-emerald-800',
    'Suspendido': 'bg-gray-100 text-gray-700',
    'Pendiente validación': 'bg-sky-100 text-sky-800',
};

const ZONA_COLORS = {
    Norte: '#2563EB',
    Sur: '#16A34A',
    Centro: '#7C3AED',
    Lima: '#E30613',
};

const PAGE_SIZE = 10;
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';

let googleMapsPromise = null;

function loadGoogleMaps() {
    if (!GOOGLE_MAPS_KEY) return Promise.resolve(null);

    if (!googleMapsPromise) {
        googleMapsPromise = new Loader({
            apiKey: GOOGLE_MAPS_KEY,
            version: 'weekly',
        }).load();
    }

    return googleMapsPromise;
}

const MAP_PIN = L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;border-radius:9999px;background:#E30613;border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,.3)"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

function buildFullAddress(data) {
    return [
        data.direccion,
        data.distrito,
        data.provincia,
        data.departamento,
        'Perú',
    ].filter(Boolean).join(', ');
}

function buildAddressAttempts(data) {
    return [
        buildFullAddress(data),
        [data.direccion, data.distrito, data.provincia, data.departamento, 'Perú'].filter(Boolean).join(', '),
        [data.distrito, data.provincia, data.departamento, 'Perú'].filter(Boolean).join(', '),
    ].filter((address, index, addresses) => address && addresses.indexOf(address) === index);
}

async function geocodeWithGoogle(data) {
    const google = await loadGoogleMaps();
    if (!google?.maps) return null;

    const { Geocoder } = await google.maps.importLibrary('geocoding');
    const geocoder = new Geocoder();

    for (const address of buildAddressAttempts(data)) {
        const { results } = await geocoder.geocode({
            address,
            componentRestrictions: { country: 'PE' },
        });

        if (results?.length) {
            const location = results[0].geometry.location;
            return {
                lat: location.lat().toFixed(7),
                lng: location.lng().toFixed(7),
                provider: 'google',
            };
        }
    }

    return null;
}

async function geocodeWithOpenStreetMap(data) {
    for (const address of buildAddressAttempts(data)) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pe&q=${encodeURIComponent(address)}`);
        const results = await response.json();

        if (Array.isArray(results) && results.length > 0) {
            return {
                lat: parseFloat(results[0].lat).toFixed(7),
                lng: parseFloat(results[0].lon).toFixed(7),
                provider: 'osm',
            };
        }
    }

    return null;
}

async function geocodeAddressData(data) {
    return await geocodeWithGoogle(data) ?? await geocodeWithOpenStreetMap(data);
}

function LocationPicker({ open, onClose, data, setData }) {
    const mapEl = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    const mapProvider = useRef(null);

    const setCoords = (lat, lng) => {
        setData('lat', Number(lat).toFixed(7));
        setData('lng', Number(lng).toFixed(7));
    };

    useEffect(() => {
        if (!open || !mapEl.current || map.current) return;

        let cancelled = false;

        const initialize = async () => {
            let lat = parseFloat(data.lat);
            let lng = parseFloat(data.lng);
            let zoom = data.lat && data.lng ? 17 : 6;

            if ((Number.isNaN(lat) || Number.isNaN(lng)) && data.departamento) {
                const coords = await geocodeAddressData(data).catch(() => null);
                if (coords) {
                    lat = parseFloat(coords.lat);
                    lng = parseFloat(coords.lng);
                    zoom = coords.provider === 'google' ? 17 : 15;
                    if (!cancelled) setData({ ...data, lat: coords.lat, lng: coords.lng });
                }
            }

            if (Number.isNaN(lat) || Number.isNaN(lng)) {
                lat = -9.189967;
                lng = -75.015152;
                zoom = 5;
            }

            const google = await loadGoogleMaps().catch(() => null);

            if (cancelled || !mapEl.current) return;

            if (google?.maps) {
                mapProvider.current = 'google';

                const center = { lat, lng };
                map.current = new google.maps.Map(mapEl.current, {
                    center,
                    zoom,
                    mapId: GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
                    mapTypeId: 'roadmap',
                    streetViewControl: true,
                    fullscreenControl: true,
                    mapTypeControl: true,
                    zoomControl: true,
                });

                marker.current = new google.maps.Marker({
                    map: map.current,
                    position: center,
                    draggable: true,
                    title: data.nombre || 'Local',
                });

                marker.current.addListener('dragend', (event) => {
                    setCoords(event.latLng.lat(), event.latLng.lng());
                });

                map.current.addListener('click', (event) => {
                    marker.current.setPosition(event.latLng);
                    setCoords(event.latLng.lat(), event.latLng.lng());
                });

                return;
            }

            mapProvider.current = 'leaflet';
            map.current = L.map(mapEl.current).setView([lat, lng], zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
            }).addTo(map.current);

            marker.current = L.marker([lat, lng], { draggable: true, icon: MAP_PIN }).addTo(map.current);
            marker.current.on('dragend', () => {
                const pos = marker.current.getLatLng();
                setCoords(pos.lat, pos.lng);
            });
            map.current.on('click', (event) => {
                marker.current.setLatLng(event.latlng);
                setCoords(event.latlng.lat, event.latlng.lng);
            });

            setTimeout(() => map.current?.invalidateSize(), 150);
        };

        initialize();

        return () => {
            cancelled = true;
        };
    }, [open]);

    useEffect(() => {
        if (!open || !map.current || !marker.current || !data.lat || !data.lng) return;

        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        if (mapProvider.current === 'google') {
            const position = { lat, lng };
            marker.current.setPosition(position);
            map.current.setCenter(position);
            map.current.setZoom(17);
            return;
        }

        marker.current.setLatLng([lat, lng]);
        map.current.setView([lat, lng], 16);
        setTimeout(() => map.current?.invalidateSize(), 100);
    }, [open, data.lat, data.lng]);

    useEffect(() => {
        if (open) return;

        if (map.current) {
            if (mapProvider.current === 'leaflet') {
                map.current.remove();
            }
            map.current = null;
            marker.current = null;
            mapProvider.current = null;
        }
    }, [open]);

    return (
        <Modal open={open} onClose={onClose} title="Ajustar ubicación en mapa" size="2xl">
            <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-gray-200 h-80">
                    <div ref={mapEl} className="h-full w-full" />
                </div>
                <p className="text-xs text-gray-400">
                    {GOOGLE_MAPS_KEY
                        ? 'Mapa de Google Maps. Arrastra el marcador o haz clic sobre el punto exacto.'
                        : 'Google Maps no está configurado; se usa OpenStreetMap como respaldo.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Latitud">
                        <Input value={data.lat || ''} onChange={(e) => setData('lat', e.target.value)} placeholder="-12.0651000" />
                    </FieldGroup>
                    <FieldGroup label="Longitud">
                        <Input value={data.lng || ''} onChange={(e) => setData('lng', e.target.value)} placeholder="-75.2049000" />
                    </FieldGroup>
                </div>
                <div className="flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold">
                        Usar esta ubicación
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function Modal({ open, onClose, title, children, size = 'lg' }) {
    if (!open) return null;
    const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };
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

function Input({ value, onChange, placeholder, type = 'text', disabled, error }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 ${
                error ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'
            }`}
        />
    );
}

function Select({ value, onChange, children, disabled, error }) {
    return (
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white disabled:bg-gray-50 disabled:text-gray-500 ${
                error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'
            }`}
        >
            {children}
        </select>
    );
}

function LocalForm({ form, isEdit, zonaMap, onSubmit }) {
    const { data, setData, errors, processing } = form;
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [mapOpen, setMapOpen] = useState(false);
    const departamentos = getDepartamentos();
    const provincias = data.departamento ? getProvincias(data.departamento) : [];
    const distritos = data.departamento && data.provincia ? getDistritos(data.departamento, data.provincia) : [];
    const hasCoords = Boolean(data.lat && data.lng);

    const geocodeAddress = async ({ openMapOnSuccess = true, openMapOnFailure = true } = {}) => {
        setLocationError('');

        if (!data.direccion || !data.departamento) {
            setLocationError('Completa dirección y departamento antes de buscar.');
            return null;
        }

        setLocating(true);
        try {
            const coords = await geocodeAddressData(data);

            if (!coords) {
                setLocationError('No se encontró una ubicación clara. Ajusta la dirección o selecciona el punto en el mapa.');
                if (openMapOnFailure) setMapOpen(true);
                return null;
            }

            const nextCoords = { lat: coords.lat, lng: coords.lng };

            setData({ ...data, ...nextCoords });
            if (openMapOnSuccess) setMapOpen(true);
            return nextCoords;
        } catch {
            setLocationError('No se pudo consultar la ubicación. Puedes ajustar el punto manualmente en el mapa.');
            if (openMapOnFailure) setMapOpen(true);
            return null;
        } finally {
            setLocating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let payload = data;
        if (!hasCoords && data.direccion && data.departamento) {
            const coords = await geocodeAddress({ openMapOnSuccess: false, openMapOnFailure: false });
            if (!coords) {
                setLocationError('No se pudo ubicar automáticamente. Ajusta el punto en el mapa antes de guardar.');
                setMapOpen(true);
                return;
            }

            payload = { ...data, ...coords };
        }

        onSubmit(e, payload);
    };

    const handleDeptChange = (e) => {
        setData({
            ...data,
            departamento: e.target.value,
            provincia: '',
            distrito: '',
            zona: zonaMap[e.target.value] || '',
            lat: '',
            lng: '',
        });
    };

    const handleProvChange = (e) => {
        setData({ ...data, provincia: e.target.value, distrito: '', lat: '', lng: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup label="Nombre" error={errors.nombre}>
                <Input value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} placeholder="Nombre del local" error={errors.nombre} />
            </FieldGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Tipo" error={errors.tipo}>
                    <Select value={data.tipo} onChange={(e) => setData('tipo', e.target.value)} error={errors.tipo}>
                        <option value="">Seleccionar tipo</option>
                        {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                </FieldGroup>
                <FieldGroup label="Estado" error={errors.estado}>
                    <Select value={data.estado} onChange={(e) => setData('estado', e.target.value)} error={errors.estado}>
                        <option value="">Seleccionar estado</option>
                        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </Select>
                </FieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Departamento" error={errors.departamento}>
                    <Select value={data.departamento} onChange={handleDeptChange} error={errors.departamento}>
                        <option value="">Seleccionar departamento</option>
                        {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                </FieldGroup>
                <FieldGroup label="Zona" error={errors.zona}>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm min-h-[42px]">
                        {data.zona ? (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ZONA_COLORS[data.zona] || '#9CA3AF' }} />
                                <span className="font-medium text-gray-700">{data.zona}</span>
                            </>
                        ) : (
                            <span className="text-gray-400">Auto-asignada por departamento</span>
                        )}
                    </div>
                </FieldGroup>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Provincia" error={errors.provincia}>
                    <Select value={data.provincia} onChange={handleProvChange} disabled={!data.departamento} error={errors.provincia}>
                        <option value="">Seleccionar provincia</option>
                        {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </FieldGroup>
                <FieldGroup label="Distrito" error={errors.distrito}>
                    <Select value={data.distrito} onChange={(e) => setData({ ...data, distrito: e.target.value, lat: '', lng: '' })} disabled={!data.provincia} error={errors.distrito}>
                        <option value="">Seleccionar distrito</option>
                        {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
                    </Select>
                </FieldGroup>
            </div>

            <FieldGroup label="Dirección" error={errors.direccion}>
                <Input value={data.direccion} onChange={(e) => setData({ ...data, direccion: e.target.value, lat: '', lng: '' })} placeholder="Av. Principal 123" error={errors.direccion} />
            </FieldGroup>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Ubicación para el mapa</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {hasCoords ? `Coordenadas: ${data.lat}, ${data.lng}` : 'Se calculará automáticamente al guardar desde la dirección completa.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={geocodeAddress}
                            disabled={locating}
                            className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            {locating ? 'Buscando...' : 'Buscar coordenadas'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMapOpen(true)}
                            className="px-3.5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
                        >
                            Ajustar en mapa
                        </button>
                    </div>
                </div>
                {locationError && <p className="mt-2 text-xs text-red-600">{locationError}</p>}
            </div>

            <LocationPicker open={mapOpen} onClose={() => setMapOpen(false)} data={data} setData={setData} />

            <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Encargado / Contacto</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Nombre del encargado" error={errors.contacto_nombre}>
                        <Input value={data.contacto_nombre} onChange={(e) => setData('contacto_nombre', e.target.value)} placeholder="Juan Pérez" error={errors.contacto_nombre} />
                    </FieldGroup>
                    <FieldGroup label="Celular" error={errors.contacto_celular}>
                        <Input value={data.contacto_celular} onChange={(e) => setData('contacto_celular', e.target.value)} placeholder="999 888 777" error={errors.contacto_celular} />
                    </FieldGroup>
                </div>
            </div>

            <FieldGroup label="Fecha de apertura" error={errors.fecha_apertura}>
                <Input type="date" value={data.fecha_apertura} onChange={(e) => setData('fecha_apertura', e.target.value)} error={errors.fecha_apertura} />
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
                            <Input
                                value={data.motivo}
                                onChange={(e) => setData('motivo', e.target.value)}
                                placeholder="Ej: Cierre por obra, traslado a nueva sede..."
                                error={errors.motivo}
                            />
                        </FieldGroup>
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
                    {isEdit ? 'Guardar cambios' : 'Crear local'}
                </button>
            </div>
        </form>
    );
}

const EMPTY_FORM = {
    nombre: '', tipo: '', estado: '', zona: '',
    departamento: '', provincia: '', distrito: '', direccion: '',
    lat: '', lng: '',
    fecha_apertura: '', contacto_nombre: '', contacto_celular: '',
    motivo: '', registrar_historial: false,
};

export default function LocalesIndex({ locales = [], zonas = [], zonaMap = {} }) {
    const user = usePage().props.auth?.user || {};
    const canDelete = user.rol === 'admin';
    const [search, setSearch] = useState('');
    const [zonaFilter, setZonaFilter] = useState('');
    const [tipoFilter, setTipoFilter] = useState('');
    const [departamentoFilter, setDepartamentoFilter] = useState('');
    const [provinciaFilter, setProvinciaFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [editLocal, setEditLocal] = useState(null);
    const [deleteLocal, setDeleteLocal] = useState(null);

    const createForm = useForm({ ...EMPTY_FORM });
    const editForm = useForm({ ...EMPTY_FORM });

    const zonasFiltro = useMemo(() => {
        return [
            ...new Set(
                locales
                    .filter((l) => !tipoFilter || l.tipo === tipoFilter)
                    .filter((l) => !departamentoFilter || l.departamento === departamentoFilter)
                    .filter((l) => !provinciaFilter || l.provincia === provinciaFilter)
                    .map((l) => l.zona)
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [locales, tipoFilter, departamentoFilter, provinciaFilter]);

    const departamentos = useMemo(() => {
        return [
            ...new Set(
                locales
                    .filter((l) => !tipoFilter || l.tipo === tipoFilter)
                    .filter((l) => !zonaFilter || l.zona === zonaFilter)
                    .map((l) => l.departamento)
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [locales, tipoFilter, zonaFilter]);

    const provincias = useMemo(() => {
        return [
            ...new Set(
                locales
                    .filter((l) => !tipoFilter || l.tipo === tipoFilter)
                    .filter((l) => !zonaFilter || l.zona === zonaFilter)
                    .filter((l) => !departamentoFilter || l.departamento === departamentoFilter)
                    .map((l) => l.provincia)
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [locales, tipoFilter, zonaFilter, departamentoFilter]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return locales.filter(
            (l) => {
                const matchesSearch = !q ||
                    l.nombre?.toLowerCase().includes(q) ||
                    l.codigo?.toLowerCase().includes(q) ||
                    l.zona?.toLowerCase().includes(q) ||
                    l.departamento?.toLowerCase().includes(q);
                const matchesZona = !zonaFilter || l.zona === zonaFilter;
                const matchesTipo = !tipoFilter || l.tipo === tipoFilter;
                const matchesDepartamento = !departamentoFilter || l.departamento === departamentoFilter;
                const matchesProvincia = !provinciaFilter || l.provincia === provinciaFilter;

                return matchesSearch && matchesZona && matchesTipo && matchesDepartamento && matchesProvincia;
            }
        );
    }, [locales, search, zonaFilter, tipoFilter, departamentoFilter, provinciaFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, zonaFilter, tipoFilter, departamentoFilter, provinciaFilter]);

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

    const hasFilters = Boolean(search || zonaFilter || tipoFilter || departamentoFilter || provinciaFilter);

    const clearFilters = () => {
        setSearch('');
        setZonaFilter('');
        setTipoFilter('');
        setDepartamentoFilter('');
        setProvinciaFilter('');
    };

    const openEdit = (local) => {
        editForm.setData({
            nombre: local.nombre || '',
            tipo: local.tipo || '',
            estado: local.estado || '',
            zona: local.zona || '',
            departamento: local.departamento || '',
            provincia: local.provincia || '',
            distrito: local.distrito || '',
            direccion: local.direccion || '',
            lat: local.lat || '',
            lng: local.lng || '',
            fecha_apertura: local.fecha_apertura || '',
            contacto_nombre: local.contacto_nombre || '',
            contacto_celular: local.contacto_celular || '',
            motivo: '',
            registrar_historial: false,
        });
        setEditLocal(local);
    };

    const handleCreate = (e, payload = null) => {
        e.preventDefault();
        createForm.transform((data) => payload ?? data);
        createForm.post('/admin/locales', {
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
            onFinish: () => createForm.transform((data) => data),
        });
    };

    const handleEdit = (e, payload = null) => {
        e.preventDefault();
        editForm.transform((data) => payload ?? data);
        editForm.put('/admin/locales/' + editLocal.id, {
            onSuccess: () => setEditLocal(null),
            onFinish: () => editForm.transform((data) => data),
        });
    };

    const handleDelete = () => {
        router.delete('/admin/locales/' + deleteLocal.id, {
            onSuccess: () => setDeleteLocal(null),
        });
    };

    return (
        <AdminLayout title="Locales">
            <Head title="Locales" />

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-3 mb-5">
                <div className="relative w-full xl:w-80 flex-shrink-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, código, zona..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    />
                </div>
                <select
                    value={zonaFilter}
                    onChange={(e) => {
                        setZonaFilter(e.target.value);
                        setDepartamentoFilter('');
                        setProvinciaFilter('');
                    }}
                    className="w-full sm:w-44 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                >
                    <option value="">Todas las zonas</option>
                    {zonasFiltro.map((zona) => (
                        <option key={zona} value={zona}>{zona}</option>
                    ))}
                </select>
                <select
                    value={tipoFilter}
                    onChange={(e) => {
                        setTipoFilter(e.target.value);
                        setDepartamentoFilter('');
                        setProvinciaFilter('');
                    }}
                    className="w-full sm:w-40 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                >
                    <option value="">Todos los tipos</option>
                    {TIPOS.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                </select>
                <select
                    value={departamentoFilter}
                    onChange={(e) => {
                        setDepartamentoFilter(e.target.value);
                        setProvinciaFilter('');
                    }}
                    className="w-full sm:w-56 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                >
                    <option value="">Todos los departamentos</option>
                    {departamentos.map((departamento) => (
                        <option key={departamento} value={departamento}>{departamento}</option>
                    ))}
                </select>
                <select
                    value={provinciaFilter}
                    onChange={(e) => setProvinciaFilter(e.target.value)}
                    disabled={provincias.length === 0}
                    className="w-full sm:w-56 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 disabled:bg-gray-50 disabled:text-gray-400"
                >
                    <option value="">Todas las provincias</option>
                    {provincias.map((provincia) => (
                        <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                </select>
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 flex-shrink-0"
                    >
                        Limpiar filtros
                    </button>
                )}
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#E30613' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo local
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zona</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pantallas</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                                        {search ? 'No se encontraron resultados para la búsqueda.' : 'No hay locales registrados.'}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((local) => (
                                    <tr key={local.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{local.codigo}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{local.nombre}</p>
                                                <p className="text-xs text-gray-400">{[local.distrito, local.provincia].filter(Boolean).join(', ')}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_COLORS[local.tipo] || 'bg-gray-100 text-gray-700'}`}>
                                                {local.tipo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[local.estado] || 'bg-gray-100 text-gray-700'}`}>
                                                {local.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {local.zona ? (
                                                <span className="flex items-center gap-1.5 text-sm text-gray-700">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ZONA_COLORS[local.zona] || '#9CA3AF' }} />
                                                    {local.zona}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {local.pantallas_count ?? 0}
                                                </span>
                                                {['Cerrado', 'Trasladado', 'Suspendido'].includes(local.estado) && (local.pantallas_count ?? 0) > 0 && (
                                                    <span title="Local inactivo con pantallas asignadas" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-600">
                                                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(local)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => setDeleteLocal(local)}
                                                        disabled={local.pantallas_count > 0}
                                                        title={local.pantallas_count > 0 ? 'No se puede eliminar: tiene pantallas asignadas' : 'Eliminar'}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
                            Mostrando {pageStart + 1}-{Math.min(pageEnd, filtered.length)} de {filtered.length} locales
                            {filtered.length !== locales.length ? ` filtrados de ${locales.length}` : ''}
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
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nuevo local" size="xl">
                <LocalForm form={createForm} isEdit={false} zonaMap={zonaMap} onSubmit={handleCreate} />
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!editLocal} onClose={() => setEditLocal(null)} title={`Editar: ${editLocal?.nombre || ''}`} size="xl">
                {editLocal && (
                    <LocalForm form={editForm} isEdit zonaMap={zonaMap} onSubmit={handleEdit} />
                )}
            </Modal>

            {/* Delete Confirm */}
            <Modal open={!!deleteLocal} onClose={() => setDeleteLocal(null)} title="Eliminar local" size="sm">
                {deleteLocal && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            ¿Eliminar el local <strong>{deleteLocal.nombre}</strong> ({deleteLocal.codigo})?
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteLocal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
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
