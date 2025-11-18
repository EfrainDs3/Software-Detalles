-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-10-2025 a las 18:27:42
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

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
  `monto_inicial` decimal(10,2) NOT NULL
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
  `nombre_caja` varchar(50) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Cerrada'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cajas`
--

INSERT INTO `cajas` (`id_caja`, `nombre_caja`, `ubicacion`, `estado`) VALUES
(1, 'caja 1', NULL, 'Cerrada');

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
  `monto_final` decimal(10,2) NOT NULL,
  `monto_esperado` decimal(10,2) NOT NULL,
  `diferencia` decimal(10,2) NOT NULL,
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
(3, 'Anggelo Lucciano ', 'Urbina Espinoza', 1, '72863068', 'Jr. San Martín 123\n', '903 171 836', 'anggelolucciano21@gmail.com', '2025-10-19 17:57:57', 1),
(4, 'Anlly Luz', 'Riva Yomona', 1, '72010812', 'Jr Lamas', '993339170', 'al.rivayo@unsm.edu.pe', '2025-10-19 17:59:08', 1),
(5, 'Efrain', 'Tores', 1, '01101067', 'Jr. San Martín 123\nOficina 01', '964983465', 'club.de.los.gatos01@gmail.com', '2025-10-19 19:39:36', 0);

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
  `motivo_anulacion` text DEFAULT NULL
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
  `id_inventario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_almacen` int(11) NOT NULL,
  `cantidad_stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `fecha_ultima_actualizacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `id_marca` int(11) NOT NULL,
  `imagen_principal` varchar(2555) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id_modelo`, `nombre_modelo`, `id_marca`, `imagen_principal`) VALUES
(1, 'Air Max720', 1, NULL),
(2, 'Air Max710', 1, '/img/upload/modelos/nike-air-max710.webp');

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
  `observaciones` text DEFAULT NULL,
  `referencia_doc` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `nombre_permiso` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `codigo` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `creado_por` varchar(100) DEFAULT NULL,
  `actualizado_por` varchar(100) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`, `descripcion`, `codigo`, `estado`, `creado_por`, `actualizado_por`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Acceder al dashboard', 'Permite visualizar el panel principal', 'DASHBOARD_VIEW', 'ACTIVO', NULL, 'anonymousUser', '2025-10-14 20:53:43', '2025-10-15 05:00:47'),
(2, 'Ver usuarios', 'Permite visualizar la lista de usuarios', 'USERS_VIEW', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(3, 'Gestionar usuarios', 'Permite crear, editar y eliminar usuarios', 'USERS_MANAGE', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(5, 'Gestionar roles', 'Permite crear, editar y eliminar roles', 'ROLES_MANAGE', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(6, 'Ver permisos', 'Permite visualizar permisos del sistema', 'PERMISSIONS_VIEW', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(7, 'Gestionar permisos', 'Permite asignar y revocar permisos', 'PERMISSIONS_MANAGE', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(8, 'Registrar ventas', 'Permite registrar nuevas ventas', 'VENTAS_REGISTRAR', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(9, 'Gestionar inventario', 'Permite gestionar stock y movimientos', 'INVENTARIO_GESTIONAR', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(10, 'Gestionar compras', 'Permite registrar órdenes de compra', 'COMPRAS_GESTIONAR', 'ACTIVO', NULL, NULL, '2025-10-14 20:53:43', '2025-10-14 20:53:43'),
(12, 'barredor', 'barredor 1234', 'XFRTTQ', 'INACTIVO', 'anonymousUser', 'anonymousUser', '2025-10-16 15:02:02', '2025-10-22 13:25:42');

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
(3, 9, 'ROL_ACTUALIZADO', 'Removido del rol Almacenero', 'anonymousUser', 'INVENTARIO_GESTIONAR', 'Gestionar inventario', '2025-10-16 03:09:00'),
(4, 1, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'DASHBOARD_VIEW', 'Acceder al dashboard', '2025-10-16 03:12:58'),
(5, 2, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'USERS_VIEW', 'Ver usuarios', '2025-10-16 03:12:58'),
(6, 3, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'USERS_MANAGE', 'Gestionar usuarios', '2025-10-16 03:12:58'),
(7, 4, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'ROLES_VIEW', 'Ver roles', '2025-10-16 03:12:58'),
(8, 5, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'ROLES_MANAGE', 'Gestionar roles', '2025-10-16 03:12:58'),
(9, 6, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'PERMISSIONS_VIEW', 'Ver permisos', '2025-10-16 03:12:58'),
(10, 7, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'PERMISSIONS_MANAGE', 'Gestionar permisos', '2025-10-16 03:12:58'),
(11, 8, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'VENTAS_REGISTRAR', 'Registrar ventas', '2025-10-16 03:12:58'),
(12, 9, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'INVENTARIO_GESTIONAR', 'Gestionar inventario', '2025-10-16 03:12:58'),
(13, 10, 'ROL_ACTUALIZADO', 'Removido del rol Administrador', 'anonymousUser', 'COMPRAS_GESTIONAR', 'Gestionar compras', '2025-10-16 03:12:58'),
(14, 2, 'ROL_ACTUALIZADO', 'Asignado al rol PruebaPermisos', 'anonymousUser', 'USERS_VIEW', 'Ver usuarios', '2025-10-16 04:25:44'),
(15, 3, 'ROL_ACTUALIZADO', 'Asignado al rol PruebaPermisos', 'anonymousUser', 'USERS_MANAGE', 'Gestionar usuarios', '2025-10-16 04:25:44'),
(16, 9, 'ROL_ACTUALIZADO', 'Asignado al rol PruebaPermisos', 'anonymousUser', 'INVENTARIO_GESTIONAR', 'Gestionar inventario', '2025-10-16 04:25:44'),
(17, 1, 'ROL_ACTUALIZADO', 'Asignado al rol PruebaPermisos', 'anonymousUser', 'DASHBOARD_VIEW', 'Acceder al dashboard', '2025-10-16 04:26:05'),
(18, 7, 'ROL_ACTUALIZADO', 'Asignado al rol PruebaPermisos', 'anonymousUser', 'PERMISSIONS_MANAGE', 'Gestionar permisos', '2025-10-16 04:26:05'),
(19, 2, 'ROL_ACTUALIZADO', 'Removido del rol PruebaPermisos', 'anonymousUser', 'USERS_VIEW', 'Ver usuarios', '2025-10-16 04:26:05'),
(20, 3, 'ROL_ACTUALIZADO', 'Removido del rol PruebaPermisos', 'anonymousUser', 'USERS_MANAGE', 'Gestionar usuarios', '2025-10-16 04:26:05'),
(21, 9, 'ROL_ACTUALIZADO', 'Removido del rol PruebaPermisos', 'anonymousUser', 'INVENTARIO_GESTIONAR', 'Gestionar inventario', '2025-10-16 04:26:05'),
(22, 11, 'CREACION', 'Se creó el permiso', 'anonymousUser', 'TEST_PERMISSION', 'Permiso de prueba', '2025-10-16 04:26:10'),
(29, 12, 'CREACION', 'Se creó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:02'),
(30, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:21'),
(31, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:27'),
(32, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:28'),
(33, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:28'),
(34, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:28'),
(35, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:28'),
(36, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:29'),
(37, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:29'),
(38, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:29'),
(39, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:29'),
(40, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:02:29'),
(41, 12, 'ACTUALIZACION', 'Se actualizó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:08'),
(42, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:15'),
(43, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:16'),
(44, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:16'),
(45, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:16'),
(46, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:16'),
(47, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:16'),
(48, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-16 15:03:17'),
(49, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:35'),
(50, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:38'),
(51, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:40'),
(52, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:41'),
(53, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:41'),
(54, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:41'),
(55, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:42'),
(56, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:42'),
(57, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:42'),
(58, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:42'),
(59, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:43'),
(60, 12, 'ELIMINACION', 'Se eliminó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:17:44'),
(61, 12, 'ACTUALIZACION', 'Se actualizó el permiso', 'anonymousUser', 'XFRTTQ', 'barredor', '2025-10-22 13:25:42');

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
  `estado` int(11) NOT NULL DEFAULT 1,
  `id_modelo` int(11) DEFAULT NULL,
  `id_material` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre_producto`, `descripcion`, `precio_venta`, `costo_compra`, `codigo_barra`, `id_categoria`, `id_proveedor`, `id_unidad_medida`, `color`, `tipo`, `dimensiones`, `peso_gramos`, `estado`, `id_modelo`, `id_material`) VALUES
(1, 'Zapatillas Deportivas Nike', 'ZapatillaNiker', 200.00, 205.00, NULL, 1, 2, 1, 'Blanco', 'Hombre', '30 x 20 x 12 cm', 1000, 1, 2, 1),
(2, 'Cinturón de Cuero Premium', 'Cinturon de cuero', 200.00, 2000.00, NULL, 2, 2, 2, 'Blanco', 'Accesorio', '120 x 4 x 0.5 cm', 11, 1, 2, 1);

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
(2, 1);

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
(8, 'Analista', 1, 'Acceso a reportes y estadísticas'),
(9, 'Vendedor', 1, 'Acceso a ventas y clientes'),
(10, 'Cajero', 1, 'Gestión de caja y cobranzas'),
(11, 'Almacenero', 1, 'Gestión de inventario y almacén'),
(12, 'Compras', 1, 'Gestión de proveedores y compras'),
(16, 'Supervisor', 1, 'Supervisión general de las operaciones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permisos`
--

CREATE TABLE `rol_permisos` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_permisos`
--

INSERT INTO `rol_permisos` (`id_rol`, `id_permiso`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(6, 1),
(6, 2),
(6, 3),
(6, 6),
(8, 1),
(8, 8),
(9, 8),
(10, 8),
(11, 9),
(12, 10),
(16, 2);

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
(2, 'M', 200.00, 2000.00);

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

--
-- Volcado de datos para la tabla `tiposcomprobantepago`
--

INSERT INTO `tiposcomprobantepago` (`id_tipo_comprobante`, `nombre_tipo`, `serie_documento`) VALUES
(1, 'Boleta de Venta', NULL),
(2, 'Factura', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiposmovimientoinventario`
--

CREATE TABLE `tiposmovimientoinventario` (
  `id_tipo_movimiento` int(11) NOT NULL,
  `nombre_tipo` varchar(50) NOT NULL,
  `es_entrada` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipospago`
--

CREATE TABLE `tipospago` (
  `id_tipopago` int(11) NOT NULL,
  `tipo_pago` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipospago`
--

INSERT INTO `tipospago` (`id_tipopago`, `tipo_pago`) VALUES
(1, 'Efectivo'),
(2, 'Tarjeta');

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
(4, 'Santiago Efrain', 'Torres Murrieta', 1, '75859114', '964983465', 'juan pablo de la cruz', 'EfrainDs3', 'santiagotorresmurrieta@gmail.com', '$2a$10$rYmgAt7/zBq5.9IEcNfwjew.bCsMzYfVlKtf/Kx4.357vLVFmyCWC', 1, '2025-10-08 15:17:29', '2025-10-22 12:33:55'),
(5, 'Anggelo Lucciano', 'Urbina Espinoza', 1, '72863068', '903 171 836', 'juan pablo de la cruz', 'Ubuntu', 'anggelolucciano21@gmail.com', '$2a$10$VwIkH6380fJV0oPcQXNKiO1oU8zqQ1vKsc0uWSkm.vtCWoTPHzzMG', 1, '2025-10-08 15:46:19', '2025-10-08 15:54:27'),
(6, 'Anlly Luz', 'Riva Yomona', 1, '72010812', '999888777', 'Calle Nueva 456', 'Anlly', 'al.rivayo@unsm.edu.pe', '$2a$10$E.7vIdGVqCYy5eoYIBjF/uYDym2.b6B6U6.TlT9uKd0tFUl4DMfJW', 1, '2025-10-08 15:57:57', '2025-10-23 14:16:42'),
(12, 'Danny Alexander', 'Garcia Salas', 1, '98765432', '999888777', 'juan pablo de la cruz', 'Dingui', 'ia.jadrixgr26@gmail.com', '$2a$10$xKxtzv1ECV/74oi69b9hPubeUZgmSnrAUoxmjmSaz0NyeVOYE9BHW', 1, '2025-10-08 16:27:52', '2025-10-16 04:28:47');

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
(5, 11),
(6, 10),
(12, 10);

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
  ADD KEY `id_usuario` (`id_usuario`);

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
  MODIFY `id_almacen` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id_inventario` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id_modelo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `movimientoscaja`
--
ALTER TABLE `movimientoscaja`
  MODIFY `id_movimiento_caja` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `movimientosinventario`
--
ALTER TABLE `movimientosinventario`
  MODIFY `id_movimiento_inv` bigint(20) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `permisos_auditoria`
--
ALTER TABLE `permisos_auditoria`
  MODIFY `id_auditoria` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `tipodocumento`
--
ALTER TABLE `tipodocumento`
  MODIFY `id_tipodocumento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tiposcomprobantepago`
--
ALTER TABLE `tiposcomprobantepago`
  MODIFY `id_tipo_comprobante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tiposmovimientoinventario`
--
ALTER TABLE `tiposmovimientoinventario`
  MODIFY `id_tipo_movimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipospago`
--
ALTER TABLE `tipospago`
  MODIFY `id_tipopago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

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
