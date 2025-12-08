/**
 * favorites.js
 * Gestiona la página de favoritos del usuario
 */

(function () {
    const API_BASE = '/api/favoritos';
    const loading = document.getElementById('loading');
    const grid = document.getElementById('favorites-grid');
    const emptyMsg = document.getElementById('empty-favorites');
    const countSpan = document.getElementById('favorites-count');

    // Cargar favoritos al iniciar
    document.addEventListener('DOMContentLoaded', cargarFavoritos);

    async function cargarFavoritos() {
        try {
            const response = await fetch(API_BASE, { credentials: 'include' });

            if (response.status === 401) {
                window.location.href = '/Detalles_web/login/logueo.html';
                return;
            }

            const data = await response.json();
            mostrarFavoritos(data.favoritos || []);
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            loading.innerHTML = '<p style="color:red;">Error al cargar favoritos</p>';
        }
    }

    function mostrarFavoritos(favoritos) {
        loading.style.display = 'none';

        if (favoritos.length === 0) {
            emptyMsg.style.display = 'block';
            grid.style.display = 'none';
            if (countSpan) countSpan.textContent = '';
            return;
        }

        grid.style.display = 'grid';
        emptyMsg.style.display = 'none';
        if (countSpan) countSpan.textContent = `(${favoritos.length})`;

        grid.innerHTML = favoritos.map(fav => `
            <div class="favorite-card" data-id="${fav.producto.id}">
                <img src="${fav.producto.imagen || '/img/Upload/productos/producto-default.jpg'}" 
                     alt="${fav.producto.nombre}" class="favorite-image">
                <div class="favorite-info">
                    <div class="favorite-name">${fav.producto.nombre}</div>
                    <div class="favorite-price">S/ ${fav.producto.precio.toFixed(2)}</div>
                    <div class="favorite-actions">
                        <button class="btn-add-cart" onclick="agregarAlCarrito(${fav.producto.id})">
                            <i class="fas fa-shopping-cart"></i> Añadir
                        </button>
                        <button class="btn-remove" onclick="eliminarFavorito(${fav.producto.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.eliminarFavorito = async function (idProducto) {
        if (!confirm('¿Eliminar de favoritos?')) return;

        try {
            const response = await fetch(`${API_BASE}/${idProducto}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                // Recargar favoritos
                cargarFavoritos();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar de favoritos');
        }
    };

    window.agregarAlCarrito = async function (idProducto) {
        try {
            // Verificar autenticación
            const authRes = await fetch('/api/auth/status', { credentials: 'include' });
            const authData = await authRes.json();

            if (!authData.authenticated) {
                window.location.href = '/Detalles_web/login/logueo.html';
                return;
            }

            // Agregar al carrito
            const response = await fetch(`/api/carrito/${authData.userId}/agregar`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idProducto, cantidad: 1 })
            });

            if (response.ok) {
                alert('Producto agregado al carrito');
            } else {
                alert('Error al agregar al carrito');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar al carrito');
        }
    };
})();
