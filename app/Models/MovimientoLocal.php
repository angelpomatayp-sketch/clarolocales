<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoLocal extends Model
{
    protected $table = 'movimientos_local';

    protected $fillable = ['local_id', 'user_id', 'tipo', 'descripcion', 'motivo'];

    public function local()
    {
        return $this->belongsTo(Local::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
