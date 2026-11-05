<?php

namespace App\Domain\Locales;

final class LocalType
{
    public const ALL = ['DAC', 'CAC', 'CAV', 'CAA', 'CADENA'];

    public static function codePrefix(string $type): string
    {
        return match ($type) {
            'DAC' => 'DAC',
            'CAC' => 'CAC',
            'CAV' => 'CAV',
            'CAA' => 'CAA',
            'CADENA' => 'CAD',
            default => 'LOC',
        };
    }
}
