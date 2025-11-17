// Dashboard JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay una sesión activa
    function checkSession() {
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const loginTime = localStorage.getItem('loginTime');
        
        if (!usuarioLogueado || !loginTime) {
            // No hay sesión, redirigir al login
            localStorage.removeItem('usuarioNombre');
            localStorage.removeItem('usuarioRoles');
            localStorage.removeItem('usuarioPermisos');
            localStorage.removeItem('usuarioModulos');
            window.location.href = '/login';
            return false;
        }
        
        // Verificar si la sesión no ha expirado (24 horas)
        const now = new Date();
        const loginDate = new Date(loginTime);
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursDiff >= 24) {
            // Sesión expirada
            localStorage.removeItem('usuarioLogueado');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('usuarioNombre');
            localStorage.removeItem('usuarioRoles');
            localStorage.removeItem('usuarioPermisos');
            localStorage.removeItem('usuarioModulos');
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            window.location.href = '/login';
            return false;
        }
        
        return true;
    }

    // Verificar sesión al cargar
    if (!checkSession()) {
        return;
    }

    // Mostrar información del usuario logueado
    const usuarioLogueado = localStorage.getItem('usuarioNombre') || localStorage.getItem('usuarioLogueado');
    const topBar = document.querySelector('.top-bar h2');
    if (topBar && usuarioLogueado) {
        topBar.textContent = `Bienvenido, ${usuarioLogueado}`;
    }

    // Utility: show floating message at top-right (type: 'error'|'success'|'info')
    function showMessage(message, type) {
        const existing = document.querySelector('.dashboard-message');
        if (existing) existing.remove();

        const div = document.createElement('div');
        div.className = `dashboard-message dashboard-message-${type}`;
        div.textContent = message;
        div.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 2000; padding: 12px 16px; border-radius:8px; color: white; font-weight:700; max-width:320px; word-wrap:break-word;box-shadow:0 4px 12px rgba(0,0,0,0.2)`;
        if (type === 'error') div.style.backgroundColor = '#dc2626';
        else if (type === 'success') div.style.backgroundColor = '#10b981';
        else div.style.backgroundColor = '#2563eb';

        document.body.appendChild(div);
        setTimeout(() => { div.remove(); }, 3000);
    }

    // Las tarjetas ahora usan enlaces directos, no necesitan JavaScript adicional para navegación

    // Apply module permission UI: color allowed modules and block unauthorized clicks
    (function applyModulePermissions() {
        let modulos = [];
        try {
            modulos = JSON.parse(localStorage.getItem('usuarioModulos') || '[]');
            if (!Array.isArray(modulos)) modulos = [];
        } catch (e) {
            modulos = [];
        }

        // normalize values to strings
        const modSet = new Set(modulos.map(m => String(m).toUpperCase()));

        document.querySelectorAll('.card-link').forEach(link => {
            const modulo = (link.getAttribute('data-modulo') || '').toUpperCase();
            const card = link.querySelector('.card');

            const allowed = modulo && modSet.has(modulo);

            if (allowed) {
                if (card) card.classList.add('allowed');
            } else {
                // mark unauthorized visually
                if (card) card.classList.add('unauthorized');
                link.classList.add('unauthorized');

                // intercept clicks to show friendly message
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    showMessage('No tiene permisos disponibles para este módulo', 'error');
                });
            }
        });
    })();

    // Add click functionality to logout button
    document.querySelector('.logout-btn').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar sesión
            localStorage.removeItem('usuarioLogueado');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('usuarioNombre');
            localStorage.removeItem('usuarioRoles');
            localStorage.removeItem('usuarioPermisos');
            localStorage.removeItem('usuarioModulos');
            
            // Mostrar mensaje y redirigir
            alert('Sesión cerrada correctamente');
            window.location.href = '/login';
        }
    });

    // Add click functionality to navigation menu
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent;
            alert(`Navegando a: ${text}`);
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key to close any open modals or go back
        if (e.key === 'Escape') {
            console.log('Escape key pressed');
        }
        
        // Enter key on focused elements
        if (e.key === 'Enter') {
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('card') || 
                focusedElement.classList.contains('logout-btn') ||
                focusedElement.classList.contains('nav-menu')) {
                focusedElement.click();
            }
        }
    });

    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Add card hover effects with sound (optional)
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add sidebar toggle for mobile (optional enhancement)
    const sidebarToggle = document.createElement('button');
    sidebarToggle.innerHTML = '☰';
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.style.cssText = `
        display: none;
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        background: #b30000;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 18px;
    `;

    document.body.appendChild(sidebarToggle);

    // Show/hide sidebar toggle on mobile
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            sidebarToggle.style.display = 'block';
        } else {
            sidebarToggle.style.display = 'none';
        }
    }

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();

    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
    });
});
