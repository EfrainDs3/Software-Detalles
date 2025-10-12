document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const ventasTableBody = document.getElementById('ventasTableBody');
    // ... (otras constantes del DOM) ...

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
        // Hacemos que la función sea compatible con el formato que devuelve el backend
        ventasTableBody.innerHTML = '';
        ventasData.forEach(venta => {
            // **IMPORTANTE**: Ajustar los nombres de las propiedades al formato de tu DTO/Entity de Java
            const id = venta.idVenta || venta.id; // Asumo idVenta si usaste ese DTO
            const cliente = venta.cliente ? venta.cliente.nombreCompleto : venta.nombre_cliente_temp; // Ejemplo de cómo acceder
            const fecha = venta.fecha_emision || venta.fecha; 
            const metodoPago = venta.tipoPago ? venta.tipoPago.nombre : venta.metodoPago; // Asumiendo que el backend trae un objeto
            const estado = venta.estado_comprobante || venta.estado;
            const total = venta.monto_total || venta.total;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="venta-checkbox"></td>
                <td>${id}</td>
                <td>${cliente}</td>
                <td>${fecha}</td>
                <td>${metodoPago}</td>
                <td><span class="status-badge ${estado.toLowerCase()}">${estado}</span></td>
                <td><span class="price">S/ ${total ? total.toFixed(2) : '0.00'}</span></td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-edit" data-id="${id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
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
    function addProductInput(product = { nombre: '', cantidad: '', precio: '' }) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('product-item');
        itemDiv.innerHTML = `
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" class="product-name-input" value="${product.nombre}" placeholder="Ej: Zapatillas">
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
        toggleFacturaFields(); // Esto inicializa los campos
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

    function showDetalleModal(venta) {
        detalleVentaId.textContent = venta.idVenta || venta.id;
        detalleVentaCliente.textContent = venta.cliente ? venta.cliente.nombreCompleto : venta.nombre_cliente_temp;
        detalleVentaFecha.textContent = venta.fecha_emision || venta.fecha;
        detalleVentaMetodoPago.textContent = venta.tipoPago ? venta.tipoPago.nombre : venta.metodoPago;
        detalleVentaEstado.textContent = venta.estado_comprobante || venta.estado;
        detalleVentaTotal.textContent = `S/ ${(venta.monto_total || venta.total).toFixed(2)}`;

        detalleProductosList.innerHTML = ''; // Limpiar la lista anterior
        const productosDetalle = venta.detalles || venta.productos;
        productosDetalle.forEach(producto => {
            const li = document.createElement('li');
            // Adaptar la visualización según el nombre de la propiedad
            const nombreProd = producto.nombre_producto || producto.nombre; 
            const cantidadProd = producto.cantidad || producto.cantidad;
            const precioProd = producto.precio_unitario || producto.precio;
            
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
        ventaIdInput.value = venta.idVenta || venta.id;
        // Asumiendo que el backend envía el nombre_cliente_temp para el campo de texto
        ventaClienteInput.value = venta.nombre_cliente_temp || venta.cliente; 
        ventaFechaInput.value = venta.fecha_emision || venta.fecha;
        // Asumiendo que el select usa el ID del tipo de pago
        ventaMetodoPagoSelect.value = venta.id_tipopago || venta.metodoPago; 
        ventaEstadoSelect.value = venta.estado_comprobante || venta.estado;
        
        // Cargar campos de factura si existen
        if(venta.id_tipo_comprobante) ventaTipoComprobanteSelect.value = venta.id_tipo_comprobante.toString();
        ventaRUCInput.value = venta.ruc || '';
        ventaRazonSocialInput.value = venta.razon_social || '';
        toggleFacturaFields(); // Aplicar reglas de visibilidad

        productosContainer.innerHTML = '';
        const productosDetalle = venta.detalles || venta.productos;
        productosDetalle.forEach(product => {
             // Adaptar la carga al formato del DTO (detalles o productos)
             addProductInput({ 
                nombre: product.nombre_producto || product.nombre,
                cantidad: product.cantidad || product.cantidad,
                precio: product.precio_unitario || product.precio,
             });
        });
        
        calculateTotal();
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
    addVentaBtn.addEventListener('click', () => {
        openModal();
        modalTitle.textContent = 'Nueva Venta';
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

    // Manejar el envío del formulario (DEBEMOS CONVERTIR LA LÓGICA DE 'EDITAR' A UNA LLAMADA DE API)
    ventaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Recolectar detalles de productos (AJUSTADO PARA EL ENVÍO) con validación
        const detalles = [];
        let detallesValidos = true;
        productosContainer.querySelectorAll('.product-item').forEach((item, idx) => {
            const nombreProducto = item.querySelector('.product-name-input').value;
            if (!nombreProducto || nombreProducto.trim() === "") {
                alert(`El nombre del producto en el detalle #${idx + 1} no puede estar vacío.`);
                detallesValidos = false;
            }
            detalles.push({
                nombre_producto_temp: nombreProducto,
                cantidad: parseInt(item.querySelector('.product-qty-input').value),
                precio_unitario: parseFloat(item.querySelector('.product-price-input').value)
            });
        });
        if (!detallesValidos) return; // No envía la venta si hay error

        // 2. Construir el objeto de Venta (ComprobantePago)
        const ventaPayload = {
            // Mantenemos el nombre 'id_comprobante' para POST/PUT
            id_comprobante: ventaIdInput.value || null, 
            
            // CAMPOS DEL COMPROBANTE
            id_tipo_comprobante: parseInt(ventaTipoComprobanteSelect.value),
            ruc: ventaRUCInput.value || null,
            razon_social: ventaRazonSocialInput.value || null,
            
            // OTROS CAMPOS
            nombre_cliente_temp: ventaClienteInput.value, 
            fecha_emision: ventaFechaInput.value,
            id_tipopago: ventaMetodoPagoSelect.value,
            estado_comprobante: ventaEstadoSelect.value,
            monto_total: parseFloat(ventaTotalSpan.textContent.replace('S/ ', '')),
            detalles: detalles
        };

        const success = await saveVenta(ventaPayload);

        if (success) {
            // ⭐️ LLAMAMOS A LA FUNCIÓN QUE TRAE LOS DATOS REALES DE LA BASE DE DATOS
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
                alert(`Error: ${errorMessage}`);
                return false;
            }

            alert(`Venta ${isUpdate ? 'actualizada' : 'registrada'} exitosamente. ID: ${data.id_comprobante || data.id}`);
            return true;
        } catch (error) {
            console.error('Error al guardar la venta:', error);
            alert('Hubo un error de conexión al guardar la venta.');
            return false;
        }
    }


    // Agregar nuevo producto al formulario de venta
    addProductBtn.addEventListener('click', () => {
        addProductInput();
    });

    // Delegación de eventos para los botones de la tabla
    ventasTableBody.addEventListener('click', async (e) => { // Agregamos 'async' aquí
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;

        const ventaId = btn.dataset.id;
        // Obtenemos la venta del arreglo cargado previamente
        const venta = ventasData.find(v => (v.idVenta || v.id) == ventaId); 
        
        if (btn.classList.contains('btn-edit')) {
            if (venta) {
                fillForm(venta);
                modalTitle.textContent = 'Editar Venta';
                openModal();
            }
        } else if (btn.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
                 // **[PENDIENTE]** Debes crear un endpoint DELETE en VentasController.java
                 const deleteUrl = `/ventas/api/${ventaId}`;
                 try {
                    const response = await fetch(deleteUrl, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Error al eliminar en el servidor.');
                    
                    alert('Venta eliminada exitosamente.');
                    // Vuelve a cargar y renderizar los datos
                    await fetchAndRenderVentas(); 
                    
                 } catch (error) {
                    console.error('Error al eliminar la venta:', error);
                    alert('Fallo la eliminación de la venta: ' + error.message);
                 }
            }
        } else if (btn.classList.contains('btn-view')) {
            if (venta) {
                showDetalleModal(venta);
            }
        } else if (btn.classList.contains('btn-pdf')) {
            // --- LÓGICA DE EXPORTACIÓN A PDF ---
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