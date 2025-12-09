/**
 * favorites-handler.js
 * Maneja la funcionalidad de favoritos en todas las páginas de productos
 * 
 * - Verifica si el usuario está autenticado consultando /api/auth/status
 * - En botones de favoritos (.btn-favorite, onclick="agregarFavoritos()"):
 *    - Si no autenticado: redirige a login
 *    - Si autenticado: agrega/elimina de favoritos mediante API
 *    - Actualiza UI (icono corazón)
 */

(function () {
    const LOGIN_URL = "/Detalles_web/login/logueo.html";
    let userAuthData = null;

    /**
     * Agrega un producto a favoritos
     */
    async function agregarAFavoritos(productId) {
        try {
            const response = await fetch('/api/favoritos/agregar', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idProducto: parseInt(productId)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✓ Producto agregado a favoritos');
                // Actualizar UI del botón si es necesario
                actualizarBotonFavorito(productId, true);
            } else {
                alert(data.error || 'Error al agregar a favoritos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al agregar a favoritos');
        }
    }

    /**
     * Elimina un producto de favoritos
     */
    async function eliminarDeFavoritos(productId) {
        try {
            const response = await fetch(`/api/favoritos/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                alert('✓ Producto eliminado de favoritos');
                actualizarBotonFavorito(productId, false);
            } else {
                alert(data.error || 'Error al eliminar de favoritos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión al eliminar de favoritos');
        }
    }

    /**
     * Actualiza la UI del botón de favorito
     */
    function actualizarBotonFavorito(productId, esFavorito) {
        const botones = document.querySelectorAll(`[data-id="${productId}"][onclick*="Favoritos"]`);
        botones.forEach(btn => {
            const icono = btn.querySelector('i');
            if (icono) {
                if (esFavorito) {
                    icono.classList.remove('far');
                    icono.classList.add('fas');
                    icono.style.color = '#e91e63';
                } else {
                    icono.classList.remove('fas');
                    icono.classList.add('far');
                    icono.style.color = '';
                }
            }
        });
    }

    /**
     * Configura los botones de favoritos en la página
     */
    function configurarBotonesFavoritos(authData) {
        const isAuth = authData.authenticated === true;
        userAuthData = authData;

        // Buscar todos los botones con onclick="agregarFavoritos(...)"
        const botones = document.querySelectorAll('[onclick*="agregarFavoritos"]');

        botones.forEach(btn => {
            if (btn.dataset.favBound === '1') return;
            btn.dataset.favBound = '1';

            // Remover el onclick original
            const onclickAttr = btn.getAttribute('onclick');
            btn.removeAttribute('onclick');

            // Extraer el ID del producto del onclick original
            const match = onclickAttr.match(/agregarFavoritos\((\d+)\)/);
            if (!match) return;

            const productId = match[1];
            btn.setAttribute('data-id', productId);

            // Agregar nuevo evento
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!isAuth) {
                    // Usuario no logueado → redirigir a login
                    if (confirm('Debes iniciar sesión para agregar favoritos. ¿Ir al login?')) {
                        window.location.href = LOGIN_URL;
                    }
                    return;
                }

                // Usuario logueado → agregar a favoritos
                agregarAFavoritos(productId);
            });
        });
    }

    /**
     * Función global para compatibilidad con código existente
     */
    window.agregarFavoritos = function (productId) {
        if (!userAuthData || !userAuthData.authenticated) {
            if (confirm('Debes iniciar sesión para agregar favoritos. ¿Ir al login?')) {
                window.location.href = LOGIN_URL;
            }
            return;
        }
        agregarAFavoritos(productId);
    };

    /**
     * Inicialización cuando se carga la página
     */
    document.addEventListener('DOMContentLoaded', () => {
        fetch('/api/auth/status', { credentials: 'include' })
            .then(r => r.ok ? r.json() : { authenticated: false })
            .then(data => configurarBotonesFavoritos(data))
            .catch(() => configurarBotonesFavoritos({ authenticated: false }));
    });

})();
