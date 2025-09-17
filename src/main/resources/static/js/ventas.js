document.addEventListener('DOMContentLoaded', () => {

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
    
    // Referencias de los campos del formulario
    const ventaIdInput = document.getElementById('ventaId');
    const ventaClienteInput = document.getElementById('ventaCliente');
    const ventaFechaInput = document.getElementById('ventaFecha');
    const ventaMetodoPagoSelect = document.getElementById('ventaMetodoPago');
    const ventaEstadoSelect = document.getElementById('ventaEstado');

    // --- Datos de Ejemplo (Simulación de una API) ---
    let ventasData = [
        {
            id: '001',
            cliente: 'Juan Pérez',
            fecha: '2025-09-15',
            metodoPago: 'Tarjeta',
            estado: 'Completada',
            total: 350.50,
            productos: [
                { nombre: 'Zapatillas Deportivas', cantidad: 1, precio: 250.00 },
                { nombre: 'Calcetines (pack)', cantidad: 2, precio: 50.25 }
            ]
        },
        {
            id: '002',
            cliente: 'Ana García',
            fecha: '2025-09-14',
            metodoPago: 'Efectivo',
            estado: 'Pendiente',
            total: 120.00,
            productos: [
                { nombre: 'Botas de Invierno', cantidad: 1, precio: 120.00 }
            ]
        },
        {
            id: '003',
            cliente: 'Carlos López',
            fecha: '2025-09-13',
            metodoPago: 'Transferencia',
            estado: 'Completada',
            total: 55.75,
            productos: [
                { nombre: 'Zapatos de Vestir', cantidad: 1, precio: 55.75 }
            ]
        }
    ];

    // --- Funciones del Dashboard ---

    // Función para renderizar la tabla
    function renderVentas() {
        ventasTableBody.innerHTML = '';
        ventasData.forEach(venta => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="venta-checkbox"></td>
                <td>${venta.id}</td>
                <td>${venta.cliente}</td>
                <td>${venta.fecha}</td>
                <td>${venta.metodoPago}</td>
                <td><span class="status-badge ${venta.estado.toLowerCase()}">${venta.estado}</span></td>
                <td><span class="price">S/ ${venta.total.toFixed(2)}</span></td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-edit" data-id="${venta.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-id="${venta.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon btn-view" data-id="${venta.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            ventasTableBody.appendChild(row);
        });
    }

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

    // Función para llenar el modal con datos de una venta
    function fillForm(venta) {
        ventaIdInput.value = venta.id;
        ventaClienteInput.value = venta.cliente;
        ventaFechaInput.value = venta.fecha;
        ventaMetodoPagoSelect.value = venta.metodoPago;
        ventaEstadoSelect.value = venta.estado;
        
        productosContainer.innerHTML = '';
        venta.productos.forEach(product => addProductInput(product));
        
        calculateTotal();
    }

    // --- Event Listeners ---

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

    // Manejar el envío del formulario (Crear o Editar)
    ventaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const productos = [];
        productosContainer.querySelectorAll('.product-item').forEach(item => {
            productos.push({
                nombre: item.querySelector('.product-name-input').value,
                cantidad: parseInt(item.querySelector('.product-qty-input').value),
                precio: parseFloat(item.querySelector('.product-price-input').value)
            });
        });

        const newVenta = {
            id: ventaIdInput.value || (ventasData.length + 1).toString().padStart(3, '0'),
            cliente: ventaClienteInput.value,
            fecha: ventaFechaInput.value,
            metodoPago: ventaMetodoPagoSelect.value,
            estado: ventaEstadoSelect.value,
            total: parseFloat(ventaTotalSpan.textContent.replace('S/ ', '')),
            productos: productos
        };

        if (ventaIdInput.value) {
            // Lógica para Editar
            const index = ventasData.findIndex(v => v.id === newVenta.id);
            if (index !== -1) {
                ventasData[index] = newVenta;
                alert('Venta actualizada exitosamente.');
            }
        } else {
            // Lógica para Crear
            ventasData.push(newVenta);
            alert('Nueva venta agregada exitosamente.');
        }

        renderVentas();
        closeModal();
    });

    // Agregar nuevo producto al formulario de venta
    addProductBtn.addEventListener('click', () => {
        addProductInput();
    });

    // Delegación de eventos para los botones de la tabla
    ventasTableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;

        const ventaId = btn.dataset.id;

        if (btn.classList.contains('btn-edit')) {
            const ventaToEdit = ventasData.find(v => v.id === ventaId);
            if (ventaToEdit) {
                fillForm(ventaToEdit);
                modalTitle.textContent = 'Editar Venta';
                openModal();
            }
        } else if (btn.classList.contains('btn-delete')) {
            if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
                ventasData = ventasData.filter(v => v.id !== ventaId);
                renderVentas();
                alert('Venta eliminada exitosamente.');
            }
        } else if (btn.classList.contains('btn-view')) {
            const ventaToView = ventasData.find(v => v.id === ventaId);
            if (ventaToView) {
                let detallesProductos = ventaToView.productos.map(p => ` - ${p.nombre} (${p.cantidad} unidades a S/ ${p.precio.toFixed(2)} c/u)`).join('\n');
                alert(`Detalles de la Venta:
                ID: ${ventaToView.id}
                Cliente: ${ventaToView.cliente}
                Fecha: ${ventaToView.fecha}
                Total: S/ ${ventaToView.total.toFixed(2)}
                
                Productos:
                ${detallesProductos}`);
            }
        }
    });
    
    // Iniciar la aplicación renderizando la tabla con los datos iniciales
    renderVentas();

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

// Actualizar el estado del checkbox "selectAll" cada vez que se renderiza la tabla
const originalRenderVentas = renderVentas;
renderVentas = function () {
    originalRenderVentas();
    updateSelectAllCheckbox();
};
});