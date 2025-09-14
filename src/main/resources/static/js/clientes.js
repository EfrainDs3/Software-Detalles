// Variables globales
let clients = [
    {
        id: 1,
        nombre: "Juan Carlos",
        apellido: "Pérez González",
        tipoDocumento: "DNI",
        nroDocumento: "12345678",
        email: "juan.perez@email.com",
        telefono: "987654321",
        direccion: "Av. Los Pinos 123, San Isidro, Lima"
    },
    {
        id: 2,
        nombre: "María Elena",
        apellido: "Rodríguez Silva",
        tipoDocumento: "DNI",
        nroDocumento: "87654321",
        email: "maria.rodriguez@email.com",
        telefono: "912345678",
        direccion: "Jr. Las Flores 456, Miraflores, Lima"
    },
    {
        id: 3,
        nombre: "Empresa XYZ",
        apellido: "S.A.C.",
        tipoDocumento: "RUC",
        nroDocumento: "20123456789",
        email: "contacto@empresaxyz.com",
        telefono: "014567890",
        direccion: "Av. Industrial 789, Los Olivos, Lima"
    }
];

let currentClientId = null;
let filteredClients = [...clients];

// DOM Elements
const clientModal = document.getElementById('clientModal');
const clientForm = document.getElementById('clientForm');
const addClientBtn = document.getElementById('addClientBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const clientsTableBody = document.getElementById('clientsTableBody');
const selectAllCheckbox = document.getElementById('selectAll');

// Modal elements
const modalTitle = document.getElementById('modalTitle');
const clientNameInput = document.getElementById('clientName');
const clientLastNameInput = document.getElementById('clientLastName');
const clientDocTypeSelect = document.getElementById('clientDocType');
const clientDocNumberInput = document.getElementById('clientDocNumber');
const clientEmailInput = document.getElementById('clientEmail');
const clientPhoneInput = document.getElementById('clientPhone');
const clientAddressInput = document.getElementById('clientAddress');

// Preview elements
const previewClientName = document.getElementById('previewClientName');
const previewClientDetails = document.getElementById('previewClientDetails');
const previewEmail = document.getElementById('previewEmail');
const previewPhone = document.getElementById('previewPhone');
const previewAddress = document.getElementById('previewAddress');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    setupEventListeners();
    setupPreviewUpdates();
});

// Event Listeners
function setupEventListeners() {
    // Modal controls
    addClientBtn.addEventListener('click', openAddClientModal);
    saveBtn.addEventListener('click', saveClient);
    cancelBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function(event) {
        if (event.target === clientModal) {
            closeModal();
        }
    });

    // Búsqueda
    searchInput.addEventListener('input', handleSearch);
    
    // Select all checkbox
    selectAllCheckbox.addEventListener('change', handleSelectAll);
    
    // Validación en tiempo real del tipo de documento
    clientDocTypeSelect.addEventListener('change', function() {
        const tipo = this.value;
        if (tipo === 'DNI') {
            clientDocNumberInput.placeholder = "Ej: 12345678";
            clientDocNumberInput.maxLength = 8;
        } else if (tipo === 'RUC') {
            clientDocNumberInput.placeholder = "Ej: 20123456789";
            clientDocNumberInput.maxLength = 11;
        } else {
            clientDocNumberInput.placeholder = "Número de documento";
            clientDocNumberInput.removeAttribute('maxLength');
        }
        clientDocNumberInput.value = '';
        updatePreview();
    });
    
    // Validar solo números en el documento
    clientDocNumberInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
        updatePreview();
    });

    // Form submission
    clientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveClient();
    });
}

// Setup preview updates
function setupPreviewUpdates() {
    const formInputs = [
        clientNameInput,
        clientLastNameInput,
        clientDocTypeSelect,
        clientDocNumberInput,
        clientEmailInput,
        clientPhoneInput,
        clientAddressInput
    ];

    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
}

// Update preview in real time
function updatePreview() {
    const nombre = clientNameInput.value || 'Nombre del Cliente';
    const apellido = clientLastNameInput.value || '';
    const tipoDoc = clientDocTypeSelect.value || 'Tipo Doc.';
    const nroDoc = clientDocNumberInput.value || 'Nro Documento';
    const email = clientEmailInput.value || '--';
    const telefono = clientPhoneInput.value || '--';
    const direccion = clientAddressInput.value || '--';

    previewClientName.textContent = `${nombre} ${apellido}`.trim();
    previewClientDetails.textContent = `${tipoDoc} - ${nroDoc}`;
    previewEmail.textContent = `Email: ${email}`;
    previewPhone.textContent = `Teléfono: ${telefono}`;
    previewAddress.textContent = `Dirección: ${direccion}`;
}

// Cargar clientes en la tabla
function loadClients() {
    clientsTableBody.innerHTML = '';
    
    if (filteredClients.length === 0) {
        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">No se encontraron clientes</td>
            </tr>
        `;
        return;
    }

    filteredClients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="client-checkbox" data-client-id="${client.id}">
            </td>
            <td>${client.id}</td>
            <td>${client.nombre}</td>
            <td>${client.apellido}</td>
            <td><span class="doc-badge ${client.tipoDocumento.toLowerCase()}">${client.tipoDocumento}</span></td>
            <td>${client.nroDocumento}</td>
            <td>${client.email || '-'}</td>
            <td>${client.telefono || '-'}</td>
            <td class="address-cell" title="${client.direccion}">${truncateText(client.direccion, 30)}</td>
            <td>
                <div class="action-buttons-cell">
                    <button class="btn-icon btn-edit" onclick="editClient(${client.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteClient(${client.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-view" onclick="viewClient(${client.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        clientsTableBody.appendChild(row);
    });
    
    updatePaginationInfo();
}

// Truncar texto para la tabla
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
}

// Abrir modal para agregar cliente
function openAddClientModal() {
    currentClientId = null;
    clientForm.reset();
    modalTitle.textContent = 'Nuevo Cliente';
    clientDocTypeSelect.value = '';
    clientDocNumberInput.placeholder = 'Número de documento';
    clientDocNumberInput.removeAttribute('maxLength');
    
    // Reset preview
    updatePreview();
    
    clientModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus en el primer campo
    setTimeout(() => clientNameInput.focus(), 100);
}

// Editar cliente
function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    currentClientId = clientId;
    modalTitle.textContent = 'Editar Cliente';
    
    // Llenar el formulario
    document.getElementById('clientId').value = client.id;
    clientNameInput.value = client.nombre;
    clientLastNameInput.value = client.apellido;
    clientDocTypeSelect.value = client.tipoDocumento;
    clientDocNumberInput.value = client.nroDocumento;
    clientEmailInput.value = client.email || '';
    clientPhoneInput.value = client.telefono || '';
    clientAddressInput.value = client.direccion;
    
    // Configurar placeholder del documento
    if (client.tipoDocumento === 'DNI') {
        clientDocNumberInput.placeholder = "Ej: 12345678";
        clientDocNumberInput.maxLength = 8;
    } else if (client.tipoDocumento === 'RUC') {
        clientDocNumberInput.placeholder = "Ej: 20123456789";
        clientDocNumberInput.maxLength = 11;
    }
    
    // Actualizar preview
    updatePreview();
    
    clientModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Ver detalles del cliente
function viewClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    alert(`Detalles del Cliente:
    
Nombre: ${client.nombre} ${client.apellido}
${client.tipoDocumento}: ${client.nroDocumento}
Email: ${client.email || 'No especificado'}
Teléfono: ${client.telefono || 'No especificado'}
Dirección: ${client.direccion}
    `);
}

// Guardar cliente
function saveClient() {
    if (!validateForm()) return;

    const formData = new FormData(clientForm);
    const clientData = {
        nombre: formData.get('nombre').trim(),
        apellido: formData.get('apellido').trim(),
        tipoDocumento: formData.get('tipoDocumento'),
        nroDocumento: formData.get('nroDocumento').trim(),
        email: formData.get('email').trim(),
        telefono: formData.get('telefono').trim(),
        direccion: formData.get('direccion').trim()
    };

    // Validar documento único
    if (!validateUniqueDocument(clientData.nroDocumento, currentClientId)) {
        showNotification('Ya existe un cliente con ese número de documento', 'error');
        return;
    }

    if (currentClientId) {
        // Editar cliente existente
        const clientIndex = clients.findIndex(c => c.id === currentClientId);
        if (clientIndex !== -1) {
            clients[clientIndex] = { ...clients[clientIndex], ...clientData };
            showNotification('Cliente actualizado correctamente', 'success');
        }
    } else {
        // Agregar nuevo cliente
        const newId = Math.max(...clients.map(c => c.id), 0) + 1;
        clients.push({ id: newId, ...clientData });
        showNotification('Cliente agregado correctamente', 'success');
    }

    closeModal();
    applyCurrentSearch();
    loadClients();
}

// Validar formulario
function validateForm() {
    const requiredFields = [
        { id: 'clientName', name: 'nombre' },
        { id: 'clientLastName', name: 'apellido' },
        { id: 'clientDocType', name: 'tipo de documento' },
        { id: 'clientDocNumber', name: 'número de documento' },
        { id: 'clientAddress', name: 'dirección' }
    ];
    
    let isValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        if (!value) {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });

    // Validar formato de documento
    const tipoDoc = clientDocTypeSelect.value;
    const nroDoc = clientDocNumberInput.value;
    
    if (tipoDoc === 'DNI' && nroDoc.length !== 8) {
        clientDocNumberInput.classList.add('error');
        showNotification('El DNI debe tener 8 dígitos', 'error');
        isValid = false;
    } else if (tipoDoc === 'RUC' && nroDoc.length !== 11) {
        clientDocNumberInput.classList.add('error');
        showNotification('El RUC debe tener 11 dígitos', 'error');
        isValid = false;
    }

    // Validar email si se proporciona
    const email = clientEmailInput.value.trim();
    if (email && !isValidEmail(email)) {
        clientEmailInput.classList.add('error');
        showNotification('El formato del email no es válido', 'error');
        isValid = false;
    }

    if (!isValid) {
        showNotification('Por favor, complete todos los campos requeridos correctamente', 'error');
    }

    return isValid;
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar documento único
function validateUniqueDocument(nroDocumento, excludeId = null) {
    return !clients.some(client => 
        client.nroDocumento === nroDocumento && client.id !== excludeId
    );
}

// Eliminar cliente
function deleteClient(clientId) {
    if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
        clients = clients.filter(c => c.id !== clientId);
        applyCurrentSearch();
        loadClients();
        showNotification('Cliente eliminado correctamente', 'success');
    }
}

// Cerrar modal
function closeModal() {
    clientModal.style.display = 'none';
    document.body.style.overflow = '';
    clientForm.reset();
    currentClientId = null;
    
    // Limpiar errores
    document.querySelectorAll('.form-control, input, select, textarea').forEach(field => {
        field.classList.remove('error');
    });
    
    // Reset preview
    updatePreview();
}

// Búsqueda
function handleSearch() {
    applyCurrentSearch();
    loadClients();
}

function applyCurrentSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredClients = [...clients];
        return;
    }

    filteredClients = clients.filter(client => 
        client.nombre.toLowerCase().includes(searchTerm) ||
        client.apellido.toLowerCase().includes(searchTerm) ||
        client.nroDocumento.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm)) ||
        (client.telefono && client.telefono.includes(searchTerm)) ||
        client.direccion.toLowerCase().includes(searchTerm)
    );
}

// Select All
function handleSelectAll() {
    const checkboxes = document.querySelectorAll('.client-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Actualizar información de paginación
function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    const total = filteredClients.length;
    paginationInfo.textContent = `Mostrando 1-${total} de ${total} clientes`;
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Limpiar errores al escribir
document.addEventListener('DOMContentLoaded', function() {
    const formControls = document.querySelectorAll('input, select, textarea');
    formControls.forEach(control => {
        control.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
});
