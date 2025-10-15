# Backend - Sistema Detalles

## 🎯 Configuración Completada

### Estructura del Proyecto

```
src/main/java/fisi/software/detalles/
├── DetallesApplication.java          # Clase principal de Spring Boot
├── config/
│   └── SecurityConfig.java           # Configuración de seguridad (temporal)
└── controller/
    └── ViewController.java            # Controlador de vistas

src/main/resources/
├── application.properties             # Configuración de la aplicación
├── static/                           # Recursos estáticos (CSS, JS, imágenes)
│   ├── css/
│   ├── js/
│   └── img/
└── templates/                        # Plantillas HTML (Thymeleaf)
    ├── dashboard.html
    ├── components/
    │   └── sidebar.html
    └── software/
        └── login.html
```

## 🚀 Cómo Ejecutar

### Opción 1: Maven Wrapper (Recomendado)
```powershell
.\mvnw.cmd spring-boot:run
```

### Opción 2: Maven Instalado
```powershell
mvn spring-boot:run
```

### Opción 3: Desde el IDE
Ejecutar la clase `DetallesApplication.java`

## 🌐 URLs Disponibles

- **Página Principal**: http://localhost:8080/ → Redirige al login
- **Login**: http://localhost:8080/login
- **Dashboard**: http://localhost:8080/dashboard

### Módulos del Sistema

#### Gestión de Usuarios
- `/usuarios` - Gestión de Usuarios
- `/roles` - Gestión de Roles
- `/permisos` - Gestión de Permisos

#### Gestión de Productos
- `/productos/calzados` - Gestión de Calzados
- `/productos/accesorios` - Gestión de Accesorios
- `/productos/catalogos` - Catálogo de Productos

#### Gestión Comercial
- `/clientes` - Gestión de Clientes
- `/ventas` - Gestión de Ventas
- `/ventas/caja` - Punto de Venta (Caja)
- `/compras` - Gestión de Compras
- `/compras/proveedores` - Gestión de Proveedores

#### Operaciones
- `/inventario` - Gestión de Inventario
- `/reportes` - Reportes del Sistema
- `/auditoria` - Auditoría del Sistema

## 🔐 Credenciales de Prueba

El sistema actualmente usa autenticación simulada en el frontend. Las credenciales válidas son:

| Usuario | Contraseña |
|---------|------------|
| admin   | 123456     |
| usuario | password   |
| test    | test123    |
| demo    | demo123    |

## ⚙️ Configuración

### Base de Datos (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rest?useSSL=false
spring.datasource.username=rest
spring.datasource.password=Danny2004@
```

### Actualización de esquema para permisos

Si trabajas con la base de datos MySQL existente, aplica la siguiente migración manual antes de iniciar la aplicación. Añade metadatos de auditoría al catálogo de permisos y crea la tabla de historial:

```sql
ALTER TABLE permisos
    ADD COLUMN creado_por VARCHAR(100) NULL AFTER estado,
    ADD COLUMN actualizado_por VARCHAR(100) NULL AFTER creado_por,
    ADD COLUMN fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER actualizado_por,
    ADD COLUMN fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER fecha_creacion;

CREATE TABLE IF NOT EXISTS permisos_auditoria (
    id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_permiso BIGINT NULL,
    accion VARCHAR(40) NOT NULL,
    detalle VARCHAR(500) NULL,
    usuario VARCHAR(100) NULL,
    permiso_codigo VARCHAR(100) NULL,
    permiso_nombre VARCHAR(150) NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_permisos_auditoria_permiso (id_permiso)
);
```

> ℹ️ La tabla `permisos_auditoria` no define una restricción `FOREIGN KEY` para permitir conservar el historial incluso cuando un permiso sea eliminado.

### Puerto del Servidor
Por defecto: **8080**

Para cambiar el puerto, descomenta y modifica en `application.properties`:
```properties
server.port=8081
```

## 🔧 Estado Actual del Desarrollo

### ✅ Completado
- [x] Configuración inicial de Spring Boot
- [x] Controlador de vistas (`ViewController`)
- [x] Configuración de seguridad básica
- [x] Integración con Thymeleaf
- [x] Página de Login funcional
- [x] Dashboard con menú de navegación
- [x] Rutas corregidas para todos los módulos
- [x] JavaScript actualizado para rutas de Spring Boot

### 🚧 Pendiente
- [ ] Crear vistas HTML para todos los módulos
- [ ] Crear modelos de datos (Entidades JPA)
- [ ] Crear repositorios (JPA Repositories)
- [ ] Crear servicios (Business Logic)
- [ ] Crear controladores REST (APIs)
- [ ] Implementar autenticación real con Spring Security
- [ ] Implementar autorización basada en roles
- [ ] Integrar con la base de datos MySQL
- [ ] Crear DTOs y validaciones
- [ ] Implementar manejo de errores global

## 📝 Notas Importantes

### Seguridad Temporal
La configuración actual de seguridad permite acceso libre a todas las rutas para facilitar el desarrollo. **Esto debe cambiarse antes de producción**.

```java
// En SecurityConfig.java - TEMPORAL
.requestMatchers("/**").permitAll()
```

### Azure AI Vector Store
La auto-configuración de Azure AI está deshabilitada ya que no es necesaria para el proyecto actual:
```properties
spring.autoconfigure.exclude=org.springframework.ai.vectorstore.azure.autoconfigure.AzureVectorStoreAutoConfiguration
```

### Sesión del Usuario
Actualmente la sesión se maneja con `localStorage` en el navegador (válida por 24 horas). En producción, esto debe reemplazarse con JWT o sesiones de Spring Security.

## 🔄 Próximos Pasos Recomendados

1. **Crear las Entidades JPA** para representar las tablas de la base de datos
2. **Crear los Repositorios** para acceder a los datos
3. **Crear los Servicios** con la lógica de negocio
4. **Crear las vistas HTML** para cada módulo
5. **Implementar APIs REST** para operaciones CRUD
6. **Configurar Spring Security** con autenticación real
7. **Agregar validaciones** en el backend
8. **Implementar pruebas unitarias**

## 🐛 Solución de Problemas

### Error: "No static resource software/login.html"
**Causa**: Intentar acceder directamente a archivos HTML en `/templates`

**Solución**: Usar las rutas del controlador:
- ❌ `http://localhost:8080/software/login.html`
- ✅ `http://localhost:8080/login`

### Error: Azure Vector Store
**Causa**: Dependencia de Spring AI incluida en el POM

**Solución**: Ya está deshabilitada en `application.properties`

### La aplicación no inicia
**Verificar**:
1. MySQL está corriendo en el puerto 3306
2. La base de datos `rest` existe
3. El usuario `rest` tiene permisos

## 📚 Tecnologías Utilizadas

- **Spring Boot 3.5.5**
- **Spring Data JPA** - Persistencia
- **Spring Security** - Seguridad
- **Thymeleaf** - Motor de plantillas
- **MySQL** - Base de datos
- **Lombok** - Reducción de código boilerplate
- **Maven** - Gestión de dependencias

## 👥 Equipo de Desarrollo

Universidad UNMSM - FISI
Ciclo VII - Ingeniería de Software

---
**Última actualización**: Octubre 2025
