-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-10-2025 a las 00:59:41
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
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tipos`
--

CREATE TABLE `producto_tipos` (
  `id_producto` int(11) NOT NULL,
  `id_tipo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permisos`
--

CREATE TABLE `rol_permisos` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipodocumento`
--

CREATE TABLE `tipodocumento` (
  `id_tipodocumento` int(11) NOT NULL,
  `nombre_tipodocumento` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_roles`
--

CREATE TABLE `usuario_roles` (
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipodocumento`
--
ALTER TABLE `tipodocumento`
  MODIFY `id_tipodocumento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiposcomprobantepago`
--
ALTER TABLE `tiposcomprobantepago`
  MODIFY `id_tipo_comprobante` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiposmovimientoinventario`
--
ALTER TABLE `tiposmovimientoinventario`
  MODIFY `id_tipo_movimiento` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

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
