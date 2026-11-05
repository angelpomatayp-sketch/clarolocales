<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicioPantalla extends Model
{
    protected $table = 'servicios_pantalla';

    protected $fillable = [
        'codigo', 'tipo', 'estado', 'local_id', 'pantalla_id', 'operador_id',
        'creado_por', 'revisado_por', 'fecha_programada', 'iniciado_at',
        'enviado_revision_at', 'finalizado_at', 'numero_solicitud',
        'instrucciones', 'informe_tecnico', 'observaciones', 'persona_recepcion',
        'estado_resultante', 'datos_equipo', 'motivo_observacion',
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'iniciado_at' => 'datetime',
        'enviado_revision_at' => 'datetime',
        'finalizado_at' => 'datetime',
        'datos_equipo' => 'array',
    ];

    public function local()
    {
        return $this->belongsTo(Local::class);
    }

    public function pantalla()
    {
        return $this->belongsTo(Pantalla::class);
    }

    public function operador()
    {
        return $this->belongsTo(User::class, 'operador_id');
    }

    public function creador()
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function revisor()
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }

    public function evidencias()
    {
        return $this->hasMany(EvidenciaServicio::class, 'servicio_id')->orderBy('orden');
    }

    public function equipos()
    {
        return $this->hasMany(ServicioEquipo::class, 'servicio_id')->orderBy('orden');
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoPantalla::class, 'servicio_id');
    }

    public function cambiosLocal()
    {
        return $this->hasMany(MovimientoLocal::class, 'servicio_id')->latest();
    }
}
