// Clientes Module - Fixed Version
// Compatible con los modales del HTML existente

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

let currentClientId = null;
let currentFilterOptions = {
    tipoDocumento: 'todos',
    estado: 'todos'
};

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initClientesModule();
    loadClientes();
});

function initClientesModule() {
    console.log('Initializing Clientes Module...');
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        console.log('Search input attached');
    }
    
    // Add client button
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', openAddClientModal);
        console.log('Add button attached');
    }
    
    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', openFilterModal);
        console.log('Filter button attached');
    }
    
    // Add Client Modal
    setupAddModal();
    
    // Edit Client Modal
    setupEditModal();
    
    // Delete Client Modal
    setupDeleteModal();
    
    // View Client Modal
    setupViewModal();
    
    console.log('Clientes Module initialized successfully');
}

// ========== ADD MODAL ==========
function setupAddModal() {
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const clientForm = document.getElementById('clientForm');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeAddModal);
    }
    
    if (clientForm) {
        clientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddClient();
        });
    }
}

function openAddClientModal() {
    console.log('Opening add modal...');
    const modal = document.getElementById('clientModal');
    if (modal) {
        const form = document.getElementById('clientForm');
        if (form) {
            form.reset();
        }
        modal.style.display = 'flex';
        console.log('Add modal opened');
    } else {
        console.error('clientModal not found');
    }
}

function closeAddModal() {
    const modal = document.getElementById('clientModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleAddClient() {
    const form = document.getElementById('clientForm');
    
    const newClient = {
        id: generateId(),
        nombre: document.getElementById('clientName').value,
        apellido: document.getElementById('clientLastName').value,
        tipoDocumento: document.getElementById('clientDocType').value,
        numeroDocumento: document.getElementById('clientDocNumber').value,
        email: document.getElementById('clientEmail').value,
        telefono: document.getElementById('clientPhone').value,
        direccion: document.getElementById('clientAddress').value,
        estado: 'activo'
    };
    
    clientes.push(newClient);
    loadClientes();
    closeAddModal();
    showNotification('Cliente agregado exitosamente', 'success');
}

// ========== EDIT MODAL ==========
function setupEditModal() {
    const closeBtn = document.getElementById('closeEditClientModal');
    const cancelBtn = document.getElementById('cancelEditClientBtn');
    const editForm = document.getElementById('editClientForm');
    const saveBtn = document.getElementById('saveEditClientBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }
    
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditClient();
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleEditClient();
        });
    }
}

function openEditClientModal(clientId) {
    console.log('Opening edit modal for client:', clientId);
    currentClientId = clientId;
    const cliente = clientes.find(c => c.id === clientId);
    
    if (!cliente) {
        console.error('Cliente not found:', clientId);
        return;
    }
    
    // Populate form
    document.getElementById('editClientName').value = cliente.nombre;
    document.getElementById('editClientLastName').value = cliente.apellido;
    document.getElementById('editClientDocType').value = cliente.tipoDocumento;
    document.getElementById('editClientDocNumber').value = cliente.numeroDocumento;
    document.getElementById('editClientEmail').value = cliente.email;
    document.getElementById('editClientPhone').value = cliente.telefono;
    document.getElementById('editClientAddress').value = cliente.direccion;
    
    // Show modal
    const modal = document.getElementById('editClientModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('Edit modal opened');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editClientModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentClientId = null;
}

function handleEditClient() {
    if (!currentClientId) return;
    
    const cliente = clientes.find(c => c.id === currentClientId);
    if (!cliente) return;
    
    // Update client data
    cliente.nombre = document.getElementById('editClientName').value;
    cliente.apellido = document.getElementById('editClientLastName').value;
    cliente.tipoDocumento = document.getElementById('editClientDocType').value;
    cliente.numeroDocumento = document.getElementById('editClientDocNumber').value;
    cliente.email = document.getElementById('editClientEmail').value;
    cliente.telefono = document.getElementById('editClientPhone').value;
    cliente.direccion = document.getElementById('editClientAddress').value;
    
    loadClientes();
    closeEditModal();
    showNotification('Cliente actualizado exitosamente', 'success');
}

// ========== DELETE MODAL ==========
function setupDeleteModal() {
    const closeBtn = document.getElementById('closeDeleteClientModal');
    const cancelBtn = document.getElementById('cancelDeleteClientBtn');
    const confirmBtn = document.getElementById('confirmDeleteClientBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDeleteModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeDeleteModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleDeleteClient);
    }
}

function openDeleteClientModal(clientId) {
    console.log('Opening delete modal for client:', clientId);
    currentClientId = clientId;
    const cliente = clientes.find(c => c.id === clientId);
    
    if (!cliente) {
        console.error('Cliente not found:', clientId);
        return;
    }
    
    // Set client name in modal
    const nameSpan = document.getElementById('deleteClientName');
    if (nameSpan) {
        nameSpan.textContent = `${cliente.nombre} ${cliente.apellido}`;
    }
    
    // Show modal
    const modal = document.getElementById('deleteClientModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('Delete modal opened');
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteClientModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentClientId = null;
}

function handleDeleteClient() {
    if (!currentClientId) return;
    
    const index = clientes.findIndex(c => c.id === currentClientId);
    if (index !== -1) {
        clientes.splice(index, 1);
        loadClientes();
        closeDeleteModal();
        showNotification('Cliente eliminado exitosamente', 'success');
    }
}

// ========== VIEW MODAL ==========
function setupViewModal() {
    const closeBtn = document.getElementById('closeViewClientModal');
    const closeFooterBtn = document.getElementById('closeViewClientBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeViewModal);
    }
    
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', closeViewModal);
    }
}

function openViewClientModal(clientId) {
    console.log('Opening view modal for client:', clientId);
    const cliente = clientes.find(c => c.id === clientId);
    
    if (!cliente) {
        console.error('Cliente not found:', clientId);
        return;
    }
    
    // Populate view modal
    document.getElementById('viewClientName').textContent = cliente.nombre;
    document.getElementById('viewClientLastName').textContent = cliente.apellido;
    document.getElementById('viewClientDocType').textContent = cliente.tipoDocumento;
    document.getElementById('viewClientDocNumber').textContent = cliente.numeroDocumento;
    document.getElementById('viewClientEmail').textContent = cliente.email || 'N/A';
    document.getElementById('viewClientPhone').textContent = cliente.telefono || 'N/A';
    document.getElementById('viewClientAddress').textContent = cliente.direccion;
    
    // Show modal
    const modal = document.getElementById('viewClientModal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('View modal opened');
    }
}

function closeViewModal() {
    const modal = document.getElementById('viewClientModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========== TABLE MANAGEMENT ==========
function loadClientes() {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) {
        console.error('clientsTableBody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    clientes.forEach(cliente => {
        const row = createClienteRow(cliente);
        tbody.appendChild(row);
    });
    
    console.log('Loaded', clientes.length, 'clients');
}

function createClienteRow(cliente) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>${cliente.id}</td>
        <td>${cliente.nombre} ${cliente.apellido}</td>
        <td>
            <span class="doc-badge doc-badge-${cliente.tipoDocumento.toLowerCase()}">
                ${cliente.tipoDocumento}
            </span>
        </td>
        <td>${cliente.numeroDocumento}</td>
        <td>${cliente.email || 'N/A'}</td>
        <td>${cliente.telefono || 'N/A'}</td>
        <td>
            <span class="status-badge status-${cliente.estado}">
                ${cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </span>
        </td>
        <td class="action-buttons-cell">
            <button class="btn-icon btn-view" onclick="openViewClientModal('${cliente.id}')" title="Ver">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon btn-edit" onclick="openEditClientModal('${cliente.id}')" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" onclick="openDeleteClientModal('${cliente.id}')" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// ========== SEARCH ==========
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    const filteredClientes = clientes.filter(cliente => {
        const matchesSearch = 
            cliente.id.toLowerCase().includes(searchTerm) ||
            cliente.nombre.toLowerCase().includes(searchTerm) ||
            cliente.apellido.toLowerCase().includes(searchTerm) ||
            cliente.numeroDocumento.includes(searchTerm) ||
            (cliente.email && cliente.email.toLowerCase().includes(searchTerm)) ||
            (cliente.telefono && cliente.telefono.includes(searchTerm));
        
        return matchesSearch;
    });
    
    displayFilteredClientes(filteredClientes);
}

function displayFilteredClientes(filteredClientes) {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    filteredClientes.forEach(cliente => {
        const row = createClienteRow(cliente);
        tbody.appendChild(row);
    });
}

// ========== FILTER MODAL ==========
function openFilterModal() {
    console.log('Opening filter modal...');
    // Create filter modal dynamically
    createFilterModal();
}

function createFilterModal() {
    // Remove existing filter modal if any
    const existingModal = document.getElementById('filterModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div id="filterModal" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-filter"></i>
                        Filtros
                    </h3>
                    <button class="modal-close" onclick="closeFilterModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-id-card"></i>
                            Tipo de Documento
                        </label>
                        <select id="filterTipoDocumento" class="filter-select">
                            <option value="todos">Todos</option>
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-toggle-on"></i>
                            Estado
                        </label>
                        <select id="filterEstado" class="filter-select">
                            <option value="todos">Todos</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="clearFilters()">
                        <i class="fas fa-eraser"></i>
                        Limpiar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="applyFilters()">
                        <i class="fas fa-check"></i>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set current filter values
    document.getElementById('filterTipoDocumento').value = currentFilterOptions.tipoDocumento;
    document.getElementById('filterEstado').value = currentFilterOptions.estado;
}

function closeFilterModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.remove();
    }
}

function applyFilters() {
    const tipoDocumento = document.getElementById('filterTipoDocumento').value;
    const estado = document.getElementById('filterEstado').value;
    
    currentFilterOptions = { tipoDocumento, estado };
    
    let filteredClientes = clientes.filter(cliente => {
        const matchesTipoDocumento = tipoDocumento === 'todos' || cliente.tipoDocumento === tipoDocumento;
        const matchesEstado = estado === 'todos' || cliente.estado === estado;
        
        return matchesTipoDocumento && matchesEstado;
    });
    
    displayFilteredClientes(filteredClientes);
    closeFilterModal();
    showNotification(`Filtros aplicados: ${filteredClientes.length} clientes encontrados`, 'info');
}

function clearFilters() {
    currentFilterOptions = {
        tipoDocumento: 'todos',
        estado: 'todos'
    };
    
    document.getElementById('filterTipoDocumento').value = 'todos';
    document.getElementById('filterEstado').value = 'todos';
    
    loadClientes();
    closeFilterModal();
    showNotification('Filtros limpiados', 'info');
}

// ========== UTILITIES ==========
function generateId() {
    const maxId = clientes.reduce((max, c) => {
        const numId = parseInt(c.id);
        return numId > max ? numId : max;
    }, 0);
    
    return String(maxId + 1).padStart(3, '0');
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions globally accessible
window.openEditClientModal = openEditClientModal;
window.openDeleteClientModal = openDeleteClientModal;
window.openViewClientModal = openViewClientModal;
window.closeFilterModal = closeFilterModal;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
