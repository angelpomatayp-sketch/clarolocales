import { useState, useEffect, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/AppModal';
import EmptyState from '@/Components/EmptyState';
import { RowAction, RowActions } from '@/Components/RowActions';
import AdminLayout from '@/Layouts/AdminLayout';
import { ESTADOS_PANTALLA, ESTADO_PANTALLA_BADGE as ESTADO_COLORS } from '@/constants/shared';

function FieldGroup({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'es'));

const VIDEO_WALL_PRESETS = ['2x1', '2x2', '2x3'];

const buildVideoWallComponents = (rows, columns, current = []) => {
    const existing = new Map(current.map((item) => [`${item.fila}-${item.columna}`, item]));
    const components = [];

    for (let row = 1; row <= rows; row += 1) {
        for (let column = 1; column <= columns; column += 1) {
            components.push(existing.get(`${row}-${column}`) || {
                serie: '',
                fila: row,
                columna: column,
            });
        }
    }

    return components;
};

function VideoWallInventoryFields({ form, inputClass }) {
    const { data, setData, errors } = form;
    if (data.modelo !== 'Video Wall') return null;

    const rows = Number(data.filas) || 0;
    const columns = Number(data.columnas) || 0;
    const currentConfiguration = rows && columns ? `${rows}x${columns}` : '';
    const presetValue = VIDEO_WALL_PRESETS.includes(currentConfiguration)
        ? currentConfiguration
        : (currentConfiguration ? 'custom' : '');

    const applyConfiguration = (nextRows, nextColumns) => {
        const safeRows = Math.min(10, Math.max(1, Number(nextRows) || 1));
        const safeColumns = Math.min(10, Math.max(1, Number(nextColumns) || 1));
        setData({
            ...data,
            filas: String(safeRows),
            columnas: String(safeColumns),
            componentes: buildVideoWallComponents(safeRows, safeColumns, data.componentes || []),
        });
    };

    const updateComponent = (index, serie) => {
        const componentes = [...(data.componentes || [])];
        componentes[index] = { ...componentes[index], serie };
        setData('componentes', componentes);
    };

    return (
        <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 space-y-4">
            <div>
                <p className="text-sm font-semibold text-gray-900">Componentes del Video Wall</p>
                <p className="mt-0.5 text-xs text-gray-500">
                    La serie principal identifica el conjunto. Registra debajo la serie individual de cada panel físico.
                </p>
            </div>

            <FieldGroup label="Configuración (filas × columnas)" error={errors.filas || errors.columnas}>
                <select
                    value={presetValue}
                    onChange={(event) => {
                        if (event.target.value === 'custom') {
                            applyConfiguration(rows || 1, columns || 1);
                            return;
                        }
                        const [nextRows, nextColumns] = event.target.value.split('x').map(Number);
                        applyConfiguration(nextRows, nextColumns);
                    }}
                    className={inputClass(errors.filas || errors.columnas) + ' bg-white'}
                >
                    <option value="">Seleccionar configuración</option>
                    <option value="2x1">2x1 — 2 paneles</option>
                    <option value="2x2">2x2 — 4 paneles</option>
                    <option value="2x3">2x3 — 6 paneles</option>
                    <option value="custom">Personalizada</option>
                </select>
            </FieldGroup>

            {presetValue === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Filas" error={errors.filas}>
                        <input type="number" min="1" max="10" value={data.filas} onChange={(event) => applyConfiguration(event.target.value, columns)} className={inputClass(errors.filas)} />
                    </FieldGroup>
                    <FieldGroup label="Columnas" error={errors.columnas}>
                        <input type="number" min="1" max="10" value={data.columnas} onChange={(event) => applyConfiguration(rows, event.target.value)} className={inputClass(errors.columnas)} />
                    </FieldGroup>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(data.componentes || []).map((component, index) => (
                    <FieldGroup
                        key={`${component.fila}-${component.columna}`}
                        label={`Panel F${component.fila}-C${component.columna}`}
                        error={errors[`componentes.${index}.serie`]}
                    >
                        <input
                            type="text"
                            value={component.serie || ''}
                            onChange={(event) => updateComponent(index, event.target.value)}
                            placeholder="Serie del panel"
                            autoComplete="off"
                            className={inputClass(errors[`componentes.${index}.serie`]) + ' font-mono'}
                        />
                    </FieldGroup>
                ))}
            </div>
            {errors.componentes && <p className="text-xs text-red-600">{errors.componentes}</p>}
        </div>
    );
}

function PantallaForm({ form, locales, tipos, isEdit, onSubmit, isOperativo = false, operationType = 'actualizacion', pantalla = null }) {
    const { data, setData, errors, processing } = form;

    const initialLocal = locales.find((local) => String(local.id) === String(data.local_id));
    const [zona, setZona] = useState(initialLocal?.zona || '');
    const [departamento, setDepartamento] = useState(initialLocal?.departamento || '');
    const [provincia, setProvincia] = useState(initialLocal?.provincia || '');
    const [distrito, setDistrito] = useState(initialLocal?.distrito || '');

    const zonas = uniqueSorted(locales.map((local) => local.zona));
    const departamentos = uniqueSorted(
        locales.filter((local) => local.zona === zona).map((local) => local.departamento)
    );
    const provincias = uniqueSorted(
        locales
            .filter((local) => local.zona === zona && local.departamento === departamento)
            .map((local) => local.provincia)
    );
    const distritos = uniqueSorted(
        locales
            .filter((local) => (
                local.zona === zona
                && local.departamento === departamento
                && local.provincia === provincia
            ))
            .map((local) => local.distrito)
    );
    const localesFiltrados = locales.filter((local) => (
        local.zona === zona
        && local.departamento === departamento
        && local.provincia === provincia
        && local.distrito === distrito
    ));

    const clearLocal = () => setData('local_id', '');

    const changeZona = (value) => {
        setZona(value);
        setDepartamento('');
        setProvincia('');
        setDistrito('');
        clearLocal();
    };

    const changeDepartamento = (value) => {
        setDepartamento(value);
        setProvincia('');
        setDistrito('');
        clearLocal();
    };

    const changeProvincia = (value) => {
        setProvincia(value);
        setDistrito('');
        clearLocal();
    };

    const changeDistrito = (value) => {
        setDistrito(value);
        clearLocal();
    };

    const changeScreenType = (value) => {
        if (value === 'Video Wall') {
            const rows = Number(data.filas) || 0;
            const columns = Number(data.columnas) || 0;
            setData({
                ...data,
                modelo: value,
                filas: rows ? String(rows) : '',
                columnas: columns ? String(columns) : '',
                componentes: rows && columns
                    ? buildVideoWallComponents(rows, columns, data.componentes || [])
                    : [],
            });
            return;
        }

        setData({ ...data, modelo: value, filas: '', columnas: '', componentes: [] });
    };

    const inputClass = (err) =>
        `w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            err ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'
        }`;

    if (isOperativo) {
        const isMaintenance = isEdit && operationType === 'mantenimiento';

        return (
            <form onSubmit={onSubmit} className="space-y-4">
                {isEdit && pantalla && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-mono text-xs text-gray-500">{pantalla.codigo}</p>
                                <p className="mt-0.5 text-base font-semibold text-gray-900">Serie {pantalla.serie}</p>
                                <p className="mt-1 text-sm text-gray-600">{pantalla.modelo}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[pantalla.estado] || 'bg-gray-100 text-gray-700'}`}>
                                {pantalla.estado}
                            </span>
                        </div>
                        <div className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-600">
                            <p className="font-medium text-gray-800">
                                {pantalla.local ? `${pantalla.local.codigo} — ${pantalla.local.nombre}` : 'Sin local asignado'}
                            </p>
                        </div>
                    </div>
                )}

                {!isEdit && (
                    <>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-500">
                            El código y la fecha de registro se asignarán automáticamente.
                        </div>
                        <FieldGroup label={data.modelo === 'Video Wall' ? 'Serie principal del Video Wall' : 'N° de serie'} error={errors.serie}>
                            <input
                                type="text"
                                value={data.serie}
                                onChange={(e) => setData('serie', e.target.value)}
                                placeholder="Escanea o escribe la serie"
                                autoComplete="off"
                                className={inputClass(errors.serie)}
                            />
                        </FieldGroup>
                        <FieldGroup label="Tipo de pantalla" error={errors.modelo}>
                            <select
                                value={data.modelo}
                                onChange={(e) => changeScreenType(e.target.value)}
                                className={inputClass(errors.modelo) + ' bg-white'}
                            >
                                <option value="">Seleccionar tipo</option>
                                {(tipos || []).map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                            </select>
                        </FieldGroup>
                        <VideoWallInventoryFields form={form} inputClass={inputClass} />
                    </>
                )}

                {isMaintenance ? (
                    <>
                        <FieldGroup label="Estado después del mantenimiento" error={errors.estado}>
                            <select
                                value={data.estado}
                                onChange={(e) => setData('estado', e.target.value)}
                                className={inputClass(errors.estado) + ' bg-white'}
                            >
                                <option value="">Seleccionar resultado</option>
                                {ESTADOS_PANTALLA.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </FieldGroup>
                        <FieldGroup label="Fecha del mantenimiento" error={errors.mantenimiento_fecha}>
                            <input
                                type="date"
                                value={data.mantenimiento_fecha}
                                onChange={(e) => setData('mantenimiento_fecha', e.target.value)}
                                className={inputClass(errors.mantenimiento_fecha)}
                            />
                        </FieldGroup>
                        <FieldGroup label="Trabajo realizado" error={errors.mantenimiento_motivo}>
                            <textarea
                                value={data.mantenimiento_motivo}
                                onChange={(e) => setData('mantenimiento_motivo', e.target.value)}
                                placeholder="Describe brevemente lo verificado y realizado en campo"
                                rows={3}
                                className={inputClass(errors.mantenimiento_motivo) + ' resize-none'}
                            />
                        </FieldGroup>
                    </>
                ) : (
                    <>
                        {isEdit && pantalla?.modelo === 'Video Wall' && (
                            <VideoWallInventoryFields form={form} inputClass={inputClass} />
                        )}

                        <div>
                            <FieldGroup label="Estado actual" error={errors.estado}>
                                <select
                                    value={data.estado}
                                    onChange={(e) => setData('estado', e.target.value)}
                                    className={inputClass(errors.estado) + ' bg-white'}
                                >
                                    <option value="">Seleccionar estado</option>
                                    {ESTADOS_PANTALLA.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                                </select>
                            </FieldGroup>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Local donde se encuentra</p>
                                <p className="mt-0.5 text-xs text-gray-500">Selecciona la ubicación para evitar asignaciones incorrectas.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FieldGroup label="Zona">
                                    <select value={zona} onChange={(e) => changeZona(e.target.value)} className={inputClass(false) + ' bg-white'}>
                                        <option value="">Seleccionar zona</option>
                                        {zonas.map((value) => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </FieldGroup>
                                <FieldGroup label="Departamento">
                                    <select value={departamento} onChange={(e) => changeDepartamento(e.target.value)} disabled={!zona} className={inputClass(false) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400'}>
                                        <option value="">Seleccionar departamento</option>
                                        {departamentos.map((value) => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </FieldGroup>
                                <FieldGroup label="Provincia">
                                    <select value={provincia} onChange={(e) => changeProvincia(e.target.value)} disabled={!departamento} className={inputClass(false) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400'}>
                                        <option value="">Seleccionar provincia</option>
                                        {provincias.map((value) => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </FieldGroup>
                                <FieldGroup label="Distrito">
                                    <select value={distrito} onChange={(e) => changeDistrito(e.target.value)} disabled={!provincia} className={inputClass(false) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400'}>
                                        <option value="">Seleccionar distrito</option>
                                        {distritos.map((value) => <option key={value} value={value}>{value}</option>)}
                                    </select>
                                </FieldGroup>
                            </div>
                            <FieldGroup label="Local asignado" error={errors.local_id}>
                                <select
                                    value={data.local_id}
                                    onChange={(e) => setData('local_id', e.target.value)}
                                    disabled={!distrito}
                                    className={inputClass(errors.local_id) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400'}
                                >
                                    <option value="">{distrito ? 'Sin asignar' : 'Selecciona primero un distrito'}</option>
                                    {localesFiltrados.map((local) => (
                                        <option key={local.id} value={local.id}>{local.codigo} — {local.nombre} · {local.direccion}</option>
                                    ))}
                                </select>
                            </FieldGroup>
                        </div>

                        {isEdit && (
                            <FieldGroup label="Observación del cambio" error={errors.motivo}>
                                <textarea
                                    value={data.motivo}
                                    onChange={(e) => setData('motivo', e.target.value)}
                                    placeholder="Opcional: indica lo corroborado en campo"
                                    rows={2}
                                    className={inputClass(errors.motivo) + ' resize-none'}
                                />
                            </FieldGroup>
                        )}
                    </>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                    {processing
                        ? 'Guardando...'
                        : (isMaintenance ? 'Guardar mantenimiento' : (isEdit ? 'Guardar verificación' : 'Registrar pantalla'))}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {!isEdit && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-xs text-gray-400">Código</span>
                    <span className="text-xs font-mono text-gray-500 ml-auto">Se asignará automáticamente</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label={data.modelo === 'Video Wall' ? 'Serie principal del Video Wall' : 'N° de Serie'} error={errors.serie}>
                    <input
                        type="text"
                        value={data.serie}
                        onChange={(e) => setData('serie', e.target.value)}
                        placeholder="SN-XXXXXXXX"
                        className={inputClass(errors.serie)}
                    />
                </FieldGroup>
                <FieldGroup label="N° Solicitud" error={errors.numero_solicitud}>
                    <input
                        type="text"
                        value={data.numero_solicitud}
                        onChange={(e) => setData('numero_solicitud', e.target.value)}
                        placeholder="SOL-XXXXXXXX"
                        className={inputClass(errors.numero_solicitud)}
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
                        onChange={(e) => changeScreenType(e.target.value)}
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

            <VideoWallInventoryFields form={form} inputClass={inputClass} />

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

            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 space-y-4">
                <div>
                    <p className="text-sm font-semibold text-gray-800">Ubicación del local</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Filtra la ubicación para mostrar únicamente los locales del distrito seleccionado.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Zona">
                        <select
                            value={zona}
                            onChange={(e) => changeZona(e.target.value)}
                            className={inputClass(false) + ' bg-white'}
                        >
                            <option value="">Seleccionar zona</option>
                            {zonas.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </FieldGroup>

                    <FieldGroup label="Departamento">
                        <select
                            value={departamento}
                            onChange={(e) => changeDepartamento(e.target.value)}
                            disabled={!zona}
                            className={inputClass(false) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'}
                        >
                            <option value="">Seleccionar departamento</option>
                            {departamentos.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </FieldGroup>

                    <FieldGroup label="Provincia">
                        <select
                            value={provincia}
                            onChange={(e) => changeProvincia(e.target.value)}
                            disabled={!departamento}
                            className={inputClass(false) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'}
                        >
                            <option value="">Seleccionar provincia</option>
                            {provincias.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </FieldGroup>

                    <FieldGroup label="Distrito">
                        <select
                            value={distrito}
                            onChange={(e) => changeDistrito(e.target.value)}
                            disabled={!provincia}
                            className={inputClass(false) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'}
                        >
                            <option value="">Seleccionar distrito</option>
                            {distritos.map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </FieldGroup>
                </div>

                <FieldGroup label="Local asignado" error={errors.local_id}>
                    <select
                        value={data.local_id}
                        onChange={(e) => setData('local_id', e.target.value)}
                        disabled={!distrito}
                        className={inputClass(errors.local_id) + ' bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'}
                    >
                        <option value="">
                            {distrito ? 'Sin asignar' : 'Selecciona primero un distrito'}
                        </option>
                        {localesFiltrados.map((local) => (
                            <option key={local.id} value={local.id}>
                                {local.codigo} — {local.nombre} · {local.direccion}
                            </option>
                        ))}
                    </select>
                    {distrito && localesFiltrados.length === 0 && (
                        <p className="mt-1.5 text-xs text-amber-700">
                            No existen locales registrados en este distrito.
                        </p>
                    )}
                    {!data.local_id && (
                        <p className="mt-1.5 text-xs text-gray-500">
                            Puedes dejar la pantalla sin asignar si permanece en almacén.
                        </p>
                    )}
                </FieldGroup>
            </div>

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

const cleanParams = (params) => Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
);

const paginationPages = (current, last) => {
    const pages = new Set([1, last]);
    for (let page = current - 2; page <= current + 2; page += 1) {
        if (page >= 1 && page <= last) pages.add(page);
    }
    return [...pages].sort((a, b) => a - b);
};

const EMPTY_FORM = {
    codigo: '',
    serie: '',
    numero_solicitud: '',
    marca: '',
    modelo: '',
    modelo_equipo: '',
    tamanio: '',
    filas: '',
    columnas: '',
    componentes: [],
    estado: '',
    fecha_registro: '',
    local_id: '',
    operacion: 'actualizacion',
    motivo: '',
    registrar_historial: false,
    registrar_mantenimiento: false,
    mantenimiento_fecha: today(),
    mantenimiento_motivo: '',
};

export default function PantallasIndex({ pantallas = {}, locales = [], tipos = [], filters = {} }) {
    const user = usePage().props.auth?.user || {};
    const isOperativo = user.rol === 'operativo';
    const canDelete = user.rol === 'admin';
    const [search, setSearch] = useState(filters.search || '');
    const [filtering, setFiltering] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editPantalla, setEditPantalla] = useState(null);
    const [operationType, setOperationType] = useState('actualizacion');
    const [deletePantalla, setDeletePantalla] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const firstFilterRun = useRef(true);

    const createForm = useForm({ ...EMPTY_FORM });
    const editForm = useForm({ ...EMPTY_FORM });

    const rows = pantallas.data || [];
    const currentPage = pantallas.current_page || 1;
    const totalPages = pantallas.last_page || 1;
    const pageStart = pantallas.from || 0;
    const pageEnd = pantallas.to || 0;
    const totalRecords = pantallas.total || 0;
    const visiblePages = paginationPages(currentPage, totalPages);

    const requestPage = (page = 1) => {
        router.get('/admin/pantallas', cleanParams({ search, page }), {
            only: ['pantallas', 'filters'],
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onStart: () => setFiltering(true),
            onFinish: () => setFiltering(false),
        });
    };

    useEffect(() => {
        if (firstFilterRun.current) {
            firstFilterRun.current = false;
            return;
        }

        const timer = setTimeout(() => requestPage(1), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const openEdit = (pantalla, operacion = 'actualizacion') => {
        const isVideoWall = pantalla.modelo === 'Video Wall';
        const filas = isVideoWall ? Number(pantalla.filas) || 0 : 0;
        const columnas = isVideoWall ? Number(pantalla.columnas) || 0 : 0;
        const componentes = isVideoWall && filas && columnas
            ? buildVideoWallComponents(filas, columnas, pantalla.componentes || [])
            : [];

        editForm.setData({
            serie:               pantalla.serie || '',
            numero_solicitud:    pantalla.numero_solicitud || '',
            marca:               pantalla.marca || '',
            modelo:              pantalla.modelo || '',
            modelo_equipo:       pantalla.modelo_equipo || '',
            tamanio:             pantalla.tamanio ? String(pantalla.tamanio) : '',
            filas:               isVideoWall ? String(filas) : '',
            columnas:            isVideoWall ? String(columnas) : '',
            componentes,
            estado:              pantalla.estado || '',
            fecha_registro:      pantalla.fecha_registro || '',
            local_id:            pantalla.local_id ? String(pantalla.local_id) : '',
            operacion,
            motivo:              '',
            registrar_historial: false,
            registrar_mantenimiento: false,
            mantenimiento_fecha: today(),
            mantenimiento_motivo: '',
        });
        setOperationType(operacion);
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
        <AdminLayout title={isOperativo ? 'Consulta de inventario' : 'Pantallas'}>
            <Head title={isOperativo ? 'Consulta de inventario' : 'Pantallas'} />

            {isOperativo && (
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Inventario de pantallas</h2>
                    <p className="mt-1 text-sm text-gray-500">Consulta equipos por serie o código. Las instalaciones y mantenimientos se registran desde Mis servicios.</p>
                </div>
            )}

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
                        placeholder={isOperativo ? 'Buscar por serie o código...' : 'Buscar por serie, código, modelo, local...'}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                    />
                </div>
                {!isOperativo && <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#E30613' }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva pantalla
                </button>}
            </div>

            {/* Mobile field cards / administrative table */}
            {isOperativo ? (
                <div className="space-y-3">
                    {rows.length === 0 ? (
                        <EmptyState
                            compact
                            title={search ? 'No encontramos equipos' : 'No hay pantallas registradas'}
                            description={search ? 'Prueba con otra serie, código o modelo.' : 'Cuando se registre inventario aparecerá aquí para su verificación en campo.'}
                        />
                    ) : rows.map((pantalla) => (
                        <article key={pantalla.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-mono text-xs text-gray-400">{pantalla.codigo}</p>
                                    <h3 className="mt-0.5 truncate text-base font-semibold text-gray-900">Serie {pantalla.serie}</h3>
                                    <p className="mt-1 text-sm text-gray-600">{pantalla.modelo || 'Tipo no registrado'}</p>
                                    {pantalla.modelo === 'Video Wall' && (
                                        <p className="mt-1 text-xs font-medium text-red-700">
                                            {pantalla.filas && pantalla.columnas ? `${pantalla.filas}x${pantalla.columnas}` : 'Configuración pendiente'}
                                            {' · '}{pantalla.componentes_count || 0} paneles registrados
                                        </p>
                                    )}
                                </div>
                                <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[pantalla.estado] || 'bg-gray-100 text-gray-700'}`}>
                                    {pantalla.estado}
                                </span>
                            </div>
                            <div className="mt-4 rounded-xl bg-gray-50 p-3">
                                <p className="text-sm font-medium text-gray-800">
                                    {pantalla.local ? `${pantalla.local.codigo} — ${pantalla.local.nombre}` : 'Sin local asignado'}
                                </p>
                                {pantalla.componentes?.length > 0 && (
                                    <p className="mt-2 break-words font-mono text-xs text-gray-500">
                                        Series: {pantalla.componentes.map((component) => component.serie).join(', ')}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}

                    {totalRecords > 0 && (
                        <div className="flex items-center justify-between gap-3 py-2 text-xs text-gray-500">
                            <span>{pageStart}-{pageEnd} de {totalRecords}</span>
                            <div className="flex gap-2">
                                <button onClick={() => requestPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || filtering} className="rounded-lg border border-gray-200 bg-white px-3 py-2 disabled:opacity-40">Anterior</button>
                                <button onClick={() => requestPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || filtering} className="rounded-lg border border-gray-200 bg-white px-3 py-2 disabled:opacity-40">Siguiente</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide sm:table-cell">Código</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">N° Serie</th>
                                <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide xl:table-cell">N° Solicitud</th>
                                <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide md:table-cell">Tipo / Modelo</th>
                                <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide lg:table-cell">Local</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                                <th className="hidden text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide xl:table-cell">Registrado</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-4">
                                        <EmptyState
                                            compact
                                            title={search ? 'No encontramos pantallas' : 'Comienza tu inventario de pantallas'}
                                            description={search ? 'Prueba con otro término de búsqueda.' : 'Registra la primera pantalla y asígnala a un local cuando corresponda.'}
                                            actionLabel={!search ? 'Registrar pantalla' : undefined}
                                            onAction={!search ? () => setCreateOpen(true) : undefined}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                rows.map((pantalla) => (
                                    <tr key={pantalla.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="hidden px-4 py-3 font-mono text-xs text-gray-500 sm:table-cell">{pantalla.codigo}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-700">{pantalla.serie}</td>
                                        <td className="hidden px-4 py-3 font-mono text-xs text-gray-500 xl:table-cell">{pantalla.numero_solicitud || <span className="text-gray-300">—</span>}</td>
                                        <td className="hidden px-4 py-3 md:table-cell">
                                            <p className="text-gray-700">{pantalla.modelo || '—'}</p>
                                            {pantalla.modelo_equipo && (
                                                <p className="text-xs font-mono text-gray-500">{pantalla.modelo_equipo}</p>
                                            )}
                                            {(pantalla.marca || pantalla.tamanio) && (
                                                <p className="text-xs text-gray-400">
                                                    {[pantalla.marca, pantalla.tamanio ? `${pantalla.tamanio}"` : null].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                            {pantalla.modelo === 'Video Wall' && (
                                                <div className="mt-1.5">
                                                    <p className="text-xs font-medium text-red-700">
                                                        {pantalla.filas && pantalla.columnas ? `${pantalla.filas}x${pantalla.columnas}` : 'Configuración pendiente'}
                                                        {' · '}{pantalla.componentes_count || 0} paneles
                                                    </p>
                                                    {pantalla.componentes?.length > 0 && (
                                                        <p className="mt-0.5 max-w-64 break-words font-mono text-[11px] leading-4 text-gray-400">
                                                            {pantalla.componentes.map((component) => component.serie).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="hidden px-4 py-3 lg:table-cell">
                                            {pantalla.local ? (
                                                <p className="font-medium text-gray-900 text-xs">{pantalla.local.codigo} — {pantalla.local.nombre}</p>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[pantalla.estado] || 'bg-gray-100 text-gray-700'}`}>
                                                {pantalla.estado}
                                            </span>
                                        </td>
                                        <td className="hidden px-4 py-3 text-gray-500 text-xs xl:table-cell">{formatDate(pantalla.fecha_registro)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end">
                                                <RowActions label={`Acciones de la pantalla ${pantalla.serie}`}>
                                                    <RowAction onClick={() => openEdit(pantalla)}>Editar pantalla</RowAction>
                                                    {canDelete && <RowAction danger onClick={() => setDeletePantalla(pantalla)}>Eliminar pantalla</RowAction>}
                                                </RowActions>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalRecords > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-400">
                        <span>
                            Mostrando {pageStart}-{pageEnd} de {totalRecords} pantallas
                            {filtering ? ' · Actualizando...' : ''}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => requestPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || filtering}
                                    className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                {visiblePages.map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => requestPage(page)}
                                        disabled={filtering}
                                        className={`min-w-8 h-8 px-2 rounded-lg border text-xs font-medium ${
                                            page === currentPage
                                                ? 'bg-red-600 text-white border-red-600'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => requestPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || filtering}
                                    className="h-8 px-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            )}

            {/* Create Modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva pantalla" size="xl">
                <PantallaForm form={createForm} locales={locales} tipos={tipos} isEdit={false} isOperativo={isOperativo} onSubmit={handleCreate} />
            </Modal>

            {/* Edit Modal */}
            <Modal
                open={!!editPantalla}
                onClose={() => setEditPantalla(null)}
                title={isOperativo
                    ? (operationType === 'mantenimiento' ? 'Registrar mantenimiento' : 'Verificar pantalla')
                    : `Editar: ${editPantalla?.codigo || ''}`}
                size="xl"
            >
                {editPantalla && (
                    <PantallaForm
                        form={editForm}
                        locales={locales}
                        tipos={tipos}
                        isEdit
                        isOperativo={isOperativo}
                        operationType={operationType}
                        pantalla={editPantalla}
                        onSubmit={handleEdit}
                    />
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
