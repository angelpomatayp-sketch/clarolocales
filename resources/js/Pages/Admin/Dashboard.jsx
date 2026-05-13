import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { ZONA_COLORS } from '@/constants/shared';

function StatCard({ title, value, sub, subLabel, icon, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                <div style={{ color }}>{icon}</div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
                {sub !== undefined && (
                    <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-medium text-gray-600">{sub}</span> {subLabel}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({ stats = {}, pantallasPorZona = [], pantallasPorDepartamento = [] }) {
    const maxZona = pantallasPorZona.reduce((m, z) => Math.max(m, z.total), 0);
    const maxDepartamento = pantallasPorDepartamento.reduce((m, d) => Math.max(m, d.total), 0);

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                <StatCard
                    title="Locales"
                    value={stats.locales}
                    sub={stats.activos}
                    subLabel="activos"
                    color="#E30613"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pantallas"
                    value={stats.pantallas}
                    sub={stats.operativas}
                    subLabel="operativas"
                    color="#2563EB"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                />
                <StatCard
                    title="CAC"
                    value={stats.cac}
                    subLabel="locales CAC"
                    color="#7C3AED"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
                <StatCard
                    title="DAC"
                    value={stats.dac}
                    subLabel="locales DAC"
                    color="#1D4ED8"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                />
                <StatCard
                    title="CADENA"
                    value={stats.cadena}
                    subLabel="locales Cadena"
                    color="#C2410C"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    }
                />
            </div>

            {/* Pantallas por zona */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm">Pantallas por zona</h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {pantallasPorZona.length === 0 ? (
                        <p className="text-sm text-gray-400 col-span-4 text-center py-4">Sin datos</p>
                    ) : (
                        pantallasPorZona.map((item) => {
                            const pct = maxZona > 0 ? Math.round((item.total / maxZona) * 100) : 0;
                            const color = ZONA_COLORS[item.zona] || '#9CA3AF';
                            return (
                                <div key={item.zona}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
                                            {item.zona || '—'}
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">{item.total}</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">pantallas instaladas</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pantallas por departamento */}
            <div className="bg-white rounded-xl border border-gray-200 mt-6">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm">Pantallas por departamento</h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {pantallasPorDepartamento.length === 0 ? (
                        <p className="text-sm text-gray-400 col-span-4 text-center py-4">Sin datos</p>
                    ) : (
                        pantallasPorDepartamento.map((item) => {
                            const pct = maxDepartamento > 0 ? Math.round((item.total / maxDepartamento) * 100) : 0;
                            const color = item.departamento === 'Sin asignar' ? '#9CA3AF' : '#2563EB';
                            return (
                                <div key={item.departamento}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
                                            {item.departamento || '—'}
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">{item.total}</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">pantallas instaladas</p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
