// Módulo de usuarios

// Variables globales
const API_BASE = '/api/usuarios';
let users = [];
let roles = [];
let documentTypes = [];
let currentEditId = null;
let searchTerm = '';
let filters = { roleId: '', estado: '' };

// NOTE: Use backend proxy `/api/reniec` for RENIEC/DNI lookups. Token and provider configured server-side.

const elements = {};

const USER_DOCUMENT_RULES = {
    DNI: { label: 'DNI', maxLength: 8, regex: /^\d{8}$/ },
    RUC: { label: 'RUC', maxLength: 11, regex: /^\d{11}$/ }
};

function resolveUserDocumentRule(tipoTexto) {
    if (!tipoTexto) return null;
    const upper = String(tipoTexto).toUpperCase();
    if (upper.includes('DNI')) return USER_DOCUMENT_RULES.DNI;
    if (upper.includes('RUC')) return USER_DOCUMENT_RULES.RUC;
    return null;
}

function sanitizeUserDocumentoInput(input, rule) {
    if (!input) return '';
    let value = input.value || '';
    if (rule) {
        value = value.replace(/\D/g, '');
        if (typeof rule.maxLength === 'number') {
            value = value.slice(0, rule.maxLength);
        }
    } else {
        value = value.trim();
    }
    input.value = value;
    return value;
}

function applyUserDocumentConstraints(input, tipoTexto) {
    if (!input) return;
    const rule = resolveUserDocumentRule(tipoTexto);
    if (rule) {
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', `\\d{${rule.maxLength}}`);
        input.setAttribute('maxlength', String(rule.maxLength));
    } else {
        input.removeAttribute('inputmode');
        input.removeAttribute('pattern');
        input.removeAttribute('maxlength');
    }
}

function validateUserDocumentoNumero(tipoTexto, numero) {
    if (!numero) return null;
    const rule = resolveUserDocumentRule(tipoTexto);
    if (!rule) return null;
    if (!rule.regex.test(numero)) {
        return `${rule.label} debe tener exactamente ${rule.maxLength} dígitos`;
    }
    return null;
}

function getUserTipoDocumentoNombreById(id, selectEl) {
    const value = id ?? selectEl?.value;
    if (!value && selectEl) {
        return selectEl.options[selectEl.selectedIndex]?.text || '';
    }
    const tipo = (documentTypes || []).find(t => String(t.idTipoDocumento) === String(value));
    if (tipo) return tipo.nombreTipoDocumento;
    if (selectEl) {
        return selectEl.options[selectEl.selectedIndex]?.text || '';
    }
    return '';
}

function normalizeUserDocumentoValue(numero, tipoTexto) {
    if (!numero) return '';
    const rule = resolveUserDocumentRule(tipoTexto);
    let value = String(numero).trim();
    if (rule) {
        value = value.replace(/\D/g, '').slice(0, rule.maxLength);
    }
    return value;
}

function updateUserDocConstraints() {
    const docTypeSelect = document.getElementById('userDocumentType');
    const docNumberInput = document.getElementById('userDocumentNumber');
    if (!docNumberInput) return;
    const tipoTexto = getUserTipoDocumentoNombreById(docTypeSelect?.value, docTypeSelect);
    applyUserDocumentConstraints(docNumberInput, tipoTexto);
    sanitizeUserDocumentoInput(docNumberInput, resolveUserDocumentRule(tipoTexto));
}

async function fetchJson(url, options = {}) {
    const headers = options.headers ? new Headers(options.headers) : new Headers();
    if (!(options.body instanceof FormData)) {
        headers.set('Accept', 'application/json');
        if (options.body) {
            headers.set('Content-Type', 'application/json');
        }
    }

    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers
    });

    if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (Array.isArray(errorData?.errors)) {
                errorMessage = errorData.errors.join(', ');
            }
        } catch (parseError) {
            // ignore parse errors, keep default message
        }
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return await response.json();
    }

    return null;
}

// Inicialización del módulo
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    initUsuariosModule();
});

function cacheElements() {
    elements.searchInput = document.getElementById('searchInput');
    elements.addUserBtn = document.getElementById('addUserBtn');
    elements.filterBtn = document.getElementById('filterBtn');
    elements.selectAllCheckbox = document.getElementById('selectAll');
    elements.userModal = document.getElementById('userModal');
    elements.userForm = document.getElementById('userForm');
    elements.usersTableBody = document.getElementById('usersTableBody');
    elements.paginationInfo = document.querySelector('.pagination-info');
    elements.bulkActions = document.getElementById('bulkActions');
    elements.selectedCount = document.getElementById('selectedCount');
    elements.saveBtn = document.getElementById('saveBtn');
    elements.roleDescription = document.getElementById('roleDescription');
}

function initUsuariosModule() {
    bindCoreListeners();
    addPreviewListeners();
    setTableLoading(true);
    loadInitialData();
}

function bindCoreListeners() {
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', handleSearch);
    }

    if (elements.addUserBtn) {
        elements.addUserBtn.addEventListener('click', event => {
            event.preventDefault();
            openAddUserModal();
        });
    }

    if (elements.filterBtn) {
        elements.filterBtn.addEventListener('click', handleFilter);
    }

    if (elements.selectAllCheckbox) {
        elements.selectAllCheckbox.addEventListener('change', handleSelectAllCheckboxes);
    }

    if (elements.userForm) {
        elements.userForm.addEventListener('submit', handleFormSubmit);
    }

    // Attach RENIEC lookup listeners to document number/type inputs (if present)
    const userDocInput = document.getElementById('userDocumentNumber');
    const userDocType = document.getElementById('userDocumentType');
    if (userDocInput) {
        userDocInput.addEventListener('input', () => {
            const tipoTexto = getUserTipoDocumentoNombreById(userDocType?.value, userDocType);
            const rule = resolveUserDocumentRule(tipoTexto);
            sanitizeUserDocumentoInput(userDocInput, rule);
        });
        userDocInput.addEventListener('blur', handleUserDocLookupEvent);
    }
    if (userDocType) {
        userDocType.addEventListener('change', () => {
            updateUserDocConstraints();
            handleUserDocLookupEvent();
        });
    }

    updateUserDocConstraints();

    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (elements.userModal) {
        elements.userModal.addEventListener('click', event => {
            if (event.target === elements.userModal) {
                closeModal();
            }
        });
    }
}

async function loadInitialData() {
    try {
        const [rolesResponse, documentTypesResponse, usersResponse] = await Promise.all([
            fetchJson(`${API_BASE}/roles`),
            fetchJson(`${API_BASE}/tipos-documento`),
            fetchJson(`${API_BASE}`)
        ]);

        roles = Array.isArray(rolesResponse) ? rolesResponse : [];
        documentTypes = Array.isArray(documentTypesResponse) ? documentTypesResponse : [];
        users = Array.isArray(usersResponse) ? usersResponse : [];

    populateRoleSelects();
    populateDocumentTypes();
    loadUsers();
        updateRoleDescription();
        showNotification('Usuarios cargados correctamente', 'success');
    } catch (error) {
        console.error('Error al cargar datos de usuarios', error);
        showNotification('Ocurrió un error al cargar los usuarios', 'error');
        setEmptyState('No se pudieron cargar los usuarios. Intenta nuevamente.');
    } finally {
        setTableLoading(false);
    }
}

function populateRoleSelects() {
    const roleSelect = document.getElementById('userRole');

    if (!roleSelect) {
        return;
    }

    const previousValue = roleSelect.value;
    roleSelect.innerHTML = '<option value="">Seleccionar rol</option>';

    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.nombre;
        roleSelect.appendChild(option);
    });

    if (previousValue) {
        roleSelect.value = previousValue;
    }

    updateRoleDescription();
}

function populateDocumentTypes() {
    const documentSelect = document.getElementById('userDocumentType');
    if (!documentSelect) {
        return;
    }

    const previousValue = documentSelect.value;
    documentSelect.innerHTML = '<option value="">Seleccionar</option>';

    documentTypes.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.idTipoDocumento;
        option.textContent = tipo.nombreTipoDocumento;
        documentSelect.appendChild(option);
    });

    if (previousValue) {
        documentSelect.value = previousValue;
    }

    updateUserDocConstraints();
}

// -------------------- RENIEC lookup support --------------------
// Hace una llamada al endpoint backend /api/reniec que actúa como proxy
async function lookupReniec(tipoText, numero) {
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

function extractNamePartsFromReniec(data) {
    if (!data) return { firstName: '', lastName: '' };
    // Try common properties that providers use
    const nombres = data.nombres || data.nombre || data.nombre_completo || data.nombreCompleto || data.razon_social || '';
    const apellidoP = data.apellidoPaterno || data.apellido_paterno || data.apellido || data.ape_paterno || '';
    const apellidoM = data.apellidoMaterno || data.apellido_materno || data.ape_materno || '';
    const lastName = [apellidoP, apellidoM].filter(Boolean).join(' ').trim();
    // If provider returns full name in a single field, try to split
    if (!nombres && lastName) {
        return { firstName: '', lastName };
    }
    if (nombres && !apellidoP && !apellidoM) {
        // heuristic: split last word(s) as last name for Spanish names
        const parts = String(nombres).trim().split(/\s+/);
        if (parts.length === 1) return { firstName: parts[0], lastName: '' };
        const firstName = parts.slice(0, -1).join(' ');
        const last = parts.slice(-1).join(' ');
        return { firstName, lastName: last };
    }
    return { firstName: nombres || '', lastName };
}

function extractAddressFromReniec(data) {
    if (!data) return '';
    // support provider shapes: domiciliado.direccion, domicilio, direccion, address, etc.
    if (data.domiciliado && typeof data.domiciliado === 'object') {
        if (data.domiciliado.direccion) return data.domiciliado.direccion;
        if (data.domiciliado.direccion_completa) return data.domiciliado.direccion_completa;
    }
    return data.direccion || data.domicilio || data.direccion_completa || data.direccionCompleta || data.address || '';
}

async function handleUserDocLookupEvent() {
    const docTypeSelect = document.getElementById('userDocumentType');
    const docNumberInput = document.getElementById('userDocumentNumber');
    if (!docTypeSelect || !docNumberInput) return;

    const selectedVal = docTypeSelect.value;
    if (!selectedVal) {
        sanitizeUserDocumentoInput(docNumberInput, null);
        return;
    }

    const tipoTexto = getUserTipoDocumentoNombreById(selectedVal, docTypeSelect);
    const rule = resolveUserDocumentRule(tipoTexto);
    const numero = sanitizeUserDocumentoInput(docNumberInput, rule).trim();
    if (!numero) return;

    if (rule && numero.length !== rule.maxLength) {
        return;
    }

    const data = await lookupReniec(tipoTexto.toUpperCase(), numero);
    if (!data) {
        showNotification('No se encontró información para el documento proporcionado', 'warning');
        return;
    }

    if (data.success === false) {
        showNotification('Proveedor no devolvió datos para el documento', 'warning');
        return;
    }

    const provider = data.datos || data;

    const nameParts = extractNamePartsFromReniec(provider);
    const address = extractAddressFromReniec(provider);

    const firstNameInput = document.getElementById('userFirstName');
    const lastNameInput = document.getElementById('userLastName');
    const addressInput = document.getElementById('userAddress');

    if (firstNameInput && nameParts.firstName) firstNameInput.value = nameParts.firstName;
    if (lastNameInput && nameParts.lastName) lastNameInput.value = nameParts.lastName;
    if (addressInput && address) addressInput.value = address;
}


function setTableLoading(isLoading) {
    if (!elements.usersTableBody) {
        return;
    }

    if (isLoading) {
        elements.usersTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i> Cargando usuarios...
                </td>
            </tr>
        `;
    }
}

function setEmptyState(message) {
    if (!elements.usersTableBody) {
        return;
    }

    elements.usersTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">${message}</td>
        </tr>
    `;
    updatePaginationInfo(0, 0);
}

// Cargar usuarios en la tabla
function loadUsers() {
    if (!elements.usersTableBody) {
        return;
    }

    const filtered = getFilteredUsers();

    if (!filtered.length) {
        setEmptyState('No se encontraron usuarios');
        return;
    }

    elements.usersTableBody.innerHTML = '';

    filtered.forEach(user => {
        const row = createUserRow(user);
        elements.usersTableBody.appendChild(row);
    });

    updatePaginationInfo(filtered.length, users.length);
    addActionButtonListeners();
    attachCheckboxListeners();
}

// Crear fila de usuario
function createUserRow(user) {
    const row = document.createElement('tr');
    
    const primaryRole = getPrimaryRole(user);
    const formattedId = formatUserId(user.id);
    const statusInfo = getStatusInfo(user.estado);
    const lastAccess = formatDate(user.fechaUltimaSesion);

    row.innerHTML = `
        <td><input type="checkbox" class="user-checkbox" data-user-id="${user.id}"></td>
        <td>${formattedId}</td>
        <td>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <span class="user-name">${formatFullName(user)}</span>
                </div>
            </div>
        </td>
        <td>${user.email ?? ''}</td>
        <td>${formatRoleBadge(primaryRole)}</td>
        <td>${statusInfo.badge}</td>
        <td>${lastAccess}</td>
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

function getFilteredUsers() {
    const term = searchTerm.trim();
    const normalizedTerm = term.toLowerCase();
    return users.filter(user => {
        const matchesSearch = !normalizedTerm || matchesSearchTerm(user, normalizedTerm);
        const matchesRole = !filters.roleId || user.roles?.some(r => String(r.id) === filters.roleId);
        const matchesState = !filters.estado || String(Boolean(user.estado)) === filters.estado;
        return matchesSearch && matchesRole && matchesState;
    });
}

function matchesSearchTerm(user, term) {
    const values = [
        formatFullName(user).toLowerCase(),
        user.email?.toLowerCase() || '',
        user.username?.toLowerCase() || '',
        (user.roles || []).map(r => r.nombre?.toLowerCase() || '').join(' ')
    ];

    return values.some(value => value.includes(term));
}

function formatFullName(user) {
    const nombres = user.nombres || '';
    const apellidos = user.apellidos || '';
    return `${nombres} ${apellidos}`.trim() || user.nombreCompleto || nombres || apellidos || 'Sin nombre';
}

function formatUserId(id) {
    if (id === null || id === undefined) {
        return '—';
    }
    const idNumber = Number(id);
    if (Number.isNaN(idNumber)) {
        return String(id);
    }
    return idNumber.toString().padStart(3, '0');
}

function getPrimaryRole(user) {
    return Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null;
}

function formatRoleBadge(role) {
    if (!role) {
        return '<span class="badge badge-secondary">Sin rol</span>';
    }

    const roleClass = getRoleClass(role.nombre);
    return `<span class="badge ${roleClass}">${role.nombre}</span>`;
}

function getRoleClass(nombreRol = '') {
    const normalized = nombreRol.toLowerCase();
    if (normalized.includes('admin')) return 'badge-admin';
    if (normalized.includes('gerente') || normalized.includes('manager')) return 'badge-manager';
    if (normalized.includes('super')) return 'badge-supervisor';
    return 'badge-user';
}

function getStatusInfo(isActive) {
    const active = Boolean(isActive);
    return {
        badge: active
            ? '<span class="badge badge-active">Activo</span>'
            : '<span class="badge badge-inactive">Inactivo</span>',
        value: active
    };
}

function formatDate(value) {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value).replace('T', ' ');
    }

    return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funcionalidad de búsqueda
function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    loadUsers();
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
                <button type="button" class="modal-close" data-action="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterRole">Rol</label>
                        <select id="filterRole" class="form-select"></select>
                    </div>
                    <div class="form-group">
                        <label for="filterStatus">Estado</label>
                        <select id="filterStatus" class="form-select"></select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button>
                <button type="button" class="btn btn-primary" data-action="apply-filters">Aplicar Filtros</button>
            </div>
        </div>
    `;

    const roleSelect = modal.querySelector('#filterRole');
    if (roleSelect) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Todos los roles';
        roleSelect.appendChild(defaultOption);

        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = String(role.id);
            option.textContent = role.nombre;
            roleSelect.appendChild(option);
        });

        roleSelect.value = filters.roleId ?? '';
    }

    const statusSelect = modal.querySelector('#filterStatus');
    if (statusSelect) {
        const statusOptions = [
            { value: '', label: 'Todos los estados' },
            { value: 'true', label: 'Activo' },
            { value: 'false', label: 'Inactivo' }
        ];

        statusOptions.forEach(optionInfo => {
            const option = document.createElement('option');
            option.value = optionInfo.value;
            option.textContent = optionInfo.label;
            statusSelect.appendChild(option);
        });

        statusSelect.value = filters.estado ?? '';
    }

    const closeButtons = modal.querySelectorAll('[data-action="close-modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => modal.remove());
    });

    const applyButton = modal.querySelector('[data-action="apply-filters"]');
    if (applyButton) {
        applyButton.addEventListener('click', () => applyFilters(modal));
    }

    return modal;
}

function applyFilters(modalElement) {
    const roleFilter = document.getElementById('filterRole')?.value ?? '';
    const statusFilter = document.getElementById('filterStatus')?.value ?? '';

    filters = {
        roleId: roleFilter,
        estado: statusFilter
    };

    loadUsers();

    if (modalElement) {
        modalElement.remove();
    }

    const resultsCount = getFilteredUsers().length;
    showNotification(`Filtros aplicados: ${resultsCount} usuario${resultsCount === 1 ? '' : 's'} encontrado${resultsCount === 1 ? '' : 's'}`);
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
    const user = users.find(u => String(u.id) === String(userId));
    const userName = user ? formatFullName(user) : '';
    const deleteModal = createDeleteUserModal(userId, userName);
    document.body.appendChild(deleteModal);
}

function viewUser(userId) {
    const user = users.find(u => String(u.id) === String(userId));
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
        const passwordSection = form.querySelector('[data-password-section]');
        if (passwordSection) {
            passwordSection.style.display = 'block';
        }

        const passwordInput = form.querySelector('#userPassword');
        const confirmInput = form.querySelector('#confirmPassword');
        if (passwordInput) {
            passwordInput.required = true;
            passwordInput.value = '';
        }
        if (confirmInput) {
            confirmInput.required = true;
            confirmInput.value = '';
        }

        updateRoleDescription();
        updatePreview();
        updateUserDocConstraints();
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
        const user = users.find(u => String(u.id) === String(userId));
        if (user) {
            const firstNameInput = form.querySelector('#userFirstName');
            const lastNameInput = form.querySelector('#userLastName');
            const emailInput = form.querySelector('#userEmail');
            const phoneInput = form.querySelector('#userPhone');
            const statusSelect = form.querySelector('#userStatus');
            const usernameInput = form.querySelector('#userUsername');
            const documentTypeSelect = form.querySelector('#userDocumentType');
            const documentNumberInput = form.querySelector('#userDocumentNumber');
            const addressInput = form.querySelector('#userAddress');

            if (firstNameInput) firstNameInput.value = user.nombres || '';
            if (lastNameInput) lastNameInput.value = user.apellidos || '';
            if (emailInput) emailInput.value = user.email || '';
            if (phoneInput) phoneInput.value = user.celular || '';
            if (statusSelect) statusSelect.value = String(Boolean(user.estado));
            if (usernameInput) usernameInput.value = user.username || '';
            if (documentTypeSelect) documentTypeSelect.value = user.tipoDocumentoId ? String(user.tipoDocumentoId) : '';
            if (documentNumberInput) documentNumberInput.value = user.numeroDocumento || '';
            if (addressInput) addressInput.value = user.direccion || '';

            const roleSelect = form.querySelector('#userRole');
            if (roleSelect) {
                const primaryRoleId = Array.isArray(user.roles) && user.roles.length ? String(user.roles[0].id) : '';
                roleSelect.value = primaryRoleId;
            }

            const passwordSection = form.querySelector('[data-password-section]');
            if (passwordSection) {
                passwordSection.style.display = 'block';
            }

            const passwordInput = form.querySelector('#userPassword');
            const confirmInput = form.querySelector('#confirmPassword');
            if (passwordInput) {
                passwordInput.required = false;
                passwordInput.value = '';
            }
            if (confirmInput) {
                confirmInput.required = false;
                confirmInput.value = '';
            }

            updateRoleDescription();
            updatePreview();
            updateUserDocConstraints();
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
        const passwordSection = form.querySelector('[data-password-section]');
        if (passwordSection) {
            passwordSection.style.display = 'block';
        }
        const passwordInput = form.querySelector('#userPassword');
        const confirmInput = form.querySelector('#confirmPassword');
        if (passwordInput) {
            passwordInput.required = true;
            passwordInput.value = '';
        }
        if (confirmInput) {
            confirmInput.required = true;
            confirmInput.value = '';
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
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', async function() {
        const button = this;
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';

        try {
            await fetchJson(`${API_BASE}/${userId}`, { method: 'DELETE' });
            await refreshUsers();
            showNotification('Usuario eliminado exitosamente', 'success');
            modal.remove();
        } catch (error) {
            console.error('Error al eliminar usuario', error);
            showNotification(error.message || 'No se pudo eliminar el usuario', 'error');
            button.disabled = false;
            button.innerHTML = originalContent;
        }
    });

    return modal;
}

// Modal de vista
function createViewUserModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.display = 'flex';
    
    const rolesTexto = Array.isArray(user.roles) && user.roles.length
        ? user.roles.map(role => role.nombre).join(', ')
        : 'Sin roles asignados';

    const estadoTexto = user.estado ? 'Activo' : 'Inactivo';
    const fechaCreacion = formatDate(user.fechaCreacion);
    const fechaUltimaSesion = formatDate(user.fechaUltimaSesion);

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
                            <h5>${formatFullName(user)}</h5>
                            <p><strong>ID:</strong> ${formatUserId(user.id)}</p>
                            <p><strong>Nombre de usuario:</strong> ${user.username || '—'}</p>
                            <p><strong>Email:</strong> ${user.email || '—'}</p>
                            <p><strong>Teléfono:</strong> ${user.celular || '—'}</p>
                            <p><strong>Roles:</strong> ${rolesTexto}</p>
                            <p><strong>Estado:</strong> ${estadoTexto}</p>
                            <p><strong>Tipo de documento:</strong> ${user.tipoDocumentoNombre || '—'}</p>
                            <p><strong>Número de documento:</strong> ${user.numeroDocumento || '—'}</p>
                            <p><strong>Dirección:</strong> ${user.direccion || '—'}</p>
                            <p><strong>Fecha de creación:</strong> ${fechaCreacion}</p>
                            <p><strong>Última sesión:</strong> ${fechaUltimaSesion}</p>
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
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!elements.userForm) {
        return;
    }

    const formData = new FormData(elements.userForm);
    const payload = buildUserPayload(formData);
    const errors = validateForm(payload, Boolean(currentEditId));

    if (errors.length) {
        showNotification(errors.join(', '), 'error');
        return;
    }

    const saveBtn = elements.saveBtn || document.getElementById('saveBtn');
    setButtonLoading(saveBtn, true);

    try {
        if (currentEditId) {
            const updatePayload = toUpdatePayload(payload);
            await fetchJson(`${API_BASE}/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify(updatePayload)
            });
            showNotification('Usuario actualizado correctamente', 'success');
        } else {
            const createPayload = toCreatePayload(payload);
            await fetchJson(`${API_BASE}`, {
                method: 'POST',
                body: JSON.stringify(createPayload)
            });
            showNotification('Usuario creado correctamente', 'success');
        }

        await refreshUsers();
        closeModal();
    } catch (error) {
        console.error('Error al guardar usuario', error);
        showNotification(error.message || 'No se pudo guardar el usuario', 'error');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

function buildUserPayload(formData) {
    const toTrimmedValue = name => {
        const value = formData.get(name);
        return typeof value === 'string' ? value.trim() : '';
    };

    const roleValues = formData.getAll('rolIds').filter(Boolean);
    const rawTipoDocumentoId = toTrimmedValue('tipoDocumentoId');
    const docTypeSelect = document.getElementById('userDocumentType');
    const tipoTexto = getUserTipoDocumentoNombreById(rawTipoDocumentoId, docTypeSelect);
    const normalizedNumero = normalizeUserDocumentoValue(toTrimmedValue('numeroDocumento'), tipoTexto);
    const docInput = document.getElementById('userDocumentNumber');
    if (docInput) {
        docInput.value = normalizedNumero || '';
    }

    return {
        nombres: toTrimmedValue('nombres'),
        apellidos: toTrimmedValue('apellidos'),
        email: toTrimmedValue('email'),
        celular: toTrimmedValue('celular') || null,
        username: toTrimmedValue('username'),
        estado: formData.get('estado') === 'false' ? false : true,
        password: formData.get('password') || '',
        confirmPassword: formData.get('confirmPassword') || '',
        numeroDocumento: normalizedNumero || null,
        direccion: toTrimmedValue('direccion') || null,
        tipoDocumentoId: rawTipoDocumentoId ? Number(rawTipoDocumentoId) : null,
        rolIds: roleValues.length ? roleValues.map(value => Number(value)) : []
    };
}

function validateForm(payload, isEditMode) {
    const errors = [];

    if (!payload.nombres || payload.nombres.length < 2) {
        errors.push('Ingresa los nombres del usuario');
    }

    if (!payload.apellidos || payload.apellidos.length < 2) {
        errors.push('Ingresa los apellidos del usuario');
    }

    if (payload.numeroDocumento && !payload.tipoDocumentoId) {
        errors.push('Selecciona un tipo de documento');
    }

    const docTypeSelect = document.getElementById('userDocumentType');
    const tipoTexto = getUserTipoDocumentoNombreById(payload.tipoDocumentoId, docTypeSelect);
    if (payload.numeroDocumento) {
        const docError = validateUserDocumentoNumero(tipoTexto, payload.numeroDocumento);
        if (docError) {
            errors.push(docError);
        }
    }

    if (!payload.email || !isValidEmail(payload.email)) {
        errors.push('Ingresa un correo electrónico válido');
    }

    if (!payload.username || payload.username.length < 3) {
        errors.push('Ingresa un nombre de usuario válido');
    }

    if (!payload.rolIds.length) {
        errors.push('Selecciona al menos un rol');
    }

    if (!isEditMode) {
        if (!payload.password || payload.password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (payload.password !== payload.confirmPassword) {
            errors.push('Las contraseñas no coinciden');
        }
    } else if (payload.password) {
        if (payload.password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (payload.password !== payload.confirmPassword) {
            errors.push('Las contraseñas no coinciden');
        }
    }

    return errors;
}

function toCreatePayload(payload) {
    return {
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        email: payload.email,
        celular: payload.celular,
        username: payload.username,
        password: payload.password,
        numeroDocumento: payload.numeroDocumento,
        direccion: payload.direccion,
        tipoDocumentoId: payload.tipoDocumentoId,
        estado: payload.estado,
        rolIds: payload.rolIds
    };
}

function toUpdatePayload(payload) {
    const updatePayload = {
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        email: payload.email,
        celular: payload.celular,
        username: payload.username,
        numeroDocumento: payload.numeroDocumento,
        direccion: payload.direccion,
        tipoDocumentoId: payload.tipoDocumentoId,
        estado: payload.estado,
        rolIds: payload.rolIds
    };

    if (payload.password) {
        updatePayload.password = payload.password;
    }

    return updatePayload;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function refreshUsers() {
    try {
        const usuarios = await fetchJson(`${API_BASE}`);
        users = Array.isArray(usuarios) ? usuarios : [];
        loadUsers();
    } catch (error) {
        console.error('Error al recargar usuarios', error);
    }
}

function setButtonLoading(button, isLoading) {
    if (!button) {
        return;
    }

    if (isLoading) {
        button.disabled = true;
        button.dataset.originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    } else {
        button.disabled = false;
        const original = button.dataset.originalContent;
        if (original) {
            button.innerHTML = original;
        }
    }
}

// Preview en tiempo real
function addPreviewListeners() {
    const firstNameInput = document.getElementById('userFirstName');
    const lastNameInput = document.getElementById('userLastName');
    const emailInput = document.getElementById('userEmail');
    const roleSelect = document.getElementById('userRole');

    if (firstNameInput) {
        firstNameInput.addEventListener('input', updatePreview);
    }

    if (lastNameInput) {
        lastNameInput.addEventListener('input', updatePreview);
    }

    if (emailInput) {
        emailInput.addEventListener('input', updatePreview);
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', () => {
            updateRoleDescription();
            updatePreview();
        });
    }
}

function updatePreview() {
    const firstNameInput = document.getElementById('userFirstName');
    const lastNameInput = document.getElementById('userLastName');
    const emailInput = document.getElementById('userEmail');
    const roleSelect = document.getElementById('userRole');

    if (!firstNameInput && !lastNameInput && !emailInput && !roleSelect) {
        return;
    }

    const previewName = document.getElementById('previewUserName');
    const previewEmail = document.getElementById('previewUserEmail');
    const previewRole = document.getElementById('previewUserRole');

    if (previewName && (firstNameInput || lastNameInput)) {
        const firstName = firstNameInput?.value?.trim() || '';
        const lastName = lastNameInput?.value?.trim() || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Nombre del Usuario';
        previewName.textContent = fullName;
    }

    if (previewEmail && emailInput) {
        previewEmail.textContent = emailInput.value || 'email@ejemplo.com';
    }

    if (previewRole && roleSelect) {
        const selectedRole = roles.find(role => String(role.id) === roleSelect.value);
        previewRole.textContent = selectedRole?.nombre || 'Sin rol asignado';
    }
}

function updateRoleDescription() {
    const roleSelect = document.getElementById('userRole');
    const roleDescription = document.getElementById('roleDescription');
    
    if (!roleSelect || !roleDescription) return;
    
    const selectedRole = roles.find(role => String(role.id) === roleSelect.value);
    if (selectedRole?.descripcion) {
        roleDescription.textContent = selectedRole.descripcion;
    } else if (selectedRole) {
        roleDescription.textContent = `Rol: ${selectedRole.nombre}`;
    } else {
        roleDescription.textContent = 'Selecciona un rol para ver su descripción';
    }
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
function updatePaginationInfo(visibleCount, totalCount) {
    const paginationInfo = elements.paginationInfo || document.querySelector('.pagination-info');
    if (!paginationInfo) {
        return;
    }

    const total = Number.isFinite(totalCount) ? totalCount : users.length;
    const visible = Number.isFinite(visibleCount) ? visibleCount : total;

    paginationInfo.textContent = `Mostrando ${visible} de ${total} usuarios`;
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
    return Array.from(checkedCheckboxes)
        .map(checkbox => checkbox.getAttribute('data-user-id'))
        .filter(Boolean);
}

// Eliminar usuarios seleccionados
async function deleteSelectedUsers() {
    const selectedIds = getSelectedUserIds();
    
    if (selectedIds.length === 0) {
        showNotification('No hay usuarios seleccionados', 'error');
        return;
    }
    
    const confirmMessage = `¿Está seguro de eliminar ${selectedIds.length} usuario(s) seleccionado(s)?`;
    
    if (confirm(confirmMessage)) {
        try {
            await Promise.all(selectedIds.map(id => fetchJson(`${API_BASE}/${id}`, { method: 'DELETE' })));
            await refreshUsers();

            const selectAll = document.getElementById('selectAll');
            if (selectAll) {
                selectAll.checked = false;
                selectAll.indeterminate = false;
            }

            showNotification(`${selectedIds.length} usuario(s) eliminado(s) exitosamente`, 'success');
        } catch (error) {
            console.error('Error al eliminar usuarios seleccionados', error);
            showNotification(error.message || 'No se pudieron eliminar todos los usuarios seleccionados', 'error');
        }
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
    const selectedUsers = users.filter(user => selectedIds.includes(String(user.id)));
    
    // Crear contenido CSV
    let csvContent = 'ID,Nombres,Apellidos,Email,Roles,Estado,Teléfono,Fecha Creación\n';
    
    selectedUsers.forEach(user => {
        const roleNames = Array.isArray(user.roles) && user.roles.length ? user.roles.map(role => role.nombre).join(' | ') : 'Sin roles';
        const estadoTexto = user.estado ? 'Activo' : 'Inactivo';
        const fechaCreacion = formatDate(user.fechaCreacion);
        const line = `${formatUserId(user.id)},"${user.nombres || ''}","${user.apellidos || ''}","${user.email || ''}","${roleNames}",${estadoTexto},"${user.celular || ''}","${fechaCreacion}"\n`;
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
