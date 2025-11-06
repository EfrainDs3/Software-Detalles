// Funcionalidad común para el botón de cerrar sesión
function initLogoutButton() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-logout-initialized')) {
        logoutBtn.setAttribute('data-logout-initialized', 'true');
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                fetch('/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                }).finally(() => {
                    localStorage.removeItem('usuarioLogueado');
                    localStorage.removeItem('usuarioNombre');
                    localStorage.removeItem('loginTime');
                    localStorage.removeItem('usuarioRoles');
                    localStorage.removeItem('usuarioPermisos');
                    window.location.href = '/login';
                });
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initLogoutButton);
