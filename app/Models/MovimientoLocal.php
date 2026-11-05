<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoLocal extends Model
{
    protected $table = 'movimientos_local';

    protected $fillable = [
        'local_id', 'servicio_id', 'user_id', 'tipo', 'descripcion', 'motivo',
        'datos_anteriores', 'datos_nuevos',
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos' => 'array',
    ];

    public function local()
    {
        return $this->belongsTo(Local::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function servicio()
    {
        return $this->belongsTo(ServicioPantalla::class, 'servicio_id');
    }
}
