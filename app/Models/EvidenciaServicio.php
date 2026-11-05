<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EvidenciaServicio extends Model
{
    protected $table = 'evidencias_servicio';

    protected $fillable = [
        'servicio_id', 'servicio_equipo_id', 'user_id', 'tipo', 'ruta', 'nombre_original',
        'mime', 'tamanio', 'orden',
    ];

    protected $appends = ['url'];

    public function servicio()
    {
        return $this->belongsTo(ServicioPantalla::class, 'servicio_id');
    }

    public function equipo()
    {
        return $this->belongsTo(ServicioEquipo::class, 'servicio_equipo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getUrlAttribute(): string
    {
        return route('admin.servicios.evidencias.show', [$this->servicio_id, $this->id]);
    }
}
