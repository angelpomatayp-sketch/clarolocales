DOCUMENTO DE ALCANCE — v1.0
ClaroLocales
Sistema de Directorio y Gestión de Locales + Pantallas Digitales · Claro Perú
Cliente: Claro Perú
Ejecutado por: WOW Tech Peru
Estado: En análisis
Abril 2026
Solo Perú — v1.0
Tipo de sistema
Plataforma web (portal público + backoffice)
Cobertura
Perú — 5 regiones · nacional
Tiempo estimado
8 semanas · 320 horas · 1 dev full-time
Costo infraestructura
~$20 USD/mes (Railway) + Google Maps API
1
Descripción general
ClaroLocales es una plataforma web que centraliza el directorio de puntos de venta y distribución de Claro Perú a nivel nacional: DACs, CADs y tiendas propias Claro. Permite al público general localizar cualquier local en el mapa, ver su información de contacto (nombre, encargado, teléfono, horario), y consultar el historial de mudanzas del local. Adicionalmente, permite localizar en qué local está instalada una pantalla de digital signage (señalética digital) mediante su número de serie, junto con el estado de la pantalla y su historial de movimientos entre locales.

El sistema tiene dos entornos completamente separados: un portal público sin login para el cliente Claro, y un backoffice privado con autenticación exclusivo para el personal interno de WOW Technologies Peru.
2
Actores del sistema
👤
Cliente Claro
PÚBLICO · SIN LOGIN
Cualquier persona que accede al portal. Solo lectura, sin necesidad de cuenta.
Navega el directorio por región y departamento
Consulta ficha del local: nombre, encargado, teléfono, horario, dirección
Ve el local en Google Maps + Street View
Ve historial de mudanzas del local
Busca una pantalla por N° de serie
Ve estado, ubicación e historial de la pantalla
🔧
Operador WOW Tech Peru
PRIVADO · LOGIN
Personal interno de WOW Technologies Peru. Acceso autenticado al backoffice.
Registra y edita locales con todos sus datos
Actualiza coordenadas → log automático de mudanza
Registra pantallas y las asocia a locales
Actualiza estado de pantallas y locales
Traslada pantallas entre locales
Gestiona cuentas de operadores
3
Módulos del sistema
#	Módulo	Perfil	Descripción
M1	Directorio de locales	Público	Árbol navegable Región → Departamento → Locales. Filtros por tipo (DAC / CAD / Tienda Claro).
M2	Vista mapa	Público	Todos los locales sobre Google Maps con pins por tipo, clustering y filtros en tiempo real.
M3	Ficha del local	Público	Panel detalle con: nombre, tipo, encargado, teléfono, email, horario, dirección, estado, N° pantallas instaladas, mini mapa + Street View.
M4	Historial de mudanzas	Público	Línea de tiempo con todas las ubicaciones anteriores del local, visible para el público.
M5	Búsqueda por N° de serie	Público	Ingresa serie → muestra local donde está la pantalla + estado + posición + historial de movimientos entre locales.
M6	Búsqueda global de locales	Público	Buscador en el header por nombre o dirección del local. Resultados en tiempo real.
M7	Gestión de locales	Operador	CRUD completo: crear, editar, activar/desactivar locales. Mapa editable con pin arrastrable. Places Autocomplete para dirección.
M8	Actualizar ubicación	Operador	Al cambiar coordenadas o dirección → el sistema guarda automáticamente la ubicación anterior en historial_locales (trigger PostgreSQL).
M9	Gestión de pantallas	Operador	CRUD de pantallas: registrar serie, modelo, local asignado, posición, estado. Al trasladar pantalla → historial automático.
M10	Gestión de usuarios	Operador	Crear y administrar cuentas de operadores con roles (admin / operador básico).
4
Campos del local — datos completos
Campo	Descripción	Ejemplo	Visibilidad
Nombre del local REQ	Nombre oficial del punto de venta	Distribuidora Chiclayo Centro	Público
Tipo de local REQ	DAC / CAD / Tienda propia Claro	DAC	Público
Nombre del encargado REQ	Persona responsable del local	Juan Pérez Rodríguez	Público
Teléfono de contacto REQ	Número directo del encargado o local	+51 944 123 456	Público
Correo electrónico OPC	Email de contacto del local	chiclayo.centro@claro.pe	Público
Dirección actual REQ	Dirección completa (autocompletada con Places API)	Av. Balta 1023, Chiclayo, Lambayeque	Público
Coordenadas (lat/lng) REQ	Generadas automáticamente desde la dirección	-6.7714, -79.8409	Público
Región / Departamento REQ	Clasificación geográfica del local	Norte / Lambayeque	Público
Horario de atención OPC	Días y horas de apertura	Lun–Sáb 9am–7pm	Público
Estado REQ	Activo / Inactivo	Activo	Público
N° pantallas instaladas	Contador automático desde pantallas asociadas	3	Público
Historial de ubicaciones	Log automático de mudanzas anteriores con fechas	2 ubicaciones previas	Público
5
Campos de la pantalla digital (digital signage)
⚠ Contexto clave
Las pantallas son monitores de digital signage instalados en los locales de Claro para mostrar publicidad y marketing de Claro. Un local puede tener más de una pantalla. Cada pantalla tiene su propio número de serie único. La búsqueda por serie localiza exactamente en qué local está esa pantalla.
Campo	Descripción	Ejemplo
Número de serie REQ	Identificador único de la pantalla — clave de búsqueda	SN20240XA1234567
Modelo / marca REQ	Nombre comercial del equipo	LG 55" Commercial Display
Local asignado REQ	Local donde está instalada actualmente	DAC Chiclayo Centro
Posición en local OPC	Ubicación dentro del local	Entrada principal / Caja / Sala de espera
Estado REQ	Activo / Inactivo / Falla	Activo
Fecha de instalación REQ	Cuándo se instaló en el local actual	15/03/2024
Historial de movimientos	Registro automático de locales anteriores con fechas	Trujillo Centro (2022–2023) → Chiclayo (2024)
Notas técnicas OPC	Observaciones del técnico	Requiere revisión de soporte
6
Flujos principales
A
Cliente busca y consulta un local
1
Accede al portal sin login → ve directorio con regiones en el sidebar izquierdo.
2
Selecciona región → departamento → el grid central muestra las tarjetas de locales.
3
Hace clic en una tarjeta → se abre el panel derecho con la ficha completa del local.
4
La ficha muestra: nombre, tipo, nombre del encargado, teléfono, horario, dirección y mini mapa.
5
Hace clic en "Ver en Google Maps" → abre la ubicación en Google Maps con Street View disponible.
6
En la pestaña "Historial" ve la línea de tiempo de mudanzas anteriores del local.
B
Cliente busca una pantalla por número de serie
1
Ingresa el N° de serie en la barra de búsqueda superior del portal.
2
El sistema consulta la tabla series y devuelve el local donde está instalada.
3
El mapa hace zoom automático al local con pin resaltado + círculo indicador.
4
El panel derecho muestra: local, encargado, dirección, estado de la pantalla (activo/inactivo/falla), posición en el local.
5
En la pestaña "Historial pantalla" se ven los locales anteriores donde estuvo instalada con fechas.
6
Si la serie no existe → mensaje de error claro: "Serie no encontrada".
C
Operador registra o actualiza un local
1
Ingresa al backoffice con email + contraseña → dashboard de operador.
2
Va a "Gestión de Locales" → crea nuevo local completando todos los campos requeridos.
3
La dirección se autocompleta con Google Places API → lat/lng generados automáticamente.
4
Si actualiza la dirección de un local existente → el sistema guarda la ubicación anterior en historial_locales automáticamente (trigger de PostgreSQL, sin acción extra del operador).
D
Operador registra o traslada una pantalla
1
Va a "Gestión de Pantallas" → ingresa N° serie, modelo, local asignado, posición y estado.
2
Si traslada la pantalla a otro local → actualiza el local asignado en el formulario.
3
El sistema registra automáticamente el movimiento con fecha en el historial de la pantalla.
7
Dentro y fuera del alcance — v1.0
✓ DENTRO DEL ALCANCE
✓
Directorio: DACs, CADs y tiendas propias Claro Perú
✓
Vista lista + vista mapa con Google Maps real
✓
Ficha completa: nombre, encargado, teléfono, horario, email
✓
Mini mapa + Street View + botón Google Maps
✓
Historial de mudanzas del local (público)
✓
Búsqueda por N° de serie de pantalla digital
✓
Estado de pantalla: activo / inactivo / falla
✓
Historial de movimientos de pantalla entre locales
✓
Backoffice con login para operadores WOW
✓
Places Autocomplete al registrar dirección
✓
Log automático al actualizar ubicación (trigger BD)
✓
Responsive mobile para portal público
✓
Deploy en Railway — PostgreSQL + App
✓
Solo Perú — 5 regiones, cobertura nacional



DOCUMENTO DE ALCANCE — v1.0
ClaroLocales
Sistema de Directorio y Gestión de Locales + Pantallas Digitales · Claro Perú
Cliente: Claro Perú
Ejecutado por: WOW Tech Peru
Estado: En análisis
Abril 2026
Solo Perú — v1.0
Tipo de sistema
Plataforma web (portal público + backoffice)
Cobertura
Perú — 5 regiones · nacional
Tiempo estimado
8 semanas · 320 horas · 1 dev full-time
Costo infraestructura
~$20 USD/mes (Railway) + Google Maps API
1
Descripción general
ClaroLocales es una plataforma web que centraliza el directorio de puntos de venta y distribución de Claro Perú a nivel nacional: DACs, CADs y tiendas propias Claro. Permite al público general localizar cualquier local en el mapa, ver su información de contacto (nombre, encargado, teléfono, horario), y consultar el historial de mudanzas del local. Adicionalmente, permite localizar en qué local está instalada una pantalla de digital signage (señalética digital) mediante su número de serie, junto con el estado de la pantalla y su historial de movimientos entre locales.

El sistema tiene dos entornos completamente separados: un portal público sin login para el cliente Claro, y un backoffice privado con autenticación exclusivo para el personal interno de WOW Technologies Peru.
2
Actores del sistema
👤
Cliente Claro
PÚBLICO · SIN LOGIN
Cualquier persona que accede al portal. Solo lectura, sin necesidad de cuenta.
Navega el directorio por región y departamento
Consulta ficha del local: nombre, encargado, teléfono, horario, dirección
Ve el local en Google Maps + Street View
Ve historial de mudanzas del local
Busca una pantalla por N° de serie
Ve estado, ubicación e historial de la pantalla
🔧
Operador WOW Tech Peru
PRIVADO · LOGIN
Personal interno de WOW Technologies Peru. Acceso autenticado al backoffice.
Registra y edita locales con todos sus datos
Actualiza coordenadas → log automático de mudanza
Registra pantallas y las asocia a locales
Actualiza estado de pantallas y locales
Traslada pantallas entre locales
Gestiona cuentas de operadores
3
Módulos del sistema
#	Módulo	Perfil	Descripción
M1	Directorio de locales	Público	Árbol navegable Región → Departamento → Locales. Filtros por tipo (DAC / CAD / Tienda Claro).
M2	Vista mapa	Público	Todos los locales sobre Google Maps con pins por tipo, clustering y filtros en tiempo real.
M3	Ficha del local	Público	Panel detalle con: nombre, tipo, encargado, teléfono, email, horario, dirección, estado, N° pantallas instaladas, mini mapa + Street View.
M4	Historial de mudanzas	Público	Línea de tiempo con todas las ubicaciones anteriores del local, visible para el público.
M5	Búsqueda por N° de serie	Público	Ingresa serie → muestra local donde está la pantalla + estado + posición + historial de movimientos entre locales.
M6	Búsqueda global de locales	Público	Buscador en el header por nombre o dirección del local. Resultados en tiempo real.
M7	Gestión de locales	Operador	CRUD completo: crear, editar, activar/desactivar locales. Mapa editable con pin arrastrable. Places Autocomplete para dirección.
M8	Actualizar ubicación	Operador	Al cambiar coordenadas o dirección → el sistema guarda automáticamente la ubicación anterior en historial_locales (trigger PostgreSQL).
M9	Gestión de pantallas	Operador	CRUD de pantallas: registrar serie, modelo, local asignado, posición, estado. Al trasladar pantalla → historial automático.
M10	Gestión de usuarios	Operador	Crear y administrar cuentas de operadores con roles (admin / operador básico).
4
Campos del local — datos completos
Campo	Descripción	Ejemplo	Visibilidad
Nombre del local REQ	Nombre oficial del punto de venta	Distribuidora Chiclayo Centro	Público
Tipo de local REQ	DAC / CAD / Tienda propia Claro	DAC	Público
Nombre del encargado REQ	Persona responsable del local	Juan Pérez Rodríguez	Público
Teléfono de contacto REQ	Número directo del encargado o local	+51 944 123 456	Público
Correo electrónico OPC	Email de contacto del local	chiclayo.centro@claro.pe	Público
Dirección actual REQ	Dirección completa (autocompletada con Places API)	Av. Balta 1023, Chiclayo, Lambayeque	Público
Coordenadas (lat/lng) REQ	Generadas automáticamente desde la dirección	-6.7714, -79.8409	Público
Región / Departamento REQ	Clasificación geográfica del local	Norte / Lambayeque	Público
Horario de atención OPC	Días y horas de apertura	Lun–Sáb 9am–7pm	Público
Estado REQ	Activo / Inactivo	Activo	Público
N° pantallas instaladas	Contador automático desde pantallas asociadas	3	Público
Historial de ubicaciones	Log automático de mudanzas anteriores con fechas	2 ubicaciones previas	Público
5
Campos de la pantalla digital (digital signage)
⚠ Contexto clave
Las pantallas son monitores de digital signage instalados en los locales de Claro para mostrar publicidad y marketing de Claro. Un local puede tener más de una pantalla. Cada pantalla tiene su propio número de serie único. La búsqueda por serie localiza exactamente en qué local está esa pantalla.
Campo	Descripción	Ejemplo
Número de serie REQ	Identificador único de la pantalla — clave de búsqueda	SN20240XA1234567
Modelo / marca REQ	Nombre comercial del equipo	LG 55" Commercial Display
Local asignado REQ	Local donde está instalada actualmente	DAC Chiclayo Centro
Posición en local OPC	Ubicación dentro del local	Entrada principal / Caja / Sala de espera
Estado REQ	Activo / Inactivo / Falla	Activo
Fecha de instalación REQ	Cuándo se instaló en el local actual	15/03/2024
Historial de movimientos	Registro automático de locales anteriores con fechas	Trujillo Centro (2022–2023) → Chiclayo (2024)
Notas técnicas OPC	Observaciones del técnico	Requiere revisión de soporte
6
Flujos principales
A
Cliente busca y consulta un local
1
Accede al portal sin login → ve directorio con regiones en el sidebar izquierdo.
2
Selecciona región → departamento → el grid central muestra las tarjetas de locales.
3
Hace clic en una tarjeta → se abre el panel derecho con la ficha completa del local.
4
La ficha muestra: nombre, tipo, nombre del encargado, teléfono, horario, dirección y mini mapa.
5
Hace clic en "Ver en Google Maps" → abre la ubicación en Google Maps con Street View disponible.
6
En la pestaña "Historial" ve la línea de tiempo de mudanzas anteriores del local.
B
Cliente busca una pantalla por número de serie
1
Ingresa el N° de serie en la barra de búsqueda superior del portal.
2
El sistema consulta la tabla series y devuelve el local donde está instalada.
3
El mapa hace zoom automático al local con pin resaltado + círculo indicador.
4
El panel derecho muestra: local, encargado, dirección, estado de la pantalla (activo/inactivo/falla), posición en el local.
5
En la pestaña "Historial pantalla" se ven los locales anteriores donde estuvo instalada con fechas.
6
Si la serie no existe → mensaje de error claro: "Serie no encontrada".
C
Operador registra o actualiza un local
1
Ingresa al backoffice con email + contraseña → dashboard de operador.
2
Va a "Gestión de Locales" → crea nuevo local completando todos los campos requeridos.
3
La dirección se autocompleta con Google Places API → lat/lng generados automáticamente.
4
Si actualiza la dirección de un local existente → el sistema guarda la ubicación anterior en historial_locales automáticamente (trigger de PostgreSQL, sin acción extra del operador).
D
Operador registra o traslada una pantalla
1
Va a "Gestión de Pantallas" → ingresa N° serie, modelo, local asignado, posición y estado.
2
Si traslada la pantalla a otro local → actualiza el local asignado en el formulario.
3
El sistema registra automáticamente el movimiento con fecha en el historial de la pantalla.
7
Dentro y fuera del alcance — v1.0
✓ DENTRO DEL ALCANCE
✓
Directorio: DACs, CADs y tiendas propias Claro Perú
✓
Vista lista + vista mapa con Google Maps real
✓
Ficha completa: nombre, encargado, teléfono, horario, email
✓
Mini mapa + Street View + botón Google Maps
✓
Historial de mudanzas del local (público)
✓
Búsqueda por N° de serie de pantalla digital
✓
Estado de pantalla: activo / inactivo / falla
✓
Historial de movimientos de pantalla entre locales
✓
Backoffice con login para operadores WOW
✓
Places Autocomplete al registrar dirección
✓
Log automático al actualizar ubicación (trigger BD)
✓
Responsive mobile para portal público
✓
Deploy en Railway — PostgreSQL + App
✓
Solo Perú — 5 regiones, cobertura nacional
✗ FUERA DEL ALCANCE v1.0
✗
Monitoreo en tiempo real del contenido de pantallas
✗
App móvil nativa (iOS / Android)
✗
Integración con CMS de contenido de Claro
✗
Notificaciones automáticas (pendiente de definir)
✗
Escalado a otros países de Claro
✗
Módulo de reportes y estadísticas
✗
Chat o sistema de tickets de soporte
✗
API pública para terceros
✗
Integración con sistemas de facturación / ERP
✗
Autenticación SSO corporativa de Claro
✗
Gestión de contenido de las pantallas
✗
Control remoto o apagado de pantallas
8
Stack tecnológico — decisión final
Capa	Tecnología	Justificación técnica
Framework	Next.js 14 + TypeScript	SSR para el portal público (carga instantánea, SEO), SPA para el backoffice, API Routes como backend — todo en un solo repositorio y un solo lenguaje. Tipado fuerte reduce bugs en producción.
Base de datos	PostgreSQL 16 + Prisma ORM	Triggers nativos de PostgreSQL generan el historial de mudanzas automáticamente a nivel de BD, sin depender del código. Prisma genera tipos TypeScript desde el schema — frontend y backend comparten tipos sin duplicar.
Mapas	Google Maps Platform v3	Places API: autocompletar dirección al registrar local → coordenadas precisas automáticas. Geocoding API: dirección → coords al mover pin. Street View: cliente ve fachada del local. Móvil: experiencia nativa fluida. Sin restricción de costo → Google Maps es superior técnicamente.
Autenticación	NextAuth.js v5	Portal público: sin auth, rutas completamente libres. Backoffice /admin/*: protegido por middleware JWT que verifica rol antes de renderizar. Extensible a SSO si Claro lo requiere en v2.
Estilos	Tailwind CSS	Responsive mobile-first sin configuración adicional. Consistencia visual en portal público y backoffice.
Deploy	Railway	PostgreSQL + App Next.js en el mismo panel. Variables de entorno compartidas automáticamente entre servicios. CI/CD desde GitHub con un push. ~$20 USD/mes total de infraestructura.
Control de versiones	GitHub	Repositorio único (monorepo). Deploy automático a Railway en cada push a main.
✓ Railway no cambia nada del stack
Railway es solo hosting. Next.js, TypeScript, PostgreSQL y Google Maps funcionan exactamente igual. El único ajuste: agregar "start": "next start" en package.json y activar la extensión PostGIS con un comando al crear la BD.
9
Modelo de base de datos — tablas principales
locales
Tabla principal de locales
id · nombre · tipo · encargado
telefono · email · horario
direccion · lat · lng
region · departamento
estado · created_at
historial_locales
Log automático de mudanzas
id · local_id (FK)
direccion_anterior · lat_ant
lng_ant · motivo (OPC)
fecha_cambio · registrado_por
pantallas
Pantallas de digital signage
id · numero_serie (UNIQUE)
modelo · marca
local_id (FK) · posicion
estado · fecha_instalacion
notas · created_at
historial_pantallas
Movimientos de pantallas
id · pantalla_id (FK)
local_anterior_id (FK)
local_nuevo_id (FK)
fecha_movimiento
registrado_por
usuarios
Operadores del backoffice
id · nombre · email
password_hash · rol
(admin / operador)
activo · created_at
+
Tablas auxiliares en v2
(notificaciones, reportes)
10
Cronograma estimado
Semana	Módulo	Tareas principales	Horas
Sem 1–2	Setup + BD + Auth + API	Next.js + TypeScript + Tailwind, schema PostgreSQL, Prisma migrations, triggers, API Routes, Google Maps config, NextAuth + roles	80h
Sem 3–4	Portal público — Lista	Directorio por regiones, filtros, tarjetas de locales, panel detalle con todos los campos del encargado, historial de mudanzas, responsive mobile	72h
Sem 5	Portal público — Mapa	Google Maps integración Next.js, pins por tipo, clustering, Street View, búsqueda por serie con resultado + historial de pantalla	48h
Sem 6–7	Backoffice operador	Login, CRUD locales con todos los campos, mapa editable + Places Autocomplete, módulo pantallas (CRUD + traslados), gestión usuarios	72h
Sem 8	QA + Datos + Deploy	Importar locales actuales, testing flujos críticos, índices BD, deploy Railway, manual operador, buffer bugs	48h
Total: 320 horas · 8 semanas a tiempo completo · 1 desarrollador
Con 2 desarrolladores en paralelo → 4–5 semanas. Con 1 desarrollador part-time (20h/sem) → 16 semanas.
11