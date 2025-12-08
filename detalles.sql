-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 08-12-2025 a las 23:26:48
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

--
-- Volcado de datos para la tabla `aperturascaja`
--

INSERT INTO `aperturascaja` (`id_apertura`, `id_caja`, `id_usuario`, `fecha_apertura`, `hora_apertura`, `monto_inicial`) VALUES
(1, 1, 4, '2025-11-26', '12:49:13', 180.00),
(2, 2, 4, '2025-12-04', '09:07:25', 200.00);

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

--
-- Volcado de datos para la tabla `cajas`
--

INSERT INTO `cajas` (`id_caja`, `nombre_caja`, `ubicacion`, `estado`) VALUES
(1, 'Caja 1', 'del centro', 'Cerrada'),
(2, 'Caja 2', 'del costado izquierdo', 'Abierta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `id_carrito` bigint(20) NOT NULL,
  `fecha_creacion` datetime(6) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`id_carrito`, `fecha_creacion`, `id_usuario`) VALUES
(1, '2025-11-28 21:31:05.000000', 18);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_detalle`
--

CREATE TABLE `carrito_detalle` (
  `id_detalle` bigint(20) NOT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `id_carrito` bigint(20) NOT NULL,
  `id_producto` bigint(20) NOT NULL
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

--
-- Volcado de datos para la tabla `cierrescaja`
--

INSERT INTO `cierrescaja` (`id_cierre`, `id_apertura`, `id_caja`, `id_usuario`, `fecha_cierre`, `hora_cierre`, `monto_final`, `monto_esperado`, `diferencia`, `observaciones`) VALUES
(1, 1, 1, 4, '2025-11-26', '12:50:16', 500.00, 580.00, -80.00, 'Cierre de turno manual.');

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
(2, 'ANGGELO LUCCIANO', 'URBINA ESPINOZA', 2, '20154544667', 'JR. RICARDO PALMA 444', '-', NULL, '2025-11-11 17:39:19', 0),
(3, 'Anlly Luz', 'Riva', 1, '72010812', '-', '-', NULL, '2025-11-26 17:48:19', 1);

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
  `id_apertura` bigint(20) NOT NULL,
  `id_venta_original` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comprobantespago`
--

INSERT INTO `comprobantespago` (`id_comprobante`, `id_cliente`, `id_usuario`, `id_tipo_comprobante`, `numero_comprobante`, `fecha_emision`, `total`, `igv`, `subtotal`, `estado`, `motivo_anulacion`, `id_apertura`, `id_venta_original`) VALUES
(1, 3, 6, 1, 'B001-00000001', '2025-11-26 05:00:00', 400.00, 61.02, 338.98, 'Emitido', NULL, 1, NULL);

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
-- Estructura de tabla para la tabla `detallespedidocompra_talla`
--

CREATE TABLE `detallespedidocompra_talla` (
  `id_detalle_talla` bigint(20) NOT NULL,
  `id_detalle_pedido` bigint(20) NOT NULL,
  `talla` varchar(64) NOT NULL,
  `cantidad_pedida` int(11) NOT NULL,
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
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id_favorito` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha_agregado` datetime NOT NULL DEFAULT current_timestamp()
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
(5, 'Adidas'),
(29, 'Aldo'),
(10, 'Angel'),
(30, 'Birkenstock'),
(7, 'Boss'),
(8, 'Caterpillar'),
(6, 'Converse'),
(9, 'Crocs'),
(12, 'Daclay'),
(11, 'Dearfoams'),
(2, 'Dior'),
(4, 'FootLoose'),
(15, 'Gucci'),
(13, 'Guess'),
(26, 'H&M'),
(24, 'Hush Puppies'),
(3, 'Louis Vuitton'),
(27, 'Massimo Dutti'),
(21, 'New Balance'),
(17, 'New York Yankees'),
(1, 'Nike'),
(23, 'North Star'),
(14, 'Oakley'),
(28, 'Piazza'),
(20, 'Puma'),
(19, 'Ray-Ban'),
(22, 'Reebok'),
(16, 'Rolex'),
(18, 'Tommy Hilfiger'),
(25, 'Vans');

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
(5, 'Canvas'),
(1, 'Cuero'),
(4, 'Sintético'),
(3, 'Suede'),
(6, 'Tela'),
(2, 'Textil');

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
(1, 'Air Force 1', 1),
(2, 'Ultra Boost 22', 5),
(3, 'Air Max 270', 1),
(4, 'Modelo2', 1),
(5, 'J\'Adior', 2),
(6, 'Territory', 3),
(7, 'Fch-Rs023 Danae', 4),
(8, 'Adidas Superstar', 5),
(9, 'All Star', 6),
(10, 'Derby', 7),
(11, 'Cat', 8),
(12, 'Bayaband Clogs', 9),
(13, 'Modelo 4', 5),
(14, 'Urbana', 10),
(15, 'Footloose Kids', 4),
(16, 'Clásicos', 11),
(17, 'Crocs Kids', 9),
(18, 'Daclay Kids', 12),
(19, 'Laurel Slg', 13),
(20, 'Holbrook', 14),
(21, 'Blondie', 15),
(22, 'GG Supreme', 15),
(23, 'Sky-Dweller', 16),
(24, 'Eyewear', 15),
(25, 'Crosstown', 7),
(26, '9Forty MLB', 17),
(27, 'Everyday', 1),
(28, 'Essential', 18),
(29, 'Heritage86', 1),
(30, 'Aviator Junior', 19),
(31, 'Cali Court', 20),
(32, '574 Core', 21),
(33, 'Classic Leather', 22),
(34, 'Compus', 23),
(35, 'Memory Foam', 24),
(36, 'Ward', 25),
(37, 'Chuck Taylor', 6),
(38, 'Pump', 26),
(39, 'Destalonado', 27),
(40, 'Pump', 28),
(41, 'Tela Sandal', 29),
(42, 'Arizona', 30);

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
  `id_tipopago` int(11) DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado_pedido` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `total_pedido` decimal(10,2) NOT NULL DEFAULT 0.00,
  `aplica_igv` tinyint(1) NOT NULL DEFAULT 1
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
  `imagen` varchar(255) DEFAULT NULL,
  `sexo_tipo` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre_producto`, `descripcion`, `precio_venta`, `costo_compra`, `codigo_barra`, `id_categoria`, `id_proveedor`, `id_unidad_medida`, `color`, `tipo`, `dimensiones`, `peso_gramos`, `estado`, `id_modelo`, `id_material`, `imagen`, `sexo_tipo`) VALUES
(1, 'Zapatillas Nike Air Force 1 Mujer', 'Zapatilla deportiva para mujer con diseño clásico y acabado en cuero sintético, ideal para uso diario gracias a su comodidad, resistencia y estilo urbano.', 379.00, 280.00, '7891234567012', 1, 1, 1, 'Blanco', 'MUJER', NULL, NULL, b'1', 1, 1, '/img/Upload/productos/zapatillas-nike-air-force-1-mujer.jpg', 'MUJER'),
(2, 'Zapatillas Urbanas North Star Campus Azul Mujer', 'Zapato casual cómodo con diseño minimalista y suela flexible.', 189.00, 130.00, '7892234567042', 1, 1, 1, 'Azul', 'MUJER', NULL, NULL, b'1', 34, 1, '/img/Upload/productos/zapatillas-urbanas-north-star-campus-azul-mujer.jpg', 'MUJER'),
(3, 'Tacones Elegantes H&M Pump Negro', 'Tacón clásico femenino en color negro, elegante y versátil, ideal para oficina o eventos formales.', 159.00, 110.00, '7894234567014', 1, 3, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 38, 1, '/img/Upload/productos/tacones-elegantes-h-m-pump-negro.jpg', 'MUJER'),
(4, 'Botín Territory', NULL, 410.00, 359.98, NULL, 1, NULL, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 6, 1, NULL, 'MUJER'),
(5, 'Sandalias FootLoose Fch-Rs023 Danae Mujer', 'Estilo cómodo y desenfadado, con diseño sencillo ideal para el día a día, perfecta para looks informales.', 119.00, 80.00, '7895234567010', 1, 2, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 7, 4, '/img/Upload/productos/sandalias-footloose-fch-rs023-danae-mujer.jpg', 'MUJER'),
(6, 'Zapatillas Deportiva Adidas', NULL, 410.00, 380.00, NULL, 1, NULL, 1, 'Blanco', 'HOMBRE', NULL, NULL, b'1', 8, 1, NULL, 'HOMBRE'),
(7, 'Zapatos All Star', NULL, 250.00, 179.98, NULL, 1, NULL, 1, 'Negro', 'HOMBRE', NULL, NULL, b'1', 9, 1, NULL, 'HOMBRE'),
(8, 'Zapatos Elegantes BOSS', NULL, 370.00, 300.00, NULL, 1, NULL, 1, 'Negro', 'HOMBRE', NULL, NULL, b'1', 10, 1, NULL, 'HOMBRE'),
(9, 'Botas Caterpillar', NULL, 340.00, 290.00, NULL, 1, NULL, 1, 'Beige', 'HOMBRE', NULL, NULL, b'1', 11, 1, NULL, 'HOMBRE'),
(10, 'Sandalias Crogs', NULL, 370.00, 350.00, NULL, 1, NULL, 1, 'Blanco', 'HOMBRE', NULL, NULL, b'1', 12, 1, NULL, 'HOMBRE'),
(11, 'Zapatillas Adidas Niños', NULL, 110.00, 70.00, NULL, 1, NULL, 1, 'Blanco', 'NIÑO', NULL, NULL, b'1', 13, 1, NULL, 'NIÑO'),
(12, 'Zapatos Derby Kids', NULL, 130.00, 109.98, NULL, 1, NULL, 1, 'Marrón', 'NIÑO', NULL, NULL, b'1', 14, 1, NULL, 'NIÑO'),
(13, 'Zapatos Escolares Footloose Kids', NULL, 65.00, 50.00, NULL, 1, NULL, 1, 'Negro', 'NIÑO', NULL, NULL, b'1', 15, 1, NULL, 'NIÑO'),
(14, 'Pantuflas Silenciosas', NULL, 40.00, 29.00, NULL, 1, NULL, 1, 'Gris', 'NIÑO', NULL, NULL, b'1', 16, 1, NULL, 'NIÑO'),
(15, 'Sandalias Clogs Kids', NULL, 70.00, 50.00, NULL, 1, NULL, 1, 'Celeste', 'NIÑO', NULL, NULL, b'1', 17, 1, NULL, 'NIÑO'),
(16, 'Botín Daclay Kids', NULL, 60.00, 40.00, NULL, 1, NULL, 1, 'Beige', 'NIÑO', NULL, NULL, b'1', 18, 1, NULL, 'NIÑO'),
(17, 'Bolso de cuero', NULL, 100.00, 80.00, NULL, 2, NULL, 1, 'Negro', 'MUJER', '120 x 4 x 0.5 cm', 11, b'1', 5, 1, NULL, 'MUJER'),
(18, 'Billetera Guess', NULL, 290.00, 190.00, NULL, 2, NULL, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 19, 1, NULL, 'MUJER'),
(19, 'Gafas de sol Oakley Polarizado', NULL, 590.00, 470.00, NULL, 2, NULL, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 20, 1, NULL, 'MUJER'),
(20, 'Cinturón Gucci', NULL, 510.00, 460.00, NULL, 2, NULL, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 21, 1, NULL, 'MUJER'),
(21, 'Cinturón Doble G', NULL, 620.00, 570.00, NULL, 2, NULL, 1, 'Negro', 'HOMBRE', NULL, NULL, b'1', 22, 1, NULL, 'HOMBRE'),
(22, 'Reloj Rolex de Oro', NULL, 730.00, 650.00, NULL, 2, NULL, 1, 'Dorado', 'HOMBRE', NULL, NULL, b'1', 23, 1, NULL, 'HOMBRE'),
(23, 'Gafas de Sol Gucci', NULL, 670.00, 589.99, NULL, 2, NULL, 1, 'Negro', 'HOMBRE', NULL, NULL, b'1', 24, 1, NULL, 'HOMBRE'),
(24, 'Billetera Bifold clásica', NULL, 780.00, 650.00, NULL, 2, NULL, 1, 'Negro', 'HOMBRE', NULL, NULL, b'1', 25, 1, NULL, 'HOMBRE'),
(25, 'Gorra New York Yankess MLB', NULL, 160.00, 120.00, NULL, 2, NULL, 1, 'Negro', 'HOMBRE', NULL, NULL, b'1', 26, 1, NULL, 'HOMBRE'),
(26, 'Calcetín Everyday niños', NULL, 40.00, 20.00, NULL, 2, NULL, 1, 'Blanco', 'NIÑO', NULL, NULL, b'1', 27, 1, NULL, 'NIÑO'),
(27, 'Cinturón Essential Trenzado', NULL, 120.00, 90.00, NULL, 2, NULL, 1, 'Negro', 'NIÑO', NULL, NULL, b'1', 28, 1, NULL, 'NIÑO'),
(28, 'Gorra R86 Nike', NULL, 170.00, 130.00, NULL, 2, NULL, 1, 'Negro', 'NIÑO', NULL, NULL, b'1', 29, 1, NULL, 'NIÑO'),
(29, 'Gafas de sol Aviator Junior', NULL, 260.00, 180.00, NULL, 2, NULL, 1, 'Negro', 'NIÑO', NULL, NULL, b'1', 30, 1, NULL, 'NIÑO'),
(30, 'Zapatillas Adidas UltraBoost 22 Running Mujer', 'Zapatilla running para mujer con amortiguación reactiva Boost y ajuste tipo calcetín para largas distancias.', 599.00, 420.00, '7891234567024', 1, 1, 1, 'Blanco', 'MUJER', NULL, NULL, b'1', 2, 2, '/img/Upload/productos/zapatillas-adidas-ultraboost-22-running-mujer.jpg', 'MUJER'),
(31, 'Zapatillas Puma Cali Court Lth Mujer', 'Zapatilla casual femenina estilo retro con suela ancha.', 399.00, 325.00, '7891234567031', 1, 1, 1, 'Blanco', 'MUJER', NULL, NULL, b'1', 31, 1, '/img/Upload/productos/zapatillas-puma-cali-court-lth-mujer.jpg', 'MUJER'),
(32, 'Zapatillas New Balance 574 Core Mujer', 'Zapatilla lifestyle duradera y cómoda para uso diario.', 279.00, 195.00, '7891234567048', 1, 2, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 32, 3, '/img/Upload/productos/zapatillas-new-balance-574-core-mujer.jpg', 'MUJER'),
(33, 'Zapatillas Rebook Classic Leather Mujer', 'Zapatilla atemporal, cómoda y versátil para outfit diario.', 249.00, 170.00, '7891234567055', 1, 2, 1, 'Crema', 'MUJER', NULL, NULL, b'1', 33, 1, '/img/Upload/productos/zapatillas-rebook-classic-leather-mujer.jpg', 'MUJER'),
(34, 'Zapatillas Casuales Hush Puppies Lens Mujer Beige', 'Zapatilla mujer con plantilla de memory foam que absorbe el impacto al caminar otorgando mayor amortiguación y confort.', 159.00, 109.99, '7892234567035', 1, 2, 1, 'Beige', 'MUJER', NULL, NULL, b'1', 35, 4, '/img/Upload/productos/zapatillas-casuales-hush-puppies-lens-mujer-beige.jpg', 'MUJER'),
(35, 'Zapatillas Urbanas Vans Ward Mujer', 'Zapatilla casual clásica con plataforma y estilo skate.', 149.00, 115.00, '7892234567059', 1, 1, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 36, 4, '/img/Upload/productos/zapatillas-urbanas-vans-ward-mujer.jpg', 'MUJER'),
(36, 'Zapatillas Converse Chuck Taylor All Star Mujer', 'Zapatilla casual femenina con plataforma y diseño icónico.', 299.00, 210.00, '7892234567018', 1, 2, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 37, 5, '/img/Upload/productos/zapatillas-converse-chuck-taylor-all-star-mujer.jpg', 'MUJER'),
(37, 'Tacones Elegantes Mujer J\'Adior Negro', 'Tacón femenino negro estilo slingback con punta fina y detalle J\'Adior, elegante y sofisticado, ideal para eventos formales.', 2499.00, 2100.00, '7893234567023', 1, 3, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 5, 1, '/img/Upload/productos/tacones-elegantes-mujer-j-adior-negro.jpg', 'MUJER'),
(38, 'Tacones Elegantes Massimo Dutti  Negro', 'Tacón sofisticado, textura suave y look refinado para outfits casual-elegantes.', 299.00, 220.00, '7893234567020', 1, 3, 1, 'Negro', 'MUJER', NULL, NULL, b'1', 39, 1, '/img/Upload/productos/tacones-elegantes-massimo-dutti-negro.jpg', 'MUJER'),
(39, 'Tacones de Vestir Rojos Piazza', 'Un zapato que se convierte en el aliado perfecto para un look sofisticado y femenino. Ideal tanto para eventos especiales como para acompañar tu estilo en el día a día.', 179.00, 140.00, '7893234567039', 1, 3, 1, 'Rojo', 'MUJER', NULL, NULL, b'1', 40, 1, '/img/Upload/productos/tacones-de-vestir-rojos-piazza.jpg', 'MUJER'),
(40, 'Sandalias Casuales Aldo Tela Mujer', 'Sandalia de tiras cómoda y versátil.', 199.00, 135.00, '7896234567017', 1, 1, 1, 'Beige', 'MUJER', NULL, NULL, b'1', 41, 6, '/img/Upload/productos/sandalias-casuales-aldo-tela-mujer.jpg', 'MUJER'),
(41, 'Sandalias Birkenstock Arizona Mujer', 'Sandalias de doble tira ajustable, máxima comodidad para todo el día.', 319.00, 220.00, '7896234567031', 1, 1, 1, 'Gris', 'MUJER', NULL, NULL, b'1', 42, 1, '/img/Upload/productos/sandalias-birkenstock-arizona-mujer.jpg', 'MUJER');

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
(2, 2),
(3, 3),
(4, 5),
(5, 4),
(6, 1),
(7, 2),
(8, 6),
(9, 5),
(10, 4),
(11, 1),
(12, 2),
(13, 7),
(14, 8),
(15, 4),
(16, 5),
(17, 9),
(18, 10),
(19, 11),
(20, 12),
(21, 12),
(22, 13),
(23, 11),
(24, 10),
(25, 14),
(26, 15),
(27, 12),
(28, 14),
(29, 11),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 2),
(35, 2),
(36, 2),
(37, 3),
(38, 3),
(39, 3),
(40, 4),
(41, 4);

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
(1, 'Comercializadora Zapatería Andina S.A.C.', 'AndinaFoot', '20658743921', 'Distribución de calzado deportivo y casual', 'Av. Los Frutales 155 – La Molina, Lima', '942576392', 'contacto@andinafoot.pe', 1),
(2, 'Importaciones Nova Shoes E.I.R.L.', 'Nova Shoes', '20574398216', 'Venta de zapatillas y más', 'Av. Benavides 842 – Surco, Lima', '902876141', 'contacto@novashoes.pe', 1),
(3, 'Global Footwear Trading S.A.C.', 'Global Footwear', '20639481274', 'Importación de calzado formal y de vestir', 'Calle Montecarlo 229 – San Isidro, Lima', '942785026', 'info@globalfootwear.pe', 1),
(4, 'Accesorios y Estilos del Pacífico S.A.C.', 'EstiloPacífico', '20658247391', 'Accesorios de moda', 'Av. Del Ejército 380 – Miraflores, Lima', '942547390', 'ventas@estilopacifico.pe', 1),
(5, 'TrendLine Import S.A.C.', 'TrendLine', '20659123870', 'Importación de accesorios', 'Av. La Marina 1259 – San Miguel, Lima', '903489201', 'contacto@trendline.pe', 1);

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
(1, '38', 379.00, 280.00),
(2, '38', 189.00, 130.00),
(3, '38', 159.00, 110.00),
(4, '38', 410.00, 359.98),
(5, '38', 119.00, 80.00),
(6, '42', 410.00, 380.00),
(7, '42', 250.00, 179.98),
(8, '42', 370.00, 300.00),
(9, '43', 340.00, 290.00),
(10, '40', 370.00, 350.00),
(11, '12', 110.00, 70.00),
(12, '14', 130.00, 109.98),
(13, '30', 65.00, 50.00),
(14, '16', 40.00, 29.00),
(15, '14', 70.00, 50.00),
(16, '14', 60.00, 40.00),
(17, 'Única', 100.00, 80.00),
(18, 'Única', 290.00, 190.00),
(19, 'Única', 590.00, 470.00),
(20, '90cm', 510.00, 460.00),
(21, '100cm', 620.00, 570.00),
(22, '42mm', 730.00, 650.00),
(23, 'Única', 670.00, 589.99),
(24, 'Única', 780.00, 650.00),
(25, 'M', 160.00, 120.00),
(26, 'S', 40.00, 20.00),
(27, 'M', 120.00, 90.00),
(28, 'M', 170.00, 130.00),
(29, '50mm', 260.00, 180.00),
(30, '39', 599.00, 420.00),
(31, '39', 399.00, 325.00),
(32, '38', 279.00, 195.00),
(33, '39', 249.00, 170.00),
(34, '38', 159.00, 109.99),
(35, '38', 149.00, 115.00),
(36, '38', 299.00, 210.00),
(37, '38', 2499.00, 2100.00),
(38, '37', 299.00, 220.00),
(39, '38', 179.00, 140.00),
(40, '37', 199.00, 135.00),
(41, '38', 319.00, 220.00);

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
(1, 'Boleta de Venta', '0001'),
(2, 'Factura', '0002'),
(3, 'Ticket/ Venta rápida', '0003');

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
(3, 'Salida - Venta', 1),
(5, 'Entrada - Compra', 1);

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
(2, 'Efectivo'),
(1, 'Tarjeta'),
(3, 'Tranferencia');

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
(10, 'Billeteras'),
(9, 'Bolsos'),
(5, 'Botas'),
(15, 'Calcetines'),
(12, 'Cinturones'),
(11, 'Gafas de sol'),
(14, 'Gorros'),
(8, 'Pantuflas'),
(13, 'Relojes'),
(4, 'Sandalias'),
(3, 'Tacones'),
(1, 'Zapatillas Deportivas'),
(2, 'Zapatos Casuales'),
(7, 'Zapatos Escolares'),
(6, 'Zapatos Formales');

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
(4, 'Santiago Efrain', 'Torres Murrieta', 1, '75859114', '964983465', 'juan pablo de la cruz', 'EfrainDs3', 'santiagotorresmurrieta@gmail.com', '$2a$10$6587YGgYKDWyAywi61/cB.TFF.U6LrTWacPvzWaBZ9xoVsuGGy.4.', 1, '2025-10-08 15:17:29', '2025-12-08 19:25:06'),
(5, 'Anggelo Lucciano', 'Urbina Espinoza', 1, '72863068', '903 171 836', 'juan pablo de la cruz', 'Ubuntu', 'anggelolucciano21@gmail.com', '$2a$10$VwIkH6380fJV0oPcQXNKiO1oU8zqQ1vKsc0uWSkm.vtCWoTPHzzMG', 1, '2025-10-08 15:46:19', '2025-11-25 01:38:39'),
(6, 'Anlly Luz', 'Riva Yomona', 1, '72010812', '999888777', 'Calle Nueva 456', 'Anlly', 'al.rivayo@unsm.edu.pe', '$2a$10$E.7vIdGVqCYy5eoYIBjF/uYDym2.b6B6U6.TlT9uKd0tFUl4DMfJW', 1, '2025-10-08 15:57:57', '2025-11-26 17:42:14'),
(12, 'Danny Alexander', 'Garcia Salas', 1, '98765432', '999888777', 'juan pablo de la cruz', 'Dingui', 'ia.jadrixgr26@gmail.com', '$2a$10$xKxtzv1ECV/74oi69b9hPubeUZgmSnrAUoxmjmSaz0NyeVOYE9BHW', 1, '2025-10-08 16:27:52', '2025-10-15 22:05:53'),
(17, 'Alex', 'Pezo', 1, '73325101', '999999999', 'Jr. Trapoto', 'arxse', 'da.pezoin@unsm.edu.pe', '$2a$10$u6dftyj8BINK8/zY5GG.TO36M86byX5s8aWraTFHw4Zit3AiA2YSi', 1, '2025-10-15 22:08:21', '2025-10-15 22:12:18'),
(18, 'Jose Santiago', 'Ponce Riveros', NULL, NULL, NULL, NULL, 'sant10', 'ponceriverosjosesantiago@gmail.com', '$2a$10$zoYYcxBzDIxuMt3JZZGgS.clUtW43gnYdx6gzrQzjzJSYmxzd3GK.', 1, '2025-11-27 08:14:29', '2025-11-29 13:17:39'),
(20, 'Juan', 'Ponce Riveros', 1, '72129866', '918341898', NULL, 'san11', 'santi@gmail.com', '$2a$10$rAjmOHae2X3fxALc9iHdeeGEOtdbLQ1hPvr0db9MxX.srT5.4GjyK', 1, '2025-11-29 08:53:33', '2025-11-29 20:43:43');

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
(6, 1),
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
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id_carrito`),
  ADD KEY `FKkg5h8ejijsgwfr68aoggh4l8m` (`id_usuario`);

--
-- Indices de la tabla `carrito_detalle`
--
ALTER TABLE `carrito_detalle`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `FKrj8idxwbnpqm04uk9ayg7ptpw` (`id_carrito`);

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
  ADD KEY `FKi9x21nkc57r4an9bqagc3lh9u` (`id_apertura`),
  ADD KEY `FKd46g8t6xjnl4i922nywtpccee` (`id_venta_original`);

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
-- Indices de la tabla `detallespedidocompra_talla`
--
ALTER TABLE `detallespedidocompra_talla`
  ADD PRIMARY KEY (`id_detalle_talla`),
  ADD KEY `id_detalle_pedido` (`id_detalle_pedido`);

--
-- Indices de la tabla `etiquetas_producto_ia`
--
ALTER TABLE `etiquetas_producto_ia`
  ADD PRIMARY KEY (`id_etiqueta`),
  ADD UNIQUE KEY `id_producto` (`id_producto`,`etiqueta`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id_favorito`),
  ADD UNIQUE KEY `unique_user_product` (`id_usuario`,`id_producto`),
  ADD KEY `fk_favoritos_usuario` (`id_usuario`),
  ADD KEY `fk_favoritos_producto` (`id_producto`);

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
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `fk_pedidoscompra_tipospago` (`id_tipopago`);

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
  MODIFY `id_apertura` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `bitacora`
--
ALTER TABLE `bitacora`
  MODIFY `id_bitacora` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cajas`
--
ALTER TABLE `cajas`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id_carrito` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `carrito_detalle`
--
ALTER TABLE `carrito_detalle`
  MODIFY `id_detalle` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoriasproducto`
--
ALTER TABLE `categoriasproducto`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `cierrescaja`
--
ALTER TABLE `cierrescaja`
  MODIFY `id_cierre` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `comprobantespago`
--
ALTER TABLE `comprobantespago`
  MODIFY `id_comprobante` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- AUTO_INCREMENT de la tabla `detallespedidocompra_talla`
--
ALTER TABLE `detallespedidocompra_talla`
  MODIFY `id_detalle_talla` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `etiquetas_producto_ia`
--
ALTER TABLE `etiquetas_producto_ia`
  MODIFY `id_etiqueta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id_favorito` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_recomendaciones`
--
ALTER TABLE `historial_recomendaciones`
  MODIFY `id_recomendacion` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario_talla`
--
ALTER TABLE `inventario_talla`
  MODIFY `id_inventario_talla` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marcasproducto`
--
ALTER TABLE `marcasproducto`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `materialesproducto`
--
ALTER TABLE `materialesproducto`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id_modelo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

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
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id_tipo_comprobante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tiposmovimientoinventario`
--
ALTER TABLE `tiposmovimientoinventario`
  MODIFY `id_tipo_movimiento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipospago`
--
ALTER TABLE `tipospago`
  MODIFY `id_tipopago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tiposproducto`
--
ALTER TABLE `tiposproducto`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `unidadesmedida`
--
ALTER TABLE `unidadesmedida`
  MODIFY `id_unidad_medida` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `FKkg5h8ejijsgwfr68aoggh4l8m` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `carrito_detalle`
--
ALTER TABLE `carrito_detalle`
  ADD CONSTRAINT `FKrj8idxwbnpqm04uk9ayg7ptpw` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`);

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
  ADD CONSTRAINT `FKd46g8t6xjnl4i922nywtpccee` FOREIGN KEY (`id_venta_original`) REFERENCES `comprobantespago` (`id_comprobante`),
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
-- Filtros para la tabla `detallespedidocompra_talla`
--
ALTER TABLE `detallespedidocompra_talla`
  ADD CONSTRAINT `detallespedidocompra_talla_ibfk_1` FOREIGN KEY (`id_detalle_pedido`) REFERENCES `detallespedidocompra` (`id_detalle_pedido`);

--
-- Filtros para la tabla `etiquetas_producto_ia`
--
ALTER TABLE `etiquetas_producto_ia`
  ADD CONSTRAINT `etiquetas_producto_ia_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `fk_favoritos_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favoritos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_pedidoscompra_tipospago` FOREIGN KEY (`id_tipopago`) REFERENCES `tipospago` (`id_tipopago`),
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
