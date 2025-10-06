// Módulo de usuarios

// Variables globales
let users = [
    {
        id: '001',
        name: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        role: 'admin',
        status: 'active',
        phone: '+51 999 888 777',
        lastAccess: '2024-01-15 14:30'
    },
    {
        id: '002',
        name: 'María García',
        email: 'maria.garcia@empresa.com',
        role: 'user',
        status: 'active',
        phone: '+51 999 777 666',
        lastAccess: '2024-01-15 12:15'
    },
    {
        id: '003',
        name: 'Carlos López',
        email: 'carlos.lopez@empresa.com',
        role: 'manager',
        status: 'inactive',
        phone: '+51 999 666 555',
        lastAccess: '2024-01-10 09:45'
    }
];

let currentEditId = null;

// Inicialización del módulo
document.addEventListener('DOMContentLoaded', function() {
    initUsuariosModule();
    loadUsers();
});

function initUsuariosModule() {
    // Configurar eventos básicos
    const searchInput = document.getElementById('searchInput');
    const addUserBtn = document.getElementById('addUserBtn');
    const filterBtn = document.getElementById('filterBtn');
    const selectAllCheckbox = document.getElementById('selectAll');
    const userModal = document.getElementById('userModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const userForm = document.getElementById('userForm');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (addUserBtn) {
        addUserBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAddUserModal();
        });
    } else {
        console.error('addUserBtn not found!');
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilter);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAllCheckboxes);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (userForm) {
        userForm.addEventListener('submit', handleFormSubmit);
    }

    // Cerrar modal al hacer clic fuera
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === userModal) {
                closeModal();
            }
        });
    }

    // Agregar listeners a botones de acción
    addActionButtonListeners();
    
    // Agregar listeners para preview en tiempo real
    addPreviewListeners();
}

// Cargar usuarios en la tabla
function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });

    updatePaginationInfo();
    
    // volver a enlazar listeners de botones
    addActionButtonListeners();
    // Adjuntar listeners de checkboxes
    attachCheckboxListeners();
}

// Crear fila de usuario
function createUserRow(user) {
    const row = document.createElement('tr');
    
    const roleText = {
        'admin': 'Administrador',
        'manager': 'Gerente',
        'user': 'Usuario'
    };
    
    const statusText = {
        'active': 'Activo',
        'inactive': 'Inactivo'
    };
    
    const roleClass = {
        'admin': 'badge-admin',
        'manager': 'badge-manager',
        'user': 'badge-user'
    };
    
    const statusClass = {
        'active': 'badge-active',
        'inactive': 'badge-inactive'
    };

    row.innerHTML = `
        <td><input type="checkbox" class="user-checkbox" data-user-id="${user.id}"></td>
        <td>${user.id}</td>
        <td>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <span class="user-name">${user.name}</span>
                </div>
            </div>
        </td>
        <td>${user.email}</td>
        <td><span class="badge ${roleClass[user.role]}">${roleText[user.role]}</span></td>
        <td><span class="badge ${statusClass[user.status]}">${statusText[user.status]}</span></td>
        <td>${user.lastAccess}</td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" title="Editar" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" title="Eliminar" data-user-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" title="Ver detalles" data-user-id="${user.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Funcionalidad de búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#usersTableBody tr');

    tableRows.forEach(row => {
        const userName = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const userEmail = row.cells[3]?.textContent.toLowerCase() || '';
        const userRole = row.cells[4]?.textContent.toLowerCase() || '';

        if (userName.includes(searchTerm) || 
            userEmail.includes(searchTerm) || 
            userRole.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Funcionalidad de filtros
function handleFilter() {
    const filterModal = createFilterModal();
    document.body.appendChild(filterModal);
}

function createFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal center-modal show modal-top';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Filtros de Usuarios</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterRole">Rol</label>
                        <select id="filterRole">
                            <option value="">Todos los roles</option>
                            <option value="admin">Administrador</option>
                            <option value="manager">Gerente</option>
                            <option value="user">Usuario</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterStatus">Estado</label>
                        <select id="filterStatus">
                            <option value="">Todos los estados</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
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
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filteredUsers = users;
    
    if (roleFilter) {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter) {
        filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    
    // Actualizar tabla con datos filtrados
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
    
    // Cerrar modal de filtros
    const filterModal = document.querySelector('.center-modal');
    if (filterModal) {
        filterModal.remove();
    }
    
    // Reagregar listeners
    addActionButtonListeners();
    
    showNotification(`Filtros aplicados: ${filteredUsers.length} usuarios encontrados`);
}

// Manejo de checkboxes
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function handleIndividualCheckbox() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Listeners para botones de acción
function addActionButtonListeners() {
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const viewButtons = document.querySelectorAll('.btn-view');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');

    editButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-user-id');
            editUser(userId);
        });
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-user-id');
            deleteUser(userId);
        });
    });

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-user-id');
            viewUser(userId);
        });
    });

    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

// Funciones placeholder para modales (serán implementadas con estructura de ROLES)
function editUser(userId) {
    openEditUserModal(userId);
}

function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    const userName = user ? user.name : '';
    const deleteModal = createDeleteUserModal(userId, userName);
    document.body.appendChild(deleteModal);
}

function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        const viewModal = createViewUserModal(user);
        document.body.appendChild(viewModal);
    }
}

// Funciones de modal
function openAddUserModal() {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Usuario';
    }

    if (form) {
        form.reset();
        // Limpiar cualquier ID de usuario existente
        currentEditId = null;
        
        // Restablecer preview
        updatePreview();
    }

    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal element not found!');
    }
}

function openEditUserModal(userId) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    if (modalTitle) {
        modalTitle.textContent = 'Editar Usuario';
    }

    if (form) {
        form.reset();
        currentEditId = userId;
        
        // Encontrar y poblar datos del usuario
        const user = users.find(u => u.id === userId);
        if (user) {
            document.getElementById('userName').value = user.name || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userPhone').value = user.phone || '';
            document.getElementById('userStatus').value = user.status || '';
            document.getElementById('userRole').value = user.role || '';
            
            // Ocultar campos de contraseña en edición
            const passwordSection = form.querySelector('.form-section:nth-child(2)');
            if (passwordSection) {
                passwordSection.style.display = 'none';
            }
            
            updatePreview();
        }
    }

    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    // Mostrar campos de contraseña de nuevo para próxima vez
    const form = document.getElementById('userForm');
    if (form) {
        const passwordSection = form.querySelector('.form-section:nth-child(2)');
        if (passwordSection) {
            passwordSection.style.display = 'block';
        }
    }
    
    currentEditId = null;
}

// Modal de eliminación
function createDeleteUserModal(userId, userName) {
    const modal = document.createElement('div');
    modal.className = 'modal show modal-top';
    modal.style.display = 'flex';

    const displayName = userName ? `<strong>${userName}</strong>` : 'este usuario';

    modal.innerHTML = `
        <div class="modal-content delete-modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Eliminar Usuario</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar ${displayName}? Esta acción no puede deshacerse.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" id="confirmDeleteBtn">Eliminar</button>
            </div>
        </div>
    `;

    // Agregar handler para confirmar eliminación
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', function() {
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            loadUsers();
            showNotification('Usuario eliminado exitosamente', 'success');
        }
        modal.remove();
    });

    return modal;
}

// Modal de vista
function createViewUserModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.display = 'flex';
    
    const roleText = {
        'admin': 'Administrador',
        'manager': 'Gerente',
        'user': 'Usuario'
    };
    
    const statusText = {
        'active': 'Activo',
        'inactive': 'Inactivo'
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Usuario</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="user-preview">
                    <div class="preview-user-info">
                        <div class="preview-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="preview-details">
                            <h5>${user.name}</h5>
                            <p><strong>ID:</strong> ${user.id}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Teléfono:</strong> ${user.phone || 'No especificado'}</p>
                            <p><strong>Rol:</strong> ${roleText[user.role] || user.role}</p>
                            <p><strong>Estado:</strong> ${statusText[user.status] || user.status}</p>
                            <p><strong>Último Acceso:</strong> ${user.lastAccess}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                    Cerrar
                </button>
                <button type="button" class="btn btn-primary" onclick="editUser('${user.id}'); this.closest('.modal').remove();">
                    <i class="fas fa-edit"></i>
                    Editar Usuario
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

// Manejo del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Validar formulario
    if (!validateForm(userData)) {
        return;
    }

    // Mostrar estado de carga
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    // Simular llamada API
    setTimeout(() => {
        if (currentEditId) {
            // Actualizar usuario existente
            userData.id = currentEditId;
            updateUser(userData);
        } else {
            // Crear nuevo usuario
            createUser(userData);
        }

        // Cerrar modal
        closeModal();
        
        // Restablecer botón
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Usuario';
        }
    }, 1500);
}

// Validación del formulario
function validateForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('El email no es válido');
    }

    if (!data.role) {
        errors.push('Debe seleccionar un rol');
    }

    // Solo validar contraseña para usuarios nuevos
    if (!currentEditId) {
        if (!data.password || data.password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        if (data.password !== data.confirmPassword) {
            errors.push('Las contraseñas no coinciden');
        }
    }

    if (errors.length > 0) {
        showNotification(errors.join(', '), 'error');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Operaciones CRUD
function createUser(userData) {
    // Generar nuevo ID
    const newId = String(users.length + 1).padStart(3, '0');
    
    // Crear nuevo objeto usuario
    const newUser = {
        id: newId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        phone: userData.phone || '',
        lastAccess: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Agregar al array de usuarios
    users.push(newUser);
    
    // Actualizar tabla
    loadUsers();
    
    showNotification('Usuario creado exitosamente', 'success');
}

function updateUser(userData) {
    // Encontrar índice del usuario
    const userIndex = users.findIndex(user => user.id === userData.id);
    
    if (userIndex !== -1) {
        // Actualizar datos del usuario
        users[userIndex] = {
            ...users[userIndex],
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            phone: userData.phone || users[userIndex].phone
        };
        
        // Actualizar tabla
        loadUsers();
        
        showNotification('Usuario actualizado exitosamente', 'success');
    }
}

// Preview en tiempo real
function addPreviewListeners() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const roleSelect = document.getElementById('userRole');

    if (nameInput) {
        nameInput.addEventListener('input', updatePreview);
    }

    if (emailInput) {
        emailInput.addEventListener('input', updatePreview);
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            updateRoleDescription();
            updatePreview();
        });
    }
}

function updatePreview() {
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    const roleSelect = document.getElementById('userRole');

    if (!nameInput && !emailInput && !roleSelect) {
        return;
    }

    const previewName = document.getElementById('previewUserName');
    const previewEmail = document.getElementById('previewUserEmail');
    const previewRole = document.getElementById('previewUserRole');

    if (previewName && nameInput) {
        previewName.textContent = nameInput.value || 'Nombre del Usuario';
    }

    if (previewEmail && emailInput) {
        previewEmail.textContent = emailInput.value || 'email@ejemplo.com';
    }

    if (previewRole && roleSelect) {
        const roleText = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'user': 'Usuario'
        };
        previewRole.textContent = roleText[roleSelect.value] || 'Sin rol asignado';
    }
}

function updateRoleDescription() {
    const roleSelect = document.getElementById('userRole');
    const roleDescription = document.getElementById('roleDescription');
    
    if (!roleSelect || !roleDescription) return;
    
    const descriptions = {
        'admin': 'Acceso completo al sistema con permisos de administración total',
        'manager': 'Gestión de equipos, reportes y operaciones de nivel medio',
        'user': 'Acceso básico al sistema con permisos limitados'
    };
    
    const selectedRole = roleSelect.value;
    roleDescription.textContent = descriptions[selectedRole] || 'Selecciona un rol para ver su descripción';
}



// Función de notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos básicos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: #28a745;
        color: white;
        border-radius: 4px;
        z-index: 10000;
        max-width: 300px;
    `;
    
    if (type === 'error') {
        notification.style.background = '#dc3545';
    }
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Función de paginación
function updatePaginationInfo() {
    const totalUsers = users.length;
    const visibleRows = document.querySelectorAll('#usersTableBody tr:not([style*="display: none"])').length;
    
    // Actualizar información si existe elemento de paginación
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Mostrando ${visibleRows} de ${totalUsers} usuarios`;
    }
}

// ==================== FUNCIONES DE CHECKBOXES ====================

// Manejar selección de todos los checkboxes
function handleSelectAllCheckboxes(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    updateSelectedCount();
    updateBulkActionsVisibility();
}

// Manejar checkboxes individuales
function handleIndividualCheckbox() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.user-checkbox:checked');
    
    // Actualizar estado del checkbox "Seleccionar Todo"
    if (checkedCheckboxes.length === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    } else if (checkedCheckboxes.length === checkboxes.length) {
        selectAll.checked = true;
        selectAll.indeterminate = false;
    } else {
        selectAll.checked = false;
        selectAll.indeterminate = true;
    }
    
    updateSelectedCount();
    updateBulkActionsVisibility();
}

// Actualizar contador de seleccionados
function updateSelectedCount() {
    const checkedCount = document.querySelectorAll('.user-checkbox:checked').length;
    const selectedCountElement = document.getElementById('selectedCount');
    
    if (selectedCountElement) {
        selectedCountElement.textContent = checkedCount;
    }
}

// Mostrar/ocultar barra de acciones masivas
function updateBulkActionsVisibility() {
    const bulkActions = document.getElementById('bulkActions');
    const checkedCount = document.querySelectorAll('.user-checkbox:checked').length;
    
    if (bulkActions) {
        if (checkedCount > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

// Obtener IDs de usuarios seleccionados
function getSelectedUserIds() {
    const checkedCheckboxes = document.querySelectorAll('.user-checkbox:checked');
    const selectedIds = [];
    
    checkedCheckboxes.forEach(checkbox => {
        // Buscar el ID en la fila padre
        const row = checkbox.closest('tr');
        if (row) {
            const idCell = row.querySelector('td:nth-child(2)'); // Segunda columna tiene el ID
            if (idCell) {
                selectedIds.push(idCell.textContent.trim());
            }
        }
    });
    
    return selectedIds;
}

// Eliminar usuarios seleccionados
function deleteSelectedUsers() {
    const selectedIds = getSelectedUserIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay usuarios seleccionados', 'error');
        return;
    }
    
    const confirmMessage = `¿Está seguro de eliminar ${selectedIds.length} usuario(s) seleccionado(s)?`;
    
    if (confirm(confirmMessage)) {
        // Eliminar usuarios del array
        selectedIds.forEach(id => {
            const index = users.findIndex(user => user.id === id);
            if (index !== -1) {
                users.splice(index, 1);
            }
        });
        
        // Recargar tabla
        loadUsers();
        
        // Limpiar selección
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
        
        // Notificar éxito
        showNotification(`${selectedIds.length} usuario(s) eliminado(s) exitosamente`, 'success');
    }
}

// Exportar usuarios seleccionados a CSV
function exportSelectedUsers() {
    const selectedIds = getSelectedUserIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay usuarios seleccionados', 'error');
        return;
    }
    
    // Filtrar usuarios seleccionados
    const selectedUsers = users.filter(user => selectedIds.includes(user.id));
    
    // Crear contenido CSV
    let csvContent = 'ID,Nombre,Email,Rol,Estado,Teléfono,Último Acceso\n';
    
    selectedUsers.forEach(user => {
        const line = `${user.id},"${user.name}","${user.email}",${user.role},${user.status},"${user.phone}","${user.lastAccess}"\n`;
        csvContent += line;
    });
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${selectedIds.length} usuario(s) exportado(s) exitosamente`, 'success');
}

// Adjuntar eventos a checkboxes
function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

// Exponer funciones globalmente
window.deleteSelectedUsers = deleteSelectedUsers;
window.exportSelectedUsers = exportSelectedUsers;
