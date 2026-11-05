<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComponentePantalla extends Model
{
    protected $table = 'componentes_pantalla';

    protected $fillable = [
        'pantalla_id', 'serie', 'marca', 'modelo', 'tamanio',
        'fila', 'columna', 'estado', 'activo',
        'fecha_instalacion', 'fecha_retiro',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_instalacion' => 'date',
        'fecha_retiro' => 'date',
    ];

    public function pantalla()
    {
        return $this->belongsTo(Pantalla::class);
    }
}
