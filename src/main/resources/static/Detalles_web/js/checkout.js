/**
 * checkout.js v2.0
 * Maneja el proceso de checkout con carga automática de datos del usuario
 */

(function () {
    const API_CARRITO = '/api/carrito';
    const API_CHECKOUT = '/api/checkout/procesar';
    const API_PERFIL = '/api/perfil/mis-datos';
    const API_AUTH = '/api/auth/status';

    let userData = null;
    let carritoData = {
        items: [],
        subtotal: 0,
        igv: 0,
        total: 0
    };

    /**
     * Inicialización
     */
    document.addEventListener('DOMContentLoaded', () => {
        inicializarCheckout();
    });

    /**
     * Inicializa el checkout
     */
    async function inicializarCheckout() {
        mostrarLoading(true);

        try {
            // 1. Verificar autenticación
            await verificarAutenticacion();

            // 2. Cargar datos del usuario
            await cargarDatosUsuario();

            // 3. Cargar carrito
            await cargarResumenCarrito();

            // 4. Setup formulario
            setupFormulario();

            mostrarLoading(false);

        } catch (error) {
            console.error('Error en inicialización:', error);
            mostrarMensaje(error.message, 'error');
            mostrarLoading(false);
        }
    }

    /**
     * Verifica autenticación
     */
    async function verificarAutenticacion() {
        const response = await fetch(API_AUTH, { credentials: 'include' });
        const data = await response.json();

        if (!data.authenticated || !data.userId) {
            window.location.href = '/Detalles_web/login/logueo.html';
            throw new Error('No autenticado');
        }

        return data;
    }

    /**
     * Carga datos del usuario
     */
    async function cargarDatosUsuario() {
        try {
            const response = await fetch(API_PERFIL, { credentials: 'include' });

            if (!response.ok) {
                throw new Error('Error al cargar datos del usuario');
            }

            userData = await response.json();

            // Llenar formulario con datos del usuario
            document.getElementById('nombreCompleto').value =
                `${userData.nombres} ${userData.apellidos}`;
            document.getElementById('email').value = userData.email || '';
            document.getElementById('documento').value = userData.numeroDocumento || '';
            document.getElementById('telefono').value = userData.celular || '';

            // Si tiene dirección guardada, pre-llenarla
            if (userData.direccion) {
                document.getElementById('direccion').value = userData.direccion;
            }

        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            mostrarMensaje('Error al cargar tus datos', 'warning');
        }
    }

    /**
     * Carga el resumen del carrito
     */
    async function cargarResumenCarrito() {
        try {
            const authData = await verificarAutenticacion();

            const response = await fetch(`${API_CARRITO}/${authData.userId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Error al cargar el carrito');
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                mostrarMensaje('Tu carrito está vacío', 'warning');
                setTimeout(() => {
                    window.location.href = '/index';
                }, 2000);
                return;
            }

            carritoData = data;
            mostrarResumen(data.items);
            actualizarTotales();

        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error al cargar el resumen del carrito', 'error');
        }
    }

    /**
     * Muestra el resumen de items
     */
    function mostrarResumen(items) {
        const container = document.getElementById('summaryItems');

        if (!items || items.length === 0) {
            container.innerHTML = '<p class="empty-cart">No hay items en el carrito</p>';
            return;
        }

        let subtotal = 0;

        // Crear HTML de items
        container.innerHTML = items.map(item => {
            const precio = item.precioVenta || item.precio || 0;
            const cantidad = item.cantidad || 1;
            const subtotalItem = precio * cantidad;
            subtotal += subtotalItem;

            // Imagen del producto (si existe)
            const imagenUrl = item.imagenUrl || item.imagen || '/img/placeholder-product.jpg';

            return `
                <div class="cart-item-card">
                    <div class="item-image">
                        <img src="${imagenUrl}" alt="${item.nombreProducto}" onerror="this.src='/img/placeholder-product.jpg'">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.nombreProducto || 'Producto'}</div>
                        <div class="item-meta">
                            <span class="item-quantity">Cantidad: ${cantidad}</span>
                            <span class="item-price">S/ ${precio.toFixed(2)} c/u</span>
                        </div>
                    </div>
                    <div class="item-total">
                        <div class="total-label">Total</div>
                        <div class="total-amount">S/ ${subtotalItem.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Calcular totales
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
        document.getElementById('igv').textContent = `S/ ${igv.toFixed(2)}`;
        document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;

        carritoData.subtotal = subtotal;
        carritoData.igv = igv;
        carritoData.total = total;
    }

    /**
     * Actualiza los totales 
     */
    function actualizarTotales() {
        // Ya actualizado en mostrarResumen
    }

    /**
     * Configura el formulario
     */
    function setupFormulario() {
        const btnProcesar = document.getElementById('btnProcesar');
        const form = document.getElementById('checkoutForm');

        btnProcesar.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            await procesarCompra();
        });
    }

    /**
     * Procesa la compra
     */
    async function procesarCompra() {
        const direccion = document.getElementById('direccion').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const tipoComprobante = document.getElementById('tipoComprobante').value;

        // Validaciones
        if (!direccion) {
            mostrarMensaje('Por favor ingresa la dirección de envío', 'error');
            return;
        }

        if (!confirm('¿Confirmar la compra?\n\nSe procesará tu pedido con los datos ingresados.')) {
            return;
        }

        // Mostrar loading
        mostrarLoading(true);
        deshabilitarBoton(true);

        try {
            const response = await fetch(API_CHECKOUT, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    direccionEnvio: direccion,
                    telefonoContacto: telefono,
                    idTipoComprobante: parseInt(tipoComprobante)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al procesar la compra');
            }

            // Éxito
            mostrarLoading(false);
            mostrarConfirmacion(data.comprobante);

        } catch (error) {
            console.error('Error:', error);
            mostrarLoading(false);
            deshabilitarBoton(false);
            mostrarMensaje(error.message || 'Error al procesar la compra', 'error');
        }
    }

    /**
     * Muestra la confirmación de compra
     */
    function mostrarConfirmacion(comprobante) {
        const container = document.querySelector('.checkout-container');

        container.innerHTML = `
           <div class="confirmation-card">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h1>¡Compra Realizada con Éxito!</h1>
                <p class="subtitle">Tu pedido ha sido procesado correctamente</p>
                
                <div class="comprobante-info">
                    <div class="info-item">
                        <span class="label">Número de Comprobante</span>
                        <span class="value numero">${comprobante.numeroComprobante}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Total Pagado</span>
                        <span class="value total">S/ ${parseFloat(comprobante.total).toFixed(2)}</span>
                    </div>
                </div>

                <div class="confirmation-message">
                    <i class="fas fa-envelope"></i>
                    <p>Recibirás un correo con los detalles de tu pedido</p>
                </div>

                <div class="action-buttons">
                    <button onclick="window.open('/api/compras/${comprobante.idComprobante}/boleta', '_blank')" 
                            class="btn-primary">
                        <i class="fas fa-file-pdf"></i> Descargar Boleta
                    </button>
                    <button onclick="window.location.href='/Detalles_web/perfil/mis-compras.html'" 
                            class="btn-secondary">
                        <i class="fas fa-receipt"></i> Ver Mis Compras
                    </button>
                    <button onclick="window.location.href='/index'" 
                            class="btn-outline">
                        <i class="fas fa-home"></i> Volver al Inicio
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Muestra/oculta loading
     */
    function mostrarLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            if (show) {
                loading.classList.add('active');
            } else {
                loading.classList.remove('active');
            }
        }
    }

    /**
     * Deshabilita/habilita botón
     */
    function deshabilitarBoton(deshabilitar) {
        const btn = document.getElementById('btnProcesar');
        if (btn) {
            btn.disabled = deshabilitar;
        }
    }

    /**
     * Muestra mensaje de error/éxito
     */
    function mostrarMensaje(texto, tipo) {
        const message = document.getElementById('message');
        if (message) {
            message.textContent = texto;
            message.className = `message ${tipo}`;
            message.style.display = 'block';

            setTimeout(() => {
                message.style.display = 'none';
            }, 5000);
        }
    }

})();
