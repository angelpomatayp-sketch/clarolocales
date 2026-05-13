<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Local;

class MovimientoPantalla extends Model
{
    protected $table = 'movimientos_pantalla';

    protected $fillable = ['pantalla_id', 'user_id', 'local_anterior_id', 'local_nuevo_id', 'tipo', 'descripcion', 'motivo'];

    public function pantalla()
    {
        return $this->belongsTo(Pantalla::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function localAnterior()
    {
        return $this->belongsTo(Local::class, 'local_anterior_id');
    }

    public function localNuevo()
    {
        return $this->belongsTo(Local::class, 'local_nuevo_id');
    }
}
