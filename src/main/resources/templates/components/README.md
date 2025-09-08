# Sistema de Sidebar Dinámico

Este sistema permite gestionar el menú lateral de navegación desde un solo archivo, facilitando el mantenimiento y las actualizaciones.

## Archivos del Sistema

### 1. `sidebar.html`
- **Ubicación**: `src/main/resources/templates/components/sidebar.html`
- **Función**: Contiene el HTML del menú lateral
- **Modificación**: Edita este archivo para cambiar la navegación

### 2. `sidebar.js`
- **Ubicación**: `src/main/resources/static/js/sidebar.js`
- **Función**: JavaScript que carga dinámicamente el sidebar
- **Características**:
  - Carga automática del sidebar
  - Detección automática de página activa
  - Manejo de eventos de clic
  - Fallback en caso de error de carga

## Cómo Usar

### En cualquier página HTML:

1. **Reemplaza el sidebar estático**:
```html
<!-- ANTES -->
<nav class="sidebar">
    <!-- contenido del sidebar -->
</nav>

<!-- DESPUÉS -->
<div id="sidebar-container"></div>
```

2. **Incluye el script del sidebar**:
```html
<script src="../../../static/js/sidebar.js"></script>
```

3. **El sidebar se carga automáticamente** cuando la página se carga.

## Cómo Modificar la Navegación

### Para agregar un nuevo enlace:

1. Edita `src/main/resources/templates/components/sidebar.html`
2. Agrega un nuevo elemento `<li>` en el `<ul class="nav-menu">`:

```html
<li><a href="nueva-pagina.html" data-page="nueva-pagina">Nueva Página</a></li>
```

### Para cambiar el orden de los enlaces:

1. Reordena los elementos `<li>` en `sidebar.html`
2. Los cambios se aplicarán automáticamente en todas las páginas

### Para cambiar el texto de un enlace:

1. Modifica el texto dentro del elemento `<a>` en `sidebar.html`
2. Ejemplo: `<a href="usuarios.html" data-page="usuarios">Gestión de Usuarios</a>`

## Atributos Importantes

- **`data-page`**: Identificador único de la página (usado para marcar como activa)
- **`href`**: URL de destino del enlace

## Páginas Actuales Configuradas

- `dashboard` → `../../dashboard.html`
- `usuarios` → `usuario.html`
- `roles` → `roles.html`
- `productos` → `/productos`
- `clientes` → `/clientes`
- `ventas` → `/ventas`
- `stock` → `/stock`
- `reportes` → `/reportes`
- `auditoria` → `/auditoria`

## Ventajas del Sistema

1. **Mantenimiento centralizado**: Un solo archivo para toda la navegación
2. **Consistencia**: Misma navegación en todas las páginas
3. **Fácil actualización**: Cambios se aplican automáticamente
4. **Detección automática**: La página activa se marca automáticamente
5. **Fallback**: Funciona incluso si falla la carga del archivo
