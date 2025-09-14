function loadSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    // ubicación
    const currentPath = window.location.pathname;
    let sidebarPath;
    
    if (currentPath.includes('/software/usuarios/')) {
        sidebarPath = '../../../templates/components/sidebar.html';
    } else if (currentPath.includes('/software/productos/')) {
        sidebarPath = '../../../templates/components/sidebar.html';
    } else if (currentPath.includes('/templates/')) {
        sidebarPath = 'components/sidebar.html';
    } else {
        sidebarPath = 'templates/components/sidebar.html';
    }

    // barra lateral
    fetch(sidebarPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            
            // la página activa después de cargar
            setActivePage();
            
            // click
            addSidebarClickHandlers();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            // opción de barra lateral 
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

// Get del URL
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Asignar nombres de archivos para las páginas
    const pageMap = {
        'dashboard.html': 'dashboard',
        'usuario.html': 'usuarios',
        'roles.html': 'roles',
        'permisos.html': 'permisos',
        'calzados.html': 'calzado',
        'accesorios.html': 'accesorios',
        'index.html': 'usuarios', // respaldo index
        '': 'dashboard' // root path
    };
    
    // Comprueba si estamos en el panel raíz
    if (path.endsWith('/') || path.endsWith('/templates/') || path.endsWith('/templates/dashboard.html')) {
        return 'dashboard';
    }
    
    return pageMap[filename] || 'dashboard';
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

// barra lateral del HTML si falla
function getFallbackSidebar() {
    const currentPath = window.location.pathname;
    let dashboardLink, usuariosLink, rolesLink;
    
    if (currentPath.includes('/software/usuarios/')) {
        dashboardLink = '../../dashboard.html';
        usuariosLink = 'usuario.html';
        rolesLink = 'roles.html';
    } else if (currentPath.includes('/software/productos/')) {
        dashboardLink = '../../dashboard.html';
        usuariosLink = '../usuarios/usuario.html';
        rolesLink = '../usuarios/roles.html';
    } else if (currentPath.includes('/templates/')) {
        dashboardLink = 'dashboard.html';
        usuariosLink = 'software/usuarios/usuario.html';
        rolesLink = 'software/usuarios/roles.html';
    } else {
        dashboardLink = 'templates/dashboard.html';
        usuariosLink = 'templates/software/usuarios/usuario.html';
        rolesLink = 'templates/software/usuarios/roles.html';
    }
    
    return `
        <nav class="sidebar">
            <h1>DETALLES</h1>
            <ul class="nav-menu">
                <li><a href="/src/main/resources/templates/dashboard.html" data-page="dashboard">Dashboard</a></li>
                <li><a href="/src/main/resources/templates/software/usuarios/usuario.html" data-page="usuarios">Usuarios</a></li>
                <li><a href="/src/main/resources/templates/software/usuarios/roles.html" data-page="roles">Roles y Permisos</a></li>
                <li><a href="/productos" data-page="productos">Productos</a></li>
                <li><a href="/clientes" data-page="clientes">Clientes</a></li>
                <li><a href="/ventas" data-page="ventas">Ventas</a></li>
                <li><a href="/stock" data-page="stock">Stock</a></li>
                <li><a href="/reportes" data-page="reportes">Reportes</a></li>
                <li><a href="/auditoria" data-page="auditoria">Auditoría</a></li>
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
