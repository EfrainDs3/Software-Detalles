// Clientes Module JavaScript
// Siguiendo el mismo estilo y estructura del módulo de roles

// Global variables
let clientes = [
    {
        id: '001',
        nombre: 'Juan Carlos',
        apellido: 'Pérez González',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'juancarlos@email.com',
        telefono: '987654321',
        direccion: 'Av. Principal 123, San Isidro, Lima',
        estado: 'activo'
    },
    {
        id: '002',
        nombre: 'María Elena',
        apellido: 'Torres Silva',
        tipoDocumento: 'DNI',
        numeroDocumento: '87654321',
        email: 'maria.torres@email.com',
        telefono: '912345678',
        direccion: 'Jr. Comercio 456, Miraflores, Lima',
        estado: 'activo'
    },
    {
        id: '003',
        nombre: 'Empresa XYZ',
        apellido: 'S.A.C.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        email: 'contacto@empresaxyz.com',
        telefono: '014567890',
        direccion: 'Av. Industrial 789, Los Olivos, Lima',
        estado: 'activo'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize clients module
    initClientesModule();
    // Load initial data
    loadClientes();
});

function initClientesModule() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const addClientBtn = document.getElementById('addClientBtn');
    const filterBtn = document.getElementById('filterBtn');
    const clientModal = document.getElementById('clientModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const clientForm = document.getElementById('clientForm');
    const selectAllCheckbox = document.getElementById('selectAll');
    const logoutBtn = document.querySelector('.logout-btn');

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (addClientBtn) {
        addClientBtn.addEventListener('click', openAddClientModal);
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilter);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (clientForm) {
        clientForm.addEventListener('submit', handleFormSubmit);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Close modal when clicking outside
    if (clientModal) {
        clientModal.addEventListener('click', function(e) {
            if (e.target === clientModal) {
                closeModal();
            }
        });
    }
}

// Load clientes into table
function loadClientes() {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const row = createClienteRow(cliente);
        tbody.appendChild(row);
    });

    // Update pagination info
    updatePaginationInfo();
    // Attach action listeners to buttons created dynamically
    addActionButtonListeners();
}

// Create cliente row
function createClienteRow(cliente) {
    const row = document.createElement('tr');
    
    const docClass = {
        'DNI': 'dni',
        'RUC': 'ruc',
        'Pasaporte': 'passport'
    };

    row.innerHTML = `
        <td><input type="checkbox" class="client-checkbox" data-client-id="${cliente.id}"></td>
        <td><span class="badge-id">${cliente.id}</span></td>
        <td><strong>${cliente.nombre}</strong></td>
        <td>${cliente.apellido}</td>
        <td><span class="doc-badge ${docClass[cliente.tipoDocumento]}">${cliente.tipoDocumento}</span></td>
        <td><code>${cliente.numeroDocumento}</code></td>
        <td>${cliente.email}</td>
        <td>${cliente.telefono}</td>
        <td class="address-cell" title="${cliente.direccion}">${cliente.direccion}</td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" title="Editar" data-client-id="${cliente.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" title="Eliminar" data-client-id="${cliente.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" title="Ver detalles" data-client-id="${cliente.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Search functionality - Búsqueda por nombre, ID y estado
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#clientsTableBody tr');

    tableRows.forEach(row => {
        const id = row.cells[1]?.textContent.toLowerCase() || '';
        const nombre = row.cells[2]?.textContent.toLowerCase() || '';
        const apellido = row.cells[3]?.textContent.toLowerCase() || '';
        const email = row.cells[6]?.textContent.toLowerCase() || '';
        const numeroDoc = row.cells[5]?.textContent.toLowerCase() || '';
        
        // Buscar también por estado (activo/inactivo)
        const clientId = row.querySelector('.client-checkbox')?.getAttribute('data-client-id');
        const cliente = clientes.find(c => c.id === clientId);
        const estado = cliente ? cliente.estado.toLowerCase() : '';

        if (id.includes(searchTerm) || nombre.includes(searchTerm) || apellido.includes(searchTerm) || 
            email.includes(searchTerm) || numeroDoc.includes(searchTerm) || estado.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter functionality
function handleFilter() {
    const filterModal = createFilterModal();
    document.body.appendChild(filterModal);
}

function createFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal center-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Filtros de Clientes</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterTipoDocumento">Tipo de Documento</label>
                        <select id="filterTipoDocumento">
                            <option value="">Todos los tipos</option>
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterEstado">Estado</label>
                        <select id="filterEstado">
                            <option value="">Todos los estados</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="applyFilters()">Aplicar Filtros</button>
            </div>
        </div>
    `;
    
    return modal;
}

function applyFilters() {
    const tipoDocumentoFilter = document.getElementById('filterTipoDocumento').value;
    const estadoFilter = document.getElementById('filterEstado').value;
    
    let filteredClientes = clientes;
    
    if (tipoDocumentoFilter) {
        filteredClientes = filteredClientes.filter(cliente => cliente.tipoDocumento === tipoDocumentoFilter);
    }
    
    if (estadoFilter) {
        filteredClientes = filteredClientes.filter(cliente => cliente.estado === estadoFilter);
    }
    
    // Update table with filtered data
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    
    filteredClientes.forEach(cliente => {
        const row = createClienteRow(cliente);
        tbody.appendChild(row);
    });
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Re-add event listeners
    addActionButtonListeners();
    
    showNotification(`Filtros aplicados: ${filteredClientes.length} clientes encontrados`);
}

// Modal functions
function openAddClientModal() {
    const modal = document.getElementById('clientModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('clientForm');

    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Cliente';
    }

    if (form) {
        form.reset();
        // Remove any existing client ID
        const existingId = form.querySelector('input[name="id"]');
        if (existingId) {
            existingId.remove();
        }
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function openEditClientModal(clientId) {
    const modal = document.getElementById('clientModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('clientForm');

    if (modalTitle) {
        modalTitle.textContent = 'Editar Cliente';
    }

    if (form) {
        form.reset();
        
        // Add hidden input for client ID
        const existingId = form.querySelector('input[name="id"]');
        if (existingId) {
            existingId.remove();
        }
        
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = clientId;
        form.appendChild(idInput);

        // Populate form with client data
        populateClientForm(clientId);
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // También cerrar modales dinámicos
    const dynamicModals = document.querySelectorAll('.modal');
    dynamicModals.forEach(m => {
        if (m.id !== 'clientModal') {
            m.remove();
        }
    });
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clienteData = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateClientForm(clienteData)) {
        return;
    }

    // Show loading state
    const saveBtn = e.target.querySelector('button[type="submit"]');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
    }

    // Simulate API call
    setTimeout(() => {
        if (clienteData.id) {
            updateCliente(clienteData);
        } else {
            createCliente(clienteData);
        }
        
        closeModal();
        
        // Reset button
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
            saveBtn.disabled = false;
        }
    }, 500);
}

function validateClientForm(data) {
    if (!data.nombre || !data.apellido) {
        showNotification('Por favor complete los campos obligatorios', 'error');
        return false;
    }

    if (!data.tipoDocumento || !data.numeroDocumento) {
        showNotification('El tipo y número de documento son obligatorios', 'error');
        return false;
    }

    // Validate email format
    if (data.email && !validateEmail(data.email)) {
        showNotification('Por favor ingrese un email válido', 'error');
        return false;
    }

    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function createCliente(clienteData) {
    // Generate new ID
    const newId = String(clientes.length + 1).padStart(3, '0');
    
    const newCliente = {
        id: newId,
        nombre: clienteData.nombre,
        apellido: clienteData.apellido,
        tipoDocumento: clienteData.tipoDocumento,
        numeroDocumento: clienteData.numeroDocumento,
        email: clienteData.email,
        telefono: clienteData.telefono,
        direccion: clienteData.direccion,
        estado: 'activo'
    };
    
    clientes.push(newCliente);
    loadClientes();
    showNotification('Cliente creado exitosamente', 'success');
}

function updateCliente(clienteData) {
    const clienteIndex = clientes.findIndex(c => c.id === clienteData.id);
    
    if (clienteIndex !== -1) {
        clientes[clienteIndex] = {
            ...clientes[clienteIndex],
            nombre: clienteData.nombre,
            apellido: clienteData.apellido,
            tipoDocumento: clienteData.tipoDocumento,
            numeroDocumento: clienteData.numeroDocumento,
            email: clienteData.email,
            telefono: clienteData.telefono,
            direccion: clienteData.direccion
        };
        
        loadClientes();
        showNotification('Cliente actualizado exitosamente', 'success');
    }
}

function deleteCliente(clientId) {
    const cliente = clientes.find(c => c.id === clientId);
    
    if (cliente) {
        const deleteModal = createDeleteModal(clientId, cliente.nombre + ' ' + cliente.apellido);
        document.body.appendChild(deleteModal);
    }
}

function createDeleteModal(clientId, clientName) {
    const modal = document.createElement('div');
    modal.className = 'modal center-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirmar Eliminación</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar a <strong>${clientName}</strong>? Esta acción no puede deshacerse.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" id="confirmDeleteBtn">Eliminar</button>
            </div>
        </div>
    `;

    // Attach handler for confirm delete
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', function() {
        const clienteIndex = clientes.findIndex(cliente => cliente.id === clientId);
        if (clienteIndex !== -1) {
            clientes.splice(clienteIndex, 1);
            loadClientes();
            showNotification('Cliente eliminado exitosamente', 'success');
        }
        modal.remove();
    });

    return modal;
}

function viewCliente(clientId) {
    const cliente = clientes.find(c => c.id === clientId);
    
    if (cliente) {
        const viewModal = createViewClienteModal(cliente);
        document.body.appendChild(viewModal);
    }
}

function createViewClienteModal(cliente) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const estadoText = {
        'activo': 'Activo',
        'inactivo': 'Inactivo'
    };
    
    const estadoBadgeClass = {
        'activo': 'badge-active',
        'inactivo': 'badge-inactive'
    };

    const docClass = {
        'DNI': 'dni',
        'RUC': 'ruc',
        'Pasaporte': 'passport'
    };

    modal.innerHTML = `
        <div class="modal-content modal-view-client">
            <div class="modal-header">
                <h3>Detalles del Cliente</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="client-details-view">
                    <div class="client-avatar-large">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="client-info-header">
                        <h4>${cliente.nombre} ${cliente.apellido}</h4>
                        <span class="badge ${estadoBadgeClass[cliente.estado]}">${estadoText[cliente.estado]}</span>
                    </div>
                </div>
                <div class="client-info-grid">
                    <div class="info-item">
                        <span class="info-label"><i class="fas fa-hashtag"></i> ID:</span>
                        <span class="info-value">${cliente.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i class="fas fa-id-card"></i> Tipo de Documento:</span>
                        <span class="info-value"><span class="doc-badge ${docClass[cliente.tipoDocumento]}">${cliente.tipoDocumento}</span></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i class="fas fa-file-alt"></i> Número de Documento:</span>
                        <span class="info-value"><code>${cliente.numeroDocumento}</code></span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i class="fas fa-envelope"></i> Email:</span>
                        <span class="info-value">${cliente.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i class="fas fa-phone"></i> Teléfono:</span>
                        <span class="info-value">${cliente.telefono}</span>
                    </div>
                    <div class="info-item full-width">
                        <span class="info-label"><i class="fas fa-map-marker-alt"></i> Dirección:</span>
                        <span class="info-value">${cliente.direccion}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="openEditClientModal('${cliente.id}'); this.closest('.modal').remove();">
                    <i class="fas fa-edit"></i> Editar Cliente
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

// Table management
function populateClientForm(clientId) {
    const cliente = clientes.find(c => c.id === clientId);
    if (cliente) {
        document.getElementById('clientName').value = cliente.nombre;
        document.getElementById('clientLastName').value = cliente.apellido;
        document.getElementById('clientDocType').value = cliente.tipoDocumento;
        document.getElementById('clientDocNumber').value = cliente.numeroDocumento;
        document.getElementById('clientEmail').value = cliente.email || '';
        document.getElementById('clientPhone').value = cliente.telefono || '';
        document.getElementById('clientAddress').value = cliente.direccion || '';
    }
}

// Add action button listeners
function addActionButtonListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = this.getAttribute('data-client-id');
            openEditClientModal(clientId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = this.getAttribute('data-client-id');
            deleteCliente(clientId);
        });
    });

    // View buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const clientId = this.getAttribute('data-client-id');
            viewCliente(clientId);
        });
    });
}

// Select all functionality
function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
}

// Pagination
function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Mostrando 1-${clientes.length} de ${clientes.length} clientes`;
    }
}

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Logout functionality
function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        window.location.href = '/software/login.html';
    }
}
