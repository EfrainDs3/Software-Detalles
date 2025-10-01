# 📋 Estructura de Controladores - Sistema Detalles

## 🎯 Arquitectura de Controladores

El sistema está organizado siguiendo el patrón **MVC (Model-View-Controller)** con una separación clara de responsabilidades por módulo. Cada módulo tiene su propio controlador independiente.

---

## 📂 Controladores Creados (10 Controladores)

### 1. **LoginController** 🔐
**Ubicación**: `controller/LoginController.java`

**Responsabilidad**: Autenticación, gestión de sesiones y navegación general

**Endpoints de Vistas**:
- `GET /` → Redirige al login
- `GET /login` → Página de inicio de sesión
- `GET /components/sidebar` → Componente de navegación lateral

**Endpoints REST a Implementar**:
- `POST /api/login/authenticate` - Autenticar usuario
- `POST /api/login/logout` - Cerrar sesión
- `GET /api/login/forgot-password` - Recuperar contraseña
- `POST /api/login/refresh-token` - Refrescar token JWT

---

### 2. **DashboardController** 📊
**Ubicación**: `controller/DashboardController.java`

**Responsabilidad**: Dashboard principal del sistema

**Endpoints de Vistas**:
- `GET /dashboard` → Dashboard principal

**Endpoints REST a Implementar**:
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/recent-activities` - Actividades recientes
- `GET /api/dashboard/notifications` - Notificaciones

---

### 3. **UsuariosController** 👥
**Ubicación**: `controller/UsuariosController.java`

**Responsabilidad**: Gestión de usuarios, roles y permisos

**Endpoints de Vistas**:
- `GET /usuarios` → Gestión de usuarios
- `GET /roles` → Gestión de roles
- `GET /permisos` → Gestión de permisos

**Endpoints REST a Implementar**:
```
Usuarios:
- GET    /api/usuarios       - Listar usuarios
- GET    /api/usuarios/{id}  - Obtener usuario
- POST   /api/usuarios       - Crear usuario
- PUT    /api/usuarios/{id}  - Actualizar usuario
- DELETE /api/usuarios/{id}  - Eliminar usuario

Roles:
- GET    /api/roles         - Listar roles
- POST   /api/roles         - Crear rol
- PUT    /api/roles/{id}    - Actualizar rol
- DELETE /api/roles/{id}    - Eliminar rol

Permisos:
- GET    /api/permisos              - Listar permisos
- POST   /api/permisos              - Asignar permiso
- DELETE /api/permisos/{id}         - Revocar permiso
```

---

### 4. **ProductosController** 📦
**Ubicación**: `controller/ProductosController.java`

**Responsabilidad**: Gestión de productos (calzados, accesorios, catálogos)

**Endpoints de Vistas**:
- `GET /productos/calzados` → Gestión de calzados
- `GET /productos/accesorios` → Gestión de accesorios
- `GET /productos/catalogos` → Catálogos de productos

**Endpoints REST a Implementar**:
```
Calzados:
- GET    /api/productos/calzados       - Listar calzados
- GET    /api/productos/calzados/{id}  - Obtener calzado
- POST   /api/productos/calzados       - Crear calzado
- PUT    /api/productos/calzados/{id}  - Actualizar calzado
- DELETE /api/productos/calzados/{id}  - Eliminar calzado

Accesorios:
- GET    /api/productos/accesorios     - Listar accesorios
- POST   /api/productos/accesorios     - Crear accesorio
- PUT    /api/productos/accesorios/{id} - Actualizar accesorio
- DELETE /api/productos/accesorios/{id} - Eliminar accesorio

Catálogos:
- GET    /api/productos/catalogos      - Listar catálogos
- POST   /api/productos/catalogos      - Crear catálogo
```

---

### 5. **ClientesController** 👨‍💼
**Ubicación**: `controller/ClientesController.java`

**Responsabilidad**: Gestión de clientes

**Endpoints de Vistas**:
- `GET /clientes` → Gestión de clientes

**Endpoints REST a Implementar**:
```
- GET    /api/clientes              - Listar clientes
- GET    /api/clientes/{id}         - Obtener cliente
- POST   /api/clientes              - Crear cliente
- PUT    /api/clientes/{id}         - Actualizar cliente
- DELETE /api/clientes/{id}         - Eliminar cliente
- GET    /api/clientes/search       - Buscar clientes
- GET    /api/clientes/{id}/historial - Historial de compras
```

---

### 6. **VentasController** 💰
**Ubicación**: `controller/VentasController.java`

**Responsabilidad**: Gestión de ventas y punto de venta (caja)

**Endpoints de Vistas**:
- `GET /ventas` → Gestión de ventas
- `GET /ventas/caja` → Punto de venta (caja)

**Endpoints REST a Implementar**:
```
Ventas:
- GET    /api/ventas        - Listar ventas
- GET    /api/ventas/{id}   - Obtener venta
- POST   /api/ventas        - Registrar venta
- PUT    /api/ventas/{id}   - Actualizar venta
- DELETE /api/ventas/{id}   - Anular venta

Caja:
- GET    /api/ventas/caja/estado      - Estado de caja
- POST   /api/ventas/caja/abrir       - Abrir caja
- POST   /api/ventas/caja/cerrar      - Cerrar caja
- GET    /api/ventas/caja/movimientos - Movimientos de caja
```

---

### 7. **ComprasController** 🛒
**Ubicación**: `controller/ComprasController.java`

**Responsabilidad**: Gestión de compras y proveedores

**Endpoints de Vistas**:
- `GET /compras` → Gestión de compras
- `GET /compras/proveedores` → Gestión de proveedores

**Endpoints REST a Implementar**:
```
Compras:
- GET    /api/compras       - Listar compras
- GET    /api/compras/{id}  - Obtener compra
- POST   /api/compras       - Registrar compra
- PUT    /api/compras/{id}  - Actualizar compra
- DELETE /api/compras/{id}  - Anular compra

Proveedores:
- GET    /api/compras/proveedores       - Listar proveedores
- POST   /api/compras/proveedores       - Crear proveedor
- PUT    /api/compras/proveedores/{id}  - Actualizar proveedor
- DELETE /api/compras/proveedores/{id}  - Eliminar proveedor
```

---

### 8. **InventarioController** 📊
**Ubicación**: `controller/InventarioController.java`

**Responsabilidad**: Gestión de inventario y stock

**Endpoints de Vistas**:
- `GET /inventario` → Gestión de inventario

**Endpoints REST a Implementar**:
```
- GET  /api/inventario                     - Listar inventario
- GET  /api/inventario/{id}                - Detalle de producto
- PUT  /api/inventario/{id}/ajuste         - Ajustar stock
- GET  /api/inventario/bajo-stock          - Productos con bajo stock
- GET  /api/inventario/movimientos         - Movimientos de inventario
- POST /api/inventario/transferencia       - Transferir entre almacenes
- GET  /api/inventario/kardex/{id}         - Kardex de producto
```

---

### 9. **ReportesController** 📈
**Ubicación**: `controller/ReportesController.java`

**Responsabilidad**: Generación y visualización de reportes

**Endpoints de Vistas**:
- `GET /reportes` → Página de reportes

**Endpoints REST a Implementar**:
```
- GET  /api/reportes/ventas                - Reporte de ventas
- GET  /api/reportes/compras               - Reporte de compras
- GET  /api/reportes/inventario            - Reporte de inventario
- GET  /api/reportes/clientes              - Reporte de clientes
- GET  /api/reportes/productos-mas-vendidos - Productos más vendidos
- GET  /api/reportes/ingresos              - Reporte de ingresos
- POST /api/reportes/generar               - Generar reporte personalizado
- GET  /api/reportes/exportar/{tipo}       - Exportar (PDF, Excel, CSV)
```

---

### 10. **AuditoriaController** 🔍
**Ubicación**: `controller/AuditoriaController.java`

**Responsabilidad**: Auditoría y logs del sistema

**Endpoints de Vistas**:
- `GET /auditoria` → Auditoría del sistema

**Endpoints REST a Implementar**:
```
- GET  /api/auditoria/logs                 - Listar logs
- GET  /api/auditoria/logs/{id}            - Detalle de log
- GET  /api/auditoria/logs/usuario/{id}    - Logs por usuario
- GET  /api/auditoria/logs/accion/{tipo}   - Logs por acción
- GET  /api/auditoria/accesos              - Registro de accesos
- GET  /api/auditoria/cambios              - Historial de cambios
- POST /api/auditoria/exportar             - Exportar logs
```

---

## 🗂️ Estructura de Directorios

```
src/main/java/fisi/software/detalles/controller/
├── LoginController.java          ✅ Autenticación y navegación
├── DashboardController.java      ✅ Dashboard principal
├── UsuariosController.java       ✅ Usuarios, roles, permisos
├── ProductosController.java      ✅ Calzados, accesorios, catálogos
├── ClientesController.java       ✅ Gestión de clientes
├── VentasController.java         ✅ Ventas y caja
├── ComprasController.java        ✅ Compras y proveedores
├── InventarioController.java     ✅ Inventario y stock
├── ReportesController.java       ✅ Reportes del sistema
└── AuditoriaController.java      ✅ Auditoría y logs
```

**Total**: 10 Controladores

---

## 🎨 Patrón de Diseño

### Separación de Responsabilidades

1. **Controladores de Vista** (`@Controller`)
   - Retornan nombres de plantillas Thymeleaf
   - Manejan la navegación entre páginas
   - Ejemplo: `return "dashboard";`

2. **Controladores REST** (A implementar con `@RestController`)
   - Retornan datos en formato JSON
   - Manejan la lógica de negocio a través de servicios
   - Ejemplo: `return ResponseEntity.ok(data);`

### Convención de Nomenclatura

**Vistas**:
- Método: `show{Modulo}()`
- Ruta: `GET /{modulo}`
- Retorno: `"software/{modulo}/{vista}"`

**APIs REST** (a implementar):
- Prefijo: `/api/{modulo}`
- Métodos HTTP: GET, POST, PUT, DELETE
- Retorno: JSON

---

## 🔄 Próximos Pasos

### Fase 1: Servicios ✨
1. Crear `service` package
2. Implementar servicios para cada módulo
3. Inyectar servicios en controladores

### Fase 2: Modelos (Entidades) ✨
1. Crear `entity` package
2. Definir entidades JPA para cada tabla
3. Mapear relaciones entre entidades

### Fase 3: Repositorios ✨
1. Crear `repository` package
2. Implementar interfaces JPA Repository
3. Agregar consultas personalizadas si es necesario

### Fase 4: DTOs ✨
1. Crear `dto` package
2. Definir DTOs para transferencia de datos
3. Implementar mappers (ModelMapper o MapStruct)

### Fase 5: APIs REST ✨
1. Implementar endpoints REST en cada controlador
2. Agregar validaciones con `@Valid`
3. Implementar manejo de excepciones

### Fase 6: Seguridad ✨
1. Configurar Spring Security completo
2. Implementar JWT para autenticación
3. Agregar autorización basada en roles

---

## 📝 Notas Importantes

- ✅ Todos los controladores están compilando correctamente
- ✅ La estructura sigue las mejores prácticas de Spring Boot
- ✅ Cada módulo tiene su propio controlador independiente
- ✅ El código está documentado con JavaDoc
- ✅ Se incluyen TODOs para los endpoints REST pendientes

---

## 🚀 Ventajas de esta Estructura

1. **Mantenibilidad**: Cada módulo es independiente y fácil de mantener
2. **Escalabilidad**: Fácil agregar nuevos módulos sin afectar existentes
3. **Claridad**: El código es más legible y organizado
4. **Testabilidad**: Cada controlador se puede probar de forma aislada
5. **Separación de Responsabilidades**: Cada controlador tiene una única responsabilidad

---

**Última actualización**: Octubre 2025
**Estado**: ✅ Fase de Controladores Completada
