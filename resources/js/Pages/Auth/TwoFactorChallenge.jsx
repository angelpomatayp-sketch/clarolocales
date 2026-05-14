import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';

export default function TwoFactorChallenge({ email, setupRequired, qrSvg, manualKey, status }) {
    const [showManualKey, setShowManualKey] = useState(false);
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.store'));
    };

    const cancel = () => {
        router.delete(route('two-factor.cancel'));
    };

    return (
        <>
            <Head title="Verificación 2FA — ClaroLocales" />

            <div className="relative min-h-screen overflow-hidden bg-white">
                <div className="min-h-screen flex" aria-hidden="true">
                    <div
                        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #9B0A14 0%, #E30613 55%, #FF2D2D 100%)' }}
                    >
                        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white opacity-10" />
                        <div className="absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-white opacity-10" />
                        <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full bg-white opacity-5" />

                        <div className="relative z-10 flex flex-col items-center text-center px-12">
                            <div className="w-28 h-28 bg-white rounded-3xl p-3 shadow-2xl mb-8">
                                <img src="/claro-estado-averia.svg" alt="" className="w-full h-full" />
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

                    <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">
                        <div className="w-full max-w-sm opacity-35 blur-[1px] select-none">
                            <div className="lg:hidden flex flex-col items-center mb-10">
                                <img src="/claro-estado-averia.svg" alt="" className="w-16 h-16 mb-3 rounded-2xl shadow" />
                                <h1 className="text-2xl font-black text-gray-900">ClaroLocales</h1>
                                <p className="text-gray-400 text-sm mt-1">Backoffice — Claro Perú</p>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
                                <p className="text-gray-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                                    <div className="h-[46px] rounded-xl border border-gray-200 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                                    <div className="h-[46px] rounded-xl border border-gray-200 bg-gray-50" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-28 rounded bg-gray-100" />
                                    <div className="h-4 w-36 rounded bg-gray-100" />
                                </div>
                                <div className="h-[46px] rounded-xl bg-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 px-3 py-3 sm:px-4 sm:py-6">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="two-factor-title"
                        className="max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:p-6"
                    >
                        <div className="mb-4 flex items-center gap-3 sm:mb-6">
                            <img src="/claro-estado-averia.svg" alt="Claro" className="h-10 w-10 rounded-xl sm:h-11 sm:w-11" />
                            <div>
                                <h1 id="two-factor-title" className="text-lg font-bold text-gray-900 sm:text-xl">Verificación 2FA</h1>
                                <p className="text-xs text-gray-400">{email}</p>
                            </div>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        {setupRequired ? (
                            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 sm:mb-5 sm:p-4">
                                <p className="mb-2 text-sm font-semibold text-gray-900">Configura tu autenticador</p>
                                <p className="mb-3 text-xs text-gray-600 sm:mb-4">
                                    Escanea este código con Google Authenticator, Microsoft Authenticator o una app compatible.
                                </p>
                                {qrSvg && (
                                    <div
                                        className="mx-auto mb-3 flex w-fit max-w-[210px] rounded-xl bg-white p-2 shadow-sm [&_svg]:h-auto [&_svg]:max-h-[190px] [&_svg]:w-full sm:max-w-none sm:p-3 sm:[&_svg]:max-h-[220px]"
                                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                                    />
                                )}
                                {manualKey && (
                                    <div className="rounded-lg bg-white px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowManualKey((visible) => !visible)}
                                            className="text-xs font-semibold text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
                                        >
                                            {showManualKey ? 'Ocultar clave manual' : 'No puedo escanear el QR'}
                                        </button>

                                        {showManualKey && (
                                            <div className="mt-2 border-t border-gray-100 pt-2">
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Clave manual</p>
                                                <p className="break-all font-mono text-xs text-gray-700">{manualKey}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="mb-5 text-sm text-gray-600">
                                Ingresa el código de 6 dígitos de tu aplicación autenticadora.
                            </p>
                        )}

                        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de verificación</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    autoFocus
                                    className={`w-full rounded-xl border px-4 py-2.5 text-center font-mono text-lg tracking-[0.35em] focus:outline-none focus:ring-2 sm:py-3 ${
                                        errors.code
                                            ? 'border-red-400 bg-red-50 focus:ring-red-200'
                                            : 'border-gray-200 bg-gray-50 focus:border-red-400 focus:ring-red-100'
                                    }`}
                                    placeholder="000000"
                                />
                                {errors.code && <p className="mt-1.5 text-xs text-red-600">{errors.code}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.code.length !== 6}
                                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60 sm:py-3"
                            >
                                {setupRequired ? 'Confirmar y entrar' : 'Verificar y entrar'}
                            </button>

                            <button
                                type="button"
                                onClick={cancel}
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                            >
                                Volver al login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
