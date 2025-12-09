/**
 * perfil-page.js
 * Gestiona la página de perfil con sidebar y múltiples secciones
 */

(function () {
    const API_PERFIL = '/api/perfil/mis-datos';
    const API_PASSWORD = '/api/perfil/cambiar-password';
    const API_FAVORITOS = '/api/favoritos';

    // Inicialización
    document.addEventListener('DOMContentLoaded', function () {
        cargarDatosUsuario();
        setupNavigation();
        setupPasswordForm();
        setupPerfilForm();
        setupLogout();
    });

    // === NAVEGACIÓN ENTRE SECCIONES ===
    function setupNavigation() {
        const navItems = document.querySelectorAll('.perfil-nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();

                const section = this.dataset.section;

                // Actualizar navegación activa
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');

                // Mostrar sección correspondiente
                document.querySelectorAll('.perfil-section').forEach(sec => {
                    sec.classList.remove('active');
                    sec.style.display = 'none';
                });

                const targetSection = document.getElementById(`section-${section}`);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    targetSection.classList.add('active');

                    // Cargar datos si es necesario
                    if (section === 'favoritos') {
                        cargarFavoritos();
                    }
                }
            });
        });
    }

    // === CARGAR DATOS DEL USUARIO ===
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
            document.getElementById('loading-datos').innerHTML =
                '<p style="color:red;">Error al cargar información del perfil</p>';
        }
    }

    function mostrarDatos(data) {
        // Ocultar loading
        document.getElementById('loading-datos').style.display = 'none';
        document.getElementById('content-datos').style.display = 'block';

        // Llenar sidebar
        const fullName = `${data.nombres} ${data.apellidos}`;
        document.getElementById('sidebarUsername').textContent = fullName;
        document.getElementById('sidebarEmail').textContent = data.email || '';

        // Llenar formulario
        document.getElementById('username').value = data.username || '';
        document.getElementById('nombres').value = data.nombres || '';
        document.getElementById('apellidos').value = data.apellidos || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('documento').value = data.numeroDocumento || '';
        document.getElementById('celular').value = data.celular || '';
    }

    // === CAMBIAR CONTRASEÑA ===
    function setupPasswordForm() {
        const form = document.getElementById('password-form');
        const messageDiv = document.getElementById('password-message');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const actual = document.getElementById('password-actual').value;
            const nueva = document.getElementById('password-nueva').value;
            const confirm = document.getElementById('password-confirm').value;

            // Validar que coincidan
            if (nueva !== confirm) {
                showMessage('Las contraseñas no coinciden', 'error');
                return;
            }

            try {
                const response = await fetch(API_PASSWORD, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        passwordActual: actual,
                        passwordNueva: nueva
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('Contraseña actualizada correctamente', 'success');
                    form.reset();
                } else {
                    showMessage(data.error || 'Error al cambiar contraseña', 'error');
                }
            } catch (error) {
                showMessage('Error de conexión', 'error');
            }
        });

        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = `perfil-message ${type}`;
            messageDiv.style.display = 'block';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // === ACTUALIZAR PERFIL ===
    function setupPerfilForm() {
        const btn = document.getElementById('guardarCambios');
        const messageDiv = document.getElementById('perfil-message');

        if (!btn) return;

        btn.addEventListener('click', async function () {
            const nombres = document.getElementById('nombres').value.trim();
            const apellidos = document.getElementById('apellidos').value.trim();
            const email = document.getElementById('email').value.trim();
            const documento = document.getElementById('documento').value.trim();
            const celular = document.getElementById('celular').value.trim();

            // Validaciones
            if (!nombres || !apellidos || !email) {
                showPerfilMessage('Los campos Nombres, Apellidos y Email son obligatorios', 'error');
                return;
            }

            if (documento && documento.length !== 8) {
                showPerfilMessage('El DNI debe tener exactamente 8 dígitos', 'error');
                return;
            }

            if (celular && celular.length !== 9) {
                showPerfilMessage('El celular debe tener exactamente 9 dígitos', 'error');
                return;
            }

            try {
                const response = await fetch('/api/perfil/actualizar', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombres,
                        apellidos,
                        email,
                        numeroDocumento: documento,
                        celular
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showPerfilMessage('Información actualizada correctamente', 'success');
                    // Actualizar sidebar
                    const fullName = `${nombres} ${apellidos}`;
                    document.getElementById('sidebarUsername').textContent = fullName;
                    document.getElementById('sidebarEmail').textContent = email;
                } else {
                    showPerfilMessage(data.error || 'Error al actualizar información', 'error');
                }
            } catch (error) {
                showPerfilMessage('Error de conexión', 'error');
            }
        });

        function showPerfilMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = `perfil-message ${type}`;
            messageDiv.style.display = 'block';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // === FAVORITOS ===
    async function cargarFavoritos() {
        const loading = document.getElementById('loading-favoritos');
        const grid = document.getElementById('favoritos-grid');
        const emptyMsg = document.getElementById('empty-favoritos');

        loading.style.display = 'block';
        grid.style.display = 'none';
        emptyMsg.style.display = 'none';

        try {
            const response = await fetch(API_FAVORITOS, { credentials: 'include' });

            if (response.status === 401) {
                window.location.href = '/Detalles_web/login/logueo.html';
                return;
            }

            const data = await response.json();
            loading.style.display = 'none';

            if (!data.favoritos || data.favoritos.length === 0) {
                emptyMsg.style.display = 'block';
                return;
            }

            mostrarFavoritos(data.favoritos);
        } catch (error) {
            console.error('Error:', error);
            loading.innerHTML = '<p style="color:red;">Error al cargar favoritos</p>';
        }
    }

    function mostrarFavoritos(favoritos) {
        const grid = document.getElementById('favoritos-grid');
        grid.style.display = 'grid';

        grid.innerHTML = favoritos.map(fav => `
            <div class="favorito-card">
                <img src="${fav.producto.imagen || '/img/calzado-default.jpg'}" 
                     alt="${fav.producto.nombre}" class="favorito-image">
                <div class="favorito-info">
                    <div class="favorito-name">${fav.producto.nombre}</div>
                    <div class="favorito-price">S/ ${fav.producto.precio.toFixed(2)}</div>
                    <div class="favorito-actions">
                        <button class="favorito-btn favorito-btn-cart" onclick="agregarAlCarrito(${fav.producto.id})">
                            <i class="fas fa-cart-plus"></i> Añadir
                        </button>
                        <button class="favorito-btn favorito-btn-remove" onclick="eliminarFavorito(${fav.producto.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // === FUNCIONES GLOBALES ===
    window.eliminarFavorito = async function (idProducto) {
        if (!confirm('¿Eliminar de favoritos?')) return;

        try {
            const response = await fetch(`${API_FAVORITOS}/${idProducto}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                cargarFavoritos();
            } else {
                alert('Error al eliminar');
            }
        } catch (error) {
            alert('Error al eliminar de favoritos');
        }
    };

    window.agregarAlCarrito = async function (idProducto) {
        try {
            const authRes = await fetch('/api/auth/status', { credentials: 'include' });
            const authData = await authRes.json();

            if (!authData.authenticated) {
                window.location.href = '/Detalles_web/login/logueo.html';
                return;
            }

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
            alert('Error al agregar al carrito');
        }
    };

    // === LOGOUT ===
    function setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', function () {
            if (confirm('¿Cerrar sesión?')) {
                // Limpiar almacenamiento local primero
                localStorage.clear();
                sessionStorage.clear();

                // Hacer logout en el servidor
                fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                }).finally(() => {
                    // Redirigir al index como visitante (sin sesión)
                    window.location.href = '/index';
                });
            }
        });
    }
})();
