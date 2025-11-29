// Script para manejar la navegación del icono de usuario
// Verifica si el usuario está autenticado y redirige al perfil o al login

function irAPerfil(event) {
    if (event) {
        event.preventDefault();
    }

    // Verificar si el usuario está autenticado
    fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                // Usuario autenticado, redirigir al perfil
                window.location.href = '/Detalles_web/perfil/mi-cuenta.html';
            } else {
                // No autenticado, redirigir al login
                window.location.href = '/Detalles_web/login/logueo.html';
            }
        })
        .catch(error => {
            console.error('Error al verificar autenticación:', error);
            // En caso de error, redirigir al login
            window.location.href = '/Detalles_web/login/logueo.html';
        });
}

// Inicializar el enlace del usuario cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    const userIcon = document.querySelector('.nav-icon[href*="login"], .nav-icon[href*="perfil"]');

    if (userIcon) {
        userIcon.href = '#';
        userIcon.addEventListener('click', irAPerfil);
    }
});
