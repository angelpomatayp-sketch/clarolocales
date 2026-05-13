<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoPantalla extends Model
{
    protected $table = 'tipos_pantalla';

    protected $fillable = ['nombre', 'descripcion', 'activo'];

    protected $casts = ['activo' => 'boolean'];
}
