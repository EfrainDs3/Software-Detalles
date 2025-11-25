-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-11-2025 a las 17:49:34
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `detalles`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `almacenes`
--

CREATE TABLE `almacenes` (
  `id_almacen` int(11) NOT NULL,
  `nombre_almacen` varchar(100) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `almacenes`
--

INSERT INTO `almacenes` (`id_almacen`, `nombre_almacen`, `ubicacion`) VALUES
(1, 'Almacen 2', 'Av Principal 123'),
(2, 'Almacen 3', 'Av Principal 123');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aperturascaja`
--

CREATE TABLE `aperturascaja` (
  `id_apertura` bigint(20) NOT NULL,
  `id_caja` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_apertura` date NOT NULL,
  `hora_apertura` time NOT NULL,
  `monto_inicial` decimal(38,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora`
--

CREATE TABLE `bitacora` (
  `id_bitacora` bigint(20) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `accion` varchar(100) NOT NULL,
  `detalle_accion` varchar(600) DEFAULT NULL,
  `ip_origen` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cajas`
--

CREATE TABLE `cajas` (
  `id_caja` int(11) NOT NULL,
  `nombre_caja` varchar(255) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `estado` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoriasproducto`
--

CREATE TABLE `categoriasproducto` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoriasproducto`
--

INSERT INTO `categoriasproducto` (`id_categoria`, `nombre_categoria`) VALUES
(2, 'Accesorio'),
(1, 'Calzado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cierrescaja`
--

CREATE TABLE `cierrescaja` (
  `id_cierre` bigint(20) NOT NULL,
  `id_apertura` bigint(20) NOT NULL,
  `id_caja` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_cierre` date NOT NULL,
  `hora_cierre` time NOT NULL,
  `monto_final` decimal(38,2) NOT NULL,
  `monto_esperado` decimal(38,2) NOT NULL,
  `diferencia` decimal(38,2) NOT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `id_tipodocumento` int(11) DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id_cliente`, `nombre`, `apellido`, `id_tipodocumento`, `numero_documento`, `direccion`, `telefono`, `email`, `fecha_registro`, `estado`) VALUES
(1, 'Santiago Efrain', 'Torres Murrieta ', 1, '75859114', 'Jr Tnaga Mandapio', '964983465', 'santiagotorresmurrieta@gmail.com', '2025-10-08 03:30:17', 1),
(2, 'ANGGELO LUCCIANO', 'URBINA ESPINOZA', 2, '20154544667', 'JR. RICARDO PALMA 444', '-', NULL, '2025-11-11 17:39:19', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprobantespago`
--

CREATE TABLE `comprobantespago` (
  `id_comprobante` bigint(20) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_tipo_comprobante` int(11) NOT NULL,
  `numero_comprobante` varchar(20) NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `igv` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Emitido',
  `motivo_anulacion` text DEFAULT NULL,
  `id_apertura` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallescomprobantepago`
--

CREATE TABLE `detallescomprobantepago` (
  `id_detalle_comprobante` bigint(20) NOT NULL,
  `id_comprobante` bigint(20) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento_aplicado` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal_linea` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallespedidocompra`
--

CREATE TABLE `detallespedidocompra` (
  `id_detalle_pedido` bigint(20) NOT NULL,
  `id_pedido_compra` bigint(20) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad_pedida` int(11) NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `subtotal_linea` decimal(10,2) NOT NULL,
  `cantidad_recibida` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `etiquetas_producto_ia`
--

CREATE TABLE `etiquetas_producto_ia` (
  `id_etiqueta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `etiqueta` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_recomendaciones`
--

CREATE TABLE `historial_recomendaciones` (
  `id_recomendacion` bigint(20) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_producto_recomendado` int(11) NOT NULL,
  `fecha_recomendacion` datetime NOT NULL DEFAULT current_timestamp(),
  `contexto` varchar(255) DEFAULT NULL,
  `fue_comprobado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_inventario` bigint(20) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_almacen` int(11) NOT NULL,
  `cantidad_stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `fecha_ultima_actualizacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_inventario`, `id_producto`, `id_almacen`, `cantidad_stock`, `stock_minimo`, `fecha_ultima_actualizacion`) VALUES
(4, 1, 1, 5, 1, '2025-11-24 16:47:29'),
(5, 2, 1, 2, 1, '2025-10-30 06:28:14'),
(6, 5, 1, 3, 0, '2025-11-24 16:49:15'),
(7, 9, 1, 0, 0, '2025-11-20 03:13:53'),
(8, 10, 1, 4, 3, '2025-11-20 05:01:54'),
(9, 4, 1, 0, 0, '2025-11-20 05:02:37'),
(10, 12, 1, 0, 0, '2025-11-20 15:33:19'),
(11, 6, 2, 5, 0, '2025-11-24 14:32:45'),
(12, 11, 1, 0, 0, '2025-11-24 15:53:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario_talla`
--

CREATE TABLE `inventario_talla` (
  `id_inventario_talla` bigint(20) NOT NULL,
  `cantidad_stock` int(11) NOT NULL,
  `fecha_ultima_actualizacion` datetime(6) NOT NULL,
  `stock_minimo` int(11) NOT NULL,
  `talla` varchar(64) DEFAULT NULL,
  `id_inventario` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario_talla`
--

INSERT INTO `inventario_talla` (`id_inventario_talla`, `cantidad_stock`, `fecha_ultima_actualizacion`, `stock_minimo`, `talla`, `id_inventario`) VALUES
(1, 5, '2025-11-24 16:47:29.000000', 2, '35', 4),
(2, 5, '2025-11-24 14:32:45.000000', 3, '42', 11),
(3, 3, '2025-11-24 16:49:15.000000', 5, '12', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcasproducto`
--

CREATE TABLE `marcasproducto` (
  `id_marca` int(11) NOT NULL,
  `nombre_marca` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marcasproducto`
--

INSERT INTO `marcasproducto` (`id_marca`, `nombre_marca`) VALUES
(1, 'Nike');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materialesproducto`
--

CREATE TABLE `materialesproducto` (
  `id_material` int(11) NOT NULL,
  `nombre_material` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materialesproducto`
--

INSERT INTO `materialesproducto` (`id_material`, `nombre_material`) VALUES
(1, 'Cuero');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelos`
--

CREATE TABLE `modelos` (
  `id_modelo` int(11) NOT NULL,
  `nombre_modelo` varchar(100) NOT NULL,
  `id_marca` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id_modelo`, `nombre_modelo`, `id_marca`) VALUES
(1, 'Air Max720', 1),
(2, 'Air Max710', 1),
(3, 'Modelo123', 1),
(4, 'Modelo2', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientoscaja`
--

CREATE TABLE `movimientoscaja` (
  `id_movimiento_caja` bigint(20) NOT NULL,
  `id_caja` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo_movimiento` varchar(10) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_comprobante` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientosinventario`
--

CREATE TABLE `movimientosinventario` (
  `id_movimiento_inv` bigint(20) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_almacen` int(11) DEFAULT NULL,
  `id_tipo_movimiento` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  `observaciones` varchar(500) DEFAULT NULL,
  `referencia_doc` varchar(50) DEFAULT NULL,
  `talla` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientosinventario`
--

INSERT INTO `movimientosinventario` (`id_movimiento_inv`, `id_producto`, `id_almacen`, `id_tipo_movimiento`, `cantidad`, `fecha_movimiento`, `id_usuario`, `observaciones`, `referencia_doc`, `talla`) VALUES
(1, 1, 1, 2, 1, '2025-10-30 06:00:12', 4, NULL, NULL, NULL),
(2, 2, 1, 3, 2, '2025-10-30 06:28:14', 4, NULL, NULL, NULL),
(3, 1, 1, 1, 1, '2025-10-30 06:36:34', 4, NULL, NULL, NULL),
(4, 1, 1, 2, 1, '2025-10-30 06:40:20', 4, NULL, NULL, NULL),
(5, 1, 1, 2, 1, '2025-10-30 06:42:02', 4, NULL, NULL, NULL),
(6, 1, 1, 3, 1, '2025-11-17 22:17:17', 4, NULL, NULL, '35'),
(7, 1, 1, 2, 1, '2025-11-17 22:17:37', 4, NULL, NULL, '35'),
(8, 5, 1, 2, 1, '2025-11-19 13:09:36', 4, NULL, NULL, NULL),
(9, 10, 1, 2, 5, '2025-11-20 03:32:14', 4, NULL, NULL, NULL),
(10, 10, 1, 1, 6, '2025-11-20 04:27:48', 4, NULL, NULL, NULL),
(11, 10, 1, 2, 1, '2025-11-20 04:36:25', 4, NULL, NULL, NULL),
(12, 10, 1, 2, 1, '2025-11-20 05:01:29', 4, NULL, NULL, NULL),
(13, 10, 1, 2, 1, '2025-11-20 05:01:44', 4, NULL, NULL, NULL),
(14, 10, 1, 2, 1, '2025-11-20 05:01:54', 4, NULL, NULL, NULL),
(15, 6, 2, 2, 1, '2025-11-20 15:59:53', 4, NULL, NULL, '42'),
(16, 6, 2, 2, 4, '2025-11-20 16:00:23', 4, NULL, NULL, '42'),
(17, 6, 2, 1, 4, '2025-11-24 14:32:21', 4, NULL, NULL, '42'),
(18, 6, 2, 2, 4, '2025-11-24 14:32:45', 4, NULL, NULL, '42'),
(19, 1, 1, 2, 3, '2025-11-24 16:47:29', 4, '', '', '35'),
(20, 5, 1, 1, 5, '2025-11-24 16:48:15', 4, '', '', '12'),
(21, 5, 1, 2, 10, '2025-11-24 16:48:52', 4, '', '', '12'),
(22, 5, 1, 1, 7, '2025-11-24 16:49:15', 4, NULL, NULL, '12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagoscomprobante`
--

CREATE TABLE `pagoscomprobante` (
  `id_pago` bigint(20) NOT NULL,
  `id_comprobante` bigint(20) NOT NULL,
  `id_tipopago` int(11) NOT NULL,
  `monto_pagado` decimal(10,2) NOT NULL,
  `referencia_pago` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidoscompra`
--

CREATE TABLE `pedidoscompra` (
  `id_pedido_compra` bigint(20) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_pedido` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_entrega_esperada` date DEFAULT NULL,
  `estado_pedido` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `total_pedido` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfiles_estilo_cliente`
--

CREATE TABLE `perfiles_estilo_cliente` (
  `id_cliente` int(11) NOT NULL,
  `paleta_color_predominante` varchar(50) DEFAULT NULL,
  `estilos_preferidos` text DEFAULT NULL,
  `tallas_frecuentes` varchar(100) DEFAULT NULL,
  `fecha_ultimo_analisis` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id_permiso` int(11) NOT NULL,
  `nombre_permiso` varchar(150) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modulo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`, `descripcion`, `estado`, `fecha_creacion`, `fecha_actualizacion`, `modulo`) VALUES
(1, 'Acceder al dashboard', 'Permite visualizar el panel principal', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 05:06:44', 'Dashboard'),
(2, 'Ver reportes', 'Permite ingresar al módulo de reportes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Reportes'),
(3, 'Generar reportes', 'Permite generar o exportar reportes cuando estén disponibles', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Reportes'),
(4, 'Ver auditoría', 'Permite ingresar al módulo de auditoría', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Auditoría'),
(5, 'Consultar registros de auditoría', 'Permite revisar historial y logs del sistema', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Auditoría'),
(6, 'Ver usuarios', 'Permite visualizar la lista de usuarios', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 05:06:44', 'Usuarios'),
(7, 'Registrar usuarios', 'Crear nuevos usuarios del sistema', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Usuarios'),
(8, 'Editar usuarios', 'Actualizar datos generales y roles de usuarios', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Usuarios'),
(9, 'Eliminar usuarios', 'Eliminar o desactivar usuarios', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Usuarios'),
(11, 'Registrar roles', 'Crear nuevos roles', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Roles'),
(12, 'Editar roles', 'Actualizar nombre, descripción o permisos del rol', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Roles'),
(13, 'Cambiar estado de roles', 'Activar o suspender roles existentes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Roles'),
(14, 'Eliminar roles', 'Eliminar roles del sistema', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Roles'),
(15, 'Ver permisos', 'Permite visualizar permisos del sistema', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 05:06:44', 'Permisos'),
(16, 'Registrar permisos', 'Crear nuevos permisos funcionales', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Permisos'),
(17, 'Editar permisos', 'Modificar nombre, módulo o descripción de permisos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Permisos'),
(18, 'Eliminar permisos', 'Eliminar permisos que no estén asignados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Permisos'),
(19, 'Ver auditoría de permisos', 'Revisar historial de cambios de permisos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Permisos'),
(20, 'Gestionar asignaciones de permisos', 'Asignar o revocar permisos para roles', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Permisos'),
(21, 'Ver permisos por usuario', 'Consultar permisos efectivos de un usuario', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Permisos'),
(22, 'Ver calzados', 'Listar calzados registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(23, 'Registrar calzados', 'Crear nuevos calzados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(24, 'Editar calzados', 'Actualizar información de calzados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(25, 'Eliminar calzados', 'Eliminar calzados del catálogo', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(26, 'Ver accesorios', 'Listar accesorios registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(27, 'Registrar accesorios', 'Crear nuevos accesorios', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(28, 'Editar accesorios', 'Actualizar información de accesorios', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(29, 'Eliminar accesorios', 'Eliminar accesorios del catálogo', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Productos'),
(30, 'Ver catálogos maestros', 'Listar marcas, modelos, materiales, unidades y tipos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Catálogos'),
(31, 'Gestionar marcas', 'Crear, editar o eliminar marcas', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Catálogos'),
(32, 'Gestionar modelos', 'Crear, editar o eliminar modelos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Catálogos'),
(33, 'Gestionar materiales', 'Crear, editar o eliminar materiales', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Catálogos'),
(34, 'Gestionar unidades', 'Crear, editar o eliminar unidades de medida', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Catálogos'),
(35, 'Gestionar tipos de producto', 'Crear, editar o eliminar tipos de producto', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Catálogos'),
(36, 'Ver clientes', 'Listar clientes activos e inactivos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Clientes'),
(37, 'Registrar clientes', 'Crear clientes desde el módulo interno', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Clientes'),
(38, 'Editar clientes', 'Actualizar datos personales de clientes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Clientes'),
(39, 'Eliminar clientes', 'Eliminar o inactivar clientes registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Clientes'),
(40, 'Reactivar clientes', 'Reactivar clientes inactivos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Clientes'),
(41, 'Buscar clientes', 'Utilizar el buscador interno de clientes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Clientes'),
(42, 'Consultar RENIEC', 'Consumir el servicio RENIEC desde el sistema', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Integraciones'),
(43, 'Probar integración RENIEC', 'Ejecutar consultas de prueba al servicio RENIEC', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Integraciones'),
(44, 'Ver proveedores', 'Listar proveedores registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(45, 'Registrar proveedores', 'Crear nuevos proveedores', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(46, 'Editar proveedores', 'Actualizar datos de proveedores', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(47, 'Eliminar proveedores', 'Eliminar proveedores del sistema', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(48, 'Buscar proveedores', 'Buscar proveedores por nombre, comercio o RUC', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(49, 'Consultar proveedores por rubro', 'Filtrar proveedores por rubro', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(50, 'Verificar RUC de proveedor', 'Verificar existencia de RUC registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Proveedores'),
(51, 'Ver ventas', 'Listar ventas realizadas', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Ventas'),
(52, 'Registrar ventas', 'Permite registrar nuevas ventas', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 05:06:44', 'Ventas'),
(53, 'Editar ventas', 'Actualizar información de ventas registradas', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Ventas'),
(54, 'Emitir comprobantes de venta', 'Generar comprobantes PDF desde las ventas', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Ventas'),
(55, 'Ver estado de caja', 'Consultar el estado actual de las cajas', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Caja'),
(56, 'Aperturar caja', 'Registrar la apertura de una caja', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Caja'),
(57, 'Cerrar caja', 'Registrar el cierre de caja', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Caja'),
(58, 'Ver historial de caja', 'Listar movimientos y aperturas de caja', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Caja'),
(59, 'Listar cajas activas', 'Consultar cajas disponibles para apertura', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Caja'),
(60, 'Registrar cajas', 'Crear nuevas cajas registradoras', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Caja'),
(61, 'Ver compras', 'Acceder al módulo de compras', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Compras'),
(62, 'Gestionar compras', 'Permite registrar órdenes de compra', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 05:06:44', 'Compras'),
(63, 'Ver inventario', 'Listar inventario central y por almacén', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(64, 'Registrar inventario en almacén', 'Registrar productos en un almacén', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(65, 'Ajustar stock de inventario', 'Aplicar ajustes manuales de stock', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(66, 'Transferir stock entre almacenes', 'Transferir productos entre almacenes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(67, 'Ver productos con stock bajo', 'Listar productos con stock mínimo', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(68, 'Ver movimientos de inventario', 'Consultar movimientos registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(69, 'Ver kardex de producto', 'Consultar kardex de un producto', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(70, 'Ver estadísticas de inventario', 'Consultar métricas globales de inventario', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(71, 'Listar productos disponibles para inventario', 'Listar productos sin ubicación en almacén', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(72, 'Listar almacenes para inventario', 'Obtener almacenes disponibles en inventario', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(73, 'Listar tipos de movimiento de inventario', 'Consultar tipos de movimiento admitidos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Inventario'),
(74, 'Ver almacenes', 'Listar almacenes registrados', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Almacenes'),
(75, 'Registrar almacenes', 'Crear nuevos almacenes físicos', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Almacenes'),
(76, 'Editar almacenes', 'Actualizar datos de almacenes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Almacenes'),
(77, 'Eliminar almacenes', 'Eliminar almacenes existentes', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Almacenes'),
(78, 'Verificar nombre de almacén', 'Comprobar disponibilidad de nombres de almacén', 'ACTIVO', '2025-11-06 00:05:53', '2025-11-06 00:05:53', 'Almacenes'),
(79, 'Gestionar usuarios', 'Permite crear, editar y eliminar usuarios', 'ACTIVO', '2025-11-06 05:06:44', '2025-11-11 17:30:48', 'Usuarios'),
(80, 'Gestionar roles', 'Permite crear, editar y eliminar roles', 'ACTIVO', '2025-11-06 05:06:44', '2025-11-11 17:30:48', 'Roles'),
(81, 'Gestionar permisos', 'Permite asignar y revocar permisos', 'ACTIVO', '2025-11-06 05:06:44', '2025-11-11 17:30:48', 'Permisos'),
(82, 'Gestionar inventario', 'Permite gestionar stock y movimientos', 'ACTIVO', '2025-11-06 05:06:44', '2025-11-11 17:30:48', 'Inventario'),
(83, 'Gestionar clientes', 'Permite crear, editar y eliminar clientes', 'ACTIVO', '2025-11-11 17:30:48', '2025-11-11 17:30:48', 'Clientes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos_auditoria`
--

CREATE TABLE `permisos_auditoria` (
  `id_auditoria` bigint(20) NOT NULL,
  `id_permiso` bigint(20) DEFAULT NULL,
  `accion` varchar(40) NOT NULL,
  `detalle` varchar(500) DEFAULT NULL,
  `usuario` varchar(100) DEFAULT NULL,
  `permiso_codigo` varchar(100) DEFAULT NULL,
  `permiso_nombre` varchar(150) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos_auditoria`
--

INSERT INTO `permisos_auditoria` (`id_auditoria`, `id_permiso`, `accion`, `detalle`, `usuario`, `permiso_codigo`, `permiso_nombre`, `fecha`) VALUES
(1, 1, 'ACTUALIZACION', 'Se actualizó el permiso', 'anonymousUser', 'DASHBOARD_VIEW', 'Acceder al dashboard', '2025-10-15 05:00:01'),
(2, 1, 'ACTUALIZACION', 'Se actualizó el permiso', 'anonymousUser', 'DASHBOARD_VIEW', 'Acceder al dashboard', '2025-10-15 05:00:47'),
(3, 2, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', NULL, 'Ver usuarios', '2025-11-05 23:54:33'),
(4, 6, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', NULL, 'Ver permisos', '2025-11-05 23:54:33'),
(5, 8, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', NULL, 'Registrar ventas', '2025-11-05 23:54:33'),
(6, 2, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'anonymousUser', NULL, 'Ver usuarios', '2025-11-05 23:54:44'),
(7, 6, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'anonymousUser', NULL, 'Ver permisos', '2025-11-05 23:54:44'),
(8, 8, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'anonymousUser', NULL, 'Registrar ventas', '2025-11-05 23:54:44'),
(9, 1, 'ROL_ACTUALIZADO', 'Asignado al rol Almacenero', 'anonymousUser', NULL, 'Acceder al dashboard', '2025-11-05 23:54:54'),
(10, 3, 'ROL_ACTUALIZADO', 'Asignado al rol Almacenero', 'anonymousUser', NULL, 'Gestionar usuarios', '2025-11-05 23:54:54'),
(11, 5, 'ROL_ACTUALIZADO', 'Asignado al rol Almacenero', 'anonymousUser', NULL, 'Gestionar roles', '2025-11-05 23:54:54'),
(12, 7, 'ROL_ACTUALIZADO', 'Asignado al rol Almacenero', 'anonymousUser', NULL, 'Gestionar permisos', '2025-11-05 23:54:54'),
(13, 10, 'ROL_ACTUALIZADO', 'Asignado al rol Almacenero', 'anonymousUser', NULL, 'Gestionar compras', '2025-11-05 23:54:54'),
(14, 1, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', NULL, 'Acceder al dashboard', '2025-11-05 23:56:06'),
(15, 3, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', NULL, 'Gestionar usuarios', '2025-11-05 23:56:06'),
(16, 5, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', NULL, 'Gestionar roles', '2025-11-05 23:56:06'),
(17, 7, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', NULL, 'Gestionar permisos', '2025-11-05 23:56:06'),
(18, 9, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', NULL, 'Gestionar inventario', '2025-11-05 23:56:06'),
(19, 10, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', NULL, 'Gestionar compras', '2025-11-05 23:56:06'),
(20, 3, 'ROL_ACTUALIZADO', 'Asignado al rol Cajero', 'anonymousUser', NULL, 'Gestionar usuarios', '2025-11-05 23:56:38'),
(21, 5, 'ROL_ACTUALIZADO', 'Asignado al rol Cajero', 'anonymousUser', NULL, 'Gestionar roles', '2025-11-05 23:56:38'),
(22, 7, 'ROL_ACTUALIZADO', 'Asignado al rol Cajero', 'anonymousUser', NULL, 'Gestionar permisos', '2025-11-05 23:56:38'),
(23, 9, 'ROL_ACTUALIZADO', 'Asignado al rol Cajero', 'anonymousUser', NULL, 'Gestionar inventario', '2025-11-05 23:56:38'),
(24, 10, 'ROL_ACTUALIZADO', 'Asignado al rol Cajero', 'anonymousUser', NULL, 'Gestionar compras', '2025-11-05 23:56:38'),
(25, 3, 'ROL_ACTUALIZADO', 'Removido del rol Cajero', 'anonymousUser', NULL, 'Gestionar usuarios', '2025-11-05 23:56:45'),
(26, 5, 'ROL_ACTUALIZADO', 'Removido del rol Cajero', 'anonymousUser', NULL, 'Gestionar roles', '2025-11-05 23:56:45'),
(27, 7, 'ROL_ACTUALIZADO', 'Removido del rol Cajero', 'anonymousUser', NULL, 'Gestionar permisos', '2025-11-05 23:56:45'),
(28, 9, 'ROL_ACTUALIZADO', 'Removido del rol Cajero', 'anonymousUser', NULL, 'Gestionar inventario', '2025-11-05 23:56:45'),
(29, 10, 'ROL_ACTUALIZADO', 'Removido del rol Cajero', 'anonymousUser', NULL, 'Gestionar compras', '2025-11-05 23:56:45'),
(30, 8, 'ROL_ACTUALIZADO', 'Removido del rol Cajero', 'anonymousUser', NULL, 'Registrar ventas', '2025-11-06 01:12:09'),
(31, 8, 'ROL_ACTUALIZADO', 'Asignado al rol Gerente', 'anonymousUser', NULL, 'Registrar ventas', '2025-11-06 01:15:42'),
(32, 2, 'ROL_ACTUALIZADO', 'Removido del rol Gerente', 'anonymousUser', NULL, 'Ver usuarios', '2025-11-06 01:15:42'),
(33, 3, 'ROL_ACTUALIZADO', 'Removido del rol Gerente', 'anonymousUser', NULL, 'Gestionar usuarios', '2025-11-06 01:15:42'),
(34, 6, 'ROL_ACTUALIZADO', 'Removido del rol Gerente', 'anonymousUser', NULL, 'Ver permisos', '2025-11-06 01:15:42'),
(35, 1, 'ROL_ACTUALIZADO', 'Asignado al rol Vendedor', 'EfrainDs3', NULL, 'Acceder al dashboard', '2025-11-06 02:17:40'),
(36, 1, 'ROL_ACTUALIZADO', 'Asignado al rol Cajero', 'EfrainDs3', NULL, 'Acceder al dashboard', '2025-11-06 02:39:43'),
(37, 2, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver reportes', '2025-11-06 05:14:53'),
(38, 3, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Generar reportes', '2025-11-06 05:14:53'),
(39, 4, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver auditoría', '2025-11-06 05:14:53'),
(40, 5, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Consultar registros de auditoría', '2025-11-06 05:14:53'),
(41, 7, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar usuarios', '2025-11-06 05:14:53'),
(42, 8, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar usuarios', '2025-11-06 05:14:53'),
(43, 9, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar usuarios', '2025-11-06 05:14:53'),
(44, 11, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar roles', '2025-11-06 05:14:53'),
(45, 12, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar roles', '2025-11-06 05:14:53'),
(46, 13, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Cambiar estado de roles', '2025-11-06 05:14:53'),
(47, 14, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar roles', '2025-11-06 05:14:53'),
(48, 16, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar permisos', '2025-11-06 05:14:53'),
(49, 17, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar permisos', '2025-11-06 05:14:53'),
(50, 18, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar permisos', '2025-11-06 05:14:53'),
(51, 19, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver auditoría de permisos', '2025-11-06 05:14:53'),
(52, 20, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Gestionar asignaciones de permisos', '2025-11-06 05:14:53'),
(53, 21, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver permisos por usuario', '2025-11-06 05:14:53'),
(54, 22, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver calzados', '2025-11-06 05:14:53'),
(55, 23, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar calzados', '2025-11-06 05:14:53'),
(56, 24, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar calzados', '2025-11-06 05:14:53'),
(57, 25, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar calzados', '2025-11-06 05:14:53'),
(58, 26, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver accesorios', '2025-11-06 05:14:53'),
(59, 27, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar accesorios', '2025-11-06 05:14:53'),
(60, 28, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar accesorios', '2025-11-06 05:14:53'),
(61, 29, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar accesorios', '2025-11-06 05:14:53'),
(62, 30, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver catálogos maestros', '2025-11-06 05:14:53'),
(63, 31, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Gestionar marcas', '2025-11-06 05:14:53'),
(64, 32, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Gestionar modelos', '2025-11-06 05:14:53'),
(65, 33, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Gestionar materiales', '2025-11-06 05:14:53'),
(66, 34, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Gestionar unidades', '2025-11-06 05:14:53'),
(67, 35, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Gestionar tipos de producto', '2025-11-06 05:14:53'),
(68, 36, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver clientes', '2025-11-06 05:14:53'),
(69, 37, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar clientes', '2025-11-06 05:14:54'),
(70, 38, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar clientes', '2025-11-06 05:14:54'),
(71, 39, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar clientes', '2025-11-06 05:14:54'),
(72, 40, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Reactivar clientes', '2025-11-06 05:14:54'),
(73, 41, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Buscar clientes', '2025-11-06 05:14:54'),
(74, 42, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Consultar RENIEC', '2025-11-06 05:14:54'),
(75, 43, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Probar integración RENIEC', '2025-11-06 05:14:54'),
(76, 44, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver proveedores', '2025-11-06 05:14:54'),
(77, 45, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar proveedores', '2025-11-06 05:14:54'),
(78, 46, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar proveedores', '2025-11-06 05:14:54'),
(79, 47, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar proveedores', '2025-11-06 05:14:54'),
(80, 48, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Buscar proveedores', '2025-11-06 05:14:54'),
(81, 49, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Consultar proveedores por rubro', '2025-11-06 05:14:54'),
(82, 50, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Verificar RUC de proveedor', '2025-11-06 05:14:54'),
(83, 51, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver ventas', '2025-11-06 05:14:54'),
(84, 53, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar ventas', '2025-11-06 05:14:54'),
(85, 54, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Emitir comprobantes de venta', '2025-11-06 05:14:54'),
(86, 55, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver estado de caja', '2025-11-06 05:14:54'),
(87, 56, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Aperturar caja', '2025-11-06 05:14:54'),
(88, 57, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Cerrar caja', '2025-11-06 05:14:54'),
(89, 58, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver historial de caja', '2025-11-06 05:14:54'),
(90, 59, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Listar cajas activas', '2025-11-06 05:14:54'),
(91, 60, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar cajas', '2025-11-06 05:14:54'),
(92, 61, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver compras', '2025-11-06 05:14:54'),
(93, 63, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver inventario', '2025-11-06 05:14:54'),
(94, 64, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar inventario en almacén', '2025-11-06 05:14:54'),
(95, 65, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ajustar stock de inventario', '2025-11-06 05:14:54'),
(96, 66, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Transferir stock entre almacenes', '2025-11-06 05:14:54'),
(97, 67, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver productos con stock bajo', '2025-11-06 05:14:54'),
(98, 68, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver movimientos de inventario', '2025-11-06 05:14:54'),
(99, 69, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver kardex de producto', '2025-11-06 05:14:54'),
(100, 70, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver estadísticas de inventario', '2025-11-06 05:14:54'),
(101, 71, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Listar productos disponibles para inventario', '2025-11-06 05:14:54'),
(102, 72, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Listar almacenes para inventario', '2025-11-06 05:14:54'),
(103, 73, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Listar tipos de movimiento de inventario', '2025-11-06 05:14:54'),
(104, 74, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Ver almacenes', '2025-11-06 05:14:54'),
(105, 75, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Registrar almacenes', '2025-11-06 05:14:54'),
(106, 76, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Editar almacenes', '2025-11-06 05:14:54'),
(107, 77, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Eliminar almacenes', '2025-11-06 05:14:54'),
(108, 78, 'ROL_ACTUALIZADO', 'Asignado al rol Administrador', 'EfrainDs3', NULL, 'Verificar nombre de almacén', '2025-11-06 05:14:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `descripcion` varchar(600) DEFAULT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `costo_compra` decimal(10,2) DEFAULT NULL,
  `codigo_barra` varchar(50) DEFAULT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  `id_unidad_medida` int(11) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `dimensiones` varchar(50) DEFAULT NULL,
  `peso_gramos` int(11) DEFAULT NULL,
  `estado` bit(1) NOT NULL,
  `id_modelo` int(11) DEFAULT NULL,
  `id_material` int(11) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre_producto`, `descripcion`, `precio_venta`, `costo_compra`, `codigo_barra`, `id_categoria`, `id_proveedor`, `id_unidad_medida`, `color`, `tipo`, `dimensiones`, `peso_gramos`, `estado`, `id_modelo`, `id_material`, `imagen`) VALUES
(1, 'Zapatillas Deportivas Nike', 'ZapatillaNiker', 200.00, 205.00, NULL, 1, 2, 1, 'Blanco', 'Hombre', '30 x 20 x 12 cm', 1000, b'1', 2, 1, NULL),
(2, 'Cinturón de Cuero', 'Cinturon de cuero', 200.00, 2000.00, NULL, 2, 2, 2, 'Blanco', 'Hombre', '120 x 4 x 0.5 cm', 11, b'1', 2, 1, NULL),
(4, 'Zapatillas Deportivas Nike', 'Zapato123', 200.00, 200.00, NULL, 1, 2, 1, 'Blanco', 'Hombre', '30 x 20 x 12 cm', 2000, b'1', 3, 1, NULL),
(5, 'Alexander123', NULL, 122.00, NULL, NULL, 2, 2, 2, 'Blanco', 'Hombre', '120 x 4 x 0.5 cm', 11, b'1', 3, 1, NULL),
(6, 'Zapatilla Nike123', 'Zapatilla deportiva Nike', 250.00, 210.00, NULL, 1, 2, 1, 'Blanco y Rojo', 'Niños', '30x20', 1000, b'1', 3, 1, NULL),
(9, 'Zapatillas1', NULL, 311.00, 313.00, NULL, 1, 2, 1, 'Blanco', 'Hombre', NULL, NULL, b'1', 4, 1, '/img/upload/productos/calzados/zapatillas1.jpg'),
(10, 'Acc1', NULL, 200.00, 300.00, NULL, 2, 2, 1, 'Blanco', 'Hombre', '120 x 4 x 0.5 cm', 11, b'1', 2, 1, NULL),
(11, 'Zapato1', NULL, 100.00, 200.00, NULL, 1, 2, 1, 'Negro', 'Hombre', NULL, NULL, b'1', 2, 1, '/img/upload/productos/calzados/zapato1.jpg'),
(12, 'Zapatillas3', NULL, 200.00, 100.00, NULL, 1, 2, 1, 'Blanco', 'Hombre', NULL, NULL, b'1', 2, 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tipos`
--

CREATE TABLE `producto_tipos` (
  `id_producto` int(11) NOT NULL,
  `id_tipo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_tipos`
--

INSERT INTO `producto_tipos` (`id_producto`, `id_tipo`) VALUES
(1, 1),
(2, 1),
(4, 1),
(5, 1),
(6, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `razon_social` varchar(255) NOT NULL,
  `nombre_comercial` varchar(100) DEFAULT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `rubro` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `estado` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id_proveedor`, `razon_social`, `nombre_comercial`, `ruc`, `rubro`, `direccion`, `telefono`, `email`, `estado`) VALUES
(2, 'Zapatos', 'Nike', '12345678911', 'C', '1defefeffe', '999999999', 'dokiperrosisurro12@gmail.com', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor_metodospago`
--

CREATE TABLE `proveedor_metodospago` (
  `id_proveedor` int(11) NOT NULL,
  `id_tipopago` int(11) NOT NULL,
  `datos_pago` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `estado`, `descripcion`) VALUES
(1, 'Administrador', 1, 'Acceso total al sistema'),
(6, 'Gerente', 1, 'Gestión de operaciones y reportes'),
(7, 'Supervisor', 1, 'Supervisión general de las operaciones'),
(8, 'Analista', 1, 'Acceso a reportes y estadísticas'),
(9, 'Vendedor', 1, 'Acceso a ventas y clientes'),
(10, 'Cajero', 1, 'Gestión de caja y cobranzas'),
(11, 'Almacenero', 1, 'Gestión de inventario y almacén'),
(12, 'Compras', 1, 'Gestión de proveedores y compras');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permisos`
--

CREATE TABLE `rol_permisos` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(255) DEFAULT NULL,
  `id_permiso` int(11) NOT NULL,
  `nombre_permiso` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_permisos`
--

INSERT INTO `rol_permisos` (`id_rol`, `nombre_rol`, `id_permiso`, `nombre_permiso`) VALUES
(1, NULL, 1, NULL),
(1, NULL, 2, NULL),
(1, NULL, 3, NULL),
(1, NULL, 4, NULL),
(1, NULL, 5, NULL),
(1, NULL, 6, NULL),
(1, NULL, 7, NULL),
(1, NULL, 8, NULL),
(1, NULL, 9, NULL),
(1, NULL, 11, NULL),
(1, NULL, 12, NULL),
(1, NULL, 13, NULL),
(1, NULL, 14, NULL),
(1, NULL, 15, NULL),
(1, NULL, 16, NULL),
(1, NULL, 17, NULL),
(1, NULL, 18, NULL),
(1, NULL, 19, NULL),
(1, NULL, 20, NULL),
(1, NULL, 21, NULL),
(1, NULL, 22, NULL),
(1, NULL, 23, NULL),
(1, NULL, 24, NULL),
(1, NULL, 25, NULL),
(1, NULL, 26, NULL),
(1, NULL, 27, NULL),
(1, NULL, 28, NULL),
(1, NULL, 29, NULL),
(1, NULL, 30, NULL),
(1, NULL, 31, NULL),
(1, NULL, 32, NULL),
(1, NULL, 33, NULL),
(1, NULL, 34, NULL),
(1, NULL, 35, NULL),
(1, NULL, 36, NULL),
(1, NULL, 37, NULL),
(1, NULL, 38, NULL),
(1, NULL, 39, NULL),
(1, NULL, 40, NULL),
(1, NULL, 41, NULL),
(1, NULL, 42, NULL),
(1, NULL, 43, NULL),
(1, NULL, 44, NULL),
(1, NULL, 45, NULL),
(1, NULL, 46, NULL),
(1, NULL, 47, NULL),
(1, NULL, 48, NULL),
(1, NULL, 49, NULL),
(1, NULL, 50, NULL),
(1, NULL, 51, NULL),
(1, NULL, 52, NULL),
(1, NULL, 53, NULL),
(1, NULL, 54, NULL),
(1, NULL, 55, NULL),
(1, NULL, 56, NULL),
(1, NULL, 57, NULL),
(1, NULL, 58, NULL),
(1, NULL, 59, NULL),
(1, NULL, 60, NULL),
(1, NULL, 61, NULL),
(1, NULL, 62, NULL),
(1, NULL, 63, NULL),
(1, NULL, 64, NULL),
(1, NULL, 65, NULL),
(1, NULL, 66, NULL),
(1, NULL, 67, NULL),
(1, NULL, 68, NULL),
(1, NULL, 69, NULL),
(1, NULL, 70, NULL),
(1, NULL, 71, NULL),
(1, NULL, 72, NULL),
(1, NULL, 73, NULL),
(1, NULL, 74, NULL),
(1, NULL, 75, NULL),
(1, NULL, 76, NULL),
(1, NULL, 77, NULL),
(1, NULL, 78, NULL),
(1, NULL, 79, NULL),
(1, NULL, 80, NULL),
(1, NULL, 81, NULL),
(1, NULL, 82, NULL),
(1, NULL, 83, NULL),
(6, NULL, 1, NULL),
(6, NULL, 6, NULL),
(6, NULL, 15, NULL),
(6, NULL, 79, NULL),
(6, NULL, 83, NULL),
(7, NULL, 6, NULL),
(8, NULL, 1, NULL),
(9, NULL, 52, NULL),
(9, NULL, 83, NULL),
(10, NULL, 1, NULL),
(10, NULL, 22, NULL),
(10, NULL, 23, NULL),
(10, NULL, 24, NULL),
(10, NULL, 25, NULL),
(10, NULL, 26, NULL),
(10, NULL, 27, NULL),
(10, NULL, 28, NULL),
(10, NULL, 29, NULL),
(10, NULL, 30, NULL),
(10, NULL, 31, NULL),
(10, NULL, 32, NULL),
(10, NULL, 33, NULL),
(10, NULL, 34, NULL),
(10, NULL, 35, NULL),
(10, NULL, 52, NULL),
(11, NULL, 82, NULL),
(12, NULL, 62, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tallas`
--

CREATE TABLE `tallas` (
  `id_producto` int(11) NOT NULL,
  `talla` varchar(10) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `costo_compra` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tallas`
--

INSERT INTO `tallas` (`id_producto`, `talla`, `precio_venta`, `costo_compra`) VALUES
(1, '35', 200.00, 205.00),
(2, 'M', 200.00, 2000.00),
(4, '12', 200.00, 200.00),
(5, '12', 122.00, NULL),
(6, '42', 250.00, 210.00),
(9, '31', 311.00, 313.00),
(11, '20', 100.00, 200.00),
(12, '30', 200.00, 100.00),
(12, '31', 200.00, 100.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipodocumento`
--

CREATE TABLE `tipodocumento` (
  `id_tipodocumento` int(11) NOT NULL,
  `nombre_tipodocumento` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipodocumento`
--

INSERT INTO `tipodocumento` (`id_tipodocumento`, `nombre_tipodocumento`) VALUES
(1, 'DNI'),
(2, 'RUC');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiposcomprobantepago`
--

CREATE TABLE `tiposcomprobantepago` (
  `id_tipo_comprobante` int(11) NOT NULL,
  `nombre_tipo` varchar(50) NOT NULL,
  `serie_documento` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiposmovimientoinventario`
--

CREATE TABLE `tiposmovimientoinventario` (
  `id_tipo_movimiento` int(11) NOT NULL,
  `nombre_tipo` varchar(50) NOT NULL,
  `es_entrada` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tiposmovimientoinventario`
--

INSERT INTO `tiposmovimientoinventario` (`id_tipo_movimiento`, `nombre_tipo`, `es_entrada`) VALUES
(1, 'Salida', 0),
(2, 'Entrada', 1),
(3, 'Entrada - Registro Inicial', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipospago`
--

CREATE TABLE `tipospago` (
  `id_tipopago` int(11) NOT NULL,
  `tipo_pago` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiposproducto`
--

CREATE TABLE `tiposproducto` (
  `id_tipo` int(11) NOT NULL,
  `nombre_tipo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tiposproducto`
--

INSERT INTO `tiposproducto` (`id_tipo`, `nombre_tipo`) VALUES
(1, 'Deportivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidadesmedida`
--

CREATE TABLE `unidadesmedida` (
  `id_unidad_medida` int(11) NOT NULL,
  `nombre_unidad` varchar(50) NOT NULL,
  `abreviatura` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unidadesmedida`
--

INSERT INTO `unidadesmedida` (`id_unidad_medida`, `nombre_unidad`, `abreviatura`) VALUES
(1, 'Unidadd', 'Und'),
(2, 'Caja', 'Caj');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `id_tipodocumento` int(11) DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña_hash` varchar(255) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_ultima_sesion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombres`, `apellidos`, `id_tipodocumento`, `numero_documento`, `celular`, `direccion`, `username`, `email`, `contraseña_hash`, `estado`, `fecha_creacion`, `fecha_ultima_sesion`) VALUES
(4, 'Santiago Efrain', 'Torres Murrieta', 1, '75859114', '964983465', 'juan pablo de la cruz', 'EfrainDs3', 'santiagotorresmurrieta@gmail.com', '$2a$10$6587YGgYKDWyAywi61/cB.TFF.U6LrTWacPvzWaBZ9xoVsuGGy.4.', 1, '2025-10-08 15:17:29', '2025-11-25 01:38:02'),
(5, 'Anggelo Lucciano', 'Urbina Espinoza', 1, '72863068', '903 171 836', 'juan pablo de la cruz', 'Ubuntu', 'anggelolucciano21@gmail.com', '$2a$10$VwIkH6380fJV0oPcQXNKiO1oU8zqQ1vKsc0uWSkm.vtCWoTPHzzMG', 1, '2025-10-08 15:46:19', '2025-11-25 01:38:39'),
(6, 'Anlly Luz', 'Riva Yomona', 1, '72010812', '999888777', 'Calle Nueva 456', 'Anlly', 'al.rivayo@unsm.edu.pe', '$2a$10$E.7vIdGVqCYy5eoYIBjF/uYDym2.b6B6U6.TlT9uKd0tFUl4DMfJW', 1, '2025-10-08 15:57:57', '2025-11-06 01:16:25'),
(12, 'Danny Alexander', 'Garcia Salas', 1, '98765432', '999888777', 'juan pablo de la cruz', 'Dingui', 'ia.jadrixgr26@gmail.com', '$2a$10$xKxtzv1ECV/74oi69b9hPubeUZgmSnrAUoxmjmSaz0NyeVOYE9BHW', 1, '2025-10-08 16:27:52', '2025-10-15 22:05:53'),
(17, 'Alex', 'Pezo', 1, '73325101', '999999999', 'Jr. Trapoto', 'arxse', 'da.pezoin@unsm.edu.pe', '$2a$10$u6dftyj8BINK8/zY5GG.TO36M86byX5s8aWraTFHw4Zit3AiA2YSi', 1, '2025-10-15 22:08:21', '2025-10-15 22:12:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_roles`
--

CREATE TABLE `usuario_roles` (
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_roles`
--

INSERT INTO `usuario_roles` (`id_usuario`, `id_rol`) VALUES
(4, 1),
(5, 10),
(6, 6),
(12, 1),
(17, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `almacenes`
--
ALTER TABLE `almacenes`
  ADD PRIMARY KEY (`id_almacen`),
  ADD UNIQUE KEY `nombre_almacen` (`nombre_almacen`);

--
-- Indices de la tabla `aperturascaja`
--
ALTER TABLE `aperturascaja`
  ADD PRIMARY KEY (`id_apertura`),
  ADD UNIQUE KEY `id_caja` (`id_caja`,`fecha_apertura`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD PRIMARY KEY (`id_bitacora`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `cajas`
--
ALTER TABLE `cajas`
  ADD PRIMARY KEY (`id_caja`),
  ADD UNIQUE KEY `nombre_caja` (`nombre_caja`);

--
-- Indices de la tabla `categoriasproducto`
--
ALTER TABLE `categoriasproducto`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre_categoria` (`nombre_categoria`);

--
-- Indices de la tabla `cierrescaja`
--
ALTER TABLE `cierrescaja`
  ADD PRIMARY KEY (`id_cierre`),
  ADD UNIQUE KEY `id_apertura` (`id_apertura`),
  ADD KEY `id_caja` (`id_caja`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `UQ_Clientes_Documento` (`id_tipodocumento`,`numero_documento`);

--
-- Indices de la tabla `comprobantespago`
--
ALTER TABLE `comprobantespago`
  ADD PRIMARY KEY (`id_comprobante`),
  ADD UNIQUE KEY `id_tipo_comprobante` (`id_tipo_comprobante`,`numero_comprobante`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `FKi9x21nkc57r4an9bqagc3lh9u` (`id_apertura`);

--
-- Indices de la tabla `detallescomprobantepago`
--
ALTER TABLE `detallescomprobantepago`
  ADD PRIMARY KEY (`id_detalle_comprobante`),
  ADD KEY `id_comprobante` (`id_comprobante`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `detallespedidocompra`
--
ALTER TABLE `detallespedidocompra`
  ADD PRIMARY KEY (`id_detalle_pedido`),
  ADD UNIQUE KEY `id_pedido_compra` (`id_pedido_compra`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `etiquetas_producto_ia`
--
ALTER TABLE `etiquetas_producto_ia`
  ADD PRIMARY KEY (`id_etiqueta`),
  ADD UNIQUE KEY `id_producto` (`id_producto`,`etiqueta`);

--
-- Indices de la tabla `historial_recomendaciones`
--
ALTER TABLE `historial_recomendaciones`
  ADD PRIMARY KEY (`id_recomendacion`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_producto_recomendado` (`id_producto_recomendado`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `id_producto` (`id_producto`,`id_almacen`),
  ADD KEY `id_almacen` (`id_almacen`);

--
-- Indices de la tabla `inventario_talla`
--
ALTER TABLE `inventario_talla`
  ADD PRIMARY KEY (`id_inventario_talla`),
  ADD KEY `FKa1pg9fk706b0rk23nqj2n7rsy` (`id_inventario`);

--
-- Indices de la tabla `marcasproducto`
--
ALTER TABLE `marcasproducto`
  ADD PRIMARY KEY (`id_marca`),
  ADD UNIQUE KEY `nombre_marca` (`nombre_marca`);

--
-- Indices de la tabla `materialesproducto`
--
ALTER TABLE `materialesproducto`
  ADD PRIMARY KEY (`id_material`),
  ADD UNIQUE KEY `nombre_material` (`nombre_material`);

--
-- Indices de la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD PRIMARY KEY (`id_modelo`),
  ADD KEY `id_marca` (`id_marca`);

--
-- Indices de la tabla `movimientoscaja`
--
ALTER TABLE `movimientoscaja`
  ADD PRIMARY KEY (`id_movimiento_caja`),
  ADD KEY `id_caja` (`id_caja`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_comprobante` (`id_comprobante`);

--
-- Indices de la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  ADD PRIMARY KEY (`id_movimiento_inv`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_almacen` (`id_almacen`),
  ADD KEY `id_tipo_movimiento` (`id_tipo_movimiento`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `pagoscomprobante`
--
ALTER TABLE `pagoscomprobante`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_comprobante` (`id_comprobante`),
  ADD KEY `id_tipopago` (`id_tipopago`);

--
-- Indices de la tabla `pedidoscompra`
--
ALTER TABLE `pedidoscompra`
  ADD PRIMARY KEY (`id_pedido_compra`),
  ADD KEY `id_proveedor` (`id_proveedor`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `perfiles_estilo_cliente`
--
ALTER TABLE `perfiles_estilo_cliente`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id_permiso`),
  ADD UNIQUE KEY `nombre_permiso` (`nombre_permiso`);

--
-- Indices de la tabla `permisos_auditoria`
--
ALTER TABLE `permisos_auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `idx_permisos_auditoria_permiso` (`id_permiso`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `codigo_barra` (`codigo_barra`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_proveedor` (`id_proveedor`),
  ADD KEY `id_modelo` (`id_modelo`),
  ADD KEY `id_material` (`id_material`),
  ADD KEY `id_unidad_medida` (`id_unidad_medida`);

--
-- Indices de la tabla `producto_tipos`
--
ALTER TABLE `producto_tipos`
  ADD PRIMARY KEY (`id_producto`,`id_tipo`),
  ADD KEY `id_tipo` (`id_tipo`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`),
  ADD UNIQUE KEY `ruc` (`ruc`);

--
-- Indices de la tabla `proveedor_metodospago`
--
ALTER TABLE `proveedor_metodospago`
  ADD PRIMARY KEY (`id_proveedor`,`id_tipopago`),
  ADD KEY `id_tipopago` (`id_tipopago`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  ADD PRIMARY KEY (`id_rol`,`id_permiso`),
  ADD KEY `id_permiso` (`id_permiso`);

--
-- Indices de la tabla `tallas`
--
ALTER TABLE `tallas`
  ADD PRIMARY KEY (`id_producto`,`talla`);

--
-- Indices de la tabla `tipodocumento`
--
ALTER TABLE `tipodocumento`
  ADD PRIMARY KEY (`id_tipodocumento`),
  ADD UNIQUE KEY `nombre_tipodocumento` (`nombre_tipodocumento`);

--
-- Indices de la tabla `tiposcomprobantepago`
--
ALTER TABLE `tiposcomprobantepago`
  ADD PRIMARY KEY (`id_tipo_comprobante`),
  ADD UNIQUE KEY `nombre_tipo` (`nombre_tipo`);

--
-- Indices de la tabla `tiposmovimientoinventario`
--
ALTER TABLE `tiposmovimientoinventario`
  ADD PRIMARY KEY (`id_tipo_movimiento`),
  ADD UNIQUE KEY `nombre_tipo` (`nombre_tipo`);

--
-- Indices de la tabla `tipospago`
--
ALTER TABLE `tipospago`
  ADD PRIMARY KEY (`id_tipopago`),
  ADD UNIQUE KEY `tipo_pago` (`tipo_pago`);

--
-- Indices de la tabla `tiposproducto`
--
ALTER TABLE `tiposproducto`
  ADD PRIMARY KEY (`id_tipo`),
  ADD UNIQUE KEY `nombre_tipo` (`nombre_tipo`);

--
-- Indices de la tabla `unidadesmedida`
--
ALTER TABLE `unidadesmedida`
  ADD PRIMARY KEY (`id_unidad_medida`),
  ADD UNIQUE KEY `nombre_unidad` (`nombre_unidad`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `UQ_Usuarios_Documento` (`id_tipodocumento`,`numero_documento`);

--
-- Indices de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD PRIMARY KEY (`id_usuario`,`id_rol`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `almacenes`
--
ALTER TABLE `almacenes`
  MODIFY `id_almacen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `aperturascaja`
--
ALTER TABLE `aperturascaja`
  MODIFY `id_apertura` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  MODIFY `id_bitacora` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cajas`
--
ALTER TABLE `cajas`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoriasproducto`
--
ALTER TABLE `categoriasproducto`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cierrescaja`
--
ALTER TABLE `cierrescaja`
  MODIFY `id_cierre` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `comprobantespago`
--
ALTER TABLE `comprobantespago`
  MODIFY `id_comprobante` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detallescomprobantepago`
--
ALTER TABLE `detallescomprobantepago`
  MODIFY `id_detalle_comprobante` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detallespedidocompra`
--
ALTER TABLE `detallespedidocompra`
  MODIFY `id_detalle_pedido` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `etiquetas_producto_ia`
--
ALTER TABLE `etiquetas_producto_ia`
  MODIFY `id_etiqueta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_recomendaciones`
--
ALTER TABLE `historial_recomendaciones`
  MODIFY `id_recomendacion` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `inventario_talla`
--
ALTER TABLE `inventario_talla`
  MODIFY `id_inventario_talla` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `marcasproducto`
--
ALTER TABLE `marcasproducto`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `materialesproducto`
--
ALTER TABLE `materialesproducto`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id_modelo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `movimientoscaja`
--
ALTER TABLE `movimientoscaja`
  MODIFY `id_movimiento_caja` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  MODIFY `id_movimiento_inv` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `pagoscomprobante`
--
ALTER TABLE `pagoscomprobante`
  MODIFY `id_pago` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidoscompra`
--
ALTER TABLE `pedidoscompra`
  MODIFY `id_pedido_compra` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT de la tabla `permisos_auditoria`
--
ALTER TABLE `permisos_auditoria`
  MODIFY `id_auditoria` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `tipodocumento`
--
ALTER TABLE `tipodocumento`
  MODIFY `id_tipodocumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tiposcomprobantepago`
--
ALTER TABLE `tiposcomprobantepago`
  MODIFY `id_tipo_comprobante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiposmovimientoinventario`
--
ALTER TABLE `tiposmovimientoinventario`
  MODIFY `id_tipo_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipospago`
--
ALTER TABLE `tipospago`
  MODIFY `id_tipopago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiposproducto`
--
ALTER TABLE `tiposproducto`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `unidadesmedida`
--
ALTER TABLE `unidadesmedida`
  MODIFY `id_unidad_medida` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `aperturascaja`
--
ALTER TABLE `aperturascaja`
  ADD CONSTRAINT `aperturascaja_ibfk_1` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`),
  ADD CONSTRAINT `aperturascaja_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `bitacora`
--
ALTER TABLE `bitacora`
  ADD CONSTRAINT `bitacora_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `cierrescaja`
--
ALTER TABLE `cierrescaja`
  ADD CONSTRAINT `cierrescaja_ibfk_1` FOREIGN KEY (`id_apertura`) REFERENCES `aperturascaja` (`id_apertura`),
  ADD CONSTRAINT `cierrescaja_ibfk_2` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`),
  ADD CONSTRAINT `cierrescaja_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `FK_Clientes_TipoDocumento` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipodocumento` (`id_tipodocumento`);

--
-- Filtros para la tabla `comprobantespago`
--
ALTER TABLE `comprobantespago`
  ADD CONSTRAINT `FKi9x21nkc57r4an9bqagc3lh9u` FOREIGN KEY (`id_apertura`) REFERENCES `aperturascaja` (`id_apertura`),
  ADD CONSTRAINT `comprobantespago_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  ADD CONSTRAINT `comprobantespago_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `comprobantespago_ibfk_3` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tiposcomprobantepago` (`id_tipo_comprobante`);

--
-- Filtros para la tabla `detallescomprobantepago`
--
ALTER TABLE `detallescomprobantepago`
  ADD CONSTRAINT `detallescomprobantepago_ibfk_1` FOREIGN KEY (`id_comprobante`) REFERENCES `comprobantespago` (`id_comprobante`) ON DELETE CASCADE,
  ADD CONSTRAINT `detallescomprobantepago_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `detallespedidocompra`
--
ALTER TABLE `detallespedidocompra`
  ADD CONSTRAINT `detallespedidocompra_ibfk_1` FOREIGN KEY (`id_pedido_compra`) REFERENCES `pedidoscompra` (`id_pedido_compra`) ON DELETE CASCADE,
  ADD CONSTRAINT `detallespedidocompra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `etiquetas_producto_ia`
--
ALTER TABLE `etiquetas_producto_ia`
  ADD CONSTRAINT `etiquetas_producto_ia_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `historial_recomendaciones`
--
ALTER TABLE `historial_recomendaciones`
  ADD CONSTRAINT `historial_recomendaciones_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_recomendaciones_ibfk_2` FOREIGN KEY (`id_producto_recomendado`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `inventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventario_ibfk_2` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario_talla`
--
ALTER TABLE `inventario_talla`
  ADD CONSTRAINT `FKa1pg9fk706b0rk23nqj2n7rsy` FOREIGN KEY (`id_inventario`) REFERENCES `inventario` (`id_inventario`);

--
-- Filtros para la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD CONSTRAINT `modelos_ibfk_1` FOREIGN KEY (`id_marca`) REFERENCES `marcasproducto` (`id_marca`);

--
-- Filtros para la tabla `movimientoscaja`
--
ALTER TABLE `movimientoscaja`
  ADD CONSTRAINT `movimientoscaja_ibfk_1` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`),
  ADD CONSTRAINT `movimientoscaja_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `movimientoscaja_ibfk_3` FOREIGN KEY (`id_comprobante`) REFERENCES `comprobantespago` (`id_comprobante`);

--
-- Filtros para la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  ADD CONSTRAINT `movimientosinventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `movimientosinventario_ibfk_2` FOREIGN KEY (`id_almacen`) REFERENCES `almacenes` (`id_almacen`),
  ADD CONSTRAINT `movimientosinventario_ibfk_3` FOREIGN KEY (`id_tipo_movimiento`) REFERENCES `tiposmovimientoinventario` (`id_tipo_movimiento`),
  ADD CONSTRAINT `movimientosinventario_ibfk_4` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `pagoscomprobante`
--
ALTER TABLE `pagoscomprobante`
  ADD CONSTRAINT `pagoscomprobante_ibfk_1` FOREIGN KEY (`id_comprobante`) REFERENCES `comprobantespago` (`id_comprobante`) ON DELETE CASCADE,
  ADD CONSTRAINT `pagoscomprobante_ibfk_2` FOREIGN KEY (`id_tipopago`) REFERENCES `tipospago` (`id_tipopago`);

--
-- Filtros para la tabla `pedidoscompra`
--
ALTER TABLE `pedidoscompra`
  ADD CONSTRAINT `pedidoscompra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`),
  ADD CONSTRAINT `pedidoscompra_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `perfiles_estilo_cliente`
--
ALTER TABLE `perfiles_estilo_cliente`
  ADD CONSTRAINT `perfiles_estilo_cliente_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoriasproducto` (`id_categoria`),
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`),
  ADD CONSTRAINT `productos_ibfk_4` FOREIGN KEY (`id_modelo`) REFERENCES `modelos` (`id_modelo`),
  ADD CONSTRAINT `productos_ibfk_5` FOREIGN KEY (`id_material`) REFERENCES `materialesproducto` (`id_material`),
  ADD CONSTRAINT `productos_ibfk_6` FOREIGN KEY (`id_unidad_medida`) REFERENCES `unidadesmedida` (`id_unidad_medida`);

--
-- Filtros para la tabla `producto_tipos`
--
ALTER TABLE `producto_tipos`
  ADD CONSTRAINT `producto_tipos_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_tipos_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `tiposproducto` (`id_tipo`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proveedor_metodospago`
--
ALTER TABLE `proveedor_metodospago`
  ADD CONSTRAINT `proveedor_metodospago_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE CASCADE,
  ADD CONSTRAINT `proveedor_metodospago_ibfk_2` FOREIGN KEY (`id_tipopago`) REFERENCES `tipospago` (`id_tipopago`) ON DELETE CASCADE;

--
-- Filtros para la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  ADD CONSTRAINT `rol_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE,
  ADD CONSTRAINT `rol_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tallas`
--
ALTER TABLE `tallas`
  ADD CONSTRAINT `tallas_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `FK_Usuarios_TipoDocumento` FOREIGN KEY (`id_tipodocumento`) REFERENCES `tipodocumento` (`id_tipodocumento`);

--
-- Filtros para la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD CONSTRAINT `usuario_roles_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario_roles_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
