document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const comprasTableBody = document.getElementById('comprasTableBody');
    const addCompraBtn = document.getElementById('addCompraBtn');
    const compraModal = document.getElementById('compraModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const compraForm = document.getElementById('compraForm');
    const modalTitle = document.getElementById('modalTitle');
    const addProductBtn = document.getElementById('addProductBtn');
    const productosContainer = document.getElementById('productosContainer');
    const compraTotalSpan = document.getElementById('compraTotal');
    
    // Referencias de los campos del formulario
    const compraIdInput = document.getElementById('compraId');
    const compraProveedorSelect = document.getElementById('compraProveedor');
    const compraRucInput = document.getElementById('compraRuc');
    const compraFechaPedidoInput = document.getElementById('compraFechaPedido');
    const compraFechaEntregaInput = document.getElementById('compraFechaEntrega');
    const compraMetodoPagoSelect = document.getElementById('compraMetodoPago');
    const compraEstadoSelect = document.getElementById('compraEstado');
    const compraReferenciaInput = document.getElementById('compraReferencia');
    const compraObservacionesTextarea = document.getElementById('compraObservaciones');
    const compraSubtotalSpan = document.getElementById('compraSubtotal');
    const compraIgvSpan = document.getElementById('compraIgv');

    // para el detalle de la compra
    const detalleCompraModal = document.getElementById('detalleCompraModal');
    const closeDetalleModalBtn = document.getElementById('closeDetalleModal');
    const aceptarDetalleBtn = document.getElementById('aceptarDetalleBtn');
    const detalleCompraId = document.getElementById('detalleCompraId');
    const detalleCompraProveedor = document.getElementById('detalleCompraProveedor');
    const detalleCompraRuc = document.getElementById('detalleCompraRuc');
    const detalleCompraFechaPedido = document.getElementById('detalleCompraFechaPedido');
    const detalleCompraFechaEntrega = document.getElementById('detalleCompraFechaEntrega');
    const detalleCompraMetodoPago = document.getElementById('detalleCompraMetodoPago');
    const detalleCompraEstado = document.getElementById('detalleCompraEstado');
    const detalleCompraReferencia = document.getElementById('detalleCompraReferencia');
    const detalleCompraObservaciones = document.getElementById('detalleCompraObservaciones');
    const detalleCompraSubtotal = document.getElementById('detalleCompraSubtotal');
    const detalleCompraIgv = document.getElementById('detalleCompraIgv');
    const detalleCompraTotal = document.getElementById('detalleCompraTotal');
    const detalleProductosTableBody = document.getElementById('detalleProductosTableBody');

    // --- Datos de Ejemplo (Simulación de una API) ---
    
    // Datos de proveedores
    const proveedoresData = {
        '1': { nombre: 'Distribuidora Nike S.A.', ruc: '20123456789' },
        '2': { nombre: 'Calzados Premium Ltda.', ruc: '20987654321' },
        '3': { nombre: 'Accesorios Fashion', ruc: '20555666777' },
        '4': { nombre: 'Sportswear Internacional', ruc: '20111222333' }
    };
    
    let comprasData = [
        {
            id: '001',
            id_proveedor: '1',
            proveedor: 'Distribuidora Nike S.A.',
            ruc: '20123456789',
            fechaPedido: '2025-09-20',
            fechaEntrega: '2025-09-30',
            metodoPago: 'Transferencia',
            estado: 'Completado',
            referencia: 'COT-2025-001',
            observaciones: 'Pedido urgente para temporada alta',
            subtotal: 2118.64,
            igv: 381.36,
            total: 2500.00,
            productos: [
                { nombre: 'Zapatillas Nike Air Max', cantidadPedida: 5, cantidadRecibida: 5, costoUnitario: 400.00, subtotal: 2000.00 },
                { nombre: 'Zapatillas Nike Revolution', cantidadPedida: 2, cantidadRecibida: 2, costoUnitario: 300.00, subtotal: 600.00 }
            ]
        },
        {
            id: '002',
            id_proveedor: '2',
            proveedor: 'Calzados Premium Ltda.',
            ruc: '20987654321',
            fechaPedido: '2025-09-18',
            fechaEntrega: '2025-09-25',
            metodoPago: 'Crédito',
            estado: 'Pendiente',
            referencia: 'COT-2025-002',
            observaciones: 'Incluir factura y guía de remisión',
            subtotal: 1525.42,
            igv: 274.58,
            total: 1800.00,
            productos: [
                { nombre: 'Botas de Cuero Premium', cantidadPedida: 6, cantidadRecibida: 0, costoUnitario: 300.00, subtotal: 1800.00 }
            ]
        },
        {
            id: '003',
            id_proveedor: '3',
            proveedor: 'Accesorios Fashion',
            ruc: '20555666777',
            fechaPedido: '2025-09-15',
            fechaEntrega: '2025-09-22',
            metodoPago: 'Cheque',
            estado: 'Cancelado',
            referencia: 'COT-2025-003',
            observaciones: 'Cancelado por cambio de proveedor',
            subtotal: 381.36,
            igv: 68.64,
            total: 450.00,
            productos: [
                { nombre: 'Cinturones de Cuero', cantidadPedida: 10, cantidadRecibida: 0, costoUnitario: 25.00, subtotal: 250.00 },
                { nombre: 'Billeteras de Cuero', cantidadPedida: 8, cantidadRecibida: 0, costoUnitario: 25.00, subtotal: 200.00 }
            ]
        }
    ];

    // --- Funciones del Dashboard ---

    // Función para renderizar la tabla
    function renderCompras() {
        comprasTableBody.innerHTML = '';
        comprasData.forEach(compra => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="compra-checkbox"></td>
                <td>${compra.id}</td>
                <td>${compra.proveedor}</td>
                <td>${compra.ruc}</td>
                <td>${compra.fechaPedido}</td>
                <td>${compra.fechaEntrega || 'No definida'}</td>
                <td>${compra.metodoPago}</td>
                <td><span class="status-badge ${compra.estado.toLowerCase().replace(' ', '-')}">${compra.estado}</span></td>
                <td><span class="price">S/ ${compra.total.toFixed(2)}</span></td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-edit" data-id="${compra.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${compra.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon btn-view" data-id="${compra.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            comprasTableBody.appendChild(row);
        });
    }

    // Función para calcular el total de la compra
    function calculateTotal() {
        let subtotal = 0;
        const productItems = productosContainer.querySelectorAll('.product-item');
        productItems.forEach(item => {
            const price = parseFloat(item.querySelector('.product-price-input').value) || 0;
            const quantity = parseInt(item.querySelector('.product-qty-input').value) || 0;
            subtotal += price * quantity;
        });
        
        const igv = subtotal * 0.18;
        const total = subtotal + igv;
        
        compraSubtotalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;
        compraIgvSpan.textContent = `S/ ${igv.toFixed(2)}`;
        compraTotalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }

    // Función para agregar un campo de producto al modal
    function addProductInput(product = { nombre: '', cantidadPedida: '', cantidadRecibida: '', costoUnitario: '' }) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('product-item');
        itemDiv.innerHTML = `
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" class="product-name-input" value="${product.nombre}" placeholder="Ej: Zapatillas Nike Air Max">
            </div>
            <div class="form-group">
                <label>Cant. Pedida</label>
                <input type="number" class="product-qty-input" value="${product.cantidadPedida}" min="1" placeholder="0">
            </div>
            <div class="form-group">
                <label>Cant. Recibida</label>
                <input type="number" class="product-received-input" value="${product.cantidadRecibida || 0}" min="0" placeholder="0">
            </div>
            <div class="form-group">
                <label>Costo Unit. (S/)</label>
                <input type="number" class="product-price-input" value="${product.costoUnitario}" step="0.01" min="0" placeholder="0.00">
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
        compraModal.style.display = 'block';
    }

    // Función para cerrar el modal
    function closeModal() {
        compraModal.style.display = 'none';
        compraForm.reset();
        compraIdInput.value = '';
        modalTitle.textContent = 'Nueva Compra';
        productosContainer.innerHTML = '';
        calculateTotal();
    }

    function showDetalleModal(compra) {
        detalleCompraId.textContent = compra.id;
        detalleCompraProveedor.textContent = compra.proveedor;
        detalleCompraRuc.textContent = compra.ruc;
        detalleCompraFechaPedido.textContent = compra.fechaPedido;
        detalleCompraFechaEntrega.textContent = compra.fechaEntrega || 'No definida';
        detalleCompraMetodoPago.textContent = compra.metodoPago;
        detalleCompraEstado.textContent = compra.estado;
        detalleCompraReferencia.textContent = compra.referencia || 'Sin referencia';
        detalleCompraObservaciones.textContent = compra.observaciones || 'Sin observaciones';
        detalleCompraSubtotal.textContent = `S/ ${compra.subtotal.toFixed(2)}`;
        detalleCompraIgv.textContent = `S/ ${compra.igv.toFixed(2)}`;
        detalleCompraTotal.textContent = `S/ ${compra.total.toFixed(2)}`;

        detalleProductosTableBody.innerHTML = ''; // Limpiar la tabla anterior
        compra.productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.nombre}</td>
                <td class="text-center">${producto.cantidadPedida}</td>
                <td class="text-center">${producto.cantidadRecibida}</td>
                <td class="text-right">S/ ${producto.costoUnitario.toFixed(2)}</td>
                <td class="text-right">S/ ${producto.subtotal.toFixed(2)}</td>
            `;
            detalleProductosTableBody.appendChild(row);
        });

        detalleCompraModal.style.display = 'block';
    }

    // Función para llenar el modal con datos de una compra
    function fillForm(compra) {
        compraIdInput.value = compra.id;
        compraProveedorSelect.value = compra.id_proveedor;
        compraRucInput.value = compra.ruc;
        compraFechaPedidoInput.value = compra.fechaPedido;
        compraFechaEntregaInput.value = compra.fechaEntrega || '';
        compraMetodoPagoSelect.value = compra.metodoPago;
        compraEstadoSelect.value = compra.estado;
        compraReferenciaInput.value = compra.referencia || '';
        compraObservacionesTextarea.value = compra.observaciones || '';
        
        productosContainer.innerHTML = '';
        compra.productos.forEach(product => {
            addProductInput({
                nombre: product.nombre,
                cantidadPedida: product.cantidadPedida,
                cantidadRecibida: product.cantidadRecibida,
                costoUnitario: product.costoUnitario
            });
        });
        
        calculateTotal();
    }

    // --- Event Listeners ---

    // Actualizar RUC cuando cambie el proveedor
    compraProveedorSelect.addEventListener('change', function() {
        const proveedorId = this.value;
        if (proveedorId && proveedoresData[proveedorId]) {
            compraRucInput.value = proveedoresData[proveedorId].ruc;
        } else {
            compraRucInput.value = '';
        }
    });

    // Abrir modal para crear nueva compra
    addCompraBtn.addEventListener('click', () => {
        openModal();
        modalTitle.textContent = 'Nueva Compra';
        addProductInput();
        // Establecer fecha actual por defecto
        compraFechaPedidoInput.value = new Date().toISOString().split('T')[0];
    });

    // Cerrar modal
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === compraModal) {
            closeModal();
        }
    });

    // Manejar el envío del formulario (Crear o Editar)
    compraForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const productos = [];
        productosContainer.querySelectorAll('.product-item').forEach(item => {
            const cantidadPedida = parseInt(item.querySelector('.product-qty-input').value) || 0;
            const cantidadRecibida = parseInt(item.querySelector('.product-received-input').value) || 0;
            const costoUnitario = parseFloat(item.querySelector('.product-price-input').value) || 0;
            
            productos.push({
                nombre: item.querySelector('.product-name-input').value,
                cantidadPedida: cantidadPedida,
                cantidadRecibida: cantidadRecibida,
                costoUnitario: costoUnitario,
                subtotal: cantidadPedida * costoUnitario
            });
        });

        const subtotalValue = parseFloat(compraSubtotalSpan.textContent.replace('S/ ', ''));
        const igvValue = parseFloat(compraIgvSpan.textContent.replace('S/ ', ''));
        const totalValue = parseFloat(compraTotalSpan.textContent.replace('S/ ', ''));
        
        const proveedorId = compraProveedorSelect.value;
        const proveedorData = proveedoresData[proveedorId];

        const newCompra = {
            id: compraIdInput.value || (comprasData.length + 1).toString().padStart(3, '0'),
            id_proveedor: proveedorId,
            proveedor: proveedorData ? proveedorData.nombre : '',
            ruc: compraRucInput.value,
            fechaPedido: compraFechaPedidoInput.value,
            fechaEntrega: compraFechaEntregaInput.value,
            metodoPago: compraMetodoPagoSelect.value,
            estado: compraEstadoSelect.value,
            referencia: compraReferenciaInput.value,
            observaciones: compraObservacionesTextarea.value,
            subtotal: subtotalValue,
            igv: igvValue,
            total: totalValue,
            productos: productos
        };

        if (compraIdInput.value) {
            // Lógica para Editar
            const index = comprasData.findIndex(c => c.id === newCompra.id);
            if (index !== -1) {
                comprasData[index] = newCompra;
                alert('Compra actualizada exitosamente.');
            }
        } else {
            // Lógica para Crear
            comprasData.push(newCompra);
            alert('Nueva compra agregada exitosamente.');
        }

        renderCompras();
        closeModal();
    });

    // Agregar nuevo producto al formulario de compra
    addProductBtn.addEventListener('click', () => {
        addProductInput();
    });

    // Delegación de eventos para los botones de la tabla
    comprasTableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;

        const compraId = btn.dataset.id;

        if (btn.classList.contains('btn-edit')) {
            const compraToEdit = comprasData.find(c => c.id === compraId);
            if (compraToEdit) {
                fillForm(compraToEdit);
                modalTitle.textContent = 'Editar Compra';
                openModal();
            }
        } else if (btn.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de que deseas eliminar esta compra?')) {
                comprasData = comprasData.filter(c => c.id !== compraId);
                renderCompras();
                alert('Compra eliminada exitosamente.');
            }
        } else if (btn.classList.contains('btn-view')) {
            const compraToView = comprasData.find(c => c.id === compraId);
            if (compraToView) {
                showDetalleModal(compraToView);
            }
        }
    });
    
    // Iniciar la aplicación renderizando la tabla con los datos iniciales
    renderCompras();

    // --- Seleccionar/Deseleccionar todos los checkboxes ---
    const selectAll = document.getElementById('selectAll');

    function updateSelectAllCheckbox() {
        const checkboxes = comprasTableBody.querySelectorAll('.compra-checkbox');
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
        const checkboxes = comprasTableBody.querySelectorAll('.compra-checkbox');
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });

    // Delegación para actualizar el estado del checkbox "selectAll"
    comprasTableBody.addEventListener('change', function (e) {
        if (e.target.classList.contains('compra-checkbox')) {
            updateSelectAllCheckbox();
        }
    });

    // Actualizar el estado del checkbox "selectAll" cada vez que se renderiza la tabla
    const originalRenderCompras = renderCompras;
    renderCompras = function () {
        originalRenderCompras();
        updateSelectAllCheckbox();
    };

    // EL DETALLE DE LA COMPRA
    closeDetalleModalBtn.addEventListener('click', () => {
        detalleCompraModal.style.display = 'none';
    });

    aceptarDetalleBtn.addEventListener('click', () => {
        detalleCompraModal.style.display = 'none';
    });

    // También agrega la lógica para cerrar el modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === detalleCompraModal) {
            detalleCompraModal.style.display = 'none';
        }
    });

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === detalleCompraModal) {
            detalleCompraModal.style.display = 'none';
        }
    });
});