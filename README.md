# ClaroLocales

Sistema de gestión de locales y pantallas digitales para Claro Perú — desarrollado por WOW Tech Peru.

## Stack

- Laravel 12 + PHP 8.2
- React 18 + Inertia.js v2
- Tailwind CSS
- Vite
- MySQL (XAMPP)

La estructura modular y las reglas para ampliar el sistema están documentadas en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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
| Admin WOW        | admin@wowtechperu.com         | admin123   | admin      | —       |
| Juan Perez   | juan@claro.pe       | password.123   | operador | —       |
| Carlos Mendoza   | apomatay@wowtechperu.com     | 70354375    | Supervisor | —       |

## Estado del proyecto

### Implementado ✓

- **Gestión de locales** — CRUD completo con código auto-generado (DAC/CAC/CAV/CAA/CAD), ubigeo jerárquico, zona auto-asignada por departamento, coordenadas GPS opcionales, encargado/contacto
- **Gestión de pantallas** — CRUD completo con código auto-generado, marca, modelo (tipo), tamaño en pulgadas, n° de serie, n° de solicitud, posición, estado, local asignado, fecha de registro
- **Servicios de campo** — Instalaciones de uno o varios equipos, mantenimientos y desmontes creados por administrador/supervisor, asignados a un operador y ejecutados desde una vista móvil con revisión posterior
- **Evidencias privadas** — Fotografías de documento firmado, serie, estado inicial y resultado final vinculadas a cada servicio, sin captura de GPS
- **Trazabilidad de ubicación** — Los cambios de dirección aprobados por supervisor/admin conservan valores anteriores y nuevos y se vinculan directamente con el mantenimiento que los originó
- **Inventario de Video Wall** — Serie principal, configuración 2x1/2x2/2x3 y series individuales de cada panel
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
- **API REST** — Endpoints para integración con otros sistemas de Claro



DB_DATABASE=clarolocales
DB_USERNAME=clarolocales_user
DB_PASSWORD=ClaroLocales2026_DB!
DB_HOST=localhost
DB_PORT=3306
