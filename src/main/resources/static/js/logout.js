// Funcionalidad común para el botón de cerrar sesión
function initLogoutButton() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-logout-initialized')) {
        logoutBtn.setAttribute('data-logout-initialized', 'true');
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                // Limpiar sesión
                localStorage.removeItem('usuarioLogueado');
                localStorage.removeItem('loginTime');
                
                // Redirigir sin mensaje adicional
                window.location.href = '../login.html';
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initLogoutButton);
