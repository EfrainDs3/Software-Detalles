// Proveedores Module JavaScript

// Sample data for proveedores
let proveedores = [
    {
        id: 1,
        razonSocial: "Distribuidora El Mundo S.A.C.",
        nombreComercial: "El Mundo Distribuye",
        ruc: "20523456789",
        rubro: "Calzados y Accesorios",
        direccion: "Av. Los Pinos 1234, Lima",
        telefono: "01-4567890",
        email: "ventas@elmundo.com",
        fechaRegistro: "2024-01-15",
        metodoPago: {
            contado: true,
            credito: true,
            creditoDias: "30",
            transferencia: true,
            transferenciaCuenta: "001-234-567890",
            cheque: false,
            chequeNombre: "",
            efectivo: true
        }
    },
    {
        id: 2,
        razonSocial: "Calzados Premium E.I.R.L.",
        nombreComercial: "Premium Shoes",
        ruc: "20567891234",
        rubro: "Calzados de Cuero",
        direccion: "Jr. Comercio 567, San Juan de Lurigancho",
        telefono: "01-2345678",
        email: "contacto@premiumshoes.com",
        fechaRegistro: "2024-02-20",
        metodoPago: {
            contado: true,
            credito: true,
            creditoDias: "45",
            transferencia: true,
            transferenciaCuenta: "002-345-678901",
            cheque: true,
            chequeNombre: "Calzados Premium E.I.R.L.",
            efectivo: false
        }
    }
];

// DOM elements
const proveedoresTableBody = document.getElementById('proveedores-table-body');
const searchInput = document.getElementById('search-proveedores');
const proveedorModal = document.getElementById('proveedor-modal');
const detalleProveedorModal = document.getElementById('detalle-proveedor-modal');
const modalTitle = document.getElementById('modal-title');
const proveedorForm = document.getElementById('proveedor-form');
const metodoPagoCheckboxes = document.querySelectorAll('.metodo-pago input[type="checkbox"]');

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;

// Global function to update select all checkbox
function updateSelectAllCheckbox() {
    const selectAll = document.getElementById('selectAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');
    
    if (rowCheckboxes.length === 0) {
        selectAll.indeterminate = false;
        selectAll.checked = false;
    } else if (checkedBoxes.length === rowCheckboxes.length) {
        selectAll.indeterminate = false;
        selectAll.checked = true;
    } else if (checkedBoxes.length > 0) {
        selectAll.indeterminate = true;
        selectAll.checked = false;
    } else {
        selectAll.indeterminate = false;
        selectAll.checked = false;
    }
}

// Initialize the module
document.addEventListener('DOMContentLoaded', function() {
    renderProveedoresTable();
    initializeEventListeners();
    initializePaymentMethodsLogic();
    initializeCheckboxLogic();
});

// Initialize checkbox functionality
function initializeCheckboxLogic() {
    const selectAll = document.getElementById('selectAll');

    // Evento para seleccionar/deseleccionar todos
    selectAll.addEventListener('change', function() {
        const rowCheckboxes = document.querySelectorAll('.row-checkbox');
        rowCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Delegación para actualizar el estado del checkbox "selectAll" cuando cambien los individuales
    proveedoresTableBody.addEventListener('change', function(e) {
        if (e.target.classList.contains('row-checkbox')) {
            updateSelectAllCheckbox();
        }
    });

    // Actualizar estado inicial
    updateSelectAllCheckbox();
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Add provider button
    document.getElementById('btn-agregar-proveedor').addEventListener('click', openAddProveedorModal);
    
    // Close modal buttons
    document.querySelectorAll('.modal-close, .btn-cancel').forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === proveedorModal || event.target === detalleProveedorModal) {
            closeModals();
        }
    });
    
    // Form submission
    proveedorForm.addEventListener('submit', handleProveedorSubmit);
    
    // Pagination buttons
    document.getElementById('prev-page').addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('next-page').addEventListener('click', () => changePage(currentPage + 1));
}

// Initialize payment methods logic
function initializePaymentMethodsLogic() {
    metodoPagoCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const paymentData = this.parentElement.querySelector('.payment-data');
            if (paymentData) {
                paymentData.disabled = !this.checked;
                if (!this.checked) {
                    paymentData.value = '';
                }
            }
        });
    });
}

// Render providers table
function renderProveedoresTable(data = proveedores) {
    if (!proveedoresTableBody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    
    proveedoresTableBody.innerHTML = '';
    
    paginatedData.forEach(proveedor => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox" value="${proveedor.id}">
            </td>
            <td>
                <div style="font-weight: 500; color: #b30000; font-size: 16px;">${String(proveedor.id).padStart(3, '0')}</div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 500; color: #333;">${proveedor.razonSocial}</div>
                    <div style="font-size: 12px; color: #666;">${proveedor.nombreComercial}</div>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 500;">${proveedor.ruc}</div>
                    <div style="font-size: 12px; color: #666;">${proveedor.rubro}</div>
                </div>
            </td>
            <td>
                <div>
                    <div>${proveedor.telefono}</div>
                    <div style="font-size: 12px; color: #666;">${proveedor.email}</div>
                </div>
            </td>
            <td>
                <div style="font-size: 12px; color: #666;">${proveedor.direccion}</div>
            </td>
            <td>${formatDate(proveedor.fechaRegistro)}</td>
            <td>
                <div class="action-buttons-cell">
                    <button class="btn-icon btn-edit" onclick="editProveedor(${proveedor.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProveedor(${proveedor.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-view" onclick="viewProveedorDetails(${proveedor.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        proveedoresTableBody.appendChild(row);
    });
    
    updatePagination(data.length);
    
    // Actualizar estado de checkboxes después de renderizar
    updateSelectAllCheckbox();
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderProveedoresTable();
        return;
    }
    
    const filteredProveedores = proveedores.filter(proveedor => 
        proveedor.razonSocial.toLowerCase().includes(searchTerm) ||
        proveedor.nombreComercial.toLowerCase().includes(searchTerm) ||
        proveedor.ruc.includes(searchTerm) ||
        proveedor.rubro.toLowerCase().includes(searchTerm) ||
        proveedor.email.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    renderProveedoresTable(filteredProveedores);
}

// Open add provider modal
function openAddProveedorModal() {
    modalTitle.textContent = 'Agregar Proveedor';
    proveedorForm.reset();
    resetPaymentMethods();
    proveedorModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Edit provider
function editProveedor(id) {
    const proveedor = proveedores.find(p => p.id === id);
    if (!proveedor) return;
    
    modalTitle.textContent = 'Editar Proveedor';
    
    // Fill form with provider data
    document.getElementById('razon-social').value = proveedor.razonSocial || '';
    document.getElementById('nombre-comercial').value = proveedor.nombreComercial || '';
    document.getElementById('ruc').value = proveedor.ruc || '';
    document.getElementById('rubro').value = proveedor.rubro || '';
    document.getElementById('direccion').value = proveedor.direccion || '';
    document.getElementById('telefono').value = proveedor.telefono || '';
    document.getElementById('email').value = proveedor.email || '';
    
    // Fill payment methods
    fillPaymentMethods(proveedor.metodoPago);
    
    // Store current editing ID
    proveedorForm.dataset.editingId = id;
    
    proveedorModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fill payment methods in form
function fillPaymentMethods(metodoPago) {
    if (!metodoPago) return;
    
    // Reset all first
    resetPaymentMethods();
    
    // Set checkboxes and corresponding data
    Object.keys(metodoPago).forEach(metodo => {
        const checkbox = document.querySelector(`input[name="${metodo}"]`);
        if (checkbox) {
            checkbox.checked = metodoPago[metodo] === true;
            
            // Handle payment data fields
            const paymentData = checkbox.parentElement.querySelector('.payment-data');
            if (paymentData) {
                paymentData.disabled = !checkbox.checked;
                
                // Set corresponding data value
                if (metodo === 'credito' && metodoPago.creditoDias) {
                    paymentData.value = metodoPago.creditoDias;
                } else if (metodo === 'transferencia' && metodoPago.transferenciaCuenta) {
                    paymentData.value = metodoPago.transferenciaCuenta;
                } else if (metodo === 'cheque' && metodoPago.chequeNombre) {
                    paymentData.value = metodoPago.chequeNombre;
                }
            }
        }
    });
}

// Reset payment methods form
function resetPaymentMethods() {
    metodoPagoCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        const paymentData = checkbox.parentElement.querySelector('.payment-data');
        if (paymentData) {
            paymentData.disabled = true;
            paymentData.value = '';
        }
    });
}

// View provider details
function viewProveedorDetails(id) {
    const proveedor = proveedores.find(p => p.id === id);
    if (!proveedor) return;
    
    // Fill detail modal
    document.getElementById('detalle-razon-social').textContent = proveedor.razonSocial || 'No especificado';
    document.getElementById('detalle-nombre-comercial').textContent = proveedor.nombreComercial || 'No especificado';
    document.getElementById('detalle-ruc').textContent = proveedor.ruc || 'No especificado';
    document.getElementById('detalle-rubro').textContent = proveedor.rubro || 'No especificado';
    document.getElementById('detalle-direccion').textContent = proveedor.direccion || 'No especificada';
    document.getElementById('detalle-telefono').textContent = proveedor.telefono || 'No especificado';
    document.getElementById('detalle-email').textContent = proveedor.email || 'No especificado';
    document.getElementById('detalle-fecha-registro').textContent = formatDate(proveedor.fechaRegistro) || 'No especificada';
    
    // Fill payment methods details
    fillPaymentMethodsDetails(proveedor.metodoPago);
    
    detalleProveedorModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fill payment methods details
function fillPaymentMethodsDetails(metodoPago) {
    const metodosContainer = document.getElementById('detalle-metodos-container');
    metodosContainer.innerHTML = '';
    
    if (!metodoPago) {
        metodosContainer.innerHTML = '<p style="color: #666; font-style: italic;">No hay métodos de pago configurados.</p>';
        return;
    }
    
    const metodosActivos = [];
    
    if (metodoPago.contado) metodosActivos.push({ nombre: 'Contado', datos: 'Pago inmediato' });
    if (metodoPago.credito) metodosActivos.push({ nombre: 'Crédito', datos: `${metodoPago.creditoDias || 'No especificado'} días` });
    if (metodoPago.transferencia) metodosActivos.push({ nombre: 'Transferencia', datos: metodoPago.transferenciaCuenta || 'Cuenta no especificada' });
    if (metodoPago.cheque) metodosActivos.push({ nombre: 'Cheque', datos: `A nombre de: ${metodoPago.chequeNombre || 'No especificado'}` });
    if (metodoPago.efectivo) metodosActivos.push({ nombre: 'Efectivo', datos: 'Pago en efectivo' });
    
    if (metodosActivos.length === 0) {
        metodosContainer.innerHTML = '<p style="color: #666; font-style: italic;">No hay métodos de pago configurados.</p>';
        return;
    }
    
    metodosActivos.forEach(metodo => {
        const metodoDiv = document.createElement('div');
        metodoDiv.className = 'metodo-item';
        metodoDiv.innerHTML = `
            <div class="metodo-nombre">${metodo.nombre}</div>
            <div class="metodo-datos">${metodo.datos}</div>
        `;
        metodosContainer.appendChild(metodoDiv);
    });
}

// Delete provider
function deleteProveedor(id) {
    const proveedor = proveedores.find(p => p.id === id);
    if (!proveedor) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar el proveedor "${proveedor.razonSocial}"?`)) {
        proveedores = proveedores.filter(p => p.id !== id);
        renderProveedoresTable();
        showNotification('Proveedor eliminado exitosamente', 'success');
    }
}

// Handle form submission
function handleProveedorSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(proveedorForm);
    const proveedorData = {
        razonSocial: formData.get('razonSocial'),
        nombreComercial: formData.get('nombreComercial'),
        ruc: formData.get('ruc'),
        rubro: formData.get('rubro'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        metodoPago: getPaymentMethodsData()
    };
    
    // Validate required fields
    if (!validateProveedorData(proveedorData)) {
        return;
    }
    
    const editingId = proveedorForm.dataset.editingId;
    
    if (editingId) {
        // Update existing provider
        const index = proveedores.findIndex(p => p.id == editingId);
        if (index !== -1) {
            proveedores[index] = {
                ...proveedores[index],
                ...proveedorData
            };
            showNotification('Proveedor actualizado exitosamente', 'success');
        }
    } else {
        // Add new provider
        const newProveedor = {
            ...proveedorData,
            id: Math.max(...proveedores.map(p => p.id), 0) + 1,
            fechaRegistro: new Date().toISOString().split('T')[0]
        };
        proveedores.push(newProveedor);
        showNotification('Proveedor agregado exitosamente', 'success');
    }
    
    // Reset form and close modal
    delete proveedorForm.dataset.editingId;
    closeModals();
    renderProveedoresTable();
}

// Get payment methods data from form
function getPaymentMethodsData() {
    const metodoPago = {};
    
    metodoPagoCheckboxes.forEach(checkbox => {
        const name = checkbox.name;
        metodoPago[name] = checkbox.checked;
        
        // Get corresponding data
        const paymentData = checkbox.parentElement.querySelector('.payment-data');
        if (paymentData && checkbox.checked && paymentData.value.trim()) {
            if (name === 'credito') {
                metodoPago.creditoDias = paymentData.value.trim();
            } else if (name === 'transferencia') {
                metodoPago.transferenciaCuenta = paymentData.value.trim();
            } else if (name === 'cheque') {
                metodoPago.chequeNombre = paymentData.value.trim();
            }
        }
    });
    
    return metodoPago;
}

// Validate provider data
function validateProveedorData(data) {
    const errors = [];
    
    if (!data.razonSocial || data.razonSocial.trim() === '') {
        errors.push('La razón social es obligatoria');
    }
    
    if (!data.ruc || data.ruc.trim() === '') {
        errors.push('El RUC es obligatorio');
    } else if (!/^\d{11}$/.test(data.ruc.trim())) {
        errors.push('El RUC debe tener 11 dígitos');
    }
    
    if (data.email && !isValidEmail(data.email)) {
        errors.push('El email no tiene un formato válido');
    }
    
    if (data.telefono && !/^\d{2}-\d{7}$/.test(data.telefono.trim())) {
        errors.push('El teléfono debe tener el formato XX-XXXXXXX');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return false;
    }
    
    return true;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Close all modals
function closeModals() {
    proveedorModal.style.display = 'none';
    detalleProveedorModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    proveedorForm.reset();
    resetPaymentMethods();
    delete proveedorForm.dataset.editingId;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Pagination functions
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Update pagination info
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('pagination-info').textContent = 
        `Mostrando ${startItem} a ${endItem} de ${totalItems} proveedores`;
    
    // Update pagination buttons
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
    
    // Update page numbers
    updatePageNumbers(totalPages);
}

function updatePageNumbers(totalPages) {
    const pageNumbersContainer = document.getElementById('page-numbers');
    pageNumbersContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `btn-pagination ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => changePage(i));
        pageNumbersContainer.appendChild(pageButton);
    }
}

function changePage(page) {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const data = searchTerm === '' ? proveedores : 
        proveedores.filter(proveedor => 
            proveedor.razonSocial.toLowerCase().includes(searchTerm) ||
            proveedor.nombreComercial.toLowerCase().includes(searchTerm) ||
            proveedor.ruc.includes(searchTerm) ||
            proveedor.rubro.toLowerCase().includes(searchTerm) ||
            proveedor.email.toLowerCase().includes(searchTerm)
        );
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProveedoresTable(data);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#333';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}