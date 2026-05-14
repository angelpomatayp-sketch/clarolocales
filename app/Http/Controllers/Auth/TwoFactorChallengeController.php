<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->two_factor_secret) {
            $user->forceFill([
                'two_factor_secret' => app(Google2FA::class)->generateSecretKey(),
                'two_factor_confirmed_at' => null,
            ])->save();
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'email' => $user->email,
            'setupRequired' => blank($user->two_factor_confirmed_at),
            'qrSvg' => blank($user->two_factor_confirmed_at) ? $this->qrSvg($user) : null,
            'manualKey' => blank($user->two_factor_confirmed_at) ? $user->two_factor_secret : null,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('login');
        }

        $request->validate([
            'code' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
        ], [
            'code.regex' => 'Ingresa un código de 6 dígitos.',
        ]);

        $throttleKey = 'two-factor|'.$user->id.'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'code' => 'Demasiados intentos. Espera unos minutos e intenta otra vez.',
            ]);
        }

        $valid = app(Google2FA::class)->verifyKey($user->two_factor_secret, $request->input('code'), 1);

        if (! $valid) {
            RateLimiter::hit($throttleKey, 300);

            throw ValidationException::withMessages([
                'code' => 'El código 2FA no es válido.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        if (! $user->two_factor_confirmed_at) {
            $user->forceFill(['two_factor_confirmed_at' => now()])->save();
        }

        Auth::login($user, (bool) $request->session()->pull('login.remember', false));
        $request->session()->forget('login.id');
        $request->session()->regenerate();

        if (in_array($user->rol, ['regional', 'usuario'], true)) {
            return redirect()->route('directorio');
        }

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->session()->forget(['login.id', 'login.remember']);

        return redirect()->route('login');
    }

    private function pendingUser(Request $request): ?User
    {
        $id = $request->session()->get('login.id');

        if (! $id) {
            return null;
        }

        return User::find($id);
    }

    private function qrSvg(User $user): string
    {
        $issuer = config('app.name', 'ClaroLocales');
        $url = app(Google2FA::class)->getQRCodeUrl($issuer, $user->email, $user->two_factor_secret);

        $renderer = new ImageRenderer(new RendererStyle(220), new SvgImageBackEnd);

        return (new Writer($renderer))->writeString($url);
    }
}
