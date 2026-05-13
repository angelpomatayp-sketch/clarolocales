<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Local extends Model
{
    protected $table = 'locales';

    protected $fillable = [
        'codigo', 'nombre', 'tipo', 'estado', 'zona',
        'departamento', 'provincia', 'distrito', 'direccion',
        'lat', 'lng', 'fecha_apertura',
        'contacto_nombre', 'contacto_celular',
    ];

    protected $casts = ['fecha_apertura' => 'date'];

    public function pantallas()
    {
        return $this->hasMany(Pantalla::class);
    }

    public function movimientos()
    {
        return $this->hasMany(MovimientoLocal::class)->latest();
    }
}
