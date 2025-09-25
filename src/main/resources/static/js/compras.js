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
    const compraProveedorInput = document.getElementById('compraProveedor');
    const compraFechaInput = document.getElementById('compraFecha');
    const compraMetodoPagoSelect = document.getElementById('compraMetodoPago');
    const compraEstadoSelect = document.getElementById('compraEstado');

    // para el detalle de la compra
    const detalleCompraModal = document.getElementById('detalleCompraModal');
    const closeDetalleModalBtn = document.getElementById('closeDetalleModal');
    const aceptarDetalleBtn = document.getElementById('aceptarDetalleBtn');
    const detalleCompraId = document.getElementById('detalleCompraId');
    const detalleCompraProveedor = document.getElementById('detalleCompraProveedor');
    const detalleCompraFecha = document.getElementById('detalleCompraFecha');
    const detalleCompraMetodoPago = document.getElementById('detalleCompraMetodoPago');
    const detalleCompraEstado = document.getElementById('detalleCompraEstado');
    const detalleCompraTotal = document.getElementById('detalleCompraTotal');
    const detalleProductosList = document.getElementById('detalleProductosList');

    // --- Datos de Ejemplo (Simulación de una API) ---
    let comprasData = [
        {
            id: '001',
            proveedor: 'Distribuidora Nike S.A.',
            fecha: '2025-09-20',
            metodoPago: 'Transferencia',
            estado: 'Recibida',
            total: 2500.00,
            productos: [
                { nombre: 'Zapatillas Nike Air Max (par)', cantidad: 5, precio: 400.00 },
                { nombre: 'Zapatillas Nike Revolution (par)', cantidad: 5, precio: 300.00 }
            ]
        },
        {
            id: '002',
            proveedor: 'Calzados Premium Ltda.',
            fecha: '2025-09-18',
            metodoPago: 'Crédito',
            estado: 'En Tránsito',
            total: 1800.00,
            productos: [
                { nombre: 'Botas de Cuero (par)', cantidad: 6, precio: 300.00 }
            ]
        },
        {
            id: '003',
            proveedor: 'Accesorios Fashion',
            fecha: '2025-09-15',
            metodoPago: 'Cheque',
            estado: 'Pendiente',
            total: 450.00,
            productos: [
                { nombre: 'Cinturones de Cuero', cantidad: 10, precio: 25.00 },
                { nombre: 'Billeteras', cantidad: 8, precio: 25.00 }
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
                <td>${compra.fecha}</td>
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
        let total = 0;
        const productItems = productosContainer.querySelectorAll('.product-item');
        productItems.forEach(item => {
            const price = parseFloat(item.querySelector('.product-price-input').value) || 0;
            const quantity = parseInt(item.querySelector('.product-qty-input').value) || 0;
            total += price * quantity;
        });
        compraTotalSpan.textContent = `S/ ${total.toFixed(2)}`;
    }

    // Función para agregar un campo de producto al modal
    function addProductInput(product = { nombre: '', cantidad: '', precio: '' }) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('product-item');
        itemDiv.innerHTML = `
            <div class="form-group">
                <label>Nombre del Producto</label>
                <input type="text" class="product-name-input" value="${product.nombre}" placeholder="Ej: Zapatillas Nike">
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
        detalleCompraFecha.textContent = compra.fecha;
        detalleCompraMetodoPago.textContent = compra.metodoPago;
        detalleCompraEstado.textContent = compra.estado;
        detalleCompraTotal.textContent = `S/ ${compra.total.toFixed(2)}`;

        detalleProductosList.innerHTML = ''; // Limpiar la lista anterior
        compra.productos.forEach(producto => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${producto.cantidad} x ${producto.nombre}</span>
                <strong>S/ ${(producto.cantidad * producto.precio).toFixed(2)}</strong>
            `;
            detalleProductosList.appendChild(li);
        });

        detalleCompraModal.style.display = 'block';
    }

    // Función para llenar el modal con datos de una compra
    function fillForm(compra) {
        compraIdInput.value = compra.id;
        compraProveedorInput.value = compra.proveedor;
        compraFechaInput.value = compra.fecha;
        compraMetodoPagoSelect.value = compra.metodoPago;
        compraEstadoSelect.value = compra.estado;
        
        productosContainer.innerHTML = '';
        compra.productos.forEach(product => addProductInput(product));
        
        calculateTotal();
    }

    // --- Event Listeners ---

    // Abrir modal para crear nueva compra
    addCompraBtn.addEventListener('click', () => {
        openModal();
        modalTitle.textContent = 'Nueva Compra';
        addProductInput();
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
            productos.push({
                nombre: item.querySelector('.product-name-input').value,
                cantidad: parseInt(item.querySelector('.product-qty-input').value),
                precio: parseFloat(item.querySelector('.product-price-input').value)
            });
        });

        const newCompra = {
            id: compraIdInput.value || (comprasData.length + 1).toString().padStart(3, '0'),
            proveedor: compraProveedorInput.value,
            fecha: compraFechaInput.value,
            metodoPago: compraMetodoPagoSelect.value,
            estado: compraEstadoSelect.value,
            total: parseFloat(compraTotalSpan.textContent.replace('S/ ', '')),
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