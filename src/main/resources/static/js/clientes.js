// Clientes Module - Backend Integration
// Conectado con el backend Java Spring Boot

// Global variables
let clientes = [];
let tiposDocumento = [];
let currentClientId = null;

// Initialize module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initClientesModule();
    loadTiposDocumento();
    loadClientes();
});

function initClientesModule() {
    console.log('Initializing Clientes Module...');
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Add client button
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) {
        addClientBtn.addEventListener('click', openAddClientModal);
    }
    
    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', openFilterModal);
    }
    
    // Select All checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Setup modals
    setupAddModal();
    setupEditModal();
    setupDeleteModal();
    setupViewModal();
    setupFilterModal();
}

// ============================================================
// LOAD TIPOS DE DOCUMENTO FROM BACKEND
// ============================================================
async function loadTiposDocumento() {
    try {
        const response = await fetch('/clientes/api/tipos-documento');
        
        if (!response.ok) {
            throw new Error('Error al cargar tipos de documento');
        }
        
        tiposDocumento = await response.json();
        console.log('Tipos de documento cargados:', tiposDocumento);
        
        // Populate dropdowns
        populateTipoDocumentoSelects();
        
    } catch (error) {
        console.error('Error loading tipos documento:', error);
        showNotification('Error al cargar tipos de documento', 'error');
    }
}

function populateTipoDocumentoSelects() {
    const selects = [
        document.getElementById('clientDocType'),
        document.getElementById('editClientDocType'),
        document.getElementById('filterDocType')
    ];
    
    selects.forEach(select => {
        if (select) {
            // Clear all existing options
            select.innerHTML = '';

            // Add a sensible default option depending on the select
            const defaultOption = document.createElement('option');
            if (select.id === 'filterDocType') {
                defaultOption.value = '';
                defaultOption.textContent = 'Todos';
            } else {
                defaultOption.value = '';
                defaultOption.textContent = 'Seleccionar tipo';
            }
            select.appendChild(defaultOption);

            // Add tipo documento options (value = numeric id)
            tiposDocumento.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.idTipoDocumento; // numeric id expected by backend
                option.textContent = tipo.nombreTipoDocumento;
                select.appendChild(option);
            });
        }
    });
}

// -------------------- RENIEC lookup support for clientes --------------------
async function lookupReniecCliente(tipoText, numero) {
    if (!tipoText || !numero) return null;
    try {
        const urlProxy = `/api/reniec?tipo=${encodeURIComponent(tipoText)}&numero=${encodeURIComponent(numero)}`;
        const respProxy = await fetch(urlProxy, { credentials: 'same-origin' });
        if (!respProxy.ok) {
            console.warn('RENIEC proxy lookup failed', respProxy.status);
            return null;
        }
        return await respProxy.json();
    } catch (e) {
        console.error('Error calling RENIEC service', e);
        return null;
    }
}

function extractNamePartsFromReniecCliente(data) {
    if (!data) return { firstName: '', lastName: '' };
    // Support multiple provider shapes (camelCase, snake_case, short keys like 'ape_paterno')
    const nombres = data.nombres || data.nombre || data.nombre_completo || data.nombreCompleto || data.razon_social || '';
    const apellidoP = data.apellidoPaterno || data.apellido_paterno || data.apellido || data.ape_paterno || '';
    const apellidoM = data.apellidoMaterno || data.apellido_materno || data.ape_materno || '';
    const lastName = [apellidoP, apellidoM].filter(Boolean).join(' ').trim();
    if (!nombres && lastName) return { firstName: '', lastName };
    if (nombres && !apellidoP && !apellidoM) {
        const parts = String(nombres).trim().split(/\s+/);
        if (parts.length === 1) return { firstName: parts[0], lastName: '' };
        const firstName = parts.slice(0, -1).join(' ');
        const last = parts.slice(-1).join(' ');
        return { firstName, lastName: last };
    }
    return { firstName: nombres || '', lastName };
}


// ============================================================
// LOAD CLIENTES FROM BACKEND
// ============================================================
async function loadClientes() {
    try {
        console.log('Loading clientes from backend...');
        
        const response = await fetch('/clientes/api');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        clientes = await response.json();
        console.log('Clientes loaded:', clientes);
        
        renderClientesTable(clientes);
        updateClientCount(clientes.length);
        
        showNotification(`${clientes.length} clientes cargados`, 'success');
        
    } catch (error) {
        console.error('Error loading clientes:', error);
        showNotification('Error al cargar clientes', 'error');
        
        // Render empty table
        renderClientesTable([]);
        updateClientCount(0);
    }
}

// ============================================================
// RENDER TABLE
// ============================================================
function renderClientesTable(clientesToRender) {
    const tbody = document.getElementById('clientsTableBody');
    
    if (!tbody) {
        console.error('clientsTableBody not found');
        return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (clientesToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                    No hay clientes registrados
                </td>
            </tr>
        `;
        return;
    }
    
    clientesToRender.forEach((cliente, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-client-id', cliente.idCliente);
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="client-checkbox" data-client-id="${cliente.idCliente}">
            </td>
            <td>${cliente.idCliente}</td>
            <td>${escapeHtml(cliente.nombre)}</td>
            <td>${escapeHtml(cliente.apellido)}</td>
            <td>${escapeHtml(cliente.tipoDocumento?.nombreTipoDocumento || 'N/A')}</td>
            <td>${escapeHtml(cliente.numeroDocumento)}</td>
            <td>${escapeHtml(cliente.email)}</td>
            <td>${escapeHtml(cliente.telefono || 'N/A')}</td>
            <td>${escapeHtml(cliente.direccion || 'N/A')}</td>
            <td class="action-buttons">
                <button class="btn-icon edit" onclick="editCliente(${cliente.idCliente})" title="Editar" style="background-color: #ffc107; color: white;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="confirmDelete(${cliente.idCliente})" title="Eliminar" style="background-color: #dc3545; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon view" onclick="viewCliente(${cliente.idCliente})" title="Ver detalles" style="background-color: #007bff; color: white;">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    console.log(`Rendered ${clientesToRender.length} clients`);
}

// ============================================================
// CREATE CLIENT
// ============================================================
async function crearCliente(clienteData) {
    try {
        // Build payload matching ClienteRegistroRapidoDTO expected by the controller
        const payload = {
            idTipoDocumento: clienteData.tipoDocumentoId ? parseInt(clienteData.tipoDocumentoId) : null,
            numeroDocumento: clienteData.numeroDocumento || null,
            nombres: clienteData.nombre || null,
            apellidos: clienteData.apellido || null,
            email: clienteData.email || null,
            telefono: clienteData.telefono || null,
            direccion: clienteData.direccion || null
        };

        const response = await fetch('/clientes/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear cliente');
        }
        
        const nuevoCliente = await response.json();
        console.log('Cliente creado:', nuevoCliente);
        
        showNotification('Cliente creado exitosamente', 'success');
        
        // Reload clientes
        await loadClientes();
        
        return nuevoCliente;
        
    } catch (error) {
        console.error('Error creating cliente:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// ============================================================
// UPDATE CLIENT
// ============================================================
async function actualizarCliente(id, clienteData) {
    try {
        const response = await fetch(`/clientes/api/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: clienteData.nombre,
                apellido: clienteData.apellido,
                tipoDocumento: {
                    idTipoDocumento: parseInt(clienteData.tipoDocumentoId)
                },
                numeroDocumento: clienteData.numeroDocumento,
                email: clienteData.email,
                direccion: clienteData.direccion,
                telefono: clienteData.telefono
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar cliente');
        }
        
        const clienteActualizado = await response.json();
        console.log('Cliente actualizado:', clienteActualizado);
        
        showNotification('Cliente actualizado exitosamente', 'success');
        
        // Reload clientes
        await loadClientes();
        
        return clienteActualizado;
        
    } catch (error) {
        console.error('Error updating cliente:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// ============================================================
// DELETE CLIENT
// ============================================================
async function eliminarCliente(id) {
    try {
        const response = await fetch(`/clientes/api/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar cliente');
        }
        
        console.log('Cliente eliminado:', id);
        showNotification('Cliente eliminado exitosamente', 'success');
        
        // Reload clientes
        await loadClientes();
        
    } catch (error) {
        console.error('Error deleting cliente:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// ============================================================
// SEARCH FUNCTIONALITY
// ============================================================
async function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    
    if (searchTerm === '') {
        await loadClientes();
        return;
    }
    
    try {
        const response = await fetch(`/clientes/api/search?q=${encodeURIComponent(searchTerm)}`);
        
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }
        
        const resultados = await response.json();
        console.log('Search results:', resultados);
        
        renderClientesTable(resultados);
        updateClientCount(resultados.length);
        
    } catch (error) {
        console.error('Error searching:', error);
        showNotification('Error al buscar clientes', 'error');
    }
}

// ============================================================
// MODAL: ADD CLIENT
// ============================================================
function setupAddModal() {
    const form = document.getElementById('clientForm');
    const modal = document.getElementById('clientModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('clientName').value,
                apellido: document.getElementById('clientLastName').value,
                tipoDocumentoId: document.getElementById('clientDocType').value,
                numeroDocumento: document.getElementById('clientDocNumber').value,
                email: document.getElementById('clientEmail').value,
                telefono: document.getElementById('clientPhone').value,
                direccion: document.getElementById('clientAddress').value
            };

            // Client-side validation: if document number provided, tipoDocumento must be selected
            if (formData.numeroDocumento && (!formData.tipoDocumentoId || formData.tipoDocumentoId === '')) {
                showNotification('Debe especificar el tipo de documento', 'error');
                return;
            }
            
            try {
                await crearCliente(formData);
                closeModal(modal);
                form.reset();
            } catch (error) {
                console.error('Error al guardar cliente:', error);
            }
        });
    }

    // Attach RENIEC lookup listeners: when user ingresa nro documento o cambia tipo
    const clientDocNumber = document.getElementById('clientDocNumber');
    const clientDocType = document.getElementById('clientDocType');
    async function handleClientDocLookup() {
        if (!clientDocType || !clientDocNumber) return;
        const tipoId = clientDocType.value;
        if (!tipoId) return;
        const tipoObj = (tiposDocumento || []).find(t => String(t.idTipoDocumento) === String(tipoId));
        const tipoText = tipoObj?.nombreTipoDocumento || clientDocType.options[clientDocType.selectedIndex]?.text || '';
        const numero = clientDocNumber.value.trim();
        if (!numero) return;

        // Minimal length heuristic
        if ((/dni/i.test(tipoText) && numero.length < 6) || (/ruc/i.test(tipoText) && numero.length < 9)) return;

        const data = await lookupReniecCliente(tipoText.toUpperCase(), numero);
        if (!data) {
            // no encontrado — no sobreescribir
            return;
        }

        // Some providers wrap the payload under `datos` and add a `success` flag
        if (data.success === false) return;
        const provider = data.datos || data;

        const nameParts = extractNamePartsFromReniecCliente(provider);
        const nameInput = document.getElementById('clientName');
        const lastInput = document.getElementById('clientLastName');

        if (nameInput && nameParts.firstName) nameInput.value = nameParts.firstName;
        if (lastInput && nameParts.lastName) lastInput.value = nameParts.lastName;
        // Populate address if available
        try {
            const addressInput = document.getElementById('clientAddress');
            const direccion = (provider.domiciliado && provider.domiciliado.direccion) || provider.direccion || provider.address || '';
            if (addressInput && direccion) addressInput.value = direccion;
        } catch (e) {
            // ignore any extraction errors
            console.warn('Could not extract direccion from RENIEC response', e);
        }
    }

    if (clientDocNumber) {
        clientDocNumber.addEventListener('blur', handleClientDocLookup);
    }
    if (clientDocType) {
        clientDocType.addEventListener('change', handleClientDocLookup);
    }
    
    // Botón cerrar (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
            if (form) {
                form.reset();
            }
        });
    }
    
    // Botón cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeModal(modal);
            if (form) {
                form.reset();
            }
        });
    }
}

function openAddClientModal() {
    console.log('Opening add modal...');
    
    const modal = document.getElementById('clientModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('clientForm');
    
    if (form) {
        form.reset();
    }
    
    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Cliente';
    }
    
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('clientModal not found');
    }
}

// ============================================================
// MODAL: EDIT CLIENT
// ============================================================
function setupEditModal() {
    const form = document.getElementById('editClientForm');
    const modal = document.getElementById('editClientModal');
    const closeBtn = document.getElementById('closeEditClientModal');
    const cancelBtn = document.getElementById('cancelEditClientBtn');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nombre: document.getElementById('editClientName').value,
                apellido: document.getElementById('editClientLastName').value,
                tipoDocumentoId: document.getElementById('editClientDocType').value,
                numeroDocumento: document.getElementById('editClientDocNumber').value,
                email: document.getElementById('editClientEmail').value,
                telefono: document.getElementById('editClientPhone').value,
                direccion: document.getElementById('editClientAddress').value
            };

            // Client-side validation: if document number provided, tipoDocumento must be selected
            if (formData.numeroDocumento && (!formData.tipoDocumentoId || formData.tipoDocumentoId === '')) {
                showNotification('Debe especificar el tipo de documento', 'error');
                return;
            }
            
            try {
                await actualizarCliente(currentClientId, formData);
                closeModal(modal);
                currentClientId = null;
            } catch (error) {
                console.error('Error al actualizar cliente:', error);
            }
        });
    }
    
    // Botón cerrar (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
            currentClientId = null;
        });
    }
    
    // Botón cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeModal(modal);
            currentClientId = null;
        });
    }
}

async function editCliente(id) {
    currentClientId = id;
    
    try {
        const response = await fetch(`/clientes/api/${id}`);
        
        if (!response.ok) {
            throw new Error('Cliente no encontrado');
        }
        
        const cliente = await response.json();
        console.log('Cliente to edit:', cliente);
        
        // Populate form
        document.getElementById('editClientName').value = cliente.nombre;
        document.getElementById('editClientLastName').value = cliente.apellido;
        document.getElementById('editClientDocType').value = cliente.tipoDocumento.idTipoDocumento;
        document.getElementById('editClientDocNumber').value = cliente.numeroDocumento;
        document.getElementById('editClientEmail').value = cliente.email;
        document.getElementById('editClientPhone').value = cliente.telefono || '';
        document.getElementById('editClientAddress').value = cliente.direccion || '';
        
        // Open modal
        const modal = document.getElementById('editClientModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error loading cliente:', error);
        showNotification('Error al cargar cliente', 'error');
    }
}

// ============================================================
// MODAL: DELETE CLIENT
// ============================================================
function setupDeleteModal() {
    const confirmBtn = document.getElementById('confirmDeleteClientBtn');
    const cancelBtn = document.getElementById('cancelDeleteClientBtn');
    const closeBtn = document.getElementById('closeDeleteClientModal');
    const modal = document.getElementById('deleteClientModal');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function() {
            if (currentClientId) {
                try {
                    await eliminarCliente(currentClientId);
                    closeModal(modal);
                    currentClientId = null;
                } catch (error) {
                    console.error('Error al eliminar:', error);
                }
            }
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeModal(modal);
            currentClientId = null;
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
            currentClientId = null;
        });
    }
}

function confirmDelete(id) {
    currentClientId = id;
    
    // Find cliente name
    const cliente = clientes.find(c => c.idCliente === id);
    const clientName = cliente ? `${cliente.nombre} ${cliente.apellido}` : 'este cliente';
    
    const deleteMessage = document.getElementById('deleteClientName');
    if (deleteMessage) {
        deleteMessage.textContent = clientName;
    }
    
    const modal = document.getElementById('deleteClientModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// ============================================================
// MODAL: VIEW CLIENT
// ============================================================
function setupViewModal() {
    const closeBtn = document.getElementById('closeViewClientModal');
    const closeViewBtn = document.getElementById('closeViewClientBtn');
    const editFromViewBtn = document.getElementById('editFromViewBtn');
    const modal = document.getElementById('viewClientModal');
    
    // Botón cerrar (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
        });
    }
    
    // Botón "Cerrar" del footer
    if (closeViewBtn) {
        closeViewBtn.addEventListener('click', function() {
            closeModal(modal);
        });
    }
    
    // Botón "Editar Cliente" - cierra modal Ver y abre modal Editar
    if (editFromViewBtn) {
        editFromViewBtn.addEventListener('click', function() {
            const clientId = currentClientId || document.getElementById('viewClientId').textContent;
            closeModal(modal);
            if (clientId) {
                editCliente(parseInt(clientId));
            }
        });
    }
}

async function viewCliente(id) {
    // Guardar ID del cliente actual
    currentClientId = id;
    
    try {
        const response = await fetch(`/clientes/api/${id}`);
        
        if (!response.ok) {
            throw new Error('Cliente no encontrado');
        }
        
        const cliente = await response.json();
        console.log('Cliente to view:', cliente);
        
        // Populate view modal
        document.getElementById('viewClientFullName').textContent = `${cliente.nombre} ${cliente.apellido}`;
        document.getElementById('viewClientId').textContent = cliente.idCliente;
        document.getElementById('viewClientDocType').textContent = cliente.tipoDocumento?.nombreTipoDocumento || 'N/A';
        document.getElementById('viewClientDocNumber').textContent = cliente.numeroDocumento;
        document.getElementById('viewClientEmail').textContent = cliente.email;
        document.getElementById('viewClientPhone').textContent = cliente.telefono || 'N/A';
        document.getElementById('viewClientAddress').textContent = cliente.direccion || 'N/A';
        document.getElementById('viewClientStatus').textContent = cliente.estado ? 'Activo' : 'Inactivo';
        
        // Open modal
        const modal = document.getElementById('viewClientModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error loading cliente:', error);
        showNotification('Error al cargar cliente', 'error');
    }
}

// ============================================================
// MODAL: FILTER
// ============================================================
function setupFilterModal() {
    const form = document.getElementById('filterForm');
    const modal = document.getElementById('filterModal');
    const closeBtn = document.getElementById('closeFilterModal');
    const clearBtn = document.getElementById('clearFilterBtn');
    
    // Submit form to apply filters
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await applyFilters();
            closeModal(modal);
        });
    }
    
    // Clear filters button
    if (clearBtn) {
        clearBtn.addEventListener('click', async function() {
            document.getElementById('filterDocType').value = '';
            document.getElementById('filterStatus').value = '';
            await loadClientes(); // Reload all clients
            closeModal(modal);
            showNotification('Filtros limpiados', 'success');
        });
    }
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeModal(modal);
        });
    }
}

function openFilterModal() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

async function applyFilters() {
    const tipoDocumentoId = document.getElementById('filterDocType').value;
    const estado = document.getElementById('filterStatus').value;
    
    console.log('Aplicando filtros:', { tipoDocumentoId, estado });
    
    // Filtrar desde el array local de clientes
    let filteredClientes = [...clientes];
    
    // Filtrar por tipo de documento
    if (tipoDocumentoId) {
        filteredClientes = filteredClientes.filter(cliente => 
            cliente.tipoDocumento && cliente.tipoDocumento.idTipoDocumento == tipoDocumentoId
        );
    }
    
    // Filtrar por estado
    if (estado !== '') {
        const estadoBool = estado === 'true';
        filteredClientes = filteredClientes.filter(cliente => 
            cliente.estado === estadoBool
        );
    }
    
    console.log('Clientes filtrados:', filteredClientes.length);
    
    // Renderizar tabla con clientes filtrados
    renderClientesTable(filteredClientes);
    updateClientCount(filteredClientes.length);
    
    // Mostrar mensaje
    const filterCount = filteredClientes.length;
    const totalCount = clientes.length;
    showNotification(`Filtros aplicados: ${filterCount} de ${totalCount} clientes`, 'success');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close all modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
};

// Close buttons
document.addEventListener('DOMContentLoaded', function() {
    const closeButtons = document.querySelectorAll('.close, .cancel-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
});

function handleSelectAll(event) {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
}

function updateClientCount(count) {
    const countElement = document.querySelector('.clients-count');
    if (countElement) {
        countElement.textContent = `Total de Clientes: ${count}`;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    
    const div = document.createElement('div');
    div.textContent = text.toString();
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Export functions to global scope
window.viewCliente = viewCliente;
window.editCliente = editCliente;
window.confirmDelete = confirmDelete;
window.openAddClientModal = openAddClientModal;
window.openFilterModal = openFilterModal;

console.log('Clientes module loaded successfully');
