/**
 * profile.js
 * Gestiona la página de perfil del usuario
 */

(function () {
    const API_PERFIL = '/api/perfil/mis-datos';

    document.addEventListener('DOMContentLoaded', cargarDatosUsuario);

    async function cargarDatosUsuario() {
        try {
            const response = await fetch(API_PERFIL, { credentials: 'include' });

            if (response.status === 401) {
                window.location.href = '/Detalles_web/login/logueo.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Error al cargar datos');
            }

            const data = await response.json();
            mostrarDatos(data);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('loading').innerHTML =
                '<p style="color:red;">Error al cargar información del perfil</p>';
        }
    }

    function mostrarDatos(data) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('profile-content').style.display = 'block';

        document.getElementById('user-fullname').textContent =
            `${data.nombres} ${data.apellidos}`;
        document.getElementById('username').textContent = data.username || '-';
        document.getElementById('nombres').textContent = data.nombres || '-';
        document.getElementById('apellidos').textContent = data.apellidos || '-';
        document.getElementById('email').textContent = data.email || '-';
        document.getElementById('documento').textContent = data.numeroDocumento || '-';
        document.getElementById('celular').textContent = data.celular || '-';
        document.getElementById('direccion').textContent = data.direccion || '-';
    }
})();
