-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: clarolocales
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `componentes_pantalla`
--

DROP TABLE IF EXISTS `componentes_pantalla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `componentes_pantalla` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pantalla_id` bigint(20) unsigned NOT NULL,
  `serie` varchar(255) NOT NULL,
  `marca` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `tamanio` tinyint(3) unsigned DEFAULT NULL,
  `fila` tinyint(3) unsigned NOT NULL,
  `columna` tinyint(3) unsigned NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Operativa',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_instalacion` date DEFAULT NULL,
  `fecha_retiro` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `componentes_posicion_unique` (`pantalla_id`,`fila`,`columna`),
  UNIQUE KEY `componentes_pantalla_serie_unique` (`serie`),
  KEY `componentes_pantalla_pantalla_id_activo_index` (`pantalla_id`,`activo`),
  CONSTRAINT `componentes_pantalla_pantalla_id_foreign` FOREIGN KEY (`pantalla_id`) REFERENCES `pantallas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `componentes_pantalla`
--

LOCK TABLES `componentes_pantalla` WRITE;
/*!40000 ALTER TABLE `componentes_pantalla` DISABLE KEYS */;
/*!40000 ALTER TABLE `componentes_pantalla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidencias_servicio`
--

DROP TABLE IF EXISTS `evidencias_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `evidencias_servicio` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `servicio_id` bigint(20) unsigned NOT NULL,
  `servicio_equipo_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `tipo` enum('documento','serie','inicial','resultado','adicional') NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `mime` varchar(100) NOT NULL,
  `tamanio` bigint(20) unsigned NOT NULL,
  `orden` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evidencias_servicio_user_id_foreign` (`user_id`),
  KEY `evidencias_servicio_servicio_id_tipo_index` (`servicio_id`,`tipo`),
  KEY `evidencias_servicio_servicio_equipo_id_foreign` (`servicio_equipo_id`),
  CONSTRAINT `evidencias_servicio_servicio_equipo_id_foreign` FOREIGN KEY (`servicio_equipo_id`) REFERENCES `servicio_equipos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evidencias_servicio_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios_pantalla` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evidencias_servicio_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidencias_servicio`
--

LOCK TABLES `evidencias_servicio` WRITE;
/*!40000 ALTER TABLE `evidencias_servicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `evidencias_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locales`
--

DROP TABLE IF EXISTS `locales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locales` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'Activo',
  `zona` varchar(255) NOT NULL,
  `departamento` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `distrito` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `contacto_nombre` varchar(255) DEFAULT NULL,
  `contacto_celular` varchar(255) DEFAULT NULL,
  `fecha_apertura` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `locales_codigo_unique` (`codigo`),
  KEY `locales_zona_index` (`zona`),
  KEY `locales_tipo_index` (`tipo`),
  KEY `locales_estado_index` (`estado`),
  KEY `locales_departamento_index` (`departamento`),
  KEY `locales_provincia_index` (`provincia`),
  KEY `locales_zona_departamento_provincia_index` (`zona`,`departamento`,`provincia`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locales`
--

LOCK TABLES `locales` WRITE;
/*!40000 ALTER TABLE `locales` DISABLE KEYS */;
/*!40000 ALTER TABLE `locales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_05_11_014435_add_fields_to_users_table',1),(5,'2026_05_11_014437_create_zonas_table',1),(6,'2026_05_11_014438_create_locales_table',1),(7,'2026_05_11_014439_create_pantallas_table',1),(8,'2026_05_11_014441_create_movimientos_local_table',1),(9,'2026_05_11_014442_create_movimientos_pantalla_table',1),(10,'2026_05_11_041527_create_tipos_pantalla_table',2),(11,'2026_05_11_043946_add_numero_guia_to_pantallas_table',3),(12,'2026_05_11_045130_add_contacto_to_locales_table',4),(13,'2026_05_11_045513_remove_telefono_correo_from_locales_table',5),(14,'2026_05_11_051124_add_locales_fk_to_movimientos_pantalla_table',6),(15,'2026_05_11_060000_add_marca_tamanio_to_pantallas_table',7),(16,'2026_05_11_060001_add_motivo_to_movimientos_tables',7),(17,'2026_05_11_070000_add_modelo_equipo_to_pantallas_table',8),(18,'2026_05_11_215809_add_indexes_to_locales_table',9),(19,'2026_05_11_215812_add_fecha_registro_to_pantallas_table',9),(20,'2026_05_11_215813_fix_pendiente_instalacion_estado',9),(21,'2026_05_14_000000_add_two_factor_fields_to_users_table',10),(22,'2026_05_15_000001_add_filter_indexes_to_locales_and_pantallas',11),(23,'2026_11_04_000001_add_video_wall_inventory',12),(24,'2026_11_04_000002_create_servicios_pantalla_tables',13),(25,'2026_11_04_000003_allow_desmonte_in_servicios_pantalla',14),(26,'2026_11_04_000004_create_servicio_equipos_table',15),(27,'2026_11_04_000005_rename_numero_guia_to_numero_solicitud',16),(28,'2026_11_04_000006_link_local_history_to_services',17),(29,'2026_11_04_000007_add_workflow_history_indexes',18),(30,'2026_11_05_000001_remove_posicion_from_pantallas_table',19),(31,'2026_11_05_000002_create_zona_coberturas_table',20);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_local`
--

DROP TABLE IF EXISTS `movimientos_local`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientos_local` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `local_id` bigint(20) unsigned NOT NULL,
  `servicio_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `tipo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `movimientos_local_user_id_foreign` (`user_id`),
  KEY `movimientos_local_servicio_id_foreign` (`servicio_id`),
  KEY `movimientos_local_local_fecha_index` (`local_id`,`created_at`),
  KEY `movimientos_local_fecha_index` (`created_at`),
  CONSTRAINT `movimientos_local_local_id_foreign` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `movimientos_local_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios_pantalla` (`id`) ON DELETE SET NULL,
  CONSTRAINT `movimientos_local_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_local`
--

LOCK TABLES `movimientos_local` WRITE;
/*!40000 ALTER TABLE `movimientos_local` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_local` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_pantalla`
--

DROP TABLE IF EXISTS `movimientos_pantalla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientos_pantalla` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pantalla_id` bigint(20) unsigned NOT NULL,
  `servicio_id` bigint(20) unsigned DEFAULT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `local_anterior_id` bigint(20) unsigned DEFAULT NULL,
  `local_nuevo_id` bigint(20) unsigned DEFAULT NULL,
  `tipo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `movimientos_pantalla_user_id_foreign` (`user_id`),
  KEY `movimientos_pantalla_local_anterior_id_foreign` (`local_anterior_id`),
  KEY `movimientos_pantalla_local_nuevo_id_foreign` (`local_nuevo_id`),
  KEY `movimientos_pantalla_servicio_id_foreign` (`servicio_id`),
  KEY `movimientos_pantalla_pantalla_fecha_index` (`pantalla_id`,`created_at`),
  KEY `movimientos_pantalla_fecha_index` (`created_at`),
  CONSTRAINT `movimientos_pantalla_local_anterior_id_foreign` FOREIGN KEY (`local_anterior_id`) REFERENCES `locales` (`id`) ON DELETE SET NULL,
  CONSTRAINT `movimientos_pantalla_local_nuevo_id_foreign` FOREIGN KEY (`local_nuevo_id`) REFERENCES `locales` (`id`) ON DELETE SET NULL,
  CONSTRAINT `movimientos_pantalla_pantalla_id_foreign` FOREIGN KEY (`pantalla_id`) REFERENCES `pantallas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `movimientos_pantalla_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios_pantalla` (`id`) ON DELETE SET NULL,
  CONSTRAINT `movimientos_pantalla_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_pantalla`
--

LOCK TABLES `movimientos_pantalla` WRITE;
/*!40000 ALTER TABLE `movimientos_pantalla` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_pantalla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pantallas`
--

DROP TABLE IF EXISTS `pantallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pantallas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) NOT NULL,
  `serie` varchar(255) NOT NULL,
  `numero_solicitud` varchar(255) DEFAULT NULL,
  `marca` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) NOT NULL,
  `modelo_equipo` varchar(255) DEFAULT NULL,
  `tamanio` tinyint(3) unsigned DEFAULT NULL,
  `filas` tinyint(3) unsigned DEFAULT NULL,
  `columnas` tinyint(3) unsigned DEFAULT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'En almacén',
  `fecha_registro` date DEFAULT NULL,
  `local_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pantallas_codigo_unique` (`codigo`),
  UNIQUE KEY `pantallas_serie_unique` (`serie`),
  KEY `pantallas_local_id_foreign` (`local_id`),
  KEY `pantallas_estado_index` (`estado`),
  KEY `pantallas_modelo_index` (`modelo`),
  CONSTRAINT `pantallas_local_id_foreign` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pantallas`
--

LOCK TABLES `pantallas` WRITE;
/*!40000 ALTER TABLE `pantallas` DISABLE KEYS */;
/*!40000 ALTER TABLE `pantallas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicio_equipos`
--

DROP TABLE IF EXISTS `servicio_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicio_equipos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `servicio_id` bigint(20) unsigned NOT NULL,
  `pantalla_id` bigint(20) unsigned DEFAULT NULL,
  `orden` tinyint(3) unsigned NOT NULL,
  `tipo_esperado` varchar(255) DEFAULT NULL,
  `resultado` enum('pendiente','instalado','no_instalado') NOT NULL DEFAULT 'pendiente',
  `estado_resultante` varchar(255) DEFAULT NULL,
  `datos_equipo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_equipo`)),
  `motivo_no_instalado` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `servicio_equipos_servicio_id_orden_unique` (`servicio_id`,`orden`),
  KEY `servicio_equipos_pantalla_id_foreign` (`pantalla_id`),
  KEY `servicio_equipos_servicio_id_resultado_index` (`servicio_id`,`resultado`),
  CONSTRAINT `servicio_equipos_pantalla_id_foreign` FOREIGN KEY (`pantalla_id`) REFERENCES `pantallas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `servicio_equipos_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios_pantalla` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicio_equipos`
--

LOCK TABLES `servicio_equipos` WRITE;
/*!40000 ALTER TABLE `servicio_equipos` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicio_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_pantalla`
--

DROP TABLE IF EXISTS `servicios_pantalla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios_pantalla` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) NOT NULL,
  `tipo` varchar(30) NOT NULL,
  `estado` enum('pendiente','en_curso','en_revision','observado','finalizado','cancelado') NOT NULL DEFAULT 'pendiente',
  `local_id` bigint(20) unsigned NOT NULL,
  `pantalla_id` bigint(20) unsigned DEFAULT NULL,
  `operador_id` bigint(20) unsigned DEFAULT NULL,
  `creado_por` bigint(20) unsigned DEFAULT NULL,
  `revisado_por` bigint(20) unsigned DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `iniciado_at` timestamp NULL DEFAULT NULL,
  `enviado_revision_at` timestamp NULL DEFAULT NULL,
  `finalizado_at` timestamp NULL DEFAULT NULL,
  `numero_solicitud` varchar(255) DEFAULT NULL,
  `instrucciones` text DEFAULT NULL,
  `informe_tecnico` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `persona_recepcion` varchar(255) DEFAULT NULL,
  `estado_resultante` varchar(255) DEFAULT NULL,
  `datos_equipo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_equipo`)),
  `motivo_observacion` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `servicios_pantalla_codigo_unique` (`codigo`),
  KEY `servicios_pantalla_pantalla_id_foreign` (`pantalla_id`),
  KEY `servicios_pantalla_creado_por_foreign` (`creado_por`),
  KEY `servicios_pantalla_revisado_por_foreign` (`revisado_por`),
  KEY `servicios_pantalla_operador_id_estado_index` (`operador_id`,`estado`),
  KEY `servicios_pantalla_local_id_fecha_programada_index` (`local_id`,`fecha_programada`),
  KEY `servicios_pantalla_tipo_estado_index` (`tipo`,`estado`),
  KEY `servicios_estado_fecha_id_index` (`estado`,`fecha_programada`,`id`),
  CONSTRAINT `servicios_pantalla_creado_por_foreign` FOREIGN KEY (`creado_por`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `servicios_pantalla_local_id_foreign` FOREIGN KEY (`local_id`) REFERENCES `locales` (`id`),
  CONSTRAINT `servicios_pantalla_operador_id_foreign` FOREIGN KEY (`operador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `servicios_pantalla_pantalla_id_foreign` FOREIGN KEY (`pantalla_id`) REFERENCES `pantallas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `servicios_pantalla_revisado_por_foreign` FOREIGN KEY (`revisado_por`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_pantalla`
--

LOCK TABLES `servicios_pantalla` WRITE;
/*!40000 ALTER TABLE `servicios_pantalla` DISABLE KEYS */;
/*!40000 ALTER TABLE `servicios_pantalla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('fRQl24zPN2GcZl8CnoPOK9rmAE7IdKYhXRoT18Oj',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; es-PE) PowerShell/7.6.9','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTUVweHdJcWZIZ0Z0ZVRjQThUeE90c1ZOTmY5N0dnZG1UZmtIQmFwMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1793907833),('LjBTU5nUfz2CO6pbPqSQsHmL9xIwqRNJsOzyzSwD',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; es-PE) PowerShell/7.6.9','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV04wQk5Sa2lhTUwweTQ4dHk5SDdUYXZPUm9lRFpQUm9vM29HQWNOUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1793909419),('q9NN1TCCwnPNYvR8IolK4tBrECFo5WKAEqh46FK7',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; es-PE) PowerShell/7.6.9','YTozOntzOjY6Il90b2tlbiI7czo0MDoieHh1WTRtcU4za3NoRVR6TE41RTEzQ3c1NWI2ekhUT1BRdFR0aWIwSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1793908312),('tmfuXdbmO9XB7DXUdRXwTJChdIr6FtI2qtpbNdow',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; es-PE) PowerShell/7.6.9','YTozOntzOjY6Il90b2tlbiI7czo0MDoic0R3RElDem9wUEFLRFRaQ05YOWlnMW9EUUlmOXo2WmpYNDRmTkVDMiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMS9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1793907307),('yswkkQ2CW2NcFrw2Hd8Q3eD84GjiU6q5j9jhC43F',1,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiV1RyZUtWeFQydmNTcU5xUFVMN3ZqNmlEMERtOWx1YnNDckV6WkxaMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMS9hZG1pbi9sb2NhbGVzIjtzOjU6InJvdXRlIjtzOjE5OiJhZG1pbi5sb2NhbGVzLmluZGV4Ijt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9',1793909947);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_pantalla`
--

DROP TABLE IF EXISTS `tipos_pantalla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_pantalla` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tipos_pantalla_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_pantalla`
--

LOCK TABLES `tipos_pantalla` WRITE;
/*!40000 ALTER TABLE `tipos_pantalla` DISABLE KEYS */;
INSERT INTO `tipos_pantalla` VALUES (1,'MTM','Pantalla pequeña tipo kiosko de sobremesa',1,'2026-05-11 09:21:26','2026-11-06 00:20:11'),(3,'TO','Pantalla vertical de gran formato autosoportada',1,'2026-05-11 09:21:26','2026-11-06 00:22:28'),(4,'VW','Múltiples Pantallas (LCD o LED)',1,'2026-05-11 09:21:26','2026-11-06 00:22:35'),(5,'LED Outdoor','Pantalla LED para uso exterior',1,'2026-05-11 09:21:26','2026-05-11 09:21:26'),(6,'MTP','Pantalla pequeña tipo parante',1,'2026-05-11 09:23:25','2026-11-06 00:20:20'),(7,'MT','Minitotem CAC',1,'2026-11-06 00:19:59','2026-11-06 00:19:59'),(8,'TOTEM DE PISO 55\"',NULL,1,'2026-11-06 00:22:47','2026-11-06 00:27:32'),(9,'MP','Media Player',1,'2026-11-06 00:24:12','2026-11-06 00:24:12'),(10,'TOTEM DE PISO 75\"',NULL,1,'2026-11-06 00:24:24','2026-11-06 00:24:24');
/*!40000 ALTER TABLE `tipos_pantalla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rol` varchar(255) NOT NULL DEFAULT 'operativo',
  `zona` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `two_factor_required` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador','admin@wowtechperu.com','admin',NULL,1,'$2y$12$Mr9ocK/Ues4VD18xAZ7V7uOQgP98aTSoSATm99IyPwxcPHb3DPNsm',NULL,'2026-05-11 08:18:48','2026-05-16 01:08:32',0,NULL,NULL),(3,'Carlos Mendoza','c.mendoza@wowtech.pe','regional','Centro',1,'$2y$12$CebmR3gqmobBos1eQJw2L.ddHYXQ8J6DSXq6eZ3v06mgwsDS.wQOq',NULL,'2026-05-11 08:18:48','2026-05-21 01:36:22',0,NULL,NULL),(10,'Juan Perez','juan@claro.pe','operativo',NULL,1,'$2y$12$Jk04EqtrA59JoSfS7r2w1edVe4CcROvHf8Op2/8GXvRnuB2G7QqQu',NULL,'2026-05-13 01:42:53','2026-11-04 23:02:49',0,NULL,NULL),(11,'Angel Miguel Pomatay Paquiyauri','apomatay@wowtechperu.com','supervisor',NULL,1,'$2y$12$06mHtX43rfDElX3tdefMTeL2y20MlJfEsQMJIdW.ukpMfIxjbkngi',NULL,'2026-05-13 01:46:40','2026-05-14 21:56:23',1,'eyJpdiI6IldaaSs4d1ZLU1h6UTA0cWdUaDJSY1E9PSIsInZhbHVlIjoiWUtOeFNGRFA1NHNDMzhJemZwNUVuR3QxTVVickNWSE1iUFhkK2tUV24vWlFVV1FTWkZZRStYMThOVjh5OGVycCIsIm1hYyI6IjU3MjYzMWM0ZTg4N2JiZWNjYTg5MzYzZDBmM2Y3ZjE0ZGNiMThkMTA4YzQ2NWU2YjZkODIxOTQzZTU4ZTc1ODgiLCJ0YWciOiIifQ==','2026-05-14 21:56:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zona_coberturas`
--

DROP TABLE IF EXISTS `zona_coberturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zona_coberturas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `zona_id` bigint(20) unsigned NOT NULL,
  `departamento` varchar(255) NOT NULL,
  `provincia` varchar(255) NOT NULL,
  `distrito` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zona_coberturas_ubicacion_unique` (`departamento`,`provincia`,`distrito`),
  KEY `zona_coberturas_filtro_index` (`zona_id`,`departamento`,`provincia`),
  CONSTRAINT `zona_coberturas_zona_id_foreign` FOREIGN KEY (`zona_id`) REFERENCES `zonas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zona_coberturas`
--

LOCK TABLES `zona_coberturas` WRITE;
/*!40000 ALTER TABLE `zona_coberturas` DISABLE KEYS */;
INSERT INTO `zona_coberturas` VALUES (1,3,'Ayacucho','Huamanga','Ayacucho','2026-11-06 00:42:59','2026-11-06 00:42:59'),(2,3,'Callao','Callao','Bellavista','2026-11-06 00:42:59','2026-11-06 00:42:59'),(3,3,'Huánuco','Huánuco','Huánuco','2026-11-06 00:42:59','2026-11-06 00:42:59'),(4,3,'Ica','Ica','Ica','2026-11-06 00:42:59','2026-11-06 00:42:59'),(5,3,'Junín','Huancayo','Huancayo','2026-11-06 00:42:59','2026-11-06 00:42:59'),(6,3,'Junín','Tarma','Tarma','2026-11-06 00:42:59','2026-11-06 00:42:59'),(7,3,'Loreto','Maynas','Iquitos','2026-11-06 00:42:59','2026-11-06 00:42:59'),(8,3,'Ucayali','Coronel Portillo','Callería','2026-11-06 00:42:59','2026-11-06 00:42:59'),(9,5,'Lima','Huaral','Huaral','2026-11-06 00:42:59','2026-11-06 00:42:59'),(10,5,'Lima','Huaura','Huacho','2026-11-06 00:42:59','2026-11-06 00:42:59'),(11,4,'Callao','Callao','Callao','2026-11-06 00:42:59','2026-11-06 00:42:59'),(12,4,'Lima','Lima','Ancón','2026-11-06 00:42:59','2026-11-06 00:42:59'),(13,4,'Lima','Lima','Ate','2026-11-06 00:42:59','2026-11-06 00:42:59'),(14,4,'Lima','Lima','Chorrillos','2026-11-06 00:42:59','2026-11-06 00:42:59'),(15,4,'Lima','Lima','Comas','2026-11-06 00:42:59','2026-11-06 00:42:59'),(16,4,'Lima','Lima','El Agustino','2026-11-06 00:42:59','2026-11-06 00:42:59'),(17,4,'Lima','Lima','Independencia','2026-11-06 00:42:59','2026-11-06 00:42:59'),(18,4,'Lima','Lima','Jesús María','2026-11-06 00:42:59','2026-11-06 00:42:59'),(19,4,'Lima','Lima','La Molina','2026-11-06 00:42:59','2026-11-06 00:42:59'),(20,4,'Lima','Lima','La Victoria','2026-11-06 00:42:59','2026-11-06 00:42:59'),(21,4,'Lima','Lima','Lince','2026-11-06 00:42:59','2026-11-06 00:42:59'),(22,4,'Lima','Lima','Los Olivos','2026-11-06 00:42:59','2026-11-06 00:42:59'),(23,4,'Lima','Lima','Lurín','2026-11-06 00:42:59','2026-11-06 00:42:59'),(24,4,'Lima','Lima','Miraflores','2026-11-06 00:42:59','2026-11-06 00:42:59'),(25,4,'Lima','Lima','Pachacámac','2026-11-06 00:42:59','2026-11-06 00:42:59'),(26,4,'Lima','Lima','Pueblo Libre','2026-11-06 00:42:59','2026-11-06 00:42:59'),(27,4,'Lima','Lima','Puente Piedra','2026-11-06 00:42:59','2026-11-06 00:42:59'),(28,4,'Lima','Lima','Rímac','2026-11-06 00:42:59','2026-11-06 00:42:59'),(29,4,'Lima','Lima','San Borja','2026-11-06 00:42:59','2026-11-06 00:42:59'),(30,4,'Lima','Lima','San Isidro','2026-11-06 00:42:59','2026-11-06 00:42:59'),(31,4,'Lima','Lima','San Juan de Lurigancho','2026-11-06 00:42:59','2026-11-06 00:42:59'),(32,4,'Lima','Lima','San Juan de Miraflores','2026-11-06 00:42:59','2026-11-06 00:42:59'),(33,4,'Lima','Lima','San Martín de Porres','2026-11-06 00:43:00','2026-11-06 00:43:00'),(34,4,'Lima','Lima','San Miguel','2026-11-06 00:43:00','2026-11-06 00:43:00'),(35,4,'Lima','Lima','Santa Anita','2026-11-06 00:43:00','2026-11-06 00:43:00'),(36,4,'Lima','Lima','Surquillo','2026-11-06 00:43:00','2026-11-06 00:43:00'),(37,4,'Lima','Lima','Villa El Salvador','2026-11-06 00:43:00','2026-11-06 00:43:00'),(38,4,'Lima','Lima','Villa María del Triunfo','2026-11-06 00:43:00','2026-11-06 00:43:00'),(39,1,'Áncash','Huaraz','Huaraz','2026-11-06 00:43:00','2026-11-06 00:43:00'),(40,1,'Cajamarca','Cajamarca','Cajamarca','2026-11-06 00:43:00','2026-11-06 00:43:00'),(41,1,'La Libertad','Trujillo','Trujillo','2026-11-06 00:43:00','2026-11-06 00:43:00'),(42,1,'Lambayeque','Chiclayo','Chiclayo','2026-11-06 00:43:00','2026-11-06 00:43:00'),(43,1,'Lambayeque','Lambayeque','Lambayeque','2026-11-06 00:43:00','2026-11-06 00:43:00'),(44,1,'Piura','Piura','Piura','2026-11-06 00:43:00','2026-11-06 00:43:00'),(45,1,'Piura','Sullana','Sullana','2026-11-06 00:43:00','2026-11-06 00:43:00'),(46,1,'Tumbes','Tumbes','Tumbes','2026-11-06 00:43:00','2026-11-06 00:43:00'),(47,2,'Arequipa','Arequipa','Arequipa','2026-11-06 00:43:00','2026-11-06 00:43:00'),(48,2,'Cusco','Cusco','Cusco','2026-11-06 00:43:00','2026-11-06 00:43:00'),(49,2,'Moquegua','Mariscal Nieto','Moquegua','2026-11-06 00:43:00','2026-11-06 00:43:00'),(50,2,'Puno','Puno','Puno','2026-11-06 00:43:00','2026-11-06 00:43:00'),(51,2,'Tacna','Tacna','Tacna','2026-11-06 00:43:00','2026-11-06 00:43:00');
/*!40000 ALTER TABLE `zona_coberturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zonas`
--

DROP TABLE IF EXISTS `zonas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `zonas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#6B7280',
  `departamentos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`departamentos`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zonas_nombre_unique` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zonas`
--

LOCK TABLES `zonas` WRITE;
/*!40000 ALTER TABLE `zonas` DISABLE KEYS */;
INSERT INTO `zonas` VALUES (1,'Norte','#E30613','[\"\\u00c1ncash\",\"Cajamarca\",\"La Libertad\",\"Lambayeque\",\"Piura\",\"Tumbes\",\"Amazonas\",\"Apur\\u00edmac\",\"Madre de Dios\"]','2026-05-11 08:18:48','2026-11-06 01:17:27'),(2,'Sur','#16A34A','[\"Arequipa\",\"Cusco\",\"Moquegua\",\"Puno\",\"Tacna\"]','2026-05-11 08:18:48','2026-11-06 00:42:59'),(3,'Centro','#2563EB','[\"Ayacucho\",\"Hu\\u00e1nuco\",\"Ica\",\"Jun\\u00edn\",\"Loreto\",\"Ucayali\",\"Huancavelica\",\"Pasco\",\"San Mart\\u00edn\"]','2026-05-11 08:18:48','2026-11-06 01:17:37'),(4,'Lima','#7C3AED','[\"Lima\",\"Callao\"]','2026-05-11 08:18:48','2026-05-11 08:18:48'),(5,'Lima Provincias','#EA580C','[]','2026-11-06 00:42:59','2026-11-06 00:42:59');
/*!40000 ALTER TABLE `zonas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'clarolocales'
--

--
-- Dumping routines for database 'clarolocales'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-05 15:28:34
