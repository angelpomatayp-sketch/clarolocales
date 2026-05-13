# ClaroLocales

Sistema de gestión de locales y pantallas digitales para Claro Perú — desarrollado por WOW Tech Peru.

## Stack

- Laravel 12 + PHP 8.2
- React 18 + Inertia.js v2
- Tailwind CSS
- Vite
- MySQL (XAMPP)

## Lenguajes y base de datos

- **Lenguaje backend:** PHP 8.2
- **Lenguaje frontend:** JavaScript / JSX con React 18
- **Estilos:** CSS mediante Tailwind CSS
- **Base de datos:** MySQL / MariaDB, gestionada localmente con XAMPP
- **Consultas y migraciones:** SQL administrado desde Laravel Migrations y Eloquent ORM

## Instalación

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
node node_modules/vite/bin/vite.js build
```

## Desarrollo

```bash
# Frontend (watch)
node node_modules/vite/bin/vite.js

# Build producción
node node_modules/vite/bin/vite.js build
```

## Usuarios del sistema (seeder)

| Nombre           | Email                    | Contraseña | Rol        | Zona    |
|------------------|--------------------------|------------|------------|---------|
| Admin WOW        | admin@wowtech.pe         | admin123   | admin      | —       |
| Juan Perez   | juan@claro.pe       | password.123   | operador | —       |
| Carlos Mendoza   | c.mendoza@wowtech.pe     | oper123    | regional  | —       |

## Estado del proyecto

### Implementado ✓

- **Gestión de locales** — CRUD completo con código auto-generado (DAC/CAC/CAD), ubigeo jerárquico, zona auto-asignada por departamento, coordenadas GPS opcionales, encargado/contacto
- **Gestión de pantallas** — CRUD completo con código auto-generado, marca, modelo (tipo), tamaño en pulgadas, n° de serie, n° de guía, posición, estado, local asignado, fecha de registro
- **Historial de movimientos** — Cambios de estado y traslados registrados con usuario, fecha y motivo para locales y pantallas; toggle "Registrar cambio en historial" en formularios de edición
- **Portal público (Directorio)** — Vista lista + mapa interactivo (OpenStreetMap + Leaflet), búsqueda por nombre/dirección, búsqueda por n° de serie, filtros por zona/departamento/provincia/distrito/tipo, ficha de local con historial completo de local y equipos
- **Dashboard admin** — Tarjetas de estadísticas, últimos locales, locales por zona, banner de alertas con locales inactivos que tienen pantallas asignadas
- **Alertas** — Badge visual en tabla de locales (admin) y banner en dashboard cuando un local Cerrado/Trasladado/Suspendido tiene pantallas asignadas
- **Zonas** — CRUD de zonas con color y departamentos asignados
- **Usuarios** — Gestión de accesos con roles (admin, supervisor, operativo, regional, usuario)

### Pendiente / En progreso

- **Importación masiva** — Carga desde Excel/CSV de locales y pantallas
- **Reportes exportables** — PDF/Excel del inventario de pantallas y estado de locales
- **Notificaciones** — Alertas por correo o sistema al cambiar estado de local/pantalla
- **Módulo de mantenimiento** — Registro y seguimiento de intervenciones técnicas por equipo
- **API REST** — Endpoints para integración con otros sistemas de Claro
