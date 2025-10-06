// Roles Module JavaScript

// Global variables
let roles = [
    {
        id: '001',
        name: 'Administrador',
        description: 'Acceso completo al sistema',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'products.view', 'products.create', 'products.edit', 'products.delete', 'reports.view', 'reports.export', 'system.settings', 'system.audit'],
        userCount: 3,
        status: 'active'
    },
    {
        id: '002',
        name: 'Gerente',
        description: 'Gestión de equipos y reportes',
        permissions: ['users.view', 'users.edit', 'reports.view', 'reports.export'],
        userCount: 5,
        status: 'active'
    },
    {
        id: '003',
        name: 'Usuario',
        description: 'Acceso básico al sistema',
        permissions: ['products.view', 'reports.view'],
        userCount: 12,
        status: 'active'
    }
];

let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize roles module
    initRolesModule();
    // Load initial data
    loadRoles();
});

function initRolesModule() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const addRoleBtn = document.getElementById('addRoleBtn');
    const filterBtn = document.getElementById('filterBtn');
    const roleModal = document.getElementById('roleModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const roleForm = document.getElementById('roleForm');
    const selectAllCheckbox = document.getElementById('selectAll');
    const logoutBtn = document.querySelector('.logout-btn');

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', openAddRoleModal);
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

    if (roleForm) {
        roleForm.addEventListener('submit', handleFormSubmit);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAllCheckboxes);
    }

    // Add select all permissions functionality
    const selectAllPermissions = document.getElementById('selectAllPermissions');
    if (selectAllPermissions) {
        selectAllPermissions.addEventListener('change', handleSelectAllPermissions);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Close modal when clicking outside
    if (roleModal) {
        roleModal.addEventListener('click', function(e) {
            if (e.target === roleModal) {
                closeModal();
            }
        });
    }

    // Add real-time preview updates
    addPreviewUpdates();
}

// Load roles into table
function loadRoles() {
    const tbody = document.getElementById('rolesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    roles.forEach(role => {
        const row = createRoleRow(role);
        tbody.appendChild(row);
    });

    // Update pagination info
    updatePaginationInfo();
    // Attach action listeners to buttons created dynamically
    addActionButtonListeners();
    // Attach checkbox listeners
    attachCheckboxListeners();
}

// Create role row
function createRoleRow(role) {
    const row = document.createElement('tr');
    
    const statusClass = {
        'active': 'badge-active',
        'inactive': 'badge-inactive'
    };

    const statusText = {
        'active': 'Activo',
        'inactive': 'Inactivo'
    };

    // Get role icon based on name
    const getRoleIcon = (roleName) => {
        if (roleName.toLowerCase().includes('admin')) return 'fas fa-user-shield';
        if (roleName.toLowerCase().includes('gerente') || roleName.toLowerCase().includes('manager')) return 'fas fa-user-tie';
        if (roleName.toLowerCase().includes('editor')) return 'fas fa-user-cog';
        return 'fas fa-user';
    };

    // Create permissions badges
    const permissionsHtml = role.permissions.slice(0, 2).map(permission => 
        `<span class="badge badge-permission">${getPermissionDisplayName(permission)}</span>`
    ).join('');

    const morePermissions = role.permissions.length > 2 ? 
        `<span class="badge badge-permission">+${role.permissions.length - 2} más</span>` : '';

    row.innerHTML = `
        <td><input type="checkbox" class="role-checkbox" data-role-id="${role.id}"></td>
        <td>${role.id}</td>
        <td>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="${getRoleIcon(role.name)}"></i>
                </div>
                <div class="user-details">
                    <span class="user-name">${role.name}</span>
                </div>
            </div>
        </td>
        <td>${role.description}</td>
        <td>
            <div class="permissions-list">
                ${permissionsHtml}
                ${morePermissions}
            </div>
        </td>
        <td><span class="badge badge-count">${role.userCount} usuarios</span></td>
        <td><span class="badge ${statusClass[role.status]}">${statusText[role.status]}</span></td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" title="Editar" data-role-id="${role.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" title="Eliminar" data-role-id="${role.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" title="Ver detalles" data-role-id="${role.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Get permission display name
function getPermissionDisplayName(permission) {
    const permissionNames = {
        'users.view': 'Ver usuarios',
        'users.create': 'Crear usuarios',
        'users.edit': 'Editar usuarios',
        'users.delete': 'Eliminar usuarios',
        'products.view': 'Ver productos',
        'products.create': 'Crear productos',
        'products.edit': 'Editar productos',
        'products.delete': 'Eliminar productos',
        'reports.view': 'Ver reportes',
        'reports.export': 'Exportar reportes',
        'system.settings': 'Configuración',
        'system.audit': 'Auditoría'
    };
    return permissionNames[permission] || permission;
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#rolesTableBody tr');

    tableRows.forEach(row => {
        const roleName = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const roleDescription = row.cells[3]?.textContent.toLowerCase() || '';

        if (roleName.includes(searchTerm) || roleDescription.includes(searchTerm)) {
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
    // use center-modal so it is centered like the users modal
    modal.className = 'modal center-modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Filtros de Roles</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
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
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filteredRoles = roles;
    
    if (statusFilter) {
        filteredRoles = filteredRoles.filter(role => role.status === statusFilter);
    }
    
    // Update table with filtered data
    const tbody = document.getElementById('rolesTableBody');
    tbody.innerHTML = '';
    
    filteredRoles.forEach(role => {
        const row = createRoleRow(role);
        tbody.appendChild(row);
    });
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Re-add event listeners
    addActionButtonListeners();
    
    showNotification(`Filtros aplicados: ${filteredRoles.length} roles encontrados`);
}

// Modal functions
function openAddRoleModal() {
    const modal = document.getElementById('roleModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('roleForm');

    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Rol';
    }

    if (form) {
        form.reset();
        // Remove any existing role ID
        const existingId = form.querySelector('input[name="id"]');
        if (existingId) {
            existingId.remove();
        }
        // Clear all permission checkboxes
        clearAllPermissions();
        // Update preview
        updateRolePreview();
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function openEditRoleModal(roleId) {
    const modal = document.getElementById('roleModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('roleForm');

    if (modalTitle) {
        modalTitle.textContent = 'Editar Rol';
    }

    if (form) {
        form.reset();
        
        // Add hidden input for role ID
        const existingId = form.querySelector('input[name="id"]');
        if (existingId) {
            existingId.remove();
        }
        
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = roleId;
        form.appendChild(idInput);

        // Populate form with role data
        populateRoleForm(roleId);
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('roleModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const roleData = Object.fromEntries(formData.entries());
    
    // Get selected permissions
    const selectedPermissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(checkbox => checkbox.value);
    
    roleData.permissions = selectedPermissions;
    
    // Validate form
    if (!validateRoleForm(roleData)) {
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
    }

    // Simulate API call
    setTimeout(() => {
        if (roleData.id) {
            updateRole(roleData);
        } else {
            createRole(roleData);
        }
        
        // Reset button
        if (saveBtn) {
            saveBtn.innerHTML = 'Guardar';
            saveBtn.disabled = false;
        }
        
        closeModal();
    }, 1500);
}

function validateRoleForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre del rol debe tener al menos 2 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (!data.permissions || data.permissions.length === 0) {
        errors.push('Debe seleccionar al menos un permiso');
    }

    if (errors.length > 0) {
        alert('Errores en el formulario:\n' + errors.join('\n'));
        return false;
    }

    return true;
}

// Role CRUD operations
function createRole(roleData) {
    // Generate new ID
    const newId = String(roles.length + 1).padStart(3, '0');
    
    // Create new role object
    const newRole = {
        id: newId,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        userCount: 0,
        status: roleData.status
    };
    
    // Add to roles array
    roles.push(newRole);
    
    // Refresh table
    loadRoles();
    
    showNotification('Rol creado exitosamente', 'success');
}

function updateRole(roleData) {
    // Find role index
    const roleIndex = roles.findIndex(role => role.id === roleData.id);
    
    if (roleIndex !== -1) {
        // Update role data
        roles[roleIndex] = {
            ...roles[roleIndex],
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            status: roleData.status
        };
        
        // Refresh table
        loadRoles();
        
        showNotification('Rol actualizado exitosamente', 'success');
    }
}

function deleteRole(roleId) {
    // Use a custom modal confirmation instead of native confirm()
    const role = roles.find(r => r.id === roleId);
    const roleName = role ? role.name : '';
    const deleteModal = createDeleteRoleModal(roleId, roleName);
    document.body.appendChild(deleteModal);
}

function createDeleteRoleModal(roleId, roleName) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content delete-modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Eliminar Rol</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar <strong>${roleName}</strong>? Esta acción no puede deshacerse.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" id="confirmDeleteBtn">Eliminar</button>
            </div>
        </div>
    `;

    // Attach handler for confirm delete
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', function() {
        // perform delete
        const roleIndex = roles.findIndex(role => role.id === roleId);
        if (roleIndex !== -1) {
            roles.splice(roleIndex, 1);
            loadRoles();
            showNotification('Rol eliminado exitosamente', 'success');
        }
        modal.remove();
    });

    return modal;
}

function viewRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    
    if (role) {
        const viewModal = createViewRoleModal(role);
        document.body.appendChild(viewModal);
    }
}

function createViewRoleModal(role) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const statusText = {
        'active': 'Activo',
        'inactive': 'Inactivo'
    };

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Rol</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="role-details-view">
                    <div class="role-avatar-large">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <div class="role-info-details">
                        <h4>${role.name}</h4>
                        <p><strong>ID:</strong> ${role.id}</p>
                        <p><strong>Descripción:</strong> ${role.description}</p>
                        <p><strong>Estado:</strong> ${statusText[role.status]}</p>
                        <p><strong>Usuarios asignados:</strong> ${role.userCount}</p>
                        <p><strong>Total de permisos:</strong> ${role.permissions.length}</p>
                    </div>
                </div>
                <div class="permissions-detail">
                    <h5>Permisos del Rol:</h5>
                    <div class="permission-list-detail">
                        ${role.permissions.map(perm => `<span class="badge badge-permission">${getPermissionDisplayName(perm)}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="openEditRoleModal('${role.id}'); this.closest('.modal').remove();">Editar Rol</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Table management
function refreshRolesTable() {
    loadRoles();
}

function populateRoleForm(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        document.getElementById('roleName').value = role.name;
        document.getElementById('roleDescription').value = role.description;
        document.getElementById('roleStatus').value = role.status;
        
        // Clear all checkboxes first
        const checkboxes = document.querySelectorAll('input[name="permissions"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the role's permissions
        role.permissions.forEach(permission => {
            const checkbox = document.querySelector(`input[name="permissions"][value="${permission}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Update preview
        updateRolePreview();
    }
}

// Checkbox management
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.role-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function handleIndividualCheckbox() {
    const checkboxes = document.querySelectorAll('.role-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
    }
}

// Action button listeners
function addActionButtonListeners() {
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const viewButtons = document.querySelectorAll('.btn-view');
    const roleCheckboxes = document.querySelectorAll('.role-checkbox');

    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const roleId = this.getAttribute('data-role-id');
            openEditRoleModal(roleId);
        });
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const roleId = this.getAttribute('data-role-id');
            deleteRole(roleId);
        });
    });

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const roleId = this.getAttribute('data-role-id');
            viewRole(roleId);
        });
    });

    // Add event listeners to individual checkboxes
    roleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

// Logout functionality
function handleLogout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        showNotification('Sesión cerrada exitosamente', 'success');
        // Redirect to login page or dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    }
}

// Update pagination info
function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        const totalRoles = roles.length;
        paginationInfo.textContent = `Mostrando 1-${totalRoles} de ${totalRoles} roles`;
    }
}

// Preview updates
function addPreviewUpdates() {
    const roleNameInput = document.getElementById('roleName');
    const roleDescriptionInput = document.getElementById('roleDescription');
    const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]');

    if (roleNameInput) {
        roleNameInput.addEventListener('input', updateRolePreview);
    }

    if (roleDescriptionInput) {
        roleDescriptionInput.addEventListener('input', updateRolePreview);
    }

    permissionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateRolePreview);
    });
}

function updateRolePreview() {
    const roleName = document.getElementById('roleName').value || 'Nombre del Rol';
    const roleDescription = document.getElementById('roleDescription').value || 'Descripción del rol';
    const selectedPermissions = document.querySelectorAll('input[name="permissions"]:checked');
    
    document.getElementById('previewRoleName').textContent = roleName;
    document.getElementById('previewRoleDescription').textContent = roleDescription;
    document.getElementById('permissionCount').textContent = selectedPermissions.length;
}

// Permission management
function clearAllPermissions() {
    const checkboxes = document.querySelectorAll('input[name="permissions"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    updateRolePreview();
}

function handleSelectAllPermissions(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('input[name="permissions"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    updateRolePreview();
}

// Utility functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .permissions-detail {
        margin-top: 20px;
    }
    
    .permission-list-detail {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }
`;
document.head.appendChild(style);

// ==================== FUNCIONES DE CHECKBOXES ====================

// Manejar selección de todos los checkboxes
function handleSelectAllCheckboxes(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.role-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    updateSelectedCount();
    updateBulkActionsVisibility();
}

// Manejar checkboxes individuales
function handleIndividualCheckbox() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.role-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.role-checkbox:checked');
    
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
    const checkedCount = document.querySelectorAll('.role-checkbox:checked').length;
    const selectedCountElement = document.getElementById('selectedCount');
    
    if (selectedCountElement) {
        selectedCountElement.textContent = checkedCount;
    }
}

// Mostrar/ocultar barra de acciones masivas
function updateBulkActionsVisibility() {
    const bulkActions = document.getElementById('bulkActions');
    const checkedCount = document.querySelectorAll('.role-checkbox:checked').length;
    
    if (bulkActions) {
        if (checkedCount > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

// Obtener IDs de roles seleccionados
function getSelectedRoleIds() {
    const checkedCheckboxes = document.querySelectorAll('.role-checkbox:checked');
    const selectedIds = [];
    
    checkedCheckboxes.forEach(checkbox => {
        const roleId = checkbox.getAttribute('data-role-id');
        if (roleId) {
            selectedIds.push(roleId);
        }
    });
    
    return selectedIds;
}

// Eliminar roles seleccionados
function deleteSelectedRoles() {
    const selectedIds = getSelectedRoleIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay roles seleccionados', 'error');
        return;
    }
    
    const confirmMessage = `¿Está seguro de eliminar ${selectedIds.length} rol(es) seleccionado(s)?`;
    
    if (confirm(confirmMessage)) {
        // Eliminar roles del array
        selectedIds.forEach(id => {
            const index = roles.findIndex(role => role.id === id);
            if (index !== -1) {
                roles.splice(index, 1);
            }
        });
        
        // Recargar tabla
        loadRoles();
        
        // Limpiar selección
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
        
        // Notificar éxito
        showNotification(`${selectedIds.length} rol(es) eliminado(s) exitosamente`, 'success');
    }
}

// Exportar roles seleccionados a CSV
function exportSelectedRoles() {
    const selectedIds = getSelectedRoleIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay roles seleccionados', 'error');
        return;
    }
    
    // Filtrar roles seleccionados
    const selectedRoles = roles.filter(role => selectedIds.includes(role.id));
    
    // Crear contenido CSV
    let csvContent = 'ID,Nombre,Descripción,Permisos,Usuarios Asignados,Estado\n';
    
    selectedRoles.forEach(role => {
        const permissions = role.permissions.join('; ');
        const line = `${role.id},"${role.name}","${role.description}","${permissions}",${role.userCount},${role.status}\n`;
        csvContent += line;
    });
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `roles_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${selectedIds.length} rol(es) exportado(s) exitosamente`, 'success');
}

// Adjuntar eventos a checkboxes
function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.role-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

// Exponer funciones globalmente
window.deleteSelectedRoles = deleteSelectedRoles;
window.exportSelectedRoles = exportSelectedRoles;