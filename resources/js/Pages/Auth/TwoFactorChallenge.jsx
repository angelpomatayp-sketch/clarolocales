import { Head, router, useForm } from '@inertiajs/react';

export default function TwoFactorChallenge({ email, setupRequired, qrSvg, manualKey, status }) {
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

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <img src="/claro-estado-averia.svg" alt="Claro" className="w-10 h-10 rounded-xl" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Verificación 2FA</h1>
                            <p className="text-xs text-gray-400">{email}</p>
                        </div>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            {status}
                        </div>
                    )}

                    {setupRequired ? (
                        <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">Configura tu autenticador</p>
                            <p className="text-xs text-gray-600 mb-4">
                                Escanea este código con Google Authenticator, Microsoft Authenticator o una app compatible.
                            </p>
                            {qrSvg && (
                                <div className="mx-auto mb-3 flex w-fit rounded-xl bg-white p-3 shadow-sm" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                            )}
                            {manualKey && (
                                <div className="rounded-lg bg-white px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Clave manual</p>
                                    <p className="break-all font-mono text-xs text-gray-700">{manualKey}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="mb-5 text-sm text-gray-600">
                            Ingresa el código de 6 dígitos de tu aplicación autenticadora.
                        </p>
                    )}

                    <form onSubmit={submit} className="space-y-4">
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
                                className={`w-full rounded-xl border px-4 py-3 text-center font-mono text-lg tracking-[0.35em] focus:outline-none focus:ring-2 ${
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
                            className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
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
        </>
    );
}
