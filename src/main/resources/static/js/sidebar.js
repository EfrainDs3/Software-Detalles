function loadSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    // Detectar automáticamente la ubicación basada en la URL
    const currentPath = window.location.pathname;
    let sidebarPath;
    
    // Detectar la profundidad de carpetas automáticamente
    const pathSegments = currentPath.split('/').filter(segment => segment.length > 0);
    const depth = pathSegments.length;
    
    // Construir ruta relativa basada en la profundidad
    if (currentPath.includes('/software/')) {
        // Para cualquier archivo dentro de /software/
        sidebarPath = '../../../templates/components/sidebar.html';
    } else if (currentPath.includes('/templates/')) {
        sidebarPath = 'components/sidebar.html';
    } else {
        sidebarPath = 'templates/components/sidebar.html';
    }

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

//Establecer la página activa según la URL actual
function setActivePage() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    // Primero remover todas las clases activas
    navLinks.forEach(link => {
        link.classList.remove('active');
        // También remover la clase open de los padres
        link.classList.remove('open');
    });
    
    // Cerrar todos los submenus
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        submenu.classList.remove('open');
    });
    
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
                    parentMenuItem.classList.add('open');
                    parentSubmenu.classList.add('open');
                }
            }
        }
    });
}

// Obtener la página actual del URL de manera genérica
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Mapeo específico para casos especiales
    const pageMap = {
        'dashboard.html': 'dashboard',
        'usuario.html': 'usuarios',
        'roles.html': 'roles',
        'permisos.html': 'permisos',
        'calzados.html': 'calzado',
        'accesorios.html': 'accesorios',
        'clientes.html': 'clientes',
        'ventas.html': 'ventas',
        'stock.html': 'stock',
        'reportes.html': 'reportes',
        'auditoria.html': 'auditoria',
        'index.html': 'usuarios', // respaldo index
        '': 'dashboard' // root path
    };
    
    // Si existe en el mapeo, usarlo
    if (pageMap[filename]) {
        return pageMap[filename];
    }
    
    // Si no existe en el mapeo, extraer automáticamente del nombre del archivo
    if (filename && filename.includes('.html')) {
        const baseName = filename.replace('.html', '');
        
        // Manejar casos plurales/singulares automáticamente
        if (baseName.endsWith('s') && baseName !== 'roles' && baseName !== 'permisos') {
            return baseName; // clientes, usuarios, etc.
        }
        
        return baseName;
    }
    
    // Comprueba si estamos en el panel raíz
    if (path.endsWith('/') || path.endsWith('/templates/') || path.endsWith('/templates/dashboard.html')) {
        return 'dashboard';
    }
    
    return 'dashboard'; // fallback
}

// Agregar controladores de clic a los enlaces de la barra lateral
function addSidebarClickHandlers() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Si tiene submenu, toggle el submenu (sin marcarlo como activo)
            if (this.classList.contains('has-submenu')) {
                e.preventDefault();
                const submenu = this.parentElement.querySelector('.submenu');
                
                if (submenu) {
                    submenu.classList.toggle('open');
                    this.classList.toggle('open');
                }
                return;
            }
            
            // Para enlaces normales (incluye subopciones), actualizar solo ese elemento como activo
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Si es una subopción, mantener el submenu abierto
            const parentLi = this.closest('li');
            const isInSubmenu = parentLi && parentLi.closest('.submenu');
            
            if (isInSubmenu) {
                const parentSubmenu = parentLi.closest('.submenu');
                const parentMenuItem = parentSubmenu.previousElementSibling;
                
                if (parentMenuItem && parentMenuItem.classList.contains('has-submenu')) {
                    // Mantener el submenu abierto, pero NO marcar el parent como activo
                    parentMenuItem.classList.add('open');
                    parentSubmenu.classList.add('open');
                }
            }
        });
    });
}

// Generar barra lateral del HTML si falla la carga - versión genérica
function getFallbackSidebar() {
    const currentPath = window.location.pathname;
    let dashboardLink, usuariosLink, rolesLink, permisosLink, clientesLink;
    
    // Detectar automáticamente las rutas basadas en la estructura de carpetas
    if (currentPath.includes('/software/')) {
        // Estamos en cualquier subcarpeta de software
        dashboardLink = '../../dashboard.html';
        usuariosLink = '../usuarios/usuario.html';
        rolesLink = '../usuarios/roles.html';
        permisosLink = '../usuarios/permisos.html';
        clientesLink = '../clientes/clientes.html';
        
        // Si estamos específicamente en usuarios
        if (currentPath.includes('/usuarios/')) {
            usuariosLink = 'usuario.html';
            rolesLink = 'roles.html';
            permisosLink = 'permisos.html';
            clientesLink = '../clientes/clientes.html';
        }
        // Si estamos en productos
        else if (currentPath.includes('/productos/')) {
            clientesLink = '../clientes/clientes.html';
        }
        // Si estamos en clientes
        else if (currentPath.includes('/clientes/')) {
            usuariosLink = '../usuarios/usuario.html';
            rolesLink = '../usuarios/roles.html';
            permisosLink = '../usuarios/permisos.html';
            clientesLink = 'clientes.html';
        }
        // Si estamos en ventas
        else if (currentPath.includes('/ventas/')) {
            ventasLink = '../ventas/ventas.html';
        }
    } else if (currentPath.includes('/templates/')) {
        dashboardLink = 'dashboard.html';
        usuariosLink = 'software/usuarios/usuario.html';
        rolesLink = 'software/usuarios/roles.html';
        permisosLink = 'software/usuarios/permisos.html';
        clientesLink = 'software/clientes/clientes.html';
        ventasLink = 'software/ventas/ventas.html';
    } else {
        dashboardLink = 'templates/dashboard.html';
        usuariosLink = 'templates/software/usuarios/usuario.html';
        rolesLink = 'templates/software/usuarios/roles.html';
        permisosLink = 'templates/software/usuarios/permisos.html';
        clientesLink = 'templates/software/clientes/clientes.html';
        clientesLink = 'templates/software/ventas/ventas.html';
    }
    
    return `
        <nav class="sidebar">
            <h1>DETALLES</h1>
            <ul class="nav-menu">
                <li><a href="${dashboardLink}" data-page="dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </a></li>
                <li><a href="${usuariosLink}" data-page="usuarios">
                    <i class="fas fa-users"></i>
                    Usuarios
                </a></li>
                <li><a href="${rolesLink}" data-page="roles">
                    <i class="fas fa-user-shield"></i>
                    Roles
                </a></li>
                <li><a href="${permisosLink}" data-page="permisos">
                    <i class="fas fa-shield-alt"></i>
                    Permisos
                </a></li>
                <li><a href="#" data-page="productos" class="has-submenu">
                    <i class="fas fa-box"></i>
                    Productos
                    <i class="fas fa-chevron-down submenu-arrow"></i>
                </a>
                    <ul class="submenu">
                        <li><a href="../productos/calzados.html" data-page="calzado">
                            <i class="fas fa-shoe-prints"></i>
                            Calzado
                        </a></li>
                        <li><a href="../productos/accesorios.html" data-page="accesorios">
                            <i class="fas fa-glasses"></i>
                            Accesorios
                        </a></li>
                    </ul>
                </li>
                <li><a href="${clientesLink}" data-page="clientes">
                    <i class="fas fa-user-friends"></i>
                    Clientes
                </a></li>
                <li><a href="#" data-page="ventas">
                    <i class="fas fa-shopping-cart"></i>
                    Ventas
                </a></li>
                <li><a href="#" data-page="stock">
                    <i class="fas fa-warehouse"></i>
                    Stock
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
