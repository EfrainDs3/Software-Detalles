// Roles Module JavaScript

const ROLE_API_URL = '/api/roles';

// Global state
let roles = [];
let isLoadingRoles = false;
let hasRoleLoadError = false;

let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize roles module
    initRolesModule();
    // Load initial data
    fetchAndRenderRoles();
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

async function fetchAndRenderRoles(filters = {}) {
    isLoadingRoles = true;
    hasRoleLoadError = false;
    renderRolesPlaceholder('Cargando roles...', 'fa-spinner fa-spin');

    try {
        const data = await fetchRolesFromApi(filters);
        roles = data.map(mapRoleResponseToViewModel);
    } catch (error) {
        console.error('Error al cargar los roles', error);
        hasRoleLoadError = true;
        roles = [];
        renderRolesPlaceholder(error.message || 'No se pudieron cargar los roles.', 'fa-triangle-exclamation');
        showNotification(error.message || 'No se pudieron cargar los roles.', 'error');
        return;
    } finally {
        isLoadingRoles = false;
    }

    loadRoles();
}

async function fetchRolesFromApi(filters = {}) {
    const params = new URLSearchParams();

    if (filters.soloActivos !== undefined && filters.soloActivos !== null) {
        params.append('soloActivos', filters.soloActivos);
    }

    const url = `${ROLE_API_URL}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        let message = 'No se pudieron cargar los roles.';
        try {
            const errorBody = await response.json();
            message = errorBody.message || errorBody.error || message;
        } catch (_error) {
            // ignore JSON parsing errors
        }
        throw new Error(message);
    }

    return response.json();
}

function mapRoleResponseToViewModel(role) {
    const rawPermissions = Array.isArray(role.permisos) ? role.permisos : [];

    const permissionDetails = rawPermissions
        .map((permiso) => {
            if (!permiso) {
                return null;
            }

            if (typeof permiso === 'string') {
                return {
                    id: null,
                    codigo: permiso,
                    nombre: permiso
                };
            }

            return {
                id: permiso.id ?? null,
                codigo: permiso.codigo ?? permiso.nombre ?? null,
                nombre: permiso.nombre ?? permiso.codigo ?? ''
            };
        })
        .filter(Boolean);

    const permissionCodes = permissionDetails
        .map((detalle) => detalle.codigo)
        .filter((codigo) => typeof codigo === 'string' && codigo.length);

    const normalizedId = role.id !== null && role.id !== undefined ? String(role.id) : null;

    return {
        id: normalizedId,
    code: formatRoleId(normalizedId),
        name: role.nombre,
        description: role.descripcion || 'Sin descripción',
        permissions: permissionCodes,
        permissionDetails,
        userCount: typeof role.totalUsuarios === 'number' ? role.totalUsuarios : 0,
        status: role.estado ? 'active' : 'inactive',
        assignedUsers: Array.isArray(role.usuarios) ? role.usuarios : [],
        raw: role
    };
}

function formatRoleId(id) {
    if (id === null || id === undefined) {
        return '--';
    }

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
        return String(id);
    }

    return numericId.toString();
}

function renderRolesPlaceholder(message, iconClass = 'fa-circle-info') {
    const tbody = document.getElementById('rolesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table-placeholder';
    cell.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
    row.appendChild(cell);
    tbody.appendChild(row);
}

function formatUserFullName(user) {
    if (!user) {
        return '';
    }
    if (user.nombreCompleto) {
        return user.nombreCompleto;
    }
    const nombres = [user.nombres, user.apellidos].filter(Boolean).join(' ').trim();
    return nombres || user.email || '';
}

async function getResponseErrorMessage(response, fallbackMessage) {
    if (!response) {
        return fallbackMessage;
    }

    let message = fallbackMessage;

    try {
        const clone = response.clone();
        const data = await clone.json();
        message = data.message || data.error || message;
    } catch (_jsonError) {
        try {
            const text = await response.text();
            if (text) {
                message = text;
            }
        } catch (_textError) {
            // ignore secondary errors
        }
    }

    return message;
}

function buildRoleRequestPayload(roleData) {
    return {
        nombre: roleData.name ? roleData.name.trim() : '',
        descripcion: roleData.description ? (roleData.description.trim().length ? roleData.description.trim() : null) : null,
        estado: roleData.status ? roleData.status === 'active' : true
    };
}

async function deleteRoleFromApi(roleId) {
    if (!roleId) {
        throw new Error('Rol no válido para eliminar.');
    }

    const response = await fetch(`${ROLE_API_URL}/${roleId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        const message = await getResponseErrorMessage(response, 'No se pudo eliminar el rol.');
        throw new Error(message);
    }
}

// Load roles into table
function loadRoles() {
    const tbody = document.getElementById('rolesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (isLoadingRoles) {
        renderRolesPlaceholder('Cargando roles...', 'fa-spinner fa-spin');
        return;
    }

    if (hasRoleLoadError) {
        renderRolesPlaceholder('No se pudieron cargar los roles.', 'fa-triangle-exclamation');
        return;
    }

    if (!roles.length) {
        renderRolesPlaceholder('No se encontraron roles registrados.', 'fa-inbox');
        updatePaginationInfo();
        updateSelectedCount();
        updateBulkActionsVisibility();
        return;
    }

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
    updateSelectedCount();
    updateBulkActionsVisibility();
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

    // Choose icon based on role name for quick visual identification
    const getRoleIcon = (roleName) => {
        if (!roleName) {
            return 'fas fa-user';
        }

        const normalized = roleName.toLowerCase();
        if (normalized.includes('admin')) return 'fas fa-user-shield';
        if (normalized.includes('gerente') || normalized.includes('manager')) return 'fas fa-user-tie';
        if (normalized.includes('editor')) return 'fas fa-user-cog';
        return 'fas fa-user';
    };

    const assignedUsers = Array.isArray(role.assignedUsers) ? role.assignedUsers : [];
    const assignedUsersLabel = role.userCount === 1 ? 'usuario' : 'usuarios';
    const assignedUsersTooltip = assignedUsers.length
        ? assignedUsers.map(formatUserFullName).filter(Boolean).join(', ')
        : 'Sin usuarios asignados';

    const statusBadgeClass = statusClass[role.status] || 'badge-inactive';
    const statusBadgeText = statusText[role.status] || 'Inactivo';

    row.innerHTML = `
        <td class="cell-select">
            <input type="checkbox" class="role-checkbox" data-role-id="${role.id}">
        </td>
        <td class="cell-id">
            <span class="cell-value">${role.code}</span>
        </td>
        <td class="cell-role">
            <div class="user-info">
                <div class="user-avatar">
                    <i class="${getRoleIcon(role.name)}"></i>
                </div>
                <div class="user-details">
                    <span class="user-name">${role.name}</span>
                </div>
            </div>
        </td>
        <td class="cell-description">
            <span class="description-text">${role.description}</span>
        </td>
        <td class="cell-users">
            <span class="badge badge-count" title="${assignedUsersTooltip}">${role.userCount} ${assignedUsersLabel}</span>
        </td>
        <td class="cell-status">
            <span class="badge ${statusBadgeClass}">${statusBadgeText}</span>
        </td>
        <td class="cell-actions">
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
    if (!permission) {
        return '';
    }

    const codigo = typeof permission === 'string'
        ? permission
        : (permission.codigo ?? permission.nombre ?? '');

    const nombre = typeof permission === 'object' && permission.nombre
        ? permission.nombre
        : codigo;

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
        'system.settings': 'Configuración'
    };
    return permissionNames[codigo] || nombre || codigo;
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#rolesTableBody tr');

    tableRows.forEach(row => {
        const roleName = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const roleDescription = row.querySelector('.cell-description')?.textContent.toLowerCase() || '';

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
async function handleFormSubmit(e) {
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

    const saveBtn = document.getElementById('saveBtn');
    const originalButtonHtml = saveBtn ? saveBtn.innerHTML : '';

    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
    }

    try {
        if (roleData.id) {
            await updateRole(roleData);
        } else {
            await createRole(roleData);
        }

        closeModal();
        e.target.reset();
        clearAllPermissions();
        updateRolePreview();
    } catch (error) {
        console.error('Error al guardar el rol', error);
        showNotification(error.message || 'No se pudo guardar el rol.', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.innerHTML = originalButtonHtml || '<i class="fas fa-save"></i> Guardar Rol';
            saveBtn.disabled = false;
        }
    }
}

function validateRoleForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre del rol debe tener al menos 2 caracteres');
    }

    if (data.description && data.description.trim().length > 0 && data.description.trim().length < 10) {
        errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (errors.length > 0) {
        alert('Errores en el formulario:\n' + errors.join('\n'));
        return false;
    }

    return true;
}

// Role CRUD operations
async function createRole(roleData) {
    const payload = buildRoleRequestPayload(roleData);

    const response = await fetch(ROLE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const message = await getResponseErrorMessage(response, 'No se pudo crear el rol.');
        throw new Error(message);
    }

    const newRole = await response.json();
    showNotification('Rol creado exitosamente', 'success');
    await fetchAndRenderRoles();
    return newRole;
}

async function updateRole(roleData) {
    if (!roleData.id) {
        throw new Error('No se pudo identificar el rol a actualizar.');
    }

    const payload = buildRoleRequestPayload(roleData);
    const response = await fetch(`${ROLE_API_URL}/${roleData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const message = await getResponseErrorMessage(response, 'No se pudo actualizar el rol.');
        throw new Error(message);
    }

    const updatedRole = await response.json();
    showNotification('Rol actualizado exitosamente', 'success');
    await fetchAndRenderRoles();
    return updatedRole;
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
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', async function() {
        try {
            await deleteRoleFromApi(roleId);
            showNotification('Rol eliminado exitosamente', 'success');
            await fetchAndRenderRoles();
        } catch (error) {
            console.error('Error al eliminar rol', error);
            showNotification(error.message || 'No se pudo eliminar el rol.', 'error');
        } finally {
            modal.remove();
        }
    });

    return modal;
}

function viewRole(roleId) {
    const role = roles.find(r => r.id === roleId);

    if (role) {
        const viewModal = createViewRoleModal(role);
        document.body.appendChild(viewModal);
        return;
    }

    // fallback: try fetching directly
    showNotification('Cargando detalles del rol...', 'success');
    fetch(`${ROLE_API_URL}/${roleId}`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(roleResponse => {
            const mappedRole = mapRoleResponseToViewModel(roleResponse);
            const viewModal = createViewRoleModal(mappedRole);
            document.body.appendChild(viewModal);
        })
        .catch(async error => {
            const message = await getResponseErrorMessage(error, 'No se pudieron cargar los detalles del rol.');
            showNotification(message, 'error');
        });
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
                        <p><strong>Total de permisos:</strong> ${Array.isArray(role.permissionDetails) ? role.permissionDetails.length : 0}</p>
                    </div>
                </div>
                <div class="permissions-detail">
                    <h5>Permisos del Rol:</h5>
                    <div class="permission-list-detail">
                        ${Array.isArray(role.permissionDetails) && role.permissionDetails.length
                            ? role.permissionDetails.map(perm => `<span class="badge badge-permission">${getPermissionDisplayName(perm)}</span>`).join('')
                            : '<span class="badge badge-permission badge-empty">Sin permisos asignados</span>'}
                    </div>
                </div>
                <div class="permissions-detail">
                    <h5>Usuarios Asignados:</h5>
                    <div class="permission-list-detail">
                        ${role.assignedUsers.length
                            ? role.assignedUsers.map(user => `<span class="badge badge-count">${formatUserFullName(user)}</span>`).join('')
                            : '<span class="badge badge-empty">Sin usuarios asignados</span>'}
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
        document.getElementById('roleDescription').value = role.description === 'Sin descripción' ? '' : role.description;
        document.getElementById('roleStatus').value = role.status;
        
        // Clear all checkboxes first
        const checkboxes = document.querySelectorAll('input[name="permissions"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the role's permissions
        (role.permissions || []).forEach(permission => {
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
        if (!totalRoles) {
            paginationInfo.textContent = 'No hay roles para mostrar';
        } else {
            paginationInfo.textContent = `Mostrando 1-${totalRoles} de ${totalRoles} roles`;
        }
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

    .table-placeholder {
        text-align: center;
        padding: 24px 16px;
        color: #6c757d;
        font-size: 0.95rem;
        background: #ffffff;
    }

    .table-placeholder i {
        margin-right: 8px;
    }

    .badge-empty {
        background-color: #e9ecef;
        color: #495057;
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
        Promise.all(selectedIds.map(id => deleteRoleFromApi(id).catch(error => ({ error, id }))))
            .then(async results => {
                const failed = results.filter(result => result && result.error);
                if (failed.length) {
                    const firstError = failed[0];
                    const message = await getResponseErrorMessage(firstError.error, `No se pudo eliminar el rol ${firstError.id}.`);
                    showNotification(message, 'error');
                } else {
                    showNotification(`${selectedIds.length} rol(es) eliminado(s) exitosamente`, 'success');
                }
            })
            .finally(async () => {
                await fetchAndRenderRoles();
                const selectAll = document.getElementById('selectAll');
                if (selectAll) {
                    selectAll.checked = false;
                    selectAll.indeterminate = false;
                }
            });
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