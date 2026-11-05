<?php

namespace App\Domain\Servicios;

final class ServiceCatalog
{
    public const TYPES = ['instalacion', 'mantenimiento', 'desmonte'];

    public const SCREEN_STATES = [
        'En almacén', 'Operativa', 'En mantenimiento', 'Avería',
        'Sin señal', 'Trasladada', 'Retirada', 'Dada de baja',
    ];

    public const REMOVAL_STATES = ['En almacén', 'Retirada', 'Dada de baja'];

    public const IMAGE_RULES = ['file', 'mimes:jpg,jpeg,png,webp,heic,heif', 'max:4096'];

    private function __construct() {}
}
