// Sidebar Component JavaScript

// Load sidebar into specified container
function loadSidebar(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    // Determine the correct path based on current location
    const currentPath = window.location.pathname;
    let sidebarPath;
    
    if (currentPath.includes('/software/usuarios/')) {
        sidebarPath = '../../../templates/components/sidebar.html';
    } else if (currentPath.includes('/templates/')) {
        sidebarPath = 'components/sidebar.html';
    } else {
        sidebarPath = 'templates/components/sidebar.html';
    }

    // Fetch sidebar HTML
    fetch(sidebarPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            container.innerHTML = html;
            
            // Set active page after loading
            setActivePage();
            
            // Add click handlers
            addSidebarClickHandlers();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            // Fallback sidebar if fetch fails
            container.innerHTML = getFallbackSidebar();
            setActivePage();
            addSidebarClickHandlers();
        });
}

// Set active page based on current URL
function setActivePage() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const pageData = link.getAttribute('data-page');
        if (pageData === currentPage) {
            link.classList.add('active');
        }
    });
}

// Get current page from URL
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Map filenames to page identifiers
    const pageMap = {
        'dashboard.html': 'dashboard',
        'usuario.html': 'usuarios',
        'roles.html': 'roles',
        'index.html': 'usuarios', // fallback for index
        '': 'dashboard' // root path
    };
    
    // Check if we're on the root dashboard
    if (path.endsWith('/') || path.endsWith('/templates/') || path.endsWith('/templates/dashboard.html')) {
        return 'dashboard';
    }
    
    return pageMap[filename] || 'dashboard';
}

// Add click handlers to sidebar links
function addSidebarClickHandlers() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Let browser handle all navigation normally
            // No need to prevent default or handle manually
        });
    });
}

// Fallback sidebar HTML in case fetch fails
function getFallbackSidebar() {
    const currentPath = window.location.pathname;
    let dashboardLink, usuariosLink, rolesLink;
    
    if (currentPath.includes('/software/usuarios/')) {
        dashboardLink = '../../dashboard.html';
        usuariosLink = 'usuario.html';
        rolesLink = 'roles.html';
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

// Update sidebar navigation (for dynamic updates)
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
