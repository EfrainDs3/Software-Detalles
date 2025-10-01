-- Creaci�n y selecci�n de la Base de Datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DETALLES')
BEGIN
    CREATE DATABASE DETALLES;
END
GO

USE DETALLES;
GO

-- =================================================================
-- M�DULO 1: GESTI�N DE USUARIOS, ROLES Y PERMISOS (RBAC)
-- =================================================================

-- Tabla para definir los roles del sistema.
CREATE TABLE Roles (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE, -- Ej: 'Administrador', 'Vendedor', 'Jefe de almacen'
    estado BIT NOT NULL DEFAULT 1, -- 1 para activo, 0 para inactivo
    descripcion VARCHAR(255)
);
GO

-- Almacena cada acci�n espec�fica que se puede realizar en el sistema.
CREATE TABLE Permisos (
    id_permiso INT IDENTITY(1,1) PRIMARY KEY,
    nombre_permiso VARCHAR(100) NOT NULL UNIQUE, -- Ej: 'crear_producto', 'editar_stock', 'ver_reportes'
    descripcion VARCHAR(255)
);
GO

-- Un rol puede tener muchos permisos.
CREATE TABLE Rol_Permisos (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso), -- Clave primaria compuesta para evitar duplicados.
    CONSTRAINT FK_RolPermisos_Roles FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
    CONSTRAINT FK_RolPermisos_Permisos FOREIGN KEY (id_permiso) REFERENCES Permisos(id_permiso) ON DELETE CASCADE
);
GO

-- Para definir los tipos de documento de identidad (DNI, RUC, Pasaporte, etc.)
CREATE TABLE TipoDocumento (
    id_tipodocumento INT IDENTITY(1,1) PRIMARY KEY,
    nombre_tipodocumento VARCHAR(50) NOT NULL UNIQUE
);
GO

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    id_tipodocumento INT,
    numero_documento VARCHAR(20),
    celular VARCHAR(20),
    direccion VARCHAR(255),
    username VARCHAR(50) NOT NULL UNIQUE,    
    email VARCHAR(100) NOT NULL UNIQUE,    
    contrase�a_hash VARCHAR(255) NOT NULL, -- El HASH de la contrase�a, no el texto plano por seguridad
    estado BIT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_ultima_sesion DATETIME,
    CONSTRAINT FK_Usuarios_TipoDocumento FOREIGN KEY (id_tipodocumento) REFERENCES TipoDocumento(id_tipodocumento),
    CONSTRAINT UQ_Usuarios_Documento UNIQUE (id_tipodocumento, numero_documento)
);
GO

-- Un usuario puede tener uno o m�s roles.
CREATE TABLE Usuario_Roles (
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    PRIMARY KEY (id_usuario, id_rol), -- Clave primaria compuesta.
    CONSTRAINT FK_UsuarioRoles_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT FK_UsuarioRoles_Roles FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE
);
GO

-- Tabla para auditor�a
CREATE TABLE Bitacora (
    id_bitacora BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT,
    fecha_hora DATETIME NOT NULL DEFAULT GETDATE(),
    accion VARCHAR(100) NOT NULL,
    detalle_accion NVARCHAR(600),
    ip_origen VARCHAR(45),
    CONSTRAINT FK_Bitacora_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

-- =================================================================
-- M�DULO 2: GESTI�N DE CLIENTES Y PROVEEDORES
-- =================================================================

CREATE TABLE Clientes (
    id_cliente INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    id_tipodocumento INT,
    numero_documento VARCHAR(20),
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100),
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    estado BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Clientes_TipoDocumento FOREIGN KEY (id_tipodocumento) REFERENCES TipoDocumento(id_tipodocumento),
    CONSTRAINT UQ_Clientes_Documento UNIQUE (id_tipodocumento, numero_documento)
);
GO

CREATE TABLE Proveedores (
    id_proveedor INT IDENTITY(1,1) PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL, -- Nombre legal de la empresa
    nombre_comercial VARCHAR(100), -- Nombre con el que se le conoce
    ruc VARCHAR(20) UNIQUE,
    rubro VARCHAR(100), -- Ej: 'Calzado', 'Accesorios', 'Servicios'
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(100)
);
GO

-- =================================================================
-- M�DULO 3: GESTI�N DE PRODUCTOS E INVENTARIO
-- =================================================================

CREATE TABLE CategoriasProducto (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);
GO

CREATE TABLE MarcasProducto (
    id_marca INT IDENTITY(1,1) PRIMARY KEY,
    nombre_marca VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE Modelos (
    id_modelo INT IDENTITY(1,1) PRIMARY KEY,
    nombre_modelo VARCHAR(100) NOT NULL,
    id_marca INT NOT NULL, -- Un modelo pertenece a una marca
    imagen_principal VARCHAR(255), -- La imagen principal del modelo
    CONSTRAINT FK_Modelos_Marcas FOREIGN KEY (id_marca) REFERENCES MarcasProducto(id_marca)
);
GO

CREATE TABLE MaterialesProducto (
    id_material INT IDENTITY(1,1) PRIMARY KEY,
    nombre_material VARCHAR(100) NOT NULL UNIQUE
);
GO

CREATE TABLE UnidadesMedida (
    id_unidad_medida INT IDENTITY(1,1) PRIMARY KEY,
    nombre_unidad VARCHAR(50) NOT NULL UNIQUE, -- Ej: 'Par', 'Unidad', 'Kit', 'Caja'
    abreviatura VARCHAR(10) -- Ej: 'par', 'und', 'kit', 'caja'
);
GO

CREATE TABLE Productos (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion NVARCHAR(600),
    precio_venta DECIMAL(10, 2) NOT NULL,
    costo_compra DECIMAL(10, 2),
    codigo_barra VARCHAR(50) UNIQUE,
    id_categoria INT NOT NULL,
    id_proveedor INT,
    id_unidad_medida INT NOT NULL,
    color VARCHAR(50),
    tipo VARCHAR(20), 
    dimensiones VARCHAR(50),
    peso_gramos INT,
    id_marca INT,
    id_modelo INT,
    id_material INT,
    CONSTRAINT FK_Productos_Categorias FOREIGN KEY (id_categoria) REFERENCES CategoriasProducto(id_categoria),
    CONSTRAINT FK_Productos_Proveedores FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor),
    CONSTRAINT FK_Productos_Marcas FOREIGN KEY (id_marca) REFERENCES MarcasProducto(id_marca),
    CONSTRAINT FK_Productos_Modelos FOREIGN KEY (id_modelo) REFERENCES Modelos(id_modelo),
    CONSTRAINT FK_Productos_Materiales FOREIGN KEY (id_material) REFERENCES MaterialesProducto(id_material),
    CONSTRAINT FK_Productos_UnidadesMedida FOREIGN KEY (id_unidad_medida) REFERENCES UnidadesMedida(id_unidad_medida)
);
GO

CREATE TABLE Tallas (
    id_producto INT NOT NULL,
    talla VARCHAR(10) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    costo_compra DECIMAL(10, 2),
    PRIMARY KEY (id_producto, talla), 
    CONSTRAINT FK_Tallas_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE
);
GO

CREATE TABLE TiposProducto (
    id_tipo INT IDENTITY(1,1) PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE -- Ej: 'Deportivo', 'Urbano', 'Formal', 'Outdoor'
);
GO

CREATE TABLE Producto_Tipos (
    id_producto INT NOT NULL,
    id_tipo INT NOT NULL,
    PRIMARY KEY (id_producto, id_tipo),
    CONSTRAINT FK_ProductoTipos_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE,
    CONSTRAINT FK_ProductoTipos_Tipos FOREIGN KEY (id_tipo) REFERENCES TiposProducto(id_tipo) ON DELETE CASCADE
);
GO

CREATE TABLE Almacenes (
    id_almacen INT IDENTITY(1,1) PRIMARY KEY,
    nombre_almacen VARCHAR(100) NOT NULL UNIQUE,
    ubicacion VARCHAR(255)
);
GO

CREATE TABLE Inventario (
    id_inventario INT IDENTITY(1,1) PRIMARY KEY,
    id_producto INT NOT NULL,
    id_almacen INT NOT NULL,
    cantidad_stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5, -- Nivel de alerta espec�fico para este producto en este almac�n
    fecha_ultima_actualizacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Inventario_Producto_Almacen UNIQUE (id_producto, id_almacen),
    CONSTRAINT FK_Inventario_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE,
    CONSTRAINT FK_Inventario_Almacenes FOREIGN KEY (id_almacen) REFERENCES Almacenes(id_almacen) ON DELETE CASCADE
);
GO

-- =================================================================
-- M�DULO 4: GESTI�N DE MOVIMIENTOS Y TRANSACCIONES
-- =================================================================

CREATE TABLE TiposMovimientoInventario (
    id_tipo_movimiento INT IDENTITY(1,1) PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    es_entrada BIT NOT NULL -- 1 para entrada, 0 para salida
);
GO

CREATE TABLE MovimientosInventario (
    id_movimiento_inv BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_producto INT NOT NULL,
    id_almacen INT,
    id_tipo_movimiento INT NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT GETDATE(),
    id_usuario INT NOT NULL,
    observaciones NVARCHAR(MAX),
    referencia_doc VARCHAR(50),
    CONSTRAINT FK_MovInv_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    CONSTRAINT FK_MovInv_Almacenes FOREIGN KEY (id_almacen) REFERENCES Almacenes(id_almacen),
    CONSTRAINT FK_MovInv_TiposMovimiento FOREIGN KEY (id_tipo_movimiento) REFERENCES TiposMovimientoInventario(id_tipo_movimiento),
    CONSTRAINT FK_MovInv_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

CREATE TABLE TiposComprobantePago (
    id_tipo_comprobante INT IDENTITY(1,1) PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL UNIQUE,
    serie_documento VARCHAR(10)
);
GO

CREATE TABLE TiposPago (
    id_tipopago INT IDENTITY(1,1) PRIMARY KEY,
    tipo_pago VARCHAR(50) NOT NULL UNIQUE
);
GO

CREATE TABLE Proveedor_MetodosPago (
    id_proveedor INT NOT NULL,
    id_tipopago INT NOT NULL,
    datos_pago VARCHAR(255) NOT NULL, -- Ej: Nro de cuenta, CCI, Nro de Yape, etc.
    PRIMARY KEY (id_proveedor, id_tipopago),
    CONSTRAINT FK_ProvMetodos_Proveedor FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor) ON DELETE CASCADE,
    CONSTRAINT FK_ProvMetodos_TipoPago FOREIGN KEY (id_tipopago) REFERENCES TiposPago(id_tipopago) ON DELETE CASCADE
);
GO

CREATE TABLE ComprobantesPago (
    id_comprobante BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT,
    id_usuario INT NOT NULL,
    id_tipo_comprobante INT NOT NULL,
    numero_comprobante VARCHAR(20) NOT NULL,
    fecha_emision DATETIME NOT NULL DEFAULT GETDATE(),
    total DECIMAL(10, 2) NOT NULL,
    igv DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Emitido',
    motivo_anulacion NVARCHAR(2000),
    CONSTRAINT UQ_Comprobante_Tipo_Numero UNIQUE (id_tipo_comprobante, numero_comprobante),
    CONSTRAINT FK_Comprobantes_Clientes FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    CONSTRAINT FK_Comprobantes_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    CONSTRAINT FK_Comprobantes_TiposComprobante FOREIGN KEY (id_tipo_comprobante) REFERENCES TiposComprobantePago(id_tipo_comprobante)
);
GO

CREATE TABLE PagosComprobante (
    id_pago BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_comprobante BIGINT NOT NULL,
    id_tipopago INT NOT NULL,
    monto_pagado DECIMAL(10, 2) NOT NULL,
    referencia_pago VARCHAR(100), -- Para nro de operaci�n, �ltimos 4 d�gitos de tarjeta, etc.
    CONSTRAINT FK_Pagos_Comprobantes FOREIGN KEY (id_comprobante) REFERENCES ComprobantesPago(id_comprobante) ON DELETE CASCADE,
    CONSTRAINT FK_Pagos_TiposPago FOREIGN KEY (id_tipopago) REFERENCES TiposPago(id_tipopago)
);
GO

CREATE TABLE DetallesComprobantePago (
    id_detalle_comprobante BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_comprobante BIGINT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento_aplicado DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal_linea DECIMAL(10, 2) NOT NULL,
    CONSTRAINT FK_DetallesComprobante_Comprobantes FOREIGN KEY (id_comprobante) REFERENCES ComprobantesPago(id_comprobante) ON DELETE CASCADE,
    CONSTRAINT FK_DetallesComprobante_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
GO

-- =================================================================
-- M�DULO 5: GESTI�N DE CAJA
-- =================================================================

CREATE TABLE Cajas (
    id_caja INT IDENTITY(1,1) PRIMARY KEY,
    nombre_caja VARCHAR(50) NOT NULL UNIQUE,
    ubicacion VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'Cerrada'
);
GO

CREATE TABLE AperturasCaja (
    id_apertura BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_caja INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_apertura DATE NOT NULL,
    hora_apertura TIME NOT NULL,
    monto_inicial DECIMAL(10, 2) NOT NULL,
    CONSTRAINT UQ_AperturaCaja_Caja_Fecha UNIQUE (id_caja, fecha_apertura),
    CONSTRAINT FK_AperturasCaja_Cajas FOREIGN KEY (id_caja) REFERENCES Cajas(id_caja),
    CONSTRAINT FK_AperturasCaja_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

CREATE TABLE CierresCaja (
    id_cierre BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_apertura BIGINT NOT NULL UNIQUE,
    id_caja INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_cierre DATE NOT NULL,
    hora_cierre TIME NOT NULL,
    monto_final DECIMAL(10, 2) NOT NULL,
    monto_esperado DECIMAL(10, 2) NOT NULL,
    diferencia DECIMAL(10, 2) NOT NULL,
    observaciones NVARCHAR(MAX),
    CONSTRAINT FK_CierresCaja_Aperturas FOREIGN KEY (id_apertura) REFERENCES AperturasCaja(id_apertura),
    CONSTRAINT FK_CierresCaja_Cajas FOREIGN KEY (id_caja) REFERENCES Cajas(id_caja),
    CONSTRAINT FK_CierresCaja_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

CREATE TABLE MovimientosCaja (
    id_movimiento_caja BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_caja INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT GETDATE(),
    tipo_movimiento VARCHAR(10) NOT NULL, -- 'Ingreso' o 'Egreso'
    monto DECIMAL(10, 2) NOT NULL,
    descripcion NVARCHAR(MAX),
    id_comprobante BIGINT,
    CONSTRAINT FK_MovimientosCaja_Cajas FOREIGN KEY (id_caja) REFERENCES Cajas(id_caja),
    CONSTRAINT FK_MovimientosCaja_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
    CONSTRAINT FK_MovimientosCaja_Comprobantes FOREIGN KEY (id_comprobante) REFERENCES ComprobantesPago(id_comprobante)
);
GO

-- =================================================================
-- M�DULO 6: GESTI�N DE PEDIDOS A PROVEEDORES
-- =================================================================

CREATE TABLE PedidosCompra (
    id_pedido_compra BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_pedido DATETIME NOT NULL DEFAULT GETDATE(),
    fecha_entrega_esperada DATE,
    estado_pedido VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    total_pedido DECIMAL(10, 2) NOT NULL DEFAULT 0,
    CONSTRAINT FK_PedidosCompra_Proveedores FOREIGN KEY (id_proveedor) REFERENCES Proveedores(id_proveedor),
    CONSTRAINT FK_PedidosCompra_Usuarios FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);
GO

CREATE TABLE DetallesPedidoCompra (
    id_detalle_pedido BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_pedido_compra BIGINT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_pedida INT NOT NULL,
    costo_unitario DECIMAL(10, 2) NOT NULL,
    subtotal_linea DECIMAL(10, 2) NOT NULL,
    cantidad_recibida INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_DetallePedido_Pedido_Producto UNIQUE (id_pedido_compra, id_producto),
    CONSTRAINT FK_DetallesPedidoCompra_Pedidos FOREIGN KEY (id_pedido_compra) REFERENCES PedidosCompra(id_pedido_compra) ON DELETE CASCADE,
    CONSTRAINT FK_DetallesPedidoCompra_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);
GO

-- =================================================================
-- M�DULO 7: GESTI�N DE INTELIGENCIA ARTIFICIAL (ASESOR DE ESTILO)
-- =================================================================

-- Almacena el perfil de estilo de cada cliente, aprendido por la IA.
CREATE TABLE Perfiles_Estilo_Cliente (
    id_cliente INT PRIMARY KEY,
    paleta_color_predominante VARCHAR(50), -- Ej: 'C�lida', 'Fr�a', 'Neutra'
    estilos_preferidos NVARCHAR(MAX), -- Formato flexible como JSON o CSV: 'Urbano,Casual,Deportivo'
    tallas_frecuentes VARCHAR(100), -- Tallas m�s compradas por el cliente
    fecha_ultimo_analisis DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PerfilesEstilo_Clientes FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE
);
GO

-- Permite etiquetar productos con atributos que la IA puede entender.
CREATE TABLE Etiquetas_Producto_IA (
    id_etiqueta INT IDENTITY(1,1) PRIMARY KEY,
    id_producto INT NOT NULL,
    etiqueta VARCHAR(100) NOT NULL, -- Ej: 'color_calido', 'apto_para_lluvia', 'estilo_formal', 'ocasion_fiesta'
    CONSTRAINT UQ_Etiqueta_Producto UNIQUE (id_producto, etiqueta),
    CONSTRAINT FK_EtiquetasIA_Productos FOREIGN KEY (id_producto) REFERENCES Productos(id_producto) ON DELETE CASCADE
);
GO

-- Guarda un historial de las recomendaciones hechas a cada cliente y si tuvieron �xito.
CREATE TABLE Historial_Recomendaciones (
    id_recomendacion BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_producto_recomendado INT NOT NULL,
    fecha_recomendacion DATETIME NOT NULL DEFAULT GETDATE(),
    contexto VARCHAR(255), -- Ej: 'Basado en clima lluvioso y estilo casual'
    fue_comprobado BIT NOT NULL DEFAULT 0, -- Se actualiza a 1 si el cliente compra el producto
    CONSTRAINT FK_HistorialRec_Clientes FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT FK_HistorialRec_Productos FOREIGN KEY (id_producto_recomendado) REFERENCES Productos(id_producto) ON DELETE CASCADE
);
GO
