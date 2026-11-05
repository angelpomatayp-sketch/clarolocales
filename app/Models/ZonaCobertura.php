<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZonaCobertura extends Model
{
    protected $fillable = ['zona_id', 'departamento', 'provincia', 'distrito'];

    public function zona(): BelongsTo
    {
        return $this->belongsTo(Zona::class);
    }
}
