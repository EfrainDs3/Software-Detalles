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
            
            // Configurar la página activa después de cargar
            setActivePage();
            
            // Agregar manejadores de click
            addSidebarClickHandlers();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            // Opción de barra lateral fallback
            container.innerHTML = getFallbackSidebar();
            setActivePage();
            addSidebarClickHandlers();
        });
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
        'auditoria': 'auditoria'
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
        link.addEventListener('click', function(e) {
            const hasSubmenu = this.classList.contains('has-submenu');
            const parentSubmenu = this.closest('.submenu');

            if (hasSubmenu) {
                e.preventDefault();
                const submenu = this.parentElement.querySelector('.submenu');
                if (!submenu) return;

                closeAllSubmenus(submenu);
                submenu.classList.add('open');
                this.classList.add('open', 'active-parent');
                return;
            }

            document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.nav-menu a.has-submenu').forEach(trigger => trigger.classList.remove('active-parent'));

            this.classList.add('active');

            if (parentSubmenu) {
                const parentMenuItem = parentSubmenu.previousElementSibling;
                closeAllSubmenus(parentSubmenu);
                parentSubmenu.classList.add('open');
                if (parentMenuItem && parentMenuItem.classList.contains('has-submenu')) {
                    parentMenuItem.classList.add('open', 'active-parent');
                }
            } else {
                closeAllSubmenus();
            }
        });
    });
}

// Generar barra lateral del HTML si falla la carga - usando rutas de Spring Boot
function getFallbackSidebar() {
    return `
        <nav class="sidebar">
            <h1>DETALLES</h1>
            <ul class="nav-menu">
                <li><a href="/dashboard" data-page="dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a></li>
                <li><a href="/usuarios" data-page="usuarios">
                    <i class="fas fa-users"></i>
                    Usuarios
                </a></li>
                <li><a href="/roles" data-page="roles">
                    <i class="fas fa-user-shield"></i>
                    Roles
                </a></li>
                <li><a href="/permisos" data-page="permisos">
                    <i class="fas fa-shield-alt"></i>
                    Permisos
                </a></li>
                <li><a href="#" data-page="productos" class="has-submenu">
                    <i class="fas fa-box"></i>
                    Productos
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li><a href="/productos/calzados" data-page="calzado">
                            <i class="fas fa-shoe-prints"></i>
                            Calzado
                        </a></li>
                        <li><a href="/productos/accesorios" data-page="accesorios">
                            <i class="fas fa-glasses"></i>
                            Accesorios
                        </a></li>
                        <li><a href="/productos/catalogos" data-page="catalogo">
                            <i class="fas fa-glasses"></i>
                            Catalogo
                        </a></li>
                    </ul>
                </li>
                <li><a href="/clientes" data-page="clientes">
                    <i class="fas fa-user-friends"></i>
                    Clientes
                </a></li>
                <li><a href="#" data-page="ventas" class="has-submenu">
                    <i class="fas fa-shopping-cart"></i>
                    Ventas
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li>
                            <a href="/ventas" data-page="gestion-ventas">
                                <i class="fas fa-receipt"></i>
                                Gestión de Ventas
                            </a>
                        </li>
                        <li>
                            <a href="/ventas/caja" data-page="caja">
                                <i class="fas fa-cash-register"></i>
                                Caja
                            </a>
                        </li>
                    </ul>
                </li>
                <li><a href="#" data-page="compras" class="has-submenu">
                    <i class="fas fa-truck"></i>
                    Compras
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li>
                            <a href="/compras" data-page="gestion-compras">
                                <i class="fas fa-file-invoice-dollar"></i>
                                Gestión de Compras
                            </a>
                        </li>
                        <li>
                            <a href="/compras/proveedores" data-page="proveedores">
                                <i class="fas fa-industry"></i>
                                Proveedores
                            </a>
                        </li>
                    </ul>
                </li>
                <li><a href="/inventario" data-page="inventario">
                    <i class="fas fa-warehouse"></i>
                    Inventario
                </a></li>
                <li><a href="#" data-page="reportes">
                    <i class="fas fa-chart-bar"></i>
                    Reportes
                </a></li>
                <li><a href="#" data-page="auditoria">
                    <i class="fas fa-clipboard-list"></i>
                    Auditoría
                </a></li>
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
document.addEventListener('DOMContentLoaded', function() {
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
