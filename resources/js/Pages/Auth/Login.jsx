import { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Iniciar sesión — ClaroLocales" />

            <div className="min-h-screen flex">

                {/* ── Panel izquierdo: marca ─────────────────────────────── */}
                <div
                    className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #9B0A14 0%, #E30613 55%, #FF2D2D 100%)' }}
                >
                    {/* Círculos decorativos */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'white' }} />
                    <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'white' }} />
                    <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full opacity-5" style={{ background: 'white' }} />

                    <div className="relative z-10 flex flex-col items-center text-center px-12">
                        <div className="w-28 h-28 bg-white rounded-3xl p-3 shadow-2xl mb-8">
                            <img src="/claro-estado-averia.svg" alt="Claro" className="w-full h-full" />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                            ClaroLocales
                        </h1>
                        <p className="text-red-100 text-lg leading-relaxed max-w-xs">
                            Plataforma de gestión de locales y pantallas digitales
                        </p>
                        <div className="mt-10 flex items-center gap-2 text-red-200 text-sm">
                            <span className="w-8 h-px bg-red-300 opacity-60" />
                            Claro Perú
                            <span className="w-8 h-px bg-red-300 opacity-60" />
                        </div>
                    </div>
                </div>

                {/* ── Panel derecho: formulario ──────────────────────────── */}
                <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">
                    <div className="w-full max-w-sm">

                        {/* Logo mobile */}
                        <div className="lg:hidden flex flex-col items-center mb-10">
                            <img src="/claro-estado-averia.svg" alt="Claro" className="w-16 h-16 mb-3 rounded-2xl shadow" />
                            <h1 className="text-2xl font-black text-gray-900">ClaroLocales</h1>
                            <p className="text-gray-400 text-sm mt-1">Backoffice — Claro Perú</p>
                        </div>

                        {/* Encabezado */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
                            <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
                        </div>

                        {status && (
                            <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="tu@correo.com"
                                    autoComplete="username"
                                    autoFocus
                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                                        errors.email
                                            ? 'border-red-400 focus:ring-red-200 bg-red-50'
                                            : 'border-gray-200 focus:border-red-400 focus:ring-red-100 bg-gray-50 hover:bg-white'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                                        errors.password
                                            ? 'border-red-400 focus:ring-red-200 bg-red-50'
                                            : 'border-gray-200 focus:border-red-400 focus:ring-red-100 bg-gray-50 hover:bg-white'
                                    }`}
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember + forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-300 accent-red-600"
                                    />
                                    <span className="text-sm text-gray-600">Recordarme</span>
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium hover:underline"
                                        style={{ color: '#E30613' }}
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 rounded-xl text-white text-sm font-bold tracking-wide transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[.98]"
                                style={{ backgroundColor: '#E30613' }}
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Ingresando...
                                    </>
                                ) : 'Iniciar sesión'}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 mt-10">
                            &copy; {new Date().getFullYear()} ClaroLocales — WOW Tech Peru
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
