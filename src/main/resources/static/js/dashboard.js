// Dashboard JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay una sesión activa
    function checkSession() {
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        const loginTime = localStorage.getItem('loginTime');
        
        if (!usuarioLogueado || !loginTime) {
            // No hay sesión, redirigir al login
            window.location.href = 'software/login.html';
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
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            window.location.href = 'software/login.html';
            return false;
        }
        
        return true;
    }

    // Verificar sesión al cargar
    if (!checkSession()) {
        return;
    }

    // Mostrar información del usuario logueado
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const topBar = document.querySelector('.top-bar h2');
    if (topBar && usuarioLogueado) {
        topBar.textContent = `Bienvenido, ${usuarioLogueado}`;
    }

    // Las tarjetas ahora usan enlaces directos, no necesitan JavaScript adicional para navegación

    // Add click functionality to logout button
    document.querySelector('.logout-btn').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar sesión
            localStorage.removeItem('usuarioLogueado');
            localStorage.removeItem('loginTime');
            
            // Mostrar mensaje y redirigir
            alert('Sesión cerrada correctamente');
            window.location.href = 'software/login.html';
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
