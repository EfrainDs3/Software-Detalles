// Perfil JavaScript - Manejo de datos y edición del perfil

document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    function checkSession() {
        const usuarioLogueado = localStorage.getItem('usuarioLogueado');
        if (!usuarioLogueado) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    if (!checkSession()) {
        return;
    }

    // Variables globales
    let datosUsuario = {};
    let editando = {
        personal: false,
        contacto: false
    };

    // ===== CARGAR DATOS DEL USUARIO =====
    function cargarDatos() {
        fetch('/api/perfil/datos', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Error al cargar datos');
            }
            return response.json();
        })
        .then(data => {
            datosUsuario = data.user;
            mostrarDatosPersonales();
            mostrarDatosContacto();
            mostrarCompras(data.compras);
            mostrarFavoritos(data.favoritos);
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('Error al cargar los datos del perfil', 'error');
        });
    }

    // ===== MOSTRAR DATOS PERSONALES =====
    function mostrarDatosPersonales() {
        document.getElementById('nombres-display').textContent = datosUsuario.nombres || '-';
        document.getElementById('apellidos-display').textContent = datosUsuario.apellidos || '-';
        document.getElementById('username-display').textContent = datosUsuario.username || '-';
        document.getElementById('email-display').textContent = datosUsuario.email || '-';

        // Llenar formulario
        document.getElementById('input-nombres').value = datosUsuario.nombres || '';
        document.getElementById('input-apellidos').value = datosUsuario.apellidos || '';
        document.getElementById('input-email').value = datosUsuario.email || '';
    }

    // ===== MOSTRAR DATOS DE CONTACTO =====
    function mostrarDatosContacto() {
        document.getElementById('celular-display').textContent = datosUsuario.celular || '-';
        document.getElementById('direccion-display').textContent = datosUsuario.direccion || '-';
        document.getElementById('documento-display').textContent = datosUsuario.numero_documento || '-';

        // Llenar formulario
        document.getElementById('input-celular').value = datosUsuario.celular || '';
        document.getElementById('input-direccion').value = datosUsuario.direccion || '';
        document.getElementById('input-documento').value = datosUsuario.numero_documento || '';
    }

    // ===== MOSTRAR COMPRAS =====
    function mostrarCompras(compras) {
        const container = document.getElementById('compras-container');
        
        if (!compras || compras.length === 0) {
            container.innerHTML = '<div class="empty-message"><i class="fas fa-inbox"></i><p>No hay compras registradas</p></div>';
            return;
        }

        let html = '<div class="compras-list">';
        compras.forEach(compra => {
            const fecha = new Date(compra.fecha_emision).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const total = parseFloat(compra.total).toFixed(2);

            html += `
                <div class="compra-item">
                    <div class="compra-item-field">
                        <label>ID Comprobante</label>
                        <p>${compra.id_comprobante}</p>
                    </div>
                    <div class="compra-item-field">
                        <label>Fecha</label>
                        <p>${fecha}</p>
                    </div>
                    <div class="compra-item-field">
                        <label>Total</label>
                        <p>S/. ${total}</p>
                    </div>
                    <div class="compra-item-field">
                        <label>Estado</label>
                        <span class="compra-estado ${compra.estado.toLowerCase()}">${compra.estado}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ===== MOSTRAR FAVORITOS =====
    function mostrarFavoritos(favoritos) {
        const container = document.getElementById('favoritos-container');
        
        if (!favoritos || favoritos.length === 0) {
            container.innerHTML = '<div class="empty-message"><i class="fas fa-star"></i><p>No hay productos en tu carrito</p></div>';
            return;
        }

        let html = '<div class="favoritos-grid">';
        favoritos.forEach(producto => {
            const precio = parseFloat(producto.precio_venta).toFixed(2);
            // producto.imagen already contains the public path returned by the backend (e.g. "/img/Upload/productos/archivo.jpg")
            const imagen = producto.imagen ? producto.imagen : null;

            html += `
                <div class="favorito-card">
                    <div class="favorito-imagen">
                        ${imagen ? `<img src="${imagen}" alt="${producto.nombre_producto}">` : '<i class="fas fa-image"></i>'}
                    </div>
                    <div class="favorito-info">
                        <div class="favorito-nombre" title="${producto.nombre_producto}">${producto.nombre_producto}</div>
                        <div class="favorito-detalles">
                            <span class="favorito-tipo">${producto.tipo || 'N/A'}</span>
                            <span class="favorito-precio">S/. ${precio}</span>
                        </div>
                        ${producto.color ? `<div class="favorito-color">Color: ${producto.color}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ===== EDITAR DATOS PERSONALES =====
    document.getElementById('btn-edit-personal').addEventListener('click', function() {
        editando.personal = !editando.personal;
        mostrarFormularioPersonal(editando.personal);
    });

    document.getElementById('btn-cancel-personal').addEventListener('click', function() {
        editando.personal = false;
        mostrarFormularioPersonal(false);
    });

    function mostrarFormularioPersonal(mostrar) {
        const datosDiv = document.getElementById('datos-personales');
        const formDiv = document.getElementById('form-edicion-personal');
        const btnEdit = document.getElementById('btn-edit-personal');

        if (mostrar) {
            datosDiv.style.display = 'none';
            formDiv.style.display = 'grid';
            btnEdit.textContent = '';
            btnEdit.innerHTML = '<i class="fas fa-times"></i> Cerrar';
            btnEdit.style.backgroundColor = '#666';
        } else {
            datosDiv.style.display = 'grid';
            formDiv.style.display = 'none';
            btnEdit.textContent = '';
            btnEdit.innerHTML = '<i class="fas fa-edit"></i> Editar';
            btnEdit.style.backgroundColor = '#b30000';
        }
    }

    document.getElementById('form-edicion-personal').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const datosActualizar = {
            nombres: document.getElementById('input-nombres').value,
            apellidos: document.getElementById('input-apellidos').value,
            email: document.getElementById('input-email').value
        };

        guardarCambios(datosActualizar, 'personal');
    });

    // ===== EDITAR DATOS DE CONTACTO =====
    document.getElementById('btn-edit-contacto').addEventListener('click', function() {
        editando.contacto = !editando.contacto;
        mostrarFormularioContacto(editando.contacto);
    });

    document.getElementById('btn-cancel-contacto').addEventListener('click', function() {
        editando.contacto = false;
        mostrarFormularioContacto(false);
    });

    function mostrarFormularioContacto(mostrar) {
        const datosDiv = document.getElementById('datos-contacto');
        const formDiv = document.getElementById('form-edicion-contacto');
        const btnEdit = document.getElementById('btn-edit-contacto');

        if (mostrar) {
            datosDiv.style.display = 'none';
            formDiv.style.display = 'grid';
            btnEdit.textContent = '';
            btnEdit.innerHTML = '<i class="fas fa-times"></i> Cerrar';
            btnEdit.style.backgroundColor = '#666';
        } else {
            datosDiv.style.display = 'grid';
            formDiv.style.display = 'none';
            btnEdit.textContent = '';
            btnEdit.innerHTML = '<i class="fas fa-edit"></i> Editar';
            btnEdit.style.backgroundColor = '#b30000';
        }
    }

    document.getElementById('form-edicion-contacto').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const datosActualizar = {
            celular: document.getElementById('input-celular').value || null,
            direccion: document.getElementById('input-direccion').value || null,
            numero_documento: document.getElementById('input-documento').value || null
        };

        guardarCambios(datosActualizar, 'contacto');
    });

    // ===== GUARDAR CAMBIOS =====
    function guardarCambios(datos, seccion) {
        const btnSubmit = document.querySelector(`#form-edicion-${seccion} button[type="submit"]`);
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Guardando...';

        fetch('/api/perfil/actualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(datos)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Error al guardar cambios');
            }
            return response.json();
        })
        .then(data => {
            if (data.success || data.mensaje) {
                mostrarNotificacion('Cambios guardados exitosamente', 'success');
                // Recargar datos
                cargarDatos();
                // Cerrar formulario
                editando[seccion] = false;
                if (seccion === 'personal') {
                    mostrarFormularioPersonal(false);
                } else {
                    mostrarFormularioContacto(false);
                }
            } else {
                mostrarNotificacion(data.error || 'Error al guardar cambios', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarNotificacion('Error al guardar cambios. Intenta nuevamente', 'error');
        })
        .finally(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        });
    }

    // ===== NOTIFICACIONES =====
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.innerHTML = `
            <strong>${tipo === 'success' ? '✓' : tipo === 'error' ? '✗' : 'ℹ'}</strong> ${mensaje}
        `;

        const perfil = document.querySelector('.perfil-container');
        perfil.insertBefore(notification, perfil.firstChild);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Cargar datos al iniciar
    cargarDatos();
});
