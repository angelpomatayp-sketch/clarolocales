<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pantalla extends Model
{
    protected $fillable = ['codigo', 'serie', 'numero_solicitud', 'marca', 'modelo', 'modelo_equipo', 'tamanio', 'filas', 'columnas', 'estado', 'fecha_registro', 'local_id'];

    public function local()
    {
        return $this->belongsTo(Local::class);
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoPantalla::class)->latest();
    }

    public function componentes()
    {
        return $this->hasMany(ComponentePantalla::class)->orderBy('fila')->orderBy('columna');
    }

    public function servicios()
    {
        return $this->hasMany(ServicioPantalla::class);
    }
}
