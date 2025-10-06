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
    
    // Select All checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
        console.log('Select All checkbox attached');
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
    const editFromViewBtn = document.getElementById('editFromViewBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeViewModal);
    }
    
    if (closeFooterBtn) {
        closeFooterBtn.addEventListener('click', closeViewModal);
    }
    
    if (editFromViewBtn) {
        editFromViewBtn.addEventListener('click', function() {
            const clientId = document.getElementById('viewClientId').textContent;
            closeViewModal();
            openEditClientModal(clientId);
        });
    }
}

function openViewClientModal(clientId) {
    console.log('Opening view modal for client:', clientId);
    const cliente = clientes.find(c => c.id === clientId);
    
    if (!cliente) {
        console.error('Cliente not found:', clientId);
        return;
    }
    
    // Populate view modal with new structure
    document.getElementById('viewClientFullName').textContent = `${cliente.nombre} ${cliente.apellido}`;
    document.getElementById('viewClientId').textContent = cliente.id;
    document.getElementById('viewClientDocType').textContent = cliente.tipoDocumento;
    document.getElementById('viewClientDocNumber').textContent = cliente.numeroDocumento;
    document.getElementById('viewClientEmail').textContent = cliente.email || 'N/A';
    document.getElementById('viewClientPhone').textContent = cliente.telefono || 'N/A';
    document.getElementById('viewClientAddress').textContent = cliente.direccion;
    document.getElementById('viewClientStatus').textContent = cliente.estado === 'activo' ? 'Activo' : 'Inactivo';
    
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
    
    // Attach event listeners to checkboxes
    attachCheckboxListeners();
    
    console.log('Loaded', clientes.length, 'clients');
}

function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

function createClienteRow(cliente) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td><input type="checkbox" class="client-checkbox"></td>
        <td><span class="badge-id">${cliente.id}</span></td>
        <td><strong>${cliente.nombre}</strong></td>
        <td>${cliente.apellido}</td>
        <td>
            <span class="doc-badge ${cliente.tipoDocumento.toLowerCase()}">
                ${cliente.tipoDocumento}
            </span>
        </td>
        <td><code>${cliente.numeroDocumento}</code></td>
        <td>${cliente.email || 'N/A'}</td>
        <td>${cliente.telefono || 'N/A'}</td>
        <td class="address-cell" title="${cliente.direccion}">${cliente.direccion}</td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" onclick="openEditClientModal('${cliente.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="openDeleteClientModal('${cliente.id}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" onclick="openViewClientModal('${cliente.id}')" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
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

// ========== CHECKBOX FUNCTIONALITY ==========
function handleSelectAll(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.client-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    updateSelectedCount();
    updateBulkActionsVisibility();
}

function handleIndividualCheckbox() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    // Check if all checkboxes are checked
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const someChecked = Array.from(checkboxes).some(cb => cb.checked);
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
    
    updateSelectedCount();
    updateBulkActionsVisibility();
}

function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const count = selectedCheckboxes.length;
    
    // Update counter if exists
    const counter = document.getElementById('selectedCount');
    if (counter) {
        counter.textContent = count;
    }
    
    console.log(`Selected clients: ${count}`);
}

function updateBulkActionsVisibility() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    
    if (bulkActions) {
        if (selectedCheckboxes.length > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

function getSelectedClientIds() {
    const selectedCheckboxes = document.querySelectorAll('.client-checkbox:checked');
    const ids = [];
    
    selectedCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const idCell = row.querySelector('td:nth-child(2) .badge-id');
        if (idCell) {
            ids.push(idCell.textContent.trim());
        }
    });
    
    return ids;
}

function deleteSelectedClients() {
    const selectedIds = getSelectedClientIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay clientes seleccionados', 'error');
        return;
    }
    
    const confirmMsg = `¿Estás seguro de que deseas eliminar ${selectedIds.length} cliente(s)? Esta acción no puede deshacerse.`;
    
    if (confirm(confirmMsg)) {
        selectedIds.forEach(id => {
            const index = clientes.findIndex(c => c.id === id);
            if (index !== -1) {
                clientes.splice(index, 1);
            }
        });
        
        loadClientes();
        
        // Uncheck select all
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
        
        updateBulkActionsVisibility();
        showNotification(`${selectedIds.length} cliente(s) eliminado(s) exitosamente`, 'success');
    }
}

function exportSelectedClients() {
    const selectedIds = getSelectedClientIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay clientes seleccionados', 'error');
        return;
    }
    
    const selectedClients = clientes.filter(c => selectedIds.includes(c.id));
    
    // Create CSV content
    let csvContent = 'ID,Nombre,Apellido,Tipo Documento,Nro Documento,Email,Teléfono,Dirección,Estado\n';
    
    selectedClients.forEach(cliente => {
        const row = [
            cliente.id,
            cliente.nombre,
            cliente.apellido,
            cliente.tipoDocumento,
            cliente.numeroDocumento,
            cliente.email || 'N/A',
            cliente.telefono || 'N/A',
            `"${cliente.direccion}"`,
            cliente.estado
        ].join(',');
        
        csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${selectedIds.length} cliente(s) exportado(s) exitosamente`, 'success');
}

// Make functions globally accessible
window.openEditClientModal = openEditClientModal;
window.openDeleteClientModal = openDeleteClientModal;
window.openViewClientModal = openViewClientModal;
window.closeFilterModal = closeFilterModal;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.deleteSelectedClients = deleteSelectedClients;
window.exportSelectedClients = exportSelectedClients;
