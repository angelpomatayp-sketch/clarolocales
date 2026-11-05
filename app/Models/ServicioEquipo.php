<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicioEquipo extends Model
{
    protected $table = 'servicio_equipos';

    protected $fillable = [
        'servicio_id', 'pantalla_id', 'orden', 'tipo_esperado', 'resultado',
        'estado_resultante', 'datos_equipo', 'motivo_no_instalado',
    ];

    protected $casts = ['datos_equipo' => 'array'];

    public function servicio()
    {
        return $this->belongsTo(ServicioPantalla::class, 'servicio_id');
    }

    public function pantalla()
    {
        return $this->belongsTo(Pantalla::class);
    }

    public function evidencias()
    {
        return $this->hasMany(EvidenciaServicio::class, 'servicio_equipo_id')->orderBy('orden');
    }
}
