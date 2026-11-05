# Arquitectura de ClaroLocales

## Enfoque

ClaroLocales utiliza un **monolito modular** sobre Laravel, Inertia y React. Se mantiene un solo despliegue y una sola base de datos, pero las reglas de negocio se agrupan por módulo para evitar controladores y vistas monolíticas.

## Capas

1. **Presentación (`app/Http`, `resources/js`)**
   - Controladores: adaptan solicitudes y respuestas.
   - Form Requests: autorización y validación de formato.
   - Páginas/componentes React: interacción y presentación, sin reglas de inventario.
2. **Aplicación (`app/Application`)**
   - Casos de uso transaccionales: asignar, ejecutar, revisar y actualizar ubicaciones.
   - Orquesta modelos, archivos y movimientos históricos.
3. **Dominio (`app/Domain`)**
   - Catálogos y reglas compartidas que no dependen de HTTP.
4. **Persistencia (`app/Models`, `database/migrations`)**
   - Eloquent, relaciones, claves foráneas, índices y migraciones.

## Módulo Servicios

```text
app/
├── Domain/Servicios/ServiceCatalog.php
├── Application/Servicios/
│   ├── ServiceOrderManager.php
│   ├── SubmitService.php
│   ├── ReviewService.php
│   ├── UpdateServiceLocation.php
│   ├── EquipmentSeriesValidator.php
│   └── ServiceEvidenceManager.php
├── Http/Requests/Admin/Servicios/
└── Http/Controllers/Admin/ServicioPantallaController.php
```

El controlador no crea inventario ni administra archivos directamente. Cada caso de uso controla su propia transacción y puede probarse sin depender de una pantalla web.

## Base de datos

- Las entidades principales están normalizadas: locales, pantallas, componentes, servicios, equipos de servicio, evidencias y movimientos.
- Las relaciones críticas usan claves foráneas.
- Las series y códigos tienen restricciones únicas.
- Los historiales son registros separados y no sobrescriben eventos anteriores.
- Los índices cubren filtros de servicios, asignaciones del operador, equipos, evidencias y consultas cronológicas de movimientos.

Los campos JSON se reservan para fotografías instantáneas históricas o configuraciones variables. No deben utilizarse para reemplazar relaciones entre entidades.

## Reglas para nuevos cambios

- Una regla que modifica inventario o historial pertenece a `app/Application`, no al controlador.
- La validación HTTP pertenece a un `FormRequest`.
- Los estados compartidos pertenecen al catálogo de dominio.
- Todo cambio que afecte varias tablas debe ejecutarse dentro de una transacción.
- Los archivos se guardan de forma privada y deben eliminarse si la transacción falla.
- Las consultas de listados deben usar carga anticipada para evitar N+1.
- Una migración aplicada nunca se edita; se crea una nueva migración reversible.
