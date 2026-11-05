import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppModal from '@/Components/AppModal';
import EmptyState from '@/Components/EmptyState';
import AdminLayout from '@/Layouts/AdminLayout';
import { getDepartamentos, getDistritos, getProvincias } from '@/data/ubigeo';

const STATUS = {
    pendiente: ['Pendiente', 'bg-amber-100 text-amber-800'],
    en_curso: ['En curso', 'bg-blue-100 text-blue-800'],
    en_revision: ['En revisión', 'bg-purple-100 text-purple-800'],
    observado: ['Observado', 'bg-red-100 text-red-800'],
    finalizado: ['Finalizado', 'bg-green-100 text-green-800'],
    cancelado: ['Cancelado', 'bg-gray-100 text-gray-600'],
};

const TYPE_LABEL = { instalacion: 'Instalación', mantenimiento: 'Mantenimiento', desmonte: 'Desmonte' };
const EVIDENCE_LABEL = {
    documento: 'Documento firmado', serie: 'Serie del equipo', inicial: 'Estado inicial',
    resultado: 'Resultado final', adicional: 'Adicional',
};

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (value) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('es-PE') : '—';
const formatDateTime = (value) => value ? new Date(value).toLocaleString('es-PE') : '—';

function Field({ label, error, hint, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    );
}

const inputClass = (error) => `w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${error ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:border-red-400 focus:ring-red-200'}`;

function LocalPicker({ locales, form }) {
    const selected = locales.find((local) => String(local.id) === String(form.data.local_id));
    const [zona, setZona] = useState(selected?.zona || '');
    const [departamento, setDepartamento] = useState(selected?.departamento || '');
    const [provincia, setProvincia] = useState(selected?.provincia || '');
    const [distrito, setDistrito] = useState(selected?.distrito || '');
    const zonas = uniqueSorted(locales.map((local) => local.zona));
    const departamentos = uniqueSorted(locales.filter((local) => local.zona === zona).map((local) => local.departamento));
    const provincias = uniqueSorted(locales.filter((local) => local.zona === zona && local.departamento === departamento).map((local) => local.provincia));
    const distritos = uniqueSorted(locales.filter((local) => local.zona === zona && local.departamento === departamento && local.provincia === provincia).map((local) => local.distrito));
    const options = locales.filter((local) => local.zona === zona && local.departamento === departamento && local.provincia === provincia && local.distrito === distrito);
    const clear = () => form.setData((data) => ({ ...data, local_id: '', pantalla_id: '' }));

    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-800">Ubicación del servicio</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Zona"><select value={zona} onChange={(e) => { setZona(e.target.value); setDepartamento(''); setProvincia(''); setDistrito(''); clear(); }} className={inputClass(false)}><option value="">Seleccionar</option>{zonas.map((value) => <option key={value}>{value}</option>)}</select></Field>
                <Field label="Departamento"><select value={departamento} disabled={!zona} onChange={(e) => { setDepartamento(e.target.value); setProvincia(''); setDistrito(''); clear(); }} className={inputClass(false) + ' disabled:bg-gray-100'}><option value="">Seleccionar</option>{departamentos.map((value) => <option key={value}>{value}</option>)}</select></Field>
                <Field label="Provincia"><select value={provincia} disabled={!departamento} onChange={(e) => { setProvincia(e.target.value); setDistrito(''); clear(); }} className={inputClass(false) + ' disabled:bg-gray-100'}><option value="">Seleccionar</option>{provincias.map((value) => <option key={value}>{value}</option>)}</select></Field>
                <Field label="Distrito"><select value={distrito} disabled={!provincia} onChange={(e) => { setDistrito(e.target.value); clear(); }} className={inputClass(false) + ' disabled:bg-gray-100'}><option value="">Seleccionar</option>{distritos.map((value) => <option key={value}>{value}</option>)}</select></Field>
            </div>
            <div className="mt-3">
                <Field label="Local" error={form.errors.local_id}>
                    <select value={form.data.local_id} disabled={!distrito} onChange={(e) => form.setData((data) => ({ ...data, local_id: e.target.value, pantalla_id: '' }))} className={inputClass(form.errors.local_id) + ' disabled:bg-gray-100'}>
                        <option value="">{distrito ? 'Seleccionar local' : 'Selecciona primero el distrito'}</option>
                        {options.map((local) => <option key={local.id} value={local.id}>{local.codigo} — {local.nombre} · {local.direccion}</option>)}
                    </select>
                </Field>
            </div>
        </div>
    );
}

function OrderForm({ form, locales, pantallas, operadores, tiposPantalla, onSubmit, submitLabel }) {
    const screens = pantallas.filter((screen) => String(screen.local_id) === String(form.data.local_id));
    const equipmentPlan = form.data.equipos_plan || [];
    const updatePlan = (index, value) => form.setData('equipos_plan', equipmentPlan.map((item, itemIndex) => itemIndex === index ? { ...item, tipo_esperado: value } : item));
    const removePlan = (index) => form.setData('equipos_plan', equipmentPlan.filter((_, itemIndex) => itemIndex !== index));
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tipo de servicio" error={form.errors.tipo}>
                    <select value={form.data.tipo} onChange={(e) => form.setData((data) => ({ ...data, tipo: e.target.value, pantalla_id: '', equipos_plan: e.target.value === 'instalacion' && !data.equipos_plan?.length ? [{ tipo_esperado: '' }] : data.equipos_plan }))} className={inputClass(form.errors.tipo)}>
                        <option value="instalacion">Instalación</option><option value="mantenimiento">Mantenimiento</option><option value="desmonte">Desmonte</option>
                    </select>
                </Field>
                <Field label="Fecha programada" error={form.errors.fecha_programada}><input type="date" value={form.data.fecha_programada} onChange={(e) => form.setData('fecha_programada', e.target.value)} className={inputClass(form.errors.fecha_programada)} /></Field>
            </div>
            <LocalPicker locales={locales} form={form} />
            {['mantenimiento', 'desmonte'].includes(form.data.tipo) && (
                <Field label={form.data.tipo === 'desmonte' ? 'Pantalla que será desmontada' : 'Pantalla que recibirá mantenimiento'} error={form.errors.pantalla_id}>
                    <select value={form.data.pantalla_id} disabled={!form.data.local_id} onChange={(e) => form.setData('pantalla_id', e.target.value)} className={inputClass(form.errors.pantalla_id) + ' disabled:bg-gray-100'}>
                        <option value="">Seleccionar pantalla</option>
                        {screens.map((screen) => <option key={screen.id} value={screen.id}>{screen.codigo} — {screen.serie} · {screen.modelo}</option>)}
                    </select>
                </Field>
            )}
            {form.data.tipo === 'instalacion' && (
                <section className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div><h3 className="text-sm font-semibold text-gray-800">Equipos previstos</h3><p className="mt-1 text-xs text-gray-500">Agrega uno por cada equipo que el operador debe instalar.</p></div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">{equipmentPlan.length}/20</span>
                    </div>
                    {form.errors.equipos_plan && <p className="text-xs text-red-600">{form.errors.equipos_plan}</p>}
                    <div className="space-y-2">
                        {equipmentPlan.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5">
                                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-700">{index + 1}</span>
                                <select value={item.tipo_esperado || ''} onChange={(e) => updatePlan(index, e.target.value)} className={inputClass(form.errors[`equipos_plan.${index}.tipo_esperado`])}>
                                    <option value="">Tipo por confirmar en campo</option>{tiposPantalla.map((type) => <option key={type}>{type}</option>)}
                                </select>
                                {equipmentPlan.length > 1 && <button type="button" onClick={() => removePlan(index)} className="flex h-10 w-10 flex-none items-center justify-center rounded-lg text-gray-400 active:bg-red-50 active:text-red-700" aria-label={`Quitar equipo ${index + 1}`}>×</button>}
                            </div>
                        ))}
                    </div>
                    {equipmentPlan.length < 20 && <button type="button" onClick={() => form.setData('equipos_plan', [...equipmentPlan, { tipo_esperado: '' }])} className="w-full rounded-xl border border-dashed border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 active:scale-[0.98]">+ Agregar otro equipo</button>}
                </section>
            )}
            <Field label="Operador asignado" error={form.errors.operador_id}>
                <select value={form.data.operador_id} onChange={(e) => form.setData('operador_id', e.target.value)} className={inputClass(form.errors.operador_id)}>
                    <option value="">Seleccionar operador</option>{operadores.map((operator) => <option key={operator.id} value={operator.id}>{operator.name} — {operator.email}</option>)}
                </select>
            </Field>
            <Field label="Instrucciones" error={form.errors.instrucciones} hint="Información que el operador necesita antes de salir a campo.">
                <textarea rows={3} value={form.data.instrucciones} onChange={(e) => form.setData('instrucciones', e.target.value)} className={inputClass(form.errors.instrucciones) + ' resize-none'} />
            </Field>
            <button disabled={form.processing} className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-60">{form.processing ? 'Guardando...' : submitLabel}</button>
        </form>
    );
}

const buildComponents = (rows, columns, current = []) => {
    const map = new Map(current.map((item) => [`${item.fila}-${item.columna}`, item]));
    return Array.from({ length: rows * columns }, (_, index) => {
        const fila = Math.floor(index / columns) + 1;
        const columna = (index % columns) + 1;
        return map.get(`${fila}-${columna}`) || { serie: '', fila, columna };
    });
};

const optimizeImage = (file) => new Promise((resolve) => {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        resolve(file);
        return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
        const maxSide = 1920;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        if (scale === 1 && file.size <= 3 * 1024 * 1024) {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(blob
                ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg', lastModified: Date.now() })
                : file);
        }, 'image/jpeg', 0.82);
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    image.src = objectUrl;
});

function FileField({ label, field, form, required = true, hint }) {
    return (
        <Field label={label} error={form.errors[field]} hint={hint}>
            <input type="file" accept="image/*" capture="environment" onChange={async (e) => form.setData(field, await optimizeImage(e.target.files[0] || null))} className={inputClass(form.errors[field]) + ' bg-white file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm'} />
            {form.data[field] && <span className="mt-1 block text-xs font-medium text-green-700">Seleccionada: {form.data[field].name}</span>}
            {!required && <span className="sr-only">Opcional</span>}
        </Field>
    );
}

function EvidenceGallery({ evidences = [] }) {
    if (!evidences.length) return null;
    return (
        <div>
            <p className="mb-2 text-sm font-semibold text-gray-800">Evidencias registradas</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {evidences.map((evidence) => (
                    <a key={evidence.id} href={evidence.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-gray-200 bg-white active:scale-[0.98]">
                        {evidence.mime?.startsWith('image/') ? <img src={evidence.url} alt={EVIDENCE_LABEL[evidence.tipo]} className="h-24 w-full object-cover" /> : <div className="flex h-24 items-center justify-center bg-gray-100 text-xs text-gray-500">Archivo</div>}
                        <span className="block px-2 py-2 text-xs font-medium text-gray-700">{EVIDENCE_LABEL[evidence.tipo]}{evidence.equipo ? ` · Equipo ${evidence.equipo.orden}` : ''}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

function ExecutionForm({ servicio, form, tiposPantalla, estadosPantalla, onSubmit }) {
    const resultStates = servicio.tipo === 'desmonte'
        ? estadosPantalla.filter((state) => ['En almacén', 'Retirada', 'Dada de baja'].includes(state))
        : estadosPantalla;
    const equipments = form.data.equipos || [];
    const installedCount = equipments.filter((item) => item.resultado === 'instalado').length;
    const updateEquipment = (index, changes) => form.setData('equipos', equipments.map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item));
    const configureWall = (index, value) => {
        const equipment = equipments[index];
        if (!value) return updateEquipment(index, { filas: '', columnas: '', componentes: [] });
        const [rows, columns] = value.split('x').map(Number);
        updateEquipment(index, { filas: String(rows), columnas: String(columns), componentes: buildComponents(rows, columns, equipment.componentes || []) });
    };
    const updateComponent = (equipmentIndex, componentIndex, serie) => updateEquipment(equipmentIndex, {
        componentes: equipments[equipmentIndex].componentes.map((component, index) => index === componentIndex ? { ...component, serie } : component),
    });

    return (
        <form onSubmit={onSubmit} className="space-y-5 pb-20 sm:pb-0">
            {servicio.estado === 'observado' && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><strong>Observación del supervisor:</strong> {servicio.motivo_observacion}</div>}
            <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{servicio.codigo} · {TYPE_LABEL[servicio.tipo]}</p>
                <p className="mt-1 font-semibold text-gray-900">{servicio.local.codigo} — {servicio.local.nombre}</p>
                <p className="mt-1 text-sm text-gray-500">{servicio.local.direccion}</p>
                {servicio.pantalla && <p className="mt-2 font-mono text-xs text-gray-600">{servicio.pantalla.codigo} · Serie {servicio.pantalla.serie}</p>}
            </div>

            <nav className="grid grid-cols-3 gap-2" aria-label="Etapas del registro">
                {[
                    ['1', servicio.tipo === 'instalacion' ? 'Equipos' : 'Equipo'],
                    ['2', 'Resultado'],
                    ['3', 'Evidencias'],
                ].map(([number, label]) => (
                    <div key={number} className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-center">
                        <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">{number}</span>
                        <span className="mt-1 block truncate text-[11px] font-medium text-gray-600">{label}</span>
                    </div>
                ))}
            </nav>

            {servicio.tipo === 'instalacion' && (
                <section className="space-y-4" aria-labelledby="equipment-step-title">
                    <div className="flex items-center justify-between gap-3">
                        <div><h3 id="equipment-step-title" className="text-sm font-semibold text-gray-900"><span className="mr-2 text-red-600">1.</span>Equipos de la instalación</h3><p className="mt-1 text-xs text-gray-500">Completa cada tarjeta y fotografía su serie.</p></div>
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">{installedCount}/{equipments.length} instalados</span>
                    </div>
                    {form.errors.equipos && <p className="text-xs text-red-600">{form.errors.equipos}</p>}
                    {equipments.map((equipment, index) => {
                        const prefix = `equipos.${index}`;
                        const installed = equipment.resultado === 'instalado';
                        return (
                            <article key={equipment.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                <header className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3">
                                    <div><p className="text-sm font-semibold text-gray-900">Equipo {index + 1}</p><p className="text-xs text-gray-500">Esperado: {equipment.tipo_esperado || 'por confirmar'}</p></div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${installed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{installed ? 'Instalado' : 'No instalado'}</span>
                                </header>
                                <div className="space-y-4 p-4">
                                    <Field label="Resultado" error={form.errors[`${prefix}.resultado`]}><select value={equipment.resultado} onChange={(e) => updateEquipment(index, { resultado: e.target.value })} className={inputClass(form.errors[`${prefix}.resultado`])}><option value="instalado">Instalado</option><option value="no_instalado">No se pudo instalar</option></select></Field>
                                    {!installed ? (
                                        <Field label="Motivo por el que no se instaló" error={form.errors[`${prefix}.motivo_no_instalado`]}><textarea rows={3} value={equipment.motivo_no_instalado || ''} onChange={(e) => updateEquipment(index, { motivo_no_instalado: e.target.value })} className={inputClass(form.errors[`${prefix}.motivo_no_instalado`]) + ' resize-none'} /></Field>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Field label="Serie principal" error={form.errors[`${prefix}.serie`]}><input value={equipment.serie || ''} onChange={(e) => updateEquipment(index, { serie: e.target.value })} className={inputClass(form.errors[`${prefix}.serie`]) + ' font-mono'} /></Field>
                                                <Field label="Tipo de pantalla" error={form.errors[`${prefix}.modelo`]}><select value={equipment.modelo || ''} onChange={(e) => updateEquipment(index, { modelo: e.target.value, filas: '', columnas: '', componentes: [] })} className={inputClass(form.errors[`${prefix}.modelo`])}><option value="">Seleccionar</option>{tiposPantalla.map((type) => <option key={type}>{type}</option>)}</select></Field>
                                                <Field label="Modelo del equipo" error={form.errors[`${prefix}.modelo_equipo`]}><input value={equipment.modelo_equipo || ''} onChange={(e) => updateEquipment(index, { modelo_equipo: e.target.value })} className={inputClass(form.errors[`${prefix}.modelo_equipo`])} /></Field>
                                                <Field label="Marca" error={form.errors[`${prefix}.marca`]}><input value={equipment.marca || ''} onChange={(e) => updateEquipment(index, { marca: e.target.value })} className={inputClass(form.errors[`${prefix}.marca`])} /></Field>
                                                <Field label="Tamaño (pulgadas)" error={form.errors[`${prefix}.tamanio`]}><input type="number" value={equipment.tamanio || ''} onChange={(e) => updateEquipment(index, { tamanio: e.target.value })} className={inputClass(form.errors[`${prefix}.tamanio`])} /></Field>
                                                <Field label="Estado resultante" error={form.errors[`${prefix}.estado_resultante`]}><select value={equipment.estado_resultante || ''} onChange={(e) => updateEquipment(index, { estado_resultante: e.target.value })} className={inputClass(form.errors[`${prefix}.estado_resultante`])}><option value="">Seleccionar</option>{estadosPantalla.map((state) => <option key={state}>{state}</option>)}</select></Field>
                                                <Field label="Foto de la serie" error={form.errors[`${prefix}.evidencia_serie`]}><input type="file" accept="image/*" capture="environment" onChange={async (e) => updateEquipment(index, { evidencia_serie: await optimizeImage(e.target.files[0] || null) })} className={inputClass(form.errors[`${prefix}.evidencia_serie`]) + ' bg-white file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm'} />{equipment.evidencia_serie && <span className="mt-1 block text-xs font-medium text-green-700">Seleccionada: {equipment.evidencia_serie.name}</span>}</Field>
                                            </div>
                                            {equipment.modelo === 'Video Wall' && <div className="space-y-3 rounded-xl border border-red-100 bg-red-50/40 p-4"><Field label="Configuración (filas × columnas)" error={form.errors[`${prefix}.filas`] || form.errors[`${prefix}.componentes`]}><select value={equipment.filas && equipment.columnas ? `${equipment.filas}x${equipment.columnas}` : ''} onChange={(e) => configureWall(index, e.target.value)} className={inputClass(form.errors[`${prefix}.filas`] || form.errors[`${prefix}.componentes`])}><option value="">Seleccionar</option><option value="2x1">2x1 — 2 paneles</option><option value="2x2">2x2 — 4 paneles</option><option value="2x3">2x3 — 6 paneles</option></select></Field><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(equipment.componentes || []).map((component, componentIndex) => <Field key={`${component.fila}-${component.columna}`} label={`Panel F${component.fila}-C${component.columna}`} error={form.errors[`${prefix}.componentes.${componentIndex}.serie`]}><input value={component.serie} onChange={(e) => updateComponent(index, componentIndex, e.target.value)} className={inputClass(form.errors[`${prefix}.componentes.${componentIndex}.serie`]) + ' font-mono'} /></Field>)}</div></div>}
                                        </>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}

            <section className="space-y-4" aria-labelledby="result-step-title">
                <h3 id="result-step-title" className="text-sm font-semibold text-gray-900"><span className="mr-2 text-red-600">2.</span>Resultado del servicio</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Número de solicitud" error={form.errors.numero_solicitud}><input value={form.data.numero_solicitud} onChange={(e) => form.setData('numero_solicitud', e.target.value)} className={inputClass(form.errors.numero_solicitud)} /></Field>
                    {servicio.tipo !== 'instalacion' && <Field label="Estado resultante" error={form.errors.estado_resultante}><select value={form.data.estado_resultante} onChange={(e) => form.setData('estado_resultante', e.target.value)} className={inputClass(form.errors.estado_resultante)}><option value="">Seleccionar</option>{resultStates.map((state) => <option key={state}>{state}</option>)}</select></Field>}
                </div>
                <Field label="Informe técnico" error={form.errors.informe_tecnico}><textarea rows={4} value={form.data.informe_tecnico} onChange={(e) => form.setData('informe_tecnico', e.target.value)} className={inputClass(form.errors.informe_tecnico) + ' resize-none'} /></Field>
                <Field label="Observaciones" error={form.errors.observaciones}><textarea rows={2} value={form.data.observaciones} onChange={(e) => form.setData('observaciones', e.target.value)} className={inputClass(form.errors.observaciones) + ' resize-none'} /></Field>
                <Field label="Persona que recibió el servicio" error={form.errors.persona_recepcion}><input value={form.data.persona_recepcion} onChange={(e) => form.setData('persona_recepcion', e.target.value)} className={inputClass(form.errors.persona_recepcion)} /></Field>
            </section>

            <section className="space-y-4 border-t border-gray-100 pt-5" aria-labelledby="evidence-step-title">
                <div><h3 id="evidence-step-title" className="text-sm font-semibold text-gray-900"><span className="mr-2 text-red-600">3.</span>Evidencias fotográficas</h3><p className="mt-1 text-xs text-gray-500">Las imágenes se guardarán de forma privada. No se registrará GPS.</p></div>
                <EvidenceGallery evidences={servicio.evidencias} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FileField label="Documento firmado" field="evidencia_documento" form={form} />
                    {servicio.tipo !== 'instalacion' && <FileField label="Etiqueta o serie" field="evidencia_serie" form={form} />}
                    {servicio.tipo !== 'instalacion' && <FileField label="Estado inicial" field="evidencia_inicial" form={form} />}
                    <FileField label="Resultado final" field="evidencia_resultado" form={form} />
                    <Field label="Fotografías adicionales" error={form.errors.evidencias_adicionales} hint="Opcional, máximo 4 imágenes."><input type="file" multiple accept="image/*" onChange={async (e) => form.setData('evidencias_adicionales', await Promise.all(Array.from(e.target.files).map(optimizeImage)))} className={inputClass(form.errors.evidencias_adicionales)} /></Field>
                </div>
            </section>
            <div className="sticky -bottom-4 z-10 -mx-4 border-t border-gray-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
                <button disabled={form.processing} className="ui-pressable min-h-12 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60">{form.processing ? 'Subiendo y guardando...' : 'Enviar servicio a revisión'}</button>
            </div>
        </form>
    );
}

function AddressChangeForm({ servicio, form, onSubmit, onBack }) {
    const departamentos = getDepartamentos();
    const provincias = getProvincias(form.data.departamento);
    const distritos = getDistritos(form.data.departamento, form.data.provincia);
    const current = servicio.local;

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Ubicación registrada</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{current.direccion}</p>
                <p className="mt-1 text-xs text-gray-600">{current.distrito}, {current.provincia}, {current.departamento} · Zona {current.zona}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Zona" error={form.errors.zona}><input value={form.data.zona} onChange={(e) => form.setData('zona', e.target.value)} className={inputClass(form.errors.zona)} /></Field>
                <Field label="Departamento" error={form.errors.departamento}><select value={form.data.departamento} onChange={(e) => form.setData((data) => ({ ...data, departamento: e.target.value, provincia: '', distrito: '' }))} className={inputClass(form.errors.departamento)}><option value="">Seleccionar</option>{departamentos.map((value) => <option key={value}>{value}</option>)}</select></Field>
                <Field label="Provincia" error={form.errors.provincia}><select value={form.data.provincia} disabled={!form.data.departamento} onChange={(e) => form.setData((data) => ({ ...data, provincia: e.target.value, distrito: '' }))} className={inputClass(form.errors.provincia) + ' disabled:bg-gray-100'}><option value="">Seleccionar</option>{provincias.map((value) => <option key={value}>{value}</option>)}</select></Field>
                <Field label="Distrito" error={form.errors.distrito}><select value={form.data.distrito} disabled={!form.data.provincia} onChange={(e) => form.setData('distrito', e.target.value)} className={inputClass(form.errors.distrito) + ' disabled:bg-gray-100'}><option value="">Seleccionar</option>{distritos.map((value) => <option key={value}>{value}</option>)}</select></Field>
            </div>
            <Field label="Nueva dirección" error={form.errors.direccion}><input value={form.data.direccion} onChange={(e) => form.setData('direccion', e.target.value)} placeholder="Av., calle, número y referencia" className={inputClass(form.errors.direccion)} /></Field>
            <Field label="Motivo del cambio" error={form.errors.motivo} hint={`Quedará vinculado al mantenimiento ${servicio.codigo}.`}><textarea rows={3} value={form.data.motivo} onChange={(e) => form.setData('motivo', e.target.value)} placeholder="Ej.: Dirección corregida según lo encontrado por el operador." className={inputClass(form.errors.motivo) + ' resize-none'} /></Field>
            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">Al guardar se conservarán la ubicación anterior y la nueva, el servicio de origen y los usuarios involucrados. Las coordenadas anteriores se limpiarán para evitar mostrar una ubicación incorrecta.</div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={onBack} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 active:scale-[0.97]">Volver a la revisión</button>
                <button disabled={form.processing} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white active:scale-[0.97] disabled:opacity-60">{form.processing ? 'Guardando historial...' : 'Actualizar y registrar historial'}</button>
            </div>
        </form>
    );
}

function ServiceDetails({ servicio }) {
    const equipment = servicio.datos_equipo || {};
    const installationItems = servicio.tipo === 'instalacion' ? (servicio.equipos || []) : [];
    return (
        <div className="space-y-5">
            {servicio.motivo_observacion && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><strong>Observación:</strong> {servicio.motivo_observacion}</div>}
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-gray-400">Local</dt><dd className="font-medium text-gray-800">{servicio.local.codigo} — {servicio.local.nombre}</dd></div>
                <div><dt className="text-xs text-gray-400">Operador</dt><dd className="font-medium text-gray-800">{servicio.operador?.name || 'Usuario eliminado'}</dd></div>
                <div><dt className="text-xs text-gray-400">Solicitud</dt><dd className="font-medium text-gray-800">{servicio.numero_solicitud || '—'}</dd></div>
                {servicio.tipo !== 'instalacion' && <div><dt className="text-xs text-gray-400">Estado resultante</dt><dd className="font-medium text-gray-800">{servicio.estado_resultante || '—'}</dd></div>}
                {(servicio.pantalla || equipment.serie) && <div><dt className="text-xs text-gray-400">Equipo</dt><dd className="font-mono text-gray-800">{servicio.pantalla?.serie || equipment.serie} · {servicio.pantalla?.modelo || equipment.modelo}</dd></div>}
                <div><dt className="text-xs text-gray-400">Recibió el servicio</dt><dd className="font-medium text-gray-800">{servicio.persona_recepcion || '—'}</dd></div>
            </dl>
            {installationItems.length > 0 && <section><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-gray-800">Equipos de la instalación</p><span className="text-xs text-gray-500">{installationItems.filter((item) => item.resultado === 'instalado').length}/{installationItems.length} instalados</span></div><div className="space-y-2">{installationItems.map((item) => { const data = item.datos_equipo || {}; return <div key={item.id} className="rounded-xl border border-gray-200 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-gray-800">Equipo {item.orden} · {data.modelo || item.tipo_esperado || 'Tipo por confirmar'}</p>{item.resultado === 'instalado' ? <p className="mt-1 font-mono text-xs text-gray-600">Serie {data.serie} {item.pantalla?.codigo ? `· ${item.pantalla.codigo}` : ''}</p> : <p className="mt-1 text-xs text-red-700">{item.motivo_no_instalado || 'Pendiente de registrar'}</p>}</div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.resultado === 'instalado' ? 'bg-green-100 text-green-800' : item.resultado === 'no_instalado' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{item.resultado === 'instalado' ? 'Instalado' : item.resultado === 'no_instalado' ? 'No instalado' : 'Pendiente'}</span></div>{data.modelo === 'Video Wall' && <p className="mt-2 text-xs text-gray-500">Video Wall {data.filas}x{data.columnas} · {(data.componentes || []).length} paneles inventariados</p>}</div>; })}</div></section>}
            <div><p className="text-xs text-gray-400">Informe técnico</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{servicio.informe_tecnico || '—'}</p></div>
            {servicio.observaciones && <div><p className="text-xs text-gray-400">Observaciones</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{servicio.observaciones}</p></div>}
            {(servicio.cambios_local || []).length > 0 && <section className="space-y-2"><p className="text-sm font-semibold text-gray-800">Historial de ubicación vinculado</p>{servicio.cambios_local.map((change) => { const before = change.datos_anteriores || {}; const after = change.datos_nuevos || {}; return <article key={change.id} className="rounded-xl border border-blue-100 bg-blue-50/50 p-3"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-gray-800">Cambio de ubicación</p><time className="text-xs text-gray-500">{formatDateTime(change.created_at)}</time></div><div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2"><div><p className="text-gray-400">Anterior</p><p className="mt-0.5 text-gray-700">{before.direccion || '—'}</p><p className="text-gray-500">{[before.distrito, before.provincia, before.departamento].filter(Boolean).join(', ')}</p></div><div><p className="text-gray-400">Nueva</p><p className="mt-0.5 font-medium text-gray-800">{after.direccion || '—'}</p><p className="text-gray-500">{[after.distrito, after.provincia, after.departamento].filter(Boolean).join(', ')}</p></div></div><p className="mt-2 text-xs text-gray-600"><strong>Motivo:</strong> {change.motivo || '—'}</p><p className="mt-1 text-xs text-gray-500">Reportado en campo por {servicio.operador?.name || 'operador no disponible'} · Actualizado por {change.usuario?.name || 'usuario no disponible'}</p></article>; })}</section>}
            <EvidenceGallery evidences={servicio.evidencias} />
        </div>
    );
}

const newEmptyOrder = () => ({ tipo: 'instalacion', local_id: '', pantalla_id: '', operador_id: '', fecha_programada: today(), instrucciones: '', equipos_plan: [{ tipo_esperado: '' }] });

export default function ServiciosIndex({ servicios = {}, locales = [], pantallas = [], operadores = [], tiposPantalla = [], estadosPantalla = [], filters = {} }) {
    const user = usePage().props.auth?.user || {};
    const isOperator = user.rol === 'operativo';
    const rows = servicios.data || [];
    const [createOpen, setCreateOpen] = useState(false);
    const [editService, setEditService] = useState(null);
    const [activeService, setActiveService] = useState(null);
    const [modalMode, setModalMode] = useState(null);
    const [cancelService, setCancelService] = useState(null);
    const orderForm = useForm(newEmptyOrder());
    const reviewForm = useForm({ decision: 'observar', motivo_observacion: '' });
    const addressForm = useForm({ zona: '', departamento: '', provincia: '', distrito: '', direccion: '', motivo: '' });
    const executionForm = useForm({});

    const resetExecution = (service) => {
        const equipment = service.datos_equipo || {};
        executionForm.setData({
            numero_solicitud: service.numero_solicitud || '', informe_tecnico: service.informe_tecnico || '', observaciones: service.observaciones || '',
            persona_recepcion: service.persona_recepcion || '', estado_resultante: service.estado_resultante || (service.tipo === 'desmonte' ? 'Retirada' : service.pantalla?.estado || ''),
            serie: equipment.serie || '', marca: equipment.marca || '', modelo: equipment.modelo || '',
            modelo_equipo: equipment.modelo_equipo || '', tamanio: equipment.tamanio || '',
            filas: equipment.filas || '', columnas: equipment.columnas || '', componentes: equipment.componentes || [],
            equipos: (service.equipos || []).map((item) => {
                const data = item.datos_equipo || {};
                return {
                    id: item.id, tipo_esperado: item.tipo_esperado || '', resultado: item.resultado === 'no_instalado' ? 'no_instalado' : 'instalado',
                    serie: data.serie || '', marca: data.marca || '', modelo: data.modelo || item.tipo_esperado || '',
                    modelo_equipo: data.modelo_equipo || '', tamanio: data.tamanio || '',
                    estado_resultante: item.estado_resultante || 'Operativa', motivo_no_instalado: item.motivo_no_instalado || '',
                    filas: data.filas || '', columnas: data.columnas || '', componentes: data.componentes || [], evidencia_serie: null,
                };
            }),
            evidencia_documento: null, evidencia_serie: null, evidencia_inicial: null, evidencia_resultado: null, evidencias_adicionales: [],
        });
        executionForm.clearErrors();
    };

    const openExecution = (service) => { resetExecution(service); setActiveService(service); setModalMode('execute'); };
    const openDetails = (service, mode = 'view') => { setActiveService(service); setModalMode(mode); reviewForm.reset(); reviewForm.clearErrors(); };
    const openAddressChange = () => {
        const local = activeService.local;
        addressForm.setData({ zona: local.zona || '', departamento: local.departamento || '', provincia: local.provincia || '', distrito: local.distrito || '', direccion: local.direccion || '', motivo: '' });
        addressForm.clearErrors();
        setModalMode('address');
    };
    const openEdit = (service) => {
        orderForm.setData({ tipo: service.tipo, local_id: String(service.local_id), pantalla_id: service.pantalla_id ? String(service.pantalla_id) : '', operador_id: String(service.operador_id), fecha_programada: service.fecha_programada?.slice(0, 10) || '', instrucciones: service.instrucciones || '', equipos_plan: service.equipos?.length ? service.equipos.map((item) => ({ tipo_esperado: item.tipo_esperado || '' })) : [{ tipo_esperado: '' }] });
        orderForm.clearErrors(); setEditService(service);
    };

    const submitOrder = (event) => { event.preventDefault(); orderForm.post('/admin/servicios', { onSuccess: () => { setCreateOpen(false); orderForm.setData(newEmptyOrder()); } }); };
    const updateOrder = (event) => { event.preventDefault(); orderForm.put(`/admin/servicios/${editService.id}`, { onSuccess: () => setEditService(null) }); };
    const submitExecution = (event) => { event.preventDefault(); executionForm.post(`/admin/servicios/${activeService.id}/enviar`, { forceFormData: true, onSuccess: () => { setModalMode(null); setActiveService(null); } }); };
    const approve = () => router.post(`/admin/servicios/${activeService.id}/revisar`, { decision: 'aprobar' }, { onSuccess: () => { setModalMode(null); setActiveService(null); } });
    const observe = (event) => { event.preventDefault(); reviewForm.post(`/admin/servicios/${activeService.id}/revisar`, { onSuccess: () => { setModalMode(null); setActiveService(null); } }); };
    const submitAddressChange = (event) => { event.preventDefault(); addressForm.post(`/admin/servicios/${activeService.id}/actualizar-direccion`, { preserveScroll: true, onSuccess: () => { setModalMode(null); setActiveService(null); } }); };

    return (
        <AdminLayout title={isOperator ? 'Mis servicios' : 'Servicios'}>
            <Head title={isOperator ? 'Mis servicios' : 'Servicios'} />
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div><h2 className="text-lg font-semibold text-gray-900">{isOperator ? 'Trabajos asignados' : 'Instalaciones y mantenimientos'}</h2><p className="mt-1 text-sm text-gray-500">{isOperator ? 'Ejecuta solamente los servicios asignados a tu usuario.' : 'Asigna, revisa y controla las evidencias de cada servicio.'}</p></div>
                {!isOperator && <button type="button" onClick={() => { orderForm.setData(newEmptyOrder()); orderForm.clearErrors(); setCreateOpen(true); }} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.97]">Nuevo servicio</button>}
            </div>

            <form method="get" className="mb-5 flex flex-col gap-3 sm:flex-row">
                <input name="search" defaultValue={filters.search || ''} placeholder="Buscar servicio, local o serie..." className={inputClass(false) + ' sm:max-w-sm'} />
                <select name="estado" defaultValue={filters.estado || ''} className={inputClass(false) + ' sm:max-w-52'}><option value="">Todos los estados</option>{Object.entries(STATUS).map(([value, config]) => <option key={value} value={value}>{config[0]}</option>)}</select>
                <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 active:scale-[0.97]">Filtrar</button>
            </form>

            <div className="space-y-3">
                {rows.length === 0 && (
                    <EmptyState
                        title={filters.search || filters.estado ? 'No encontramos servicios' : isOperator ? 'Aún no tienes trabajos asignados' : 'Todavía no hay servicios'}
                        description={filters.search || filters.estado ? 'Prueba con otro término o estado.' : isOperator ? 'Los servicios que te asigne un supervisor aparecerán aquí.' : 'Crea la primera instalación, mantenimiento o desmonte para comenzar la trazabilidad.'}
                        actionLabel={!isOperator && !filters.search && !filters.estado ? 'Crear primer servicio' : undefined}
                        onAction={!isOperator ? () => { orderForm.setData(newEmptyOrder()); orderForm.clearErrors(); setCreateOpen(true); } : undefined}
                    />
                )}
                {rows.map((service) => {
                    const status = STATUS[service.estado] || [service.estado, 'bg-gray-100 text-gray-700'];
                    const assignedCount = service.equipos?.length || 0;
                    const installedCount = service.equipos?.filter((item) => item.resultado === 'instalado').length || 0;
                    return (
                        <article key={service.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                <div className="min-w-0 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-mono text-[11px] text-gray-400">{service.codigo}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status[1]}`}>{status[0]}</span>
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">{TYPE_LABEL[service.tipo]}</span>
                                        <span className="text-[11px] text-gray-400 sm:ml-1">Programado {formatDate(service.fecha_programada)}</span>
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                                        <h3 className="truncate text-sm font-semibold text-gray-900">{service.local.codigo} — {service.local.nombre}</h3>
                                        <p className="truncate text-xs text-gray-500">{service.local.direccion}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                        {service.pantalla && <span className="font-mono text-gray-600">{service.pantalla.codigo} · Serie {service.pantalla.serie} · {service.pantalla.modelo}</span>}
                                        {service.tipo === 'instalacion' && <span className="font-medium text-gray-600">{assignedCount} equipo(s){['en_revision', 'finalizado'].includes(service.estado) ? ` · ${installedCount} instalado(s)` : ''}</span>}
                                        {!isOperator && <span>Operador: <strong className="font-medium text-gray-700">{service.operador?.name || 'Usuario eliminado'}</strong></span>}
                                    </div>
                                    {service.estado === 'observado' && <p className="line-clamp-1 text-xs font-medium text-red-700">Observación: {service.motivo_observacion}</p>}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 lg:max-w-md lg:justify-end">
                                    {isOperator && service.estado === 'pendiente' && <button type="button" onClick={() => router.post(`/admin/servicios/${service.id}/iniciar`)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97]">Iniciar servicio</button>}
                                    {isOperator && ['en_curso', 'observado'].includes(service.estado) && <button type="button" onClick={() => openExecution(service)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97]">{service.estado === 'observado' ? 'Corregir y reenviar' : 'Continuar registro'}</button>}
                                    {!isOperator && service.estado === 'en_revision' && <button type="button" onClick={() => openDetails(service, 'review')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-transform duration-150 active:scale-[0.97]">Revisar servicio</button>}
                                    <button type="button" onClick={() => openDetails(service)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-transform duration-150 active:scale-[0.97]">Ver detalle</button>
                                    {!isOperator && service.estado === 'pendiente' && <button type="button" onClick={() => openEdit(service)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-transform duration-150 active:scale-[0.97]">Editar</button>}
                                    {!isOperator && !['finalizado', 'cancelado'].includes(service.estado) && <button type="button" onClick={() => setCancelService(service)} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-transform duration-150 active:scale-[0.97]">Cancelar</button>}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {servicios.total > 0 && <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">Mostrando <strong className="font-semibold text-gray-700">{servicios.from}–{servicios.to}</strong> de <strong className="font-semibold text-gray-700">{servicios.total}</strong> servicios</p>
                {servicios.links?.length > 3 && <nav aria-label="Paginación de servicios" className="flex flex-wrap items-center gap-1">{servicios.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll preserveState className={`min-w-9 rounded-lg border px-3 py-2 text-center text-xs font-medium transition-transform duration-150 active:scale-[0.97] ${link.active ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 bg-white text-gray-600'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} aria-disabled="true" className="min-w-9 rounded-lg border border-gray-100 px-3 py-2 text-center text-xs text-gray-300" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
            </div>}

            <AppModal open={createOpen} title="Nuevo servicio" description="Define el trabajo y asígnalo a un operador." onClose={() => setCreateOpen(false)} wide><OrderForm form={orderForm} locales={locales} pantallas={pantallas} operadores={operadores} tiposPantalla={tiposPantalla} onSubmit={submitOrder} submitLabel="Crear y asignar servicio" /></AppModal>
            <AppModal open={!!editService} title={`Editar ${editService?.codigo || ''}`} onClose={() => setEditService(null)} wide>{editService && <OrderForm form={orderForm} locales={locales} pantallas={pantallas} operadores={operadores} tiposPantalla={tiposPantalla} onSubmit={updateOrder} submitLabel="Guardar asignación" />}</AppModal>
            <AppModal open={modalMode === 'execute'} title="Registrar servicio" description="Completa los datos encontrados en campo y adjunta las evidencias." onClose={() => setModalMode(null)} wide>{activeService && <ExecutionForm servicio={activeService} form={executionForm} tiposPantalla={tiposPantalla} estadosPantalla={estadosPantalla} onSubmit={submitExecution} />}</AppModal>
            <AppModal open={modalMode === 'view'} title={activeService?.codigo || 'Detalle del servicio'} onClose={() => setModalMode(null)} wide>{activeService && <ServiceDetails servicio={activeService} />}</AppModal>
            <AppModal open={modalMode === 'review'} title={`Revisar ${activeService?.codigo || ''}`} onClose={() => setModalMode(null)} wide>{activeService && <div className="space-y-5"><ServiceDetails servicio={activeService} />{activeService.tipo === 'mantenimiento' && <button type="button" onClick={openAddressChange} className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800 active:scale-[0.97]">Actualizar dirección reportada en campo</button>}<div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2"><button onClick={approve} className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white active:scale-[0.97]">Aprobar y actualizar inventario</button><form onSubmit={observe} className="space-y-2"><textarea value={reviewForm.data.motivo_observacion} onChange={(e) => reviewForm.setData('motivo_observacion', e.target.value)} placeholder="Motivo para devolver al operador" rows={2} className={inputClass(reviewForm.errors.motivo_observacion) + ' resize-none'} />{reviewForm.errors.motivo_observacion && <p className="text-xs text-red-600">{reviewForm.errors.motivo_observacion}</p>}<button className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 active:scale-[0.97]">Observar y devolver</button></form></div></div>}</AppModal>
            <AppModal open={modalMode === 'address'} title="Actualizar dirección del local" onClose={() => setModalMode('review')} wide>{activeService && <AddressChangeForm servicio={activeService} form={addressForm} onSubmit={submitAddressChange} onBack={() => setModalMode('review')} />}</AppModal>
            <AppModal open={!!cancelService} title="Cancelar servicio" onClose={() => setCancelService(null)} size="sm" mobileFullscreen={false}>{cancelService && <div><p className="text-sm text-gray-600">Se cancelará <strong>{cancelService.codigo}</strong>. El registro permanecerá en el historial.</p><div className="mt-5 flex justify-end gap-3"><button onClick={() => setCancelService(null)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700">Volver</button><button onClick={() => router.post(`/admin/servicios/${cancelService.id}/cancelar`, {}, { onSuccess: () => setCancelService(null) })} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">Cancelar servicio</button></div></div>}</AppModal>
        </AdminLayout>
    );
}
