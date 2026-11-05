<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zona extends Model
{
    protected $fillable = ['nombre', 'color', 'departamentos'];

    protected $casts = ['departamentos' => 'array'];

    public function coberturas(): HasMany
    {
        return $this->hasMany(ZonaCobertura::class);
    }
}
