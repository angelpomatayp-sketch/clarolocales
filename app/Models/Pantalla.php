<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pantalla extends Model
{
    protected $fillable = ['codigo', 'serie', 'numero_guia', 'marca', 'modelo', 'modelo_equipo', 'tamanio', 'posicion', 'estado', 'fecha_registro', 'local_id'];

    public function local()
    {
        return $this->belongsTo(Local::class);
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoPantalla::class)->latest();
    }
}
