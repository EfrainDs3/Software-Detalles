document.addEventListener('DOMContentLoaded', () => {


    // ========================================
    // SISTEMA DE TOAST NOTIFICATIONS
    // ========================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="toast-content">
                <h4>${type === 'success' ? '¡Éxito!' : '¡Error!'}</h4>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    // --- Variables y Referencias del DOM ---
    const ventasTableBody = document.getElementById('ventasTableBody');

    const addVentaBtn = document.getElementById('addVentaBtn');
    const ventaModal = document.getElementById('ventaModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const ventaForm = document.getElementById('ventaForm');
    const modalTitle = document.getElementById('modalTitle');
    const addProductBtn = document.getElementById('addProductBtn');
    const productosContainer = document.getElementById('productosContainer');
    const ventaTotalSpan = document.getElementById('ventaTotal');

    const ventaTipoComprobanteSelect = document.getElementById('ventaTipoComprobante');
    const facturaFieldsDiv = document.getElementById('facturaFields');
    const ventaRUCInput = document.getElementById('ventaRUC');
    const ventaRazonSocialInput = document.getElementById('ventaRazonSocial');

    // Referencias de los campos del formulario
    const ventaIdInput = document.getElementById('ventaId');
    const ventaClienteInput = document.getElementById('ventaCliente');
    const ventaFechaInput = document.getElementById('ventaFecha');
    const ventaMetodoPagoSelect = document.getElementById('ventaMetodoPago');
    const ventaEstadoSelect = document.getElementById('ventaEstado');

    // para el detalle dde la venta
    const detalleVentaModal = document.getElementById('detalleVentaModal');
    const closeDetalleModalBtn = document.getElementById('closeDetalleModal');
    const aceptarDetalleBtn = document.getElementById('aceptarDetalleBtn');
    const detalleVentaId = document.getElementById('detalleVentaId');
    const detalleVentaCliente = document.getElementById('detalleVentaCliente');
    const detalleVentaFecha = document.getElementById('detalleVentaFecha');
    const detalleVentaMetodoPago = document.getElementById('detalleVentaMetodoPago');
    const detalleVentaEstado = document.getElementById('detalleVentaEstado');
    const detalleVentaTotal = document.getElementById('detalleVentaTotal');
    const detalleProductosList = document.getElementById('detalleProductosList');


    // CÓDIGO PARA COPIAR Y PEGAR EN /js/ventas.js (Reemplaza la sección de Cliente anterior)

    // ======================================================
    // CONSTANTES DE CLIENTE
    // ======================================================

    const clienteTipoDocInput = document.getElementById('clienteTipoDoc');
    const clienteNumDocInput = document.getElementById('clienteNumDoc');
    const buscarClienteBtn = document.getElementById('buscarClienteBtn');
    const clienteInfoDiv = document.getElementById('clienteInfo');
    const nombreClienteResultado = document.getElementById('nombreClienteResultado');
    const registrarClienteBtn = document.getElementById('registrarClienteBtn');
    const idClienteVentaInput = document.getElementById('idClienteVenta');

    // Constantes del Modal
    const clienteModal = document.getElementById('clienteModal');
    const cerrarModalClienteBtn = document.getElementById('cerrarModalClienteBtn');
    const cerrarModalClienteBtnTop = document.getElementById('cerrarModalClienteBtnTop');
    const guardarClienteBtn = document.getElementById('guardarClienteBtn');
    const modalClienteTipoDoc = document.getElementById('modalClienteTipoDoc');
    const modalClienteNumDoc = document.getElementById('modalClienteNumDoc');
    const modalClienteNombres = document.getElementById('modalClienteNombres');
    const modalClienteApellidos = document.getElementById('modalClienteApellidos');

    // ✅ FUNCIÓN PARA ESTABLECER LA FECHA ACTUAL
    function setFechaActual() {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaFormateada = `${year}-${mes}-${dia}`;

        ventaFechaInput.value = fechaFormateada;
    }

    // Escuchadores de Eventos
    buscarClienteBtn.addEventListener('click', buscarClientePorDocumento);
    registrarClienteBtn.addEventListener('click', () => {
        // 1. Prepara el modal con los datos de búsqueda
        modalClienteTipoDoc.value = clienteTipoDocInput.value;
        modalClienteNumDoc.value = clienteNumDocInput.value.trim();
        modalClienteNombres.value = '';
        modalClienteApellidos.value = '';

        // 2. Abre el modal
        clienteModal.style.display = 'block';
    });

    cerrarModalClienteBtn.addEventListener('click', () => { clienteModal.style.display = 'none'; });
    cerrarModalClienteBtnTop.addEventListener('click', () => { clienteModal.style.display = 'none'; });
    guardarClienteBtn.addEventListener('click', registrarCliente);


    // ======================================================
    // LÓGICA DE BÚSQUEDA
    // ======================================================

    async function buscarClientePorDocumento() {
        const idTipoDoc = clienteTipoDocInput.value;
        const numDoc = clienteNumDocInput.value.trim();

        if (!numDoc || idTipoDoc === '0') {
            alert("Seleccione un tipo y número de documento válidos.");
            return;
        }

        // Reset de estado visual
        idClienteVentaInput.value = '1';
        nombreClienteResultado.textContent = 'Buscando...';
        clienteInfoDiv.style.display = 'block';
        clienteInfoDiv.className = 'alert mt-2 alert-warning';
        registrarClienteBtn.style.display = 'none';

        try {
            const response = await fetch(`/clientes/api/buscar-documento?idTipoDoc=${idTipoDoc}&numDoc=${numDoc}`);

            if (response.ok) {
                const cliente = await response.json();

                // ✅ Cliente ENCONTRADO
                idClienteVentaInput.value = cliente.idCliente;

                const nombreCompleto = `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
                nombreClienteResultado.textContent = nombreCompleto || `Cliente #ID ${cliente.idCliente}`;

                // ✅ AUTO-RELLENAR EL CAMPO "CLIENTE" DEL FORMULARIO
                ventaClienteInput.value = nombreCompleto || `Doc: ${cliente.nombre}`;

                clienteInfoDiv.className = 'alert mt-2 alert-success';
                registrarClienteBtn.style.display = 'none';
                clienteTipoDocInput.disabled = true;
                clienteNumDocInput.disabled = true;
                buscarClienteBtn.disabled = true;

            } else if (response.status === 404) {
                // Cliente NO ENCONTRADO
                nombreClienteResultado.textContent = `No existe cliente con ese documento.`;
                clienteInfoDiv.className = 'alert mt-2 alert-danger';
                registrarClienteBtn.style.display = 'block';

                // ✅ LIMPIAR EL CAMPO CLIENTE
                ventaClienteInput.value = '';

            } else {
                nombreClienteResultado.textContent = 'Error al buscar cliente. (Servidor)';
                clienteInfoDiv.className = 'alert mt-2 alert-warning';
            }
        } catch (error) {
            console.error('Error de conexión en búsqueda de cliente:', error);
            nombreClienteResultado.textContent = 'Error de conexión con el servidor.';
            clienteInfoDiv.className = 'alert mt-2 alert-warning';
        }
    }


    // ======================================================
    // LÓGICA DE REGISTRO RÁPIDO
    // ======================================================

    async function registrarCliente() {
        const idTipoDoc = modalClienteTipoDoc.value;
        const numDoc = modalClienteNumDoc.value.trim();
        const nombres = modalClienteNombres.value.trim();
        const apellidos = modalClienteApellidos.value.trim();

        // ✅ VALIDACIÓN MANUAL
        if (!idTipoDoc || idTipoDoc === '0') {
            showToast("❌ Debe seleccionar un Tipo de Documento.", "error");
            modalClienteTipoDoc.focus();
            return;
        }

        if (!numDoc) {
            showToast("❌ El Número de Documento es obligatorio.", "error");
            modalClienteNumDoc.focus();
            return;
        }

        if (!nombres) {
            showToast("❌ El campo Nombres/Razón Social es obligatorio.", "error");
            modalClienteNombres.focus();
            return;
        }

        const clienteData = {
            idTipoDocumento: parseInt(idTipoDoc),
            numeroDocumento: numDoc,
            nombres: nombres,
            apellidos: apellidos
        };

        try {
            const response = await fetch('/clientes/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });

            if (response.status === 201) {
                const nuevoCliente = await response.json();

                // 1. Cierra el modal
                clienteModal.style.display = 'none';

                // 2. Limpia los campos del modal
                modalClienteNumDoc.value = '';
                modalClienteNombres.value = '';
                modalClienteApellidos.value = '';

                // 3. Asigna el nuevo cliente al formulario de venta
                clienteTipoDocInput.value = nuevoCliente.tipoDocumento.idTipoDocumento;
                clienteNumDocInput.value = nuevoCliente.numeroDocumento;

                // 4. Ejecuta la búsqueda para actualizar el estado
                await buscarClientePorDocumento();

                showToast("✅ Cliente registrado y seleccionado correctamente.", "success");
            } else {
                const error = await response.json();
                showToast(`❌ Error al registrar el cliente: ${error.error || 'Datos inválidos o ya existe un cliente con ese documento.'}`, "error");
            }
        } catch (error) {
            console.error('Error de conexión en registro de cliente:', error);
            showToast("❌ Error de conexión con el servidor al registrar cliente.", "error");
        }
    }

    // ======================================================
    // FUNCIÓN AUXILIAR DE REINICIO
    // ======================================================

    function resetClienteForm() {
        clienteTipoDocInput.value = '';
        clienteNumDocInput.value = '';
        idClienteVentaInput.value = '1';
        nombreClienteResultado.textContent = 'Público General';
        clienteInfoDiv.style.display = 'none';
        registrarClienteBtn.style.display = 'none';
        clienteTipoDocInput.disabled = false;
        clienteNumDocInput.disabled = false;
        buscarClienteBtn.disabled = false;
    }

    // 🛑 RECORDATORIO: En tu función `crearVenta()` (en ventas.js), 
    // asegúrate de enviar el campo: id_cliente: parseInt(idClienteVentaInput.value)

    // ❌ ELIMINAMOS LOS DATOS DE EJEMPLO E INICIALIZAMOS LA VARIABLE VACÍA
    let ventasData = [];

    // --- NUEVAS FUNCIONES DE LECTURA DE API ---

    /**
     * @description Carga las ventas desde el backend y las guarda en ventasData.
     */
    async function fetchAndRenderVentas() {
        console.log("Cargando ventas desde la API...");
        try {
            // Llamada al endpoint creado en VentasController.java
            const response = await fetch('/ventas/api/lista');

            if (!response.ok) {
                // Si la respuesta no es OK (ej. 500 Internal Server Error)
                throw new Error(`Error ${response.status}: No se pudo obtener la lista de ventas del servidor.`);
            }

            // Guardamos los datos reales del backend en la variable global
            ventasData = await response.json();
            console.log("Datos de ventas cargados:", ventasData);

            // Una vez cargados, se renderizan en la tabla
            renderVentas();

        } catch (error) {
            console.error('Fallo al cargar las ventas desde la base de datos:', error);
            // Opcional: Mostrar un mensaje de error al usuario en la tabla
            ventasTableBody.innerHTML = `<tr><td colspan="8" class="text-center">Error al cargar ventas: ${error.message}</td></tr>`;
        }
    }


    // --- Funciones del Dashboard (Mantenemos la lógica de manipulación) ---

    // Función para renderizar la tabla (Ahora usa 'ventasData' llenada por la API)
    function renderVentas() {
        ventasTableBody.innerHTML = '';

        if (ventasData.length === 0) {
            ventasTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay ventas registradas</td></tr>';
            return;
        }

        ventasData.forEach(venta => {
            // ✅ ACCESO CORRECTO A LAS PROPIEDADES DEL DTO
            const id = venta.id;
            const cliente = venta.cliente || 'Público General';
            const fecha = venta.fecha ? new Date(venta.fecha).toLocaleDateString('es-PE') : '';
            const metodoPago = venta.metodoPago || 'N/A';
            const estado = venta.estado || 'Emitido';
            const total = venta.total || 0;
            const isModificado = estado === 'Modificado';

            // Opcional: Estilo visual para ventas modificadas
            const rowClass = isModificado ? 'text-muted' : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="venta-checkbox"></td>
                <td>${id}</td>
                <td>${cliente}</td>
                <td>${fecha}</td>
                <td>${metodoPago}</td>
                <td><span class="status-badge ${estado.toLowerCase()}">${estado}</span></td>
                <td><span class="price">S/ ${total.toFixed(2)}</span></td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-edit" data-id="${id}" title="Editar" ${isModificado ? 'disabled' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <!-- Botón Eliminar REMOVIDO -->
                        <button class="btn-icon btn-view" data-id="${id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-pdf" data-id="${id}" title="Generar PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                    </div>
                </td>
            `;
            ventasTableBody.appendChild(row);
        });

        updateSelectAllCheckbox();
    }

    // ... (Resto de las funciones: calculateTotal, addProductInput, openModal, closeModal, showDetalleModal, fillForm, toggleFacturaFields) ...

    // Función para calcular el total de la venta
    function calculateTotal() {
        let total = 0;
        const productItems = productosContainer.querySelectorAll('.product-item');
        productItems.forEach(item => {
            const price = parseFloat(item.querySelector('.product-price-input').value) || 0;
            const quantity = parseInt(item.querySelector('.product-qty-input').value) || 0;
            total += price * quantity;
        });
        ventaTotalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }

    // Función para agregar un campo de producto al modal
    function addProductInput(product = { nombre: '', cantidad: 1, precio: '' }) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('product-item');

        // ✅ Generar ID único para la lista desplegable
        const uniqueId = `productos-dropdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        itemDiv.innerHTML = `
            <div class="form-group product-search-wrapper">
                <label>Nombre del Producto</label>
                <div class="custom-dropdown-container">
                    <input type="text" 
                           class="product-name-input" 
                           value="${product.nombre}" 
                           placeholder="Buscar producto..." 
                           autocomplete="off"
                           data-dropdown-id="${uniqueId}">
                    <div class="product-dropdown" id="${uniqueId}" style="display: none;"></div>
                </div>
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="product-qty-input" value="${product.cantidad}" min="1">
            </div>
            <div class="form-group">
                <label>Precio (S/)</label>
                <input type="number" class="product-price-input" value="${product.precio}" step="0.01" min="0">
            </div>
            <button type="button" class="btn-icon btn-delete remove-product-btn" title="Eliminar Producto">
                <i class="fas fa-minus-circle"></i>
            </button>
        `;
        productosContainer.appendChild(itemDiv);

        // Referencias a los elementos
        const nameInput = itemDiv.querySelector('.product-name-input');
        const priceInput = itemDiv.querySelector('.product-price-input');
        const dropdown = itemDiv.querySelector('.product-dropdown');

        // Función para renderizar la lista de productos
        function renderProductDropdown(filteredProducts) {
            if (filteredProducts.length === 0) {
                dropdown.innerHTML = '<div class="dropdown-item no-results">No se encontraron productos</div>';
                dropdown.style.display = 'block';
                return;
            }

            dropdown.innerHTML = filteredProducts.map(p => `
                <div class="dropdown-item" data-producto='${JSON.stringify(p)}'>
                    <div class="dropdown-item-name">${p.nombre}</div>
                    <div class="dropdown-item-price">S/ ${(p.precioVenta || 0).toFixed(2)}</div>
                </div>
            `).join('');
            dropdown.style.display = 'block';
        }

        // Evento de búsqueda en tiempo real
        nameInput.addEventListener('input', () => {
            const searchTerm = nameInput.value.toLowerCase().trim();

            if (searchTerm === '') {
                renderProductDropdown(productosDisponibles);
            } else {
                const filtered = productosDisponibles.filter(p =>
                    p.nombre.toLowerCase().includes(searchTerm)
                );
                renderProductDropdown(filtered);
            }
        });

        // Evento de focus para mostrar la lista
        nameInput.addEventListener('focus', () => {
            const searchTerm = nameInput.value.toLowerCase().trim();
            if (searchTerm === '') {
                renderProductDropdown(productosDisponibles);
            } else {
                const filtered = productosDisponibles.filter(p =>
                    p.nombre.toLowerCase().includes(searchTerm)
                );
                renderProductDropdown(filtered);
            }
        });

        // Evento de clic en los items de la lista
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (item && item.dataset.producto) {
                const selectedProduct = JSON.parse(item.dataset.producto);
                nameInput.value = selectedProduct.nombre;
                priceInput.value = (selectedProduct.precioVenta || 0).toFixed(2);
                dropdown.style.display = 'none';
                calculateTotal();
            }
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!itemDiv.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Actualizar el total en cada cambio de input
        itemDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateTotal);
        });

        // Eliminar producto
        itemDiv.querySelector('.remove-product-btn').addEventListener('click', () => {
            itemDiv.remove();
            calculateTotal();
        });
    }

    // Función para abrir el modal
    function openModal() {
        ventaModal.style.display = 'block';
        toggleFacturaFields();
        setFechaActual(); // ✅ ESTABLECE LA FECHA ACTUAL
    }

    // Función para cerrar el modal
    function closeModal() {
        ventaModal.style.display = 'none';
        ventaForm.reset();
        ventaIdInput.value = '';
        modalTitle.textContent = 'Nueva Venta';
        productosContainer.innerHTML = '';
        calculateTotal();
    }

    // ✅ NUEVO: Cache y función para cargar productos
    let productosDisponibles = [];

    async function cargarProductosDisponibles() {
        try {
            const response = await fetch('/api/productos/simple', { credentials: 'include' });
            if (response.ok) {
                productosDisponibles = await response.json();
                console.log(`✅ ${productosDisponibles.length} productos cargados`);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    function showDetalleModal(venta) {
        if (venta.idVentaOriginal) {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'infoEdicionVenta';
            infoDiv.className = 'alert alert-info mt-3';
            infoDiv.innerHTML = `
                <i class="fas fa-info-circle"></i> Esta venta es una edición de la Venta #${venta.idVentaOriginal}.
                <button class="btn btn-sm btn-outline-primary ml-2" onclick="window.open('/ventas/${venta.idVentaOriginal}/pdf', '_blank')">
                    <i class="fas fa-file-download"></i> Descargar Boleta Original
                </button>
            `;
            detalleVentaTotal.parentNode.appendChild(infoDiv);
        }

        detalleProductosList.innerHTML = '';
        const productosDetalle = venta.detalles || [];

        productosDetalle.forEach(producto => {
            const li = document.createElement('li');
            const nombreProd = producto.nombre_producto || 'Producto sin nombre';
            const cantidadProd = producto.cantidad || 0;
            const precioProd = producto.precio_unitario || 0;

            li.innerHTML = `
                <span>${cantidadProd} x ${nombreProd}</span>
                <strong>S/ ${(cantidadProd * precioProd).toFixed(2)}</strong>
            `;
            detalleProductosList.appendChild(li);
        });

        detalleVentaModal.style.display = 'block';
    }

    // Función para llenar el modal con datos de una venta
    function fillForm(venta) {
        // ✅ ACCESO CORRECTO A LAS PROPIEDADES
        ventaIdInput.value = venta.id || '';
        ventaClienteInput.value = venta.cliente || '';

        // Convertir fecha ISO a formato yyyy-mm-dd
        if (venta.fecha) {
            const fecha = new Date(venta.fecha);
            const year = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');

            if (ventaFechaInput) {
                ventaFechaInput.value = `${year}-${mes}-${dia}`;
            } else {
                console.error("Error: Elemento 'ventaFecha' no encontrado en el DOM.");
            }
        }

        if (ventaMetodoPagoSelect) ventaMetodoPagoSelect.value = venta.metodoPago || '';
        if (ventaEstadoSelect) ventaEstadoSelect.value = venta.estado || 'Emitido';

        // Cargar tipo de comprobante si existe
        if (venta.id_tipo_comprobante && ventaTipoComprobanteSelect) {
            ventaTipoComprobanteSelect.value = venta.id_tipo_comprobante.toString();
        }

        ventaRUCInput.value = venta.ruc || '';
        ventaRazonSocialInput.value = venta.razon_social || '';
        toggleFacturaFields();

        // Cargar productos
        if (productosContainer) {
            productosContainer.innerHTML = '';
            // Limpia los productos anteriores
            const productosDetalle = venta.detalles || [];

            productosDetalle.forEach(product => {
                addProductInput({
                    nombre: product.nombre_producto || '',
                    cantidad: product.cantidad || 1,
                    precio: product.precio_unitario || 0
                });
            });
            calculateTotal();
        } else {
            console.error('❌ No se pueden cargar productos: productosContainer es null');
            showToast('Error: No se puede editar la venta. Recarga la página', 'error');
        }
    }
    // --- Funciones para manejar la lógica de Factura/Boleta ---
    function toggleFacturaFields() {
        // ... (Tu código original de toggleFacturaFields se mantiene aquí) ...
        const isFactura = ventaTipoComprobanteSelect.value === '2';

        if (isFactura) {
            facturaFieldsDiv.style.display = 'flex';
            ventaRUCInput.setAttribute('required', 'required');
            ventaRazonSocialInput.setAttribute('required', 'required');
        } else {
            facturaFieldsDiv.style.display = 'none';
            ventaRUCInput.removeAttribute('required');
            ventaRazonSocialInput.removeAttribute('required');
            // Opcional: limpiar campos si se cambia de Factura
            // ventaRUCInput.value = '';
            // ventaRazonSocialInput.value = '';
        }

        if (ventaTipoComprobanteSelect.value === '3') {
            ventaClienteInput.value = 'Cliente Varios';
            ventaClienteInput.setAttribute('disabled', 'disabled');
        } else {
            ventaClienteInput.removeAttribute('disabled');
            if (ventaClienteInput.value === 'Cliente Varios') {
                ventaClienteInput.value = '';
            }
        }
    }


    // --- Event Listeners ---
    // ... (Tu código de Event Listeners se mantiene aquí) ...

    // Abrir modal para crear nueva venta
    addVentaBtn.addEventListener('click', async () => {
        await cargarProductosDisponibles(); // ✅ Cargar productos primero
        openModal();
        modalTitle.textContent = 'Nueva Venta';
        resetClienteForm();
        addProductInput();
    });

    // Cerrar modal
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === ventaModal) {
            closeModal();
        }
    });
    // Manejar el envío del formulario de venta
    ventaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ✅ PASO 0: Obtener el ID de la apertura activa
        let idAperturaActiva = null;
        try {
            const cajaResponse = await fetch('/api/caja/estado', { credentials: 'include' });
            if (cajaResponse.ok) {
                const cajaEstado = await cajaResponse.json();
                if (cajaEstado.abierta && cajaEstado.idAperturaActiva) {
                    idAperturaActiva = cajaEstado.idAperturaActiva;
                    console.log('✅ ID Apertura obtenido:', idAperturaActiva);
                } else {
                    showToast('❌ Error: No hay ninguna caja abierta. Debes abrir una caja antes de registrar una venta.');
                    return;
                }
            } else {
                showToast('❌ Error al verificar el estado de la caja.');
                return;
            }
        } catch (error) {
            console.error('Error al obtener estado de caja:', error);
            showToast('❌ Error de conexión al verificar la caja.');
            return;
        }
        // 1. Recolectar detalles de productos con validación
        const detalles = [];
        let detallesValidos = true;
        productosContainer.querySelectorAll('.product-item').forEach((item, idx) => {
            const nombreProducto = item.querySelector('.product-name-input').value;
            if (!nombreProducto || nombreProducto.trim() === "") {
                showToast(`El nombre del producto en el detalle #${idx + 1} no puede estar vacío.`);
                detallesValidos = false;
            }
            detalles.push({
                nombre_producto_temp: nombreProducto,
                cantidad: parseInt(item.querySelector('.product-qty-input').value),
                precio_unitario: parseFloat(item.querySelector('.product-price-input').value)
            });
        });
        if (!detallesValidos) return;
        // 2. Construir el objeto de Venta (ComprobantePago)
        const ventaPayload = {
            id_comprobante: ventaIdInput.value || null,
            id_tipo_comprobante: parseInt(ventaTipoComprobanteSelect.value),
            ruc: ventaRUCInput.value || null,
            razon_social: ventaRazonSocialInput.value || null,

            // ✅ ENVIAR EL ID DEL CLIENTE
            id_cliente: parseInt(idClienteVentaInput.value),

            // ✅ AGREGAR EL ID DE LA APERTURA ACTIVA
            id_apertura: idAperturaActiva,

            fecha_emision: ventaFechaInput.value,
            id_tipopago: ventaMetodoPagoSelect.value,

            monto_total: parseFloat(ventaTotalSpan.textContent.replace('S/ ', '')),
            detalles: detalles
        };
        console.log('📦 Payload de venta:', ventaPayload);
        const success = await saveVenta(ventaPayload);
        if (success) {
            await fetchAndRenderVentas();
            closeModal();
        }
    });
    // Función Asíncrona para guardar/actualizar la venta
    async function saveVenta(payload) {
        const isUpdate = payload.id_comprobante && payload.id_comprobante !== '0';
        const method = isUpdate ? 'PUT' : 'POST'; // Asumo que tienes un PUT para editar
        const url = '/ventas/api';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || `Error ${response.status}: Fallo en el ${method} de la venta.`;
                showToast(`Error: ${errorMessage}`);
                return false;
            }

            showToast(`Venta ${isUpdate ? 'actualizada' : 'registrada'} exitosamente. ID: ${data.id_comprobante || data.id}`);
            return true;
        } catch (error) {
            console.error('Error al guardar la venta:', error);
            showToast('Hubo un error de conexión al guardar la venta.');
            return false;
        }
    }


    // Agregar nuevo producto al formulario de venta
    addProductBtn.addEventListener('click', () => {
        addProductInput();
    });

    // Delegación de eventos para los botones de la tabla
    ventasTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;

        const ventaId = btn.dataset.id;
        // ✅ BUSCAR POR LA PROPIEDAD CORRECTA
        const venta = ventasData.find(v => v.id == ventaId);

        if (btn.classList.contains('btn-edit')) {
            if (venta) {
                await cargarProductosDisponibles();
                fillForm(venta);
                modalTitle.textContent = 'Editar Venta';
                openModal();
            }
        } else if (btn.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
                const deleteUrl = `/ventas/api/${ventaId}`;
                try {
                    const response = await fetch(deleteUrl, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Error al eliminar en el servidor.');

                    showToast('✅ Venta eliminada exitosamente.');
                    await fetchAndRenderVentas();

                } catch (error) {
                    console.error('Error al eliminar la venta:', error);
                    showToast('❌ Falló la eliminación de la venta: ' + error.message);
                }
            }
        } else if (btn.classList.contains('btn-view')) {
            if (venta) {
                showDetalleModal(venta);
            }
        } else if (btn.classList.contains('btn-pdf')) {
            exportarVentaAPDF(ventaId);
        }
    });


    /**
    * Llama al backend para generar el PDF y fuerza la descarga.
    */
    function exportarVentaAPDF(id) {
        const url = `/ventas/${id}/pdf`;
        window.open(url, '_blank');
    }

    // Añadir el listener para el cambio de tipo de comprobante
    ventaTipoComprobanteSelect.addEventListener('change', toggleFacturaFields);

    // --- Seleccionar/Deseleccionar todos los checkboxes ---
    const selectAll = document.getElementById('selectAll');

    function updateSelectAllCheckbox() {
        const checkboxes = ventasTableBody.querySelectorAll('.venta-checkbox');
        if (checkboxes.length === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            return;
        }
        const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checked === checkboxes.length;
        selectAll.indeterminate = checked > 0 && checked < checkboxes.length;
    }

    // Evento para seleccionar/deseleccionar todos
    selectAll.addEventListener('change', function () {
        const checkboxes = ventasTableBody.querySelectorAll('.venta-checkbox');
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });

    // Delegación para actualizar el estado del checkbox "selectAll"
    ventasTableBody.addEventListener('change', function (e) {
        if (e.target.classList.contains('venta-checkbox')) {
            updateSelectAllCheckbox();
        }
    });

    //EL DETALLE DE LA VENTA
    closeDetalleModalBtn.addEventListener('click', () => {
        detalleVentaModal.style.display = 'none';
    });

    aceptarDetalleBtn.addEventListener('click', () => {
        detalleVentaModal.style.display = 'none';
    });

    // También agrega la lógica para cerrar el modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === detalleVentaModal) {
            detalleVentaModal.style.display = 'none';
        }
    });

    // ⭐️ INICIO DE LA APLICACIÓN: Llamar a la función para cargar datos de la API
    // Reemplaza el antiguo 'renderVentas()' estático.
    fetchAndRenderVentas();
});