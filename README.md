# Dashboard Tienda Detalles

Un dashboard completo para la gestión de una tienda de detalles desarrollado con Spring Boot, Thymeleaf y MySQL.

## Características

- **Dashboard Principal**: Vista general con estadísticas clave del negocio
- **Gestión de Productos**: CRUD completo para productos con categorías
- **Gestión de Ventas**: Registro y seguimiento de ventas
- **Estadísticas**: Gráficos y reportes de ventas e inventario
- **Diseño Responsive**: Interfaz moderna y adaptable a diferentes dispositivos

## Tecnologías Utilizadas

- **Backend**: Spring Boot 3.5.5
- **Frontend**: Thymeleaf, Bootstrap 5, Chart.js
- **Base de Datos**: MySQL
- **ORM**: Spring Data JPA
- **Estilos**: CSS personalizado con animaciones

## Requisitos Previos

- Java 17 o superior
- Maven 3.6+
- MySQL 8.0+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd detalles
```

### 2. Configurar Base de Datos
1. Crear una base de datos MySQL llamada `detalles_db`
2. Actualizar las credenciales en `src/main/resources/application.properties`:
```properties
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
```

### 3. Ejecutar la Aplicación
```bash
# Compilar y ejecutar
mvn spring-boot:run

# O compilar primero y luego ejecutar
mvn clean package
java -jar target/detalles-0.0.1-SNAPSHOT.jar
```

### 4. Acceder al Dashboard
Abrir el navegador y ir a: `http://localhost:8080/dashboard`

## Estructura del Proyecto

```
src/
├── main/
│   ├── java/fisi/software/detalles/
│   │   ├── controller/          # Controladores REST y MVC
│   │   ├── entity/             # Entidades JPA
│   │   ├── repository/         # Repositorios de datos
│   │   ├── service/            # Lógica de negocio
│   │   └── DetallesApplication.java
│   └── resources/
│       ├── static/             # Archivos estáticos (CSS, JS, imágenes)
│       ├── templates/          # Templates Thymeleaf
│       ├── application.properties
│       └── data.sql           # Datos iniciales
└── test/                      # Pruebas unitarias
```

## Funcionalidades del Dashboard

### Dashboard Principal
- Estadísticas generales del negocio
- Productos con stock bajo
- Ventas recientes
- Acciones rápidas

### Gestión de Productos
- Lista de productos con filtros
- Crear, editar y eliminar productos
- Control de stock y categorías
- Alertas de stock bajo

### Gestión de Ventas
- Registro de nuevas ventas
- Seguimiento del estado de ventas
- Filtros por fecha y estado
- Detalles de productos por venta

### Estadísticas
- Gráficos de ventas por período
- Distribución de estados de ventas
- Productos más vendidos
- Resumen de inventario

## Datos de Prueba

El proyecto incluye datos de ejemplo que se cargan automáticamente:
- 10 productos de diferentes categorías
- 10 ventas con diferentes estados
- Detalles de ventas asociados

## Personalización

### Agregar Nuevas Categorías
Editar el archivo `src/main/resources/templates/dashboard/productos.html` y agregar opciones en el select de categorías.

### Modificar Estilos
Los estilos personalizados están en `src/main/resources/static/css/dashboard.css`.

### Agregar Nuevas Funcionalidades
1. Crear entidad en el paquete `entity`
2. Crear repositorio en el paquete `repository`
3. Crear servicio en el paquete `service`
4. Crear controlador en el paquete `controller`
5. Crear template en `src/main/resources/templates`

## API Endpoints

- `GET /dashboard` - Dashboard principal
- `GET /dashboard/productos` - Gestión de productos
- `GET /dashboard/ventas` - Gestión de ventas
- `GET /dashboard/estadisticas` - Estadísticas y reportes

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte o preguntas, contactar a: [tu-email@ejemplo.com]

---

**Desarrollado con ❤️ usando Spring Boot**