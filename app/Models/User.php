<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'zona',
        'activo',
        'two_factor_required',
        'two_factor_secret',
        'two_factor_confirmed_at',
    ];

    protected $hidden = ['password', 'remember_token', 'two_factor_secret'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'activo'   => 'boolean',
            'two_factor_required' => 'boolean',
            'two_factor_secret' => 'encrypted',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function hasConfirmedTwoFactor(): bool
    {
        return $this->two_factor_required
            && filled($this->two_factor_secret)
            && filled($this->two_factor_confirmed_at);
    }

    public function movimientosLocal()
    {
        return $this->hasMany(MovimientoLocal::class);
    }

    public function movimientosPantalla()
    {
        return $this->hasMany(MovimientoPantalla::class);
    }
}
