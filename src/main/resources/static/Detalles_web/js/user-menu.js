/**
 * user-menu.js
 * ACTUALIZADO: Click directo al perfil sin dropdown
 */

(function () {
    const API_AUTH_STATUS = '/api/auth/status';

    // Verificar autenticación al cargar
    document.addEventListener('DOMContentLoaded', function () {
        verificarAutenticacion();
    });

    async function verificarAutenticacion() {
        try {
            const response = await fetch(API_AUTH_STATUS, { credentials: 'include' });
            const data = await response.json();

            const userMenuBtn = document.getElementById('userMenuBtn');

            if (data.authenticated) {
                // Usuario autenticado: mostrar nombre y hacer click directo al perfil
                const userName = document.getElementById('userName');
                if (userName) {
                    userName.textContent = data.username;
                    userName.style.display = 'inline';
                }

                // Click directo al perfil (sin dropdown)
                if (userMenuBtn) {
                    userMenuBtn.href = '/Detalles_web/perfil/mi-cuenta.html';
                }
            } else {
                // No autenticado: ir al login
                if (userMenuBtn) {
                    userMenuBtn.href = '/Detalles_web/login/logueo.html';
                }
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
        }
    }
})();
