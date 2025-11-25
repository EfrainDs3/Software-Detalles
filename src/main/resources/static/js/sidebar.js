function loadSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    // En Spring Boot, usar la ruta del controlador
    const sidebarPath = '/components/sidebar';

    // Cargar la barra lateral
    fetch(sidebarPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            filterSidebarByAuthorities(container);

            // Configurar la página activa después de cargar
            setActivePage();

            // Agregar manejadores de click
            addSidebarClickHandlers();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            // Opción de barra lateral fallback
            container.innerHTML = getFallbackSidebar();
            filterSidebarByAuthorities(container);
            setActivePage();
            addSidebarClickHandlers();
        });
}

function parseAuthoritiesRaw(raw) {
    if (raw === null) {
        return [];
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function getStoredAuthorities() {
    const rawPermisos = localStorage.getItem('usuarioPermisos');
    const rawModulos = localStorage.getItem('usuarioModulos');
    const permisos = parseAuthoritiesRaw(rawPermisos);
    const modulos = parseAuthoritiesRaw(rawModulos);
    return {
        permissions: new Set(
            permisos
                .map(value => (value || '').toString().toUpperCase())
                .filter(value => value.length > 0)
        ),
        modules: new Set(
            modulos
                .map(value => (value || '').toString().toUpperCase())
                .filter(value => value.length > 0)
        ),
        hasData: rawPermisos !== null || rawModulos !== null
    };
}

function getElementAuthorities(element) {
    const raw = element.getAttribute('data-authorities');
    if (!raw) {
        return [];
    }
    return raw
        .split(',')
        .map(value => value.trim().toUpperCase())
        .filter(value => value.length > 0);
}

function filterSidebarByAuthorities(root) {
    const { permissions, modules, hasData } = getStoredAuthorities();
    if (!hasData) {
        return;
    }

    const hasModuleData = modules.size > 0;
    const hasPermissionData = permissions.size > 0;

    const items = Array.from(root.querySelectorAll('[data-authorities]'));
    items.forEach(element => {
        const removeEntry = () => {
            const listItem = element.closest('li');
            if (listItem) {
                listItem.remove();
            } else {
                element.remove();
            }
        };

        if (hasModuleData) {
            const moduleAttr = element.getAttribute('data-module');
            if (moduleAttr) {
                const moduleCode = moduleAttr.trim().toUpperCase();
                if (!modules.has(moduleCode)) {
                    removeEntry();
                    return;
                }
            }

            const moduleGroupAttr = element.getAttribute('data-module-group');
            if (moduleGroupAttr) {
                const groupCodes = moduleGroupAttr.split(',')
                    .map(code => code.trim().toUpperCase())
                    .filter(code => code.length > 0);
                if (!groupCodes.some(code => modules.has(code))) {
                    removeEntry();
                    return;
                }
            }
        }

        const required = getElementAuthorities(element);
        if (!required.length) {
            return;
        }

        const moduleTokens = required.filter(token => token.startsWith('MODULO_'));
        const permissionTokens = required.filter(token => !token.startsWith('MODULO_'));

        const moduleAllowed = !moduleTokens.length || (
            hasModuleData && moduleTokens.some(token => modules.has(token))
        );

        const permissionAllowed = !permissionTokens.length || (
            hasPermissionData && permissionTokens.some(token => permissions.has(token))
        );

        const shouldKeep = moduleAllowed && permissionAllowed;
        if (!shouldKeep) {
            removeEntry();
        }
    });

    root.querySelectorAll('.submenu').forEach(submenu => {
        if (!submenu.querySelector('a')) {
            const parentLi = submenu.closest('li');
            if (parentLi) {
                parentLi.remove();
            } else {
                submenu.remove();
            }
        }
    });

    const navMenu = root.querySelector('.nav-menu');
    if (navMenu && !navMenu.querySelector('a')) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'no-permissions';
        emptyMessage.textContent = 'No tienes módulos habilitados. Contacta al administrador.';
        navMenu.appendChild(emptyMessage);
    }
}

function closeAllSubmenus(except = null) {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        if (submenu !== except) {
            submenu.classList.remove('open');
            const trigger = submenu.previousElementSibling;
            if (trigger && trigger.classList.contains('has-submenu')) {
                trigger.classList.remove('open', 'active-parent');
            }
        }
    });
}

//Establecer la página activa según la URL actual
function setActivePage() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Primero remover todas las clases activas
    navLinks.forEach(link => {
        link.classList.remove('active', 'active-parent');
        if (link.classList.contains('has-submenu')) {
            link.classList.remove('open');
        }
    });

    // Cerrar todos los submenus
    closeAllSubmenus();

    navLinks.forEach(link => {
        const pageData = link.getAttribute('data-page');
        if (pageData === currentPage) {
            link.classList.add('active');

            // Si es un item del submenu, solo expandir el parent (sin marcarlo como activo)
            const parentLi = link.closest('li');
            const isInSubmenu = parentLi && parentLi.closest('.submenu');

            if (isInSubmenu) {
                // Encontrar el parent menu item
                const parentSubmenu = parentLi.closest('.submenu');
                const parentMenuItem = parentSubmenu.previousElementSibling;

                if (parentMenuItem && parentMenuItem.classList.contains('has-submenu')) {
                    // Solo agregar 'open' para expandir, NO 'active'
                    parentMenuItem.classList.add('open', 'active-parent');
                    parentSubmenu.classList.add('open');
                }
            }
        }
    });
}

// Obtener la página actual del URL de manera genérica
function getCurrentPage() {
    const rawPath = window.location.pathname || '/';
    const normalizedPath = rawPath.replace(/\/+$/, ''); // quitar slash final
    const segments = normalizedPath.split('/').filter(Boolean);
    const routeKey = segments.join('/');

    const routeMap = {
        '': 'dashboard',
        'dashboard': 'dashboard',
        'usuarios': 'usuarios',
        'roles': 'roles',
        'permisos': 'permisos',
        'productos': 'productos',
        'productos/calzados': 'calzado',
        'productos/accesorios': 'accesorios',
        'productos/catalogos': 'catalogo',
        'clientes': 'clientes',
        'ventas': 'gestion-ventas',
        'ventas/caja': 'caja',
        'compras': 'gestion-compras',
        'compras/proveedores': 'proveedores',
        'inventario': 'inventario',
        'reportes': 'reportes',
        // auditoria removed
    };

    if (routeMap.hasOwnProperty(routeKey)) {
        return routeMap[routeKey];
    }

    const lastSegment = segments[segments.length - 1] || '';

    if (!lastSegment) {
        return 'dashboard';
    }

    if (lastSegment.endsWith('.html')) {
        const baseName = lastSegment.replace('.html', '');
        return routeMap[baseName] || baseName;
    }

    // Ej. /usuarios/ -> usuarios
    if (routeMap.hasOwnProperty(lastSegment)) {
        return routeMap[lastSegment];
    }

    return lastSegment;
}

// Agregar controladores de clic a los enlaces de la barra lateral
function addSidebarClickHandlers() {
    const navLinks = document.querySelectorAll('.nav-menu a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const hasSubmenu = this.classList.contains('has-submenu');
            const parentSubmenu = this.closest('.submenu');

            if (hasSubmenu) {
                e.preventDefault();
                const submenu = this.parentElement.querySelector('.submenu');
                if (!submenu) return;

                const isOpen = submenu.classList.contains('open');
                closeAllSubmenus();

                if (!isOpen) {
                    submenu.classList.add('open');
                    this.classList.add('open', 'active-parent');
                } else {
                    this.classList.remove('open', 'active-parent');
                }
                return;
            }

            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.nav-menu a.has-submenu').forEach(trigger => trigger.classList.remove('active-parent'));

            this.classList.add('active');

            if (parentSubmenu) {
                const parentMenuItem = parentSubmenu.previousElementSibling;
                if (parentMenuItem && parentMenuItem.classList.contains('has-submenu')) {
                    parentMenuItem.classList.remove('open', 'active-parent');
                }
            }

            closeAllSubmenus();
        });
    });
}

// Generar barra lateral del HTML si falla la carga - usando rutas de Spring Boot
function getFallbackSidebar() {
    return `
        <nav class="sidebar">
            <h1>DETALLES</h1>
            <ul class="nav-menu">
                <li><a href="/dashboard" data-page="dashboard" data-module="MODULO_DASHBOARD" data-authorities="ACCEDER_AL_DASHBOARD,MODULO_DASHBOARD">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a></li>
                <li><a href="#" data-page="seguridad" class="has-submenu" data-module-group="MODULO_USUARIOS,MODULO_ROLES,MODULO_PERMISOS" data-authorities="MODULO_USUARIOS,MODULO_ROLES,MODULO_PERMISOS,GESTIONAR_USUARIOS,GESTIONAR_ROLES,GESTIONAR_PERMISOS,VER_USUARIOS,VER_ROLES,VER_PERMISOS">
                    <i class="fas fa-lock"></i>
                    Seguridad
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li><a href="/usuarios" data-page="usuarios" data-module="MODULO_USUARIOS" data-authorities="GESTIONAR_USUARIOS,VER_USUARIOS,MODULO_USUARIOS">
                            <i class="fas fa-users"></i>
                            Usuarios
                        </a></li>
                        <li><a href="/roles" data-page="roles" data-module="MODULO_ROLES" data-authorities="GESTIONAR_ROLES,VER_ROLES,MODULO_ROLES">
                            <i class="fas fa-user-shield"></i>
                            Roles
                        </a></li>
                        <li><a href="/permisos" data-page="permisos" data-module="MODULO_PERMISOS" data-authorities="GESTIONAR_PERMISOS,VER_PERMISOS,MODULO_PERMISOS">
                            <i class="fas fa-shield-alt"></i>
                            Permisos
                        </a></li>
                    </ul>
                </li>
                <li><a href="#" data-page="productos" class="has-submenu" data-module-group="MODULO_PRODUCTOS,MODULO_INVENTARIO,MODULO_CATALOGOS" data-authorities="GESTIONAR_INVENTARIO,VER_CALZADOS,VER_ACCESORIOS,VER_CATALOGOS_MAESTROS,MODULO_PRODUCTOS,MODULO_INVENTARIO,MODULO_CATALOGOS">
                    <i class="fas fa-box"></i>
                    Productos
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li><a href="/productos/calzados" data-page="calzado" data-module="MODULO_PRODUCTOS" data-authorities="GESTIONAR_INVENTARIO,VER_CALZADOS,MODULO_PRODUCTOS,MODULO_INVENTARIO">
                            <i class="fas fa-shoe-prints"></i>
                            Calzado
                        </a></li>
                        <li><a href="/productos/accesorios" data-page="accesorios" data-module="MODULO_PRODUCTOS" data-authorities="GESTIONAR_INVENTARIO,VER_ACCESORIOS,MODULO_PRODUCTOS,MODULO_INVENTARIO">
                            <i class="fas fa-glasses"></i>
                            Accesorios
                        </a></li>
                        <li><a href="/productos/catalogos" data-page="catalogo" data-module="MODULO_CATALOGOS" data-authorities="GESTIONAR_INVENTARIO,VER_CATALOGOS_MAESTROS,MODULO_CATALOGOS,MODULO_PRODUCTOS">
                            <i class="fas fa-glasses"></i>
                            Catalogo
                        </a></li>
                    </ul>
                </li>
                <li><a href="/clientes" data-page="clientes" data-module="MODULO_CLIENTES" data-authorities="GESTIONAR_CLIENTES,VER_CLIENTES,MODULO_CLIENTES">
                    <i class="fas fa-user-friends"></i>
                    Clientes
                </a></li>
                <li><a href="#" data-page="ventas" class="has-submenu" data-module-group="MODULO_VENTAS,MODULO_CAJA" data-authorities="REGISTRAR_VENTAS,VER_VENTAS,VER_ESTADO_DE_CAJA,MODULO_VENTAS,MODULO_CAJA">
                    <i class="fas fa-shopping-cart"></i>
                    Ventas
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li>
                            <a href="/ventas" data-page="gestion-ventas" data-module="MODULO_VENTAS" data-authorities="REGISTRAR_VENTAS,VER_VENTAS,MODULO_VENTAS">
                                <i class="fas fa-receipt"></i>
                                Gestión de Ventas
                            </a>
                        </li>
                        <li>
                            <a href="/ventas/caja" data-page="caja" data-module="MODULO_CAJA" data-authorities="REGISTRAR_VENTAS,VER_ESTADO_DE_CAJA,MODULO_CAJA,MODULO_VENTAS">
                                <i class="fas fa-cash-register"></i>
                                Caja
                            </a>
                        </li>
                    </ul>
                </li>
                <li><a href="#" data-page="compras" class="has-submenu" data-module-group="MODULO_COMPRAS,MODULO_PROVEEDORES" data-authorities="GESTIONAR_COMPRAS,VER_COMPRAS,VER_PROVEEDORES,MODULO_COMPRAS,MODULO_PROVEEDORES">
                    <i class="fas fa-truck"></i>
                    Compras
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li>
                            <a href="/compras" data-page="gestion-compras" data-module="MODULO_COMPRAS" data-authorities="GESTIONAR_COMPRAS,VER_COMPRAS,MODULO_COMPRAS">
                                <i class="fas fa-file-invoice-dollar"></i>
                                Gestión de Compras
                            </a>
                        </li>
                        <li>
                            <a href="/compras/proveedores" data-page="proveedores" data-module="MODULO_PROVEEDORES" data-authorities="GESTIONAR_COMPRAS,VER_PROVEEDORES,MODULO_PROVEEDORES,MODULO_COMPRAS">
                                <i class="fas fa-industry"></i>
                                Proveedores
                            </a>
                        </li>
                    </ul>
                </li>
                <li><a href="#" data-page="inventario" class="has-submenu" data-module-group="MODULO_INVENTARIO,MODULO_ALMACENES" data-authorities="GESTIONAR_INVENTARIO,VER_INVENTARIO,VER_ALMACENES,MODULO_INVENTARIO,MODULO_ALMACENES">
                    <i class="fas fa-warehouse"></i>
                    Inventario
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li><a href="/inventario" data-page="gestion-inventario" data-module="MODULO_INVENTARIO" data-authorities="GESTIONAR_INVENTARIO,VER_INVENTARIO,MODULO_INVENTARIO">
                            <i class="fas fa-boxes"></i>
                            Gestión Inventario
                        </a></li>
                        <li><a href="/almacenes" data-page="almacenes" data-module="MODULO_ALMACENES" data-authorities="GESTIONAR_INVENTARIO,VER_ALMACENES,MODULO_ALMACENES,MODULO_INVENTARIO">
                            <i class="fas fa-warehouse"></i>
                            Almacenes
                        </a></li>
                    </ul>
                </li>
                <li><a href="/reportes" data-page="reportes" data-module="MODULO_REPORTES" data-authorities="VER_REPORTES,GENERAR_REPORTES,MODULO_REPORTES">
                    <i class="fas fa-chart-bar"></i>
                    Reportes
                </a></li>
                // Auditoría entry removed
            </ul>
        </nav>
    `;
}

// Actualizar la navegación de la barra lateral
function updateSidebarNavigation(menuItems) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    navMenu.innerHTML = '';

    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');

        a.href = item.href;
        a.setAttribute('data-page', item.page);
        a.textContent = item.text;

        if (item.active) {
            a.classList.add('active');
        }

        li.appendChild(a);
        navMenu.appendChild(li);
    });

    // Re-add click handlers
    addSidebarClickHandlers();
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Auto-load sidebar if container exists
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        loadSidebar('sidebar-container');
    }
});

// Also try to load immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Still loading, wait for DOMContentLoaded
} else {
    // DOM already loaded, load sidebar immediately
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        loadSidebar('sidebar-container');
    }
}
