// permisos.js - Rediseño del módulo de permisos con matriz por rol

const PERMISSIONS_API_URL = '/api/permisos';
const ROLES_API_URL = '/api/roles';
const ROLE_PERMISSIONS_URL = (rolId) => `/api/permisos/roles/${rolId}`;
const DEFAULT_MODULE_NAME = 'General';
const MODULE_VERB_PREFIXES = ['ver', 'gestionar', 'crear', 'editar', 'registrar', 'acceder', 'administrar', 'eliminar', 'listar', 'consultar'];

const state = {
    items: [],
    filteredItems: [],
    filters: {
        estado: 'TODOS',
        termino: ''
    },
    lastUpdated: null,
    isLoading: false,
    error: null,
    currentPermissionId: null,
    deleteTarget: null,
    detailsId: null
};

const assignmentState = {
    roles: [],
    filteredRoles: [],
    selectedRoleId: null,
    selectedRoleName: '',
    selectedRoleDescription: '',
    modules: new Map(),
    assignments: new Set(),
    originalAssignments: new Set(),
    filterTerm: '',
    isSaving: false,
    isLoadingRoles: false,
    isLoadingAssignments: false,
    dirty: false
};

const dom = {};

function toTitleCase(text) {
    if (!text || typeof text !== 'string') {
        return DEFAULT_MODULE_NAME;
    }
    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || DEFAULT_MODULE_NAME;
}

function deriveModuleFromName(name) {
    if (!name || typeof name !== 'string') {
        return DEFAULT_MODULE_NAME;
    }
    const tokens = name.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) {
        return DEFAULT_MODULE_NAME;
    }
    const first = tokens[0].toLowerCase();
    const last = tokens[tokens.length - 1];
    const candidate = MODULE_VERB_PREFIXES.includes(first) && tokens.length > 1 ? last : tokens[0];
    return toTitleCase(candidate);
}

function resolveModuleName(rawModule, fallbackName) {
    if (rawModule && typeof rawModule === 'string' && rawModule.trim() !== '') {
        return toTitleCase(rawModule);
    }
    return deriveModuleFromName(fallbackName);
}

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    bindEvents();
    loadInitialData();
});

function cacheDom() {
    dom.summaryTotal = document.getElementById('totalPermits');
    dom.summaryActive = document.getElementById('activePermits');
    dom.summaryInactive = document.getElementById('inactivePermits');
    dom.summaryUpdated = document.getElementById('lastUpdated');

    dom.rolesList = document.getElementById('rolesList');
    dom.rolesCount = document.getElementById('rolesCount');
    dom.roleSearchInput = document.getElementById('roleSearchInput');

    dom.selectedRoleName = document.getElementById('selectedRoleName');
    dom.selectedRoleDescription = document.getElementById('selectedRoleDescription');
    dom.permissionsMatrix = document.getElementById('permissionsMatrix');
    dom.permissionSearchInput = document.getElementById('permissionSearchInput');
    dom.selectAllBtn = document.getElementById('selectAllBtn');
    dom.clearAllBtn = document.getElementById('clearAllBtn');
    dom.saveAssignmentsBtn = document.getElementById('saveAssignmentsBtn');
    dom.refreshRoleAssignmentsBtn = document.getElementById('refreshRoleAssignmentsBtn');
    dom.assignedCount = document.getElementById('assignedCount');
    dom.availableCount = document.getElementById('availableCount');

    dom.catalogContainer = document.getElementById('catalogContainer');
    dom.catalogSearchInput = document.getElementById('catalogSearchInput');
    dom.catalogStatusFilter = document.getElementById('catalogStatusFilter');
    dom.refreshCatalogBtn = document.getElementById('refreshCatalogBtn');
    dom.addPermissionBtn = document.getElementById('addPermissionBtn');

    dom.permissionModal = document.getElementById('permissionModal');
    dom.permissionForm = document.getElementById('permissionForm');
    dom.permissionModalTitle = document.getElementById('permissionModalTitle');
    dom.permissionModalClose = document.getElementById('permissionModalClose');
    dom.permissionModalCancel = document.getElementById('permissionModalCancel');
    dom.permissionModalSubmit = document.getElementById('permissionModalSubmit');
    dom.permissionModule = document.getElementById('permissionModule');
    dom.permissionName = document.getElementById('permissionName');
    dom.permissionDescription = document.getElementById('permissionDescription');
    dom.permissionStatus = document.getElementById('permissionStatus');

    dom.confirmModal = document.getElementById('confirmModal');
    dom.confirmMessage = document.getElementById('confirmMessage');
    dom.confirmWarning = document.getElementById('confirmWarning');
    dom.confirmClose = document.getElementById('confirmModalClose');
    dom.confirmCancelBtn = document.getElementById('confirmCancelBtn');
    dom.confirmAcceptBtn = document.getElementById('confirmAcceptBtn');

    dom.detailsModal = document.getElementById('detailsModal');
    dom.detailsClose = document.getElementById('detailsModalClose');
    dom.detailsCode = document.getElementById('detailsCode');
    dom.detailsName = document.getElementById('detailsName');
    dom.detailsDescription = document.getElementById('detailsDescription');
    dom.detailsStatus = document.getElementById('detailsStatus');
    dom.detailsRoles = document.getElementById('detailsRoles');
    dom.detailsUsers = document.getElementById('detailsUsers');
    dom.detailsCreatedBy = document.getElementById('detailsCreatedBy');
    dom.detailsCreatedAt = document.getElementById('detailsCreatedAt');
    dom.detailsUpdated = document.getElementById('detailsUpdated');
    dom.detailsUpdatedBy = document.getElementById('detailsUpdatedBy');
    dom.detailsRoleList = document.getElementById('detailsRoleList');

    dom.toastContainer = document.getElementById('toastContainer');
}

function bindEvents() {
    if (dom.catalogSearchInput) {
        dom.catalogSearchInput.addEventListener('input', debounce(() => {
            state.filters.termino = dom.catalogSearchInput.value.trim();
            applyCatalogFilters();
            renderCatalog();
            renderPermissionsMatrix();
        }, 250));
    }

    if (dom.catalogStatusFilter) {
        dom.catalogStatusFilter.addEventListener('change', () => {
            state.filters.estado = dom.catalogStatusFilter.value;
            applyCatalogFilters();
            renderCatalog();
            renderPermissionsMatrix();
        });
    }

    if (dom.refreshCatalogBtn) {
        dom.refreshCatalogBtn.addEventListener('click', () => fetchAndRenderPermissions());
    }

    if (dom.addPermissionBtn) {
        dom.addPermissionBtn.addEventListener('click', () => openPermissionModal('create'));
    }

    if (dom.rolesList) {
        dom.rolesList.addEventListener('click', handleRoleListClick);
    }

    if (dom.roleSearchInput) {
        dom.roleSearchInput.addEventListener('input', debounce(() => {
            const query = dom.roleSearchInput.value.trim().toLowerCase();
            assignmentState.filteredRoles = assignmentState.roles.filter(rol =>
                rol.nombre.toLowerCase().includes(query)
            );
            renderRolesList();
        }, 200));
    }

    if (dom.permissionSearchInput) {
        dom.permissionSearchInput.addEventListener('input', debounce(() => {
            assignmentState.filterTerm = dom.permissionSearchInput.value.trim().toLowerCase();
            renderPermissionsMatrix();
        }, 200));
    }

    if (dom.permissionsMatrix) {
        dom.permissionsMatrix.addEventListener('change', handlePermissionToggle);
    }

    if (dom.selectAllBtn) {
        dom.selectAllBtn.addEventListener('click', selectAllVisiblePermissions);
    }

    if (dom.clearAllBtn) {
        dom.clearAllBtn.addEventListener('click', clearAllAssignments);
    }

    if (dom.saveAssignmentsBtn) {
        dom.saveAssignmentsBtn.addEventListener('click', saveAssignments);
    }

    if (dom.refreshRoleAssignmentsBtn) {
        dom.refreshRoleAssignmentsBtn.addEventListener('click', () => {
            if (assignmentState.selectedRoleId) {
                loadRoleAssignments(assignmentState.selectedRoleId);
            }
        });
    }

    if (dom.catalogContainer) {
        dom.catalogContainer.addEventListener('click', handleCatalogActionClick);
    }

    if (dom.permissionModalClose) {
        dom.permissionModalClose.addEventListener('click', closePermissionModal);
    }

    if (dom.permissionModalCancel) {
        dom.permissionModalCancel.addEventListener('click', closePermissionModal);
    }

    if (dom.permissionForm) {
        dom.permissionForm.addEventListener('submit', handlePermissionSubmit);
    }

    if (dom.confirmClose) {
        dom.confirmClose.addEventListener('click', closeConfirmModal);
    }

    if (dom.confirmCancelBtn) {
        dom.confirmCancelBtn.addEventListener('click', closeConfirmModal);
    }

    if (dom.confirmAcceptBtn) {
        dom.confirmAcceptBtn.addEventListener('click', executeDelete);
    }

    if (dom.detailsClose) {
        dom.detailsClose.addEventListener('click', closeDetailsModal);
    }

    // Audit timeline removed

    document.addEventListener('keydown', handleGlobalKeydown);

    [dom.permissionModal, dom.confirmModal, dom.detailsModal].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                if (modal === dom.permissionModal) {
                    closePermissionModal();
                } else if (modal === dom.confirmModal) {
                    closeConfirmModal();
                } else if (modal === dom.detailsModal) {
                    closeDetailsModal();
                }
            }
        });
    });
}

async function loadInitialData() {
    renderRolesPlaceholder('Cargando roles...');
    renderMatrixPlaceholder('Selecciona un rol para ver la matriz de permisos.');
    renderCatalogLoading();

    try {
        await Promise.all([
            fetchAndRenderPermissions(),
            loadRoles()
        ]);
    } catch (error) {
        showNotification(error?.message || 'No se pudieron cargar los datos iniciales', 'error');
    }
}

async function fetchAndRenderPermissions() {
    state.isLoading = true;
    renderCatalogLoading();

    try {
        const data = await fetchPermissionsFromApi();
        state.items = data.map(mapPermissionResponse);
        state.lastUpdated = new Date();
        state.error = null;

        assignmentState.modules = buildModulesIndex(state.items);
        applyCatalogFilters();
        renderCatalog();
        renderSummary();
        renderPermissionsMatrix();
        updateAssignmentSummary();
    } catch (error) {
        state.error = error.message || 'No se pudieron cargar los permisos';
        renderCatalogError(state.error);
        showNotification(state.error, 'error');
    } finally {
        state.isLoading = false;
    }
}

async function fetchPermissionsFromApi() {
    const response = await fetch(PERMISSIONS_API_URL, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const body = await tryParseJson(response);
        throw new Error(body?.message || body?.error || 'Error al obtener los permisos');
    }

    return response.json();
}

function mapPermissionResponse(rawPermiso) {
    const id = Number(rawPermiso?.id ?? rawPermiso?.idPermiso ?? rawPermiso?.id_permiso ?? rawPermiso?.permisoId);

    const nombre = getFirstNonEmpty(
        rawPermiso?.nombre,
        rawPermiso?.nombrePermiso,
        rawPermiso?.nombre_permiso,
        rawPermiso?.displayName,
        rawPermiso?.titulo
    );

    const codigo = getFirstNonEmpty(
        rawPermiso?.codigo,
        rawPermiso?.code,
        rawPermiso?.clave,
        rawPermiso?.identificador,
        rawPermiso?.slug
    ) || buildCodeFromName(nombre, id);

    const modulo = resolveModuleName(
        getFirstNonEmpty(
            rawPermiso?.modulo,
            rawPermiso?.module,
            rawPermiso?.moduloNombre,
            rawPermiso?.moduleName
        ),
        nombre || codigo
    );

    // Preserve original raw module string when available so we can detect submodules
    const rawModulo = getFirstNonEmpty(
        rawPermiso?.modulo,
        rawPermiso?.module,
        rawPermiso?.moduloNombre,
        rawPermiso?.moduleName
    ) || null;

    const descripcion = getFirstNonEmpty(
        rawPermiso?.descripcion,
        rawPermiso?.description,
        rawPermiso?.detalle
    ) || 'Sin descripción';

    const estado = (rawPermiso?.estado || rawPermiso?.status || 'ACTIVO').toUpperCase();

    const rolesAsignados = Array.isArray(rawPermiso?.rolesAsignados)
        ? rawPermiso.rolesAsignados
        : Array.isArray(rawPermiso?.roles)
            ? rawPermiso.roles.map((rol) => typeof rol === 'string' ? rol : rol?.nombre ?? rol?.nombreRol).filter(Boolean)
            : [];

    return {
        id: Number.isNaN(id) ? null : id,
        codigo,
        modulo,
        rawModulo,
        nombre: nombre || codigo || `Permiso #${id ?? ''}`,
        descripcion,
        estado,
        totalRoles: Number(rawPermiso?.totalRoles ?? rawPermiso?.rolesCount ?? rolesAsignados.length ?? 0),
        roles: rolesAsignados,
    totalUsuarios: Number(rawPermiso?.totalUsuarios ?? rawPermiso?.usuariosAsignados ?? 0),
    fechaCreacion: rawPermiso?.fechaCreacion ? new Date(rawPermiso.fechaCreacion) : rawPermiso?.fecha_creacion ? new Date(rawPermiso.fecha_creacion) : null,
    fechaActualizacion: rawPermiso?.fechaActualizacion ? new Date(rawPermiso.fechaActualizacion) : rawPermiso?.fecha_actualizacion ? new Date(rawPermiso.fecha_actualizacion) : null
    };
}

function buildModulesIndex(permisos) {
    const modules = new Map();
    permisos.forEach(permiso => {
        // Determine top-level module and optional submodule
        let topModule = permiso.modulo;
        let submodule = null;
        const raw = permiso.rawModulo || permiso.modulo || '';
        // split by common separators used to indicate submodules
        const parts = raw.split(/\s*[\\/\-:>]+\s*/).filter(Boolean);
        if (parts.length > 1) {
            topModule = toTitleCase(parts[0]);
            submodule = toTitleCase(parts.slice(1).join(' '));
        } else {
            // also try to derive submodule from module string that contains dot notation
            const dotParts = raw.split('.').map(s => s.trim()).filter(Boolean);
            if (dotParts.length > 1) {
                topModule = toTitleCase(dotParts[0]);
                submodule = toTitleCase(dotParts.slice(1).join(' '));
            } else {
                // fallback: keep resolved module
                topModule = resolveModuleName(permiso.modulo, permiso.nombre || permiso.codigo);
            }
        }
        permiso.modulo = topModule;
        permiso.submodule = submodule;
        // Exclude any auditoría/auditoria modules (case-insensitive)
        if (/auditor/i.test(topModule)) return;
        const list = modules.get(topModule) ?? [];
        list.push({ ...permiso });
        modules.set(topModule, list);
    });

    modules.forEach(list => {
        list.sort((a, b) => (a.nombre || a.codigo || '').localeCompare(b.nombre || b.codigo || '', 'es', { sensitivity: 'base' }));
    });

    return new Map([...modules.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es', { sensitivity: 'base' })));
}

function applyCatalogFilters() {
    const { estado, termino } = state.filters;
    const searchTerm = termino.trim().toLowerCase();

    state.filteredItems = state.items.filter(item => {
        const matchesEstado = estado === 'TODOS' || item.estado === estado;
        const matchesSearch = !searchTerm ||
            (item.codigo || '').toLowerCase().includes(searchTerm) ||
            (item.nombre || '').toLowerCase().includes(searchTerm) ||
            (item.descripcion || '').toLowerCase().includes(searchTerm) ||
            (item.modulo || '').toLowerCase().includes(searchTerm);
        return matchesEstado && matchesSearch;
    });
}

function renderCatalogLoading() {
    if (!dom.catalogContainer) return;
    dom.catalogContainer.innerHTML = `
        <div class="catalog-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando permisos...</span>
        </div>
    `;
}

function renderCatalogError(message) {
    if (!dom.catalogContainer) return;
    dom.catalogContainer.innerHTML = `
        <div class="catalog-placeholder">
            <i class="fas fa-triangle-exclamation"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
}

function renderCatalog() {
    if (!dom.catalogContainer) return;

    if (!state.filteredItems.length) {
        dom.catalogContainer.innerHTML = `
            <div class="catalog-placeholder">
                <i class="fas fa-circle-info"></i>
                <span>No se encontraron permisos con los filtros actuales.</span>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    const modules = buildModulesIndex(state.filteredItems);

    modules.forEach((permisos, moduleName) => {
        const activos = permisos.filter(p => p.estado === 'ACTIVO').length;
        const submodules = [...new Set(permisos.map(p => p.submodule).filter(Boolean))];
        const moduleCard = document.createElement('section');
        moduleCard.className = 'catalog-module';
        moduleCard.innerHTML = `
            <header class="catalog-module-header">
                <div>
                    <h4 class="catalog-module-title">${escapeHtml(moduleName)}</h4>
                    <p class="catalog-module-subtitle">${permisos.length} ${permisos.length === 1 ? 'permiso' : 'permisos'} en este módulo${submodules.length ? ' • Submódulos: ' + escapeHtml(submodules.join(', ')) : ''}</p>
                </div>
                <span class="catalog-module-counter">${activos}/${permisos.length} activos</span>
            </header>
        `;

        const moduleBody = document.createElement('div');
        moduleBody.className = 'catalog-module-body';

        permisos.forEach(permiso => {
            const displayName = permiso.nombre && permiso.nombre.trim() !== ''
                ? permiso.nombre
                : permiso.codigo || `Permiso #${permiso.id ?? ''}`;
            const isActive = permiso.estado === 'ACTIVO';

            const row = document.createElement('article');
            row.className = 'catalog-permission';
            row.dataset.permissionId = permiso.id;

            const codigo = permiso.codigo || (permiso.id != null ? `ID-${permiso.id}` : 'Sin código');

            row.innerHTML = `
                <div class="catalog-permission-info">
                    <div class="catalog-permission-heading">
                        <h5>${escapeHtml(displayName)}</h5>
                        <span class="catalog-permission-code">${escapeHtml(codigo)}</span>
                    </div>
                    <p class="catalog-permission-description">${escapeHtml(permiso.descripcion)}</p>
                    <div class="catalog-permission-badges">
                        <span class="badge badge-status ${isActive ? '' : 'inactive'}">${isActive ? 'Activo' : 'Inactivo'}</span>
                        <span class="badge badge-assignment"><i class="fas fa-user-shield"></i> ${permiso.totalRoles} roles</span>
                        <span class="badge badge-assignment"><i class="fas fa-user-check"></i> ${permiso.totalUsuarios} directos</span>
                    </div>
                </div>
                <div class="catalog-permission-actions">
                    <button type="button" class="btn btn-light" data-action="view" title="Ver detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-light" data-action="edit" title="Editar">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="btn btn-danger" data-action="delete" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            moduleBody.appendChild(row);
        });

        moduleCard.appendChild(moduleBody);
        fragment.appendChild(moduleCard);
    });

    dom.catalogContainer.innerHTML = '';
    dom.catalogContainer.appendChild(fragment);
}

function renderSummary() {
    if (!dom.summaryTotal || !dom.summaryActive || !dom.summaryInactive || !dom.summaryUpdated) return;

    const total = state.items.length;
    const activos = state.items.filter(item => item.estado === 'ACTIVO').length;
    const inactivos = total - activos;

    dom.summaryTotal.textContent = total;
    dom.summaryActive.textContent = activos;
    dom.summaryInactive.textContent = inactivos;
    dom.summaryUpdated.textContent = state.lastUpdated ? formatDateTime(state.lastUpdated) : '—';

    if (dom.availableCount) {
        dom.availableCount.textContent = String(activos);
    }
}

async function loadRoles() {
    assignmentState.isLoadingRoles = true;
    try {
        const response = await fetch(ROLES_API_URL, {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            const body = await tryParseJson(response);
            throw new Error(body?.message || 'No se pudieron obtener los roles');
        }

        const roles = await response.json();
        assignmentState.roles = roles.map(rol => ({
            id: Number(rol.idRol ?? rol.id ?? rol.id_rol ?? rol.idRole),
            nombre: String(rol.nombreRol ?? rol.nombre ?? rol.descripcion ?? 'Rol sin nombre'),
            descripcion: rol.descripcion ?? ''
        })).filter(rol => !Number.isNaN(rol.id));

        assignmentState.roles.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
        assignmentState.filteredRoles = [...assignmentState.roles];
        renderRolesList();
    } catch (error) {
        renderRolesPlaceholder(error?.message || 'No se pudieron cargar los roles');
        throw error;
    } finally {
        assignmentState.isLoadingRoles = false;
    }
}

function renderRolesPlaceholder(message) {
    if (!dom.rolesList) return;
    dom.rolesList.innerHTML = `
        <div class="list-placeholder">
            <i class="fas fa-circle-info"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
    if (dom.rolesCount) dom.rolesCount.textContent = '0';
}

function renderRolesList() {
    if (!dom.rolesList) return;

    if (!assignmentState.filteredRoles.length) {
        renderRolesPlaceholder('No se encontraron roles con ese criterio.');
        return;
    }

    const fragment = document.createDocumentFragment();
    assignmentState.filteredRoles.forEach(rol => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'role-card';
        button.dataset.roleId = String(rol.id);

        if (assignmentState.selectedRoleId === rol.id) {
            button.classList.add('is-active');
        }

        button.innerHTML = `
            <span>${escapeHtml(rol.nombre)}</span>
            ${rol.descripcion ? `<small>${escapeHtml(rol.descripcion)}</small>` : ''}
        `;
        fragment.appendChild(button);
    });

    dom.rolesList.innerHTML = '';
    dom.rolesList.appendChild(fragment);
    if (dom.rolesCount) dom.rolesCount.textContent = String(assignmentState.filteredRoles.length);
}

function handleRoleListClick(event) {
    const button = event.target.closest('button.role-card');
    if (!button) return;
    const roleId = Number(button.dataset.roleId);
    if (Number.isNaN(roleId)) return;
    if (assignmentState.selectedRoleId === roleId && !assignmentState.isLoadingAssignments) return;
    selectRole(roleId);
}

async function selectRole(roleId) {
    assignmentState.selectedRoleId = roleId;
    const rol = assignmentState.roles.find(r => r.id === roleId);
    assignmentState.selectedRoleName = rol?.nombre ?? 'Rol seleccionado';
    assignmentState.selectedRoleDescription = rol?.descripcion ?? '';

    if (dom.selectedRoleName) dom.selectedRoleName.textContent = assignmentState.selectedRoleName;
    if (dom.selectedRoleDescription) {
        dom.selectedRoleDescription.textContent = assignmentState.selectedRoleDescription
            ? assignmentState.selectedRoleDescription
            : 'Activa o desactiva los permisos disponibles para este rol.';
    }

    renderRolesList();
    assignmentState.assignments = new Set();
    assignmentState.originalAssignments = new Set();
    assignmentState.dirty = false;
    setAssignmentControlsState();
    renderMatrixPlaceholder('Cargando permisos asignados...', 'fas fa-spinner fa-spin');

    await loadRoleAssignments(roleId);
}

async function loadRoleAssignments(roleId) {
    assignmentState.isLoadingAssignments = true;
    setAssignmentControlsState();

    let loadSucceeded = false;

    try {
        const response = await fetch(ROLE_PERMISSIONS_URL(roleId), {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            const body = await tryParseJson(response);
            throw new Error(body?.message || 'No se pudieron cargar los permisos del rol');
        }

        const data = await response.json();
        const permisosAsignados = Array.isArray(data.permisos) ? data.permisos : [];
        assignmentState.assignments = new Set(permisosAsignados.map(p => Number(p.id ?? p.idPermiso ?? p.id_permiso)));
        assignmentState.originalAssignments = new Set(assignmentState.assignments);

        if (data.rolNombre) {
            assignmentState.selectedRoleName = data.rolNombre;
            if (dom.selectedRoleName) dom.selectedRoleName.textContent = assignmentState.selectedRoleName;
        }

        assignmentState.dirty = false;
        loadSucceeded = true;
    } catch (error) {
        renderMatrixPlaceholder(error?.message || 'No se pudieron cargar los permisos asignados.');
        showNotification(error?.message || 'No se pudieron cargar los permisos del rol', 'error');
    } finally {
        assignmentState.isLoadingAssignments = false;
        setAssignmentControlsState();
        if (loadSucceeded) {
            renderPermissionsMatrix();
            updateAssignmentSummary();
        }
    }
}

function renderMatrixPlaceholder(message, iconClass = 'fas fa-layer-group') {
    if (!dom.permissionsMatrix) return;
    dom.permissionsMatrix.innerHTML = `
        <div class="matrix-placeholder">
            <i class="${iconClass}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;
}

function renderPermissionsMatrix() {
    if (!dom.permissionsMatrix) return;

    if (!assignmentState.selectedRoleId) {
        renderMatrixPlaceholder('Selecciona un rol para visualizar su matriz de permisos.');
        setAssignmentControlsState();
        return;
    }

    if (assignmentState.isLoadingAssignments) {
        renderMatrixPlaceholder('Cargando permisos asignados...', 'fas fa-spinner fa-spin');
        return;
    }

    const modules = assignmentState.modules;
    const filter = assignmentState.filterTerm;
    let renderedModules = 0;

    const container = document.createElement('div');
    container.className = 'modules-container';

    modules.forEach((permisos, moduleName) => {
        const filtered = permisos.filter(permiso => {
            if (!filter) return true;
            const name = (permiso.nombre || '').toLowerCase();
            const code = (permiso.codigo || '').toLowerCase();
            const description = (permiso.descripcion || '').toLowerCase();
            return name.includes(filter) || code.includes(filter) || description.includes(filter);
        });

        if (!filtered.length) return;

        renderedModules += 1;
        const totalAsignados = permisos.filter(p => assignmentState.assignments.has(p.id)).length;
        const totalAsignables = permisos.filter(p => p.estado === 'ACTIVO').length;
        const totalAsignadosActivos = permisos.filter(p => p.estado === 'ACTIVO' && assignmentState.assignments.has(p.id)).length;
        const moduleCard = document.createElement('article');
        moduleCard.className = 'module-card';

        const header = document.createElement('div');
        header.className = 'module-card-header';

        const headingWrap = document.createElement('div');
        headingWrap.className = 'module-heading';

        const titleEl = document.createElement('h4');
        titleEl.className = 'module-title';
        titleEl.textContent = moduleName;
        headingWrap.appendChild(titleEl);

        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'module-select-toggle';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.className = 'module-toggle';
        toggleInput.dataset.module = moduleName;
        toggleInput.title = 'Seleccionar todo el módulo';
        if (totalAsignables === 0) {
            toggleInput.disabled = true;
        } else {
            const allSelected = totalAsignadosActivos === totalAsignables;
            const someSelected = totalAsignadosActivos > 0 && totalAsignadosActivos < totalAsignables;
            toggleInput.checked = allSelected;
            toggleInput.indeterminate = !allSelected && someSelected;
        }

        toggleLabel.appendChild(toggleInput);
        headingWrap.appendChild(toggleLabel);

        const counterEl = document.createElement('span');
        counterEl.className = 'module-counter';
        counterEl.textContent = `${totalAsignados}/${permisos.length} asignados`;

        header.appendChild(headingWrap);
        header.appendChild(counterEl);
        moduleCard.appendChild(header);

        const moduleList = document.createElement('div');
        moduleList.className = 'module-permissions';

        // Group visible permissions by submodule (preserve order: submodule '' first)
        const grouped = filtered.reduce((acc, p) => {
            const key = p.submodule || '';
            if (!acc[key]) acc[key] = [];
            acc[key].push(p);
            return acc;
        }, {});

        Object.keys(grouped).forEach(subKey => {
            const group = grouped[subKey];
            if (subKey) {
                const subHeader = document.createElement('div');
                subHeader.className = 'submodule-header';
                subHeader.textContent = subKey;
                moduleList.appendChild(subHeader);
            }

            group.forEach(permiso => {
            const isActive = assignmentState.assignments.has(permiso.id);
            const isDisabled = permiso.estado !== 'ACTIVO';
            const chipName = permiso.nombre || permiso.codigo || `Permiso #${permiso.id ?? ''}`;
            const chipCode = permiso.codigo || (permiso.id != null ? `ID-${permiso.id}` : 'Sin código');

            const chip = document.createElement('label');
            chip.className = 'permission-chip';
            if (isActive) chip.classList.add('is-active');
            if (isDisabled) chip.classList.add('is-disabled');

            chip.innerHTML = `
                <input type="checkbox" class="permission-toggle" data-permission-id="${permiso.id}" ${isActive ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                <div class="chip-info">
                    <span class="chip-name">${escapeHtml(chipName)}</span>
                    <span class="chip-code">${escapeHtml(chipCode)}</span>
                    ${isDisabled ? '<span class="chip-state">Inactivo - no asignable</span>' : ''}
                </div>
            `;

            moduleList.appendChild(chip);
            });
        });

        moduleCard.appendChild(moduleList);
        container.appendChild(moduleCard);
    });

    if (!renderedModules) {
        const message = filter
            ? 'No se encontraron permisos que coincidan con el filtro aplicado.'
            : 'No hay permisos disponibles para asignar.';
        renderMatrixPlaceholder(message);
        setAssignmentControlsState();
        return;
    }

    dom.permissionsMatrix.innerHTML = '';
    dom.permissionsMatrix.appendChild(container);

    container.querySelectorAll('.module-toggle').forEach(toggle => {
        toggle.addEventListener('change', handleModuleSelectToggle);
    });
    updateAssignmentSummary();
    setAssignmentControlsState();
}

function handlePermissionToggle(event) {
    const checkbox = event.target.closest('input.permission-toggle');
    if (!checkbox) return;
    const permissionId = Number(checkbox.dataset.permissionId);
    if (Number.isNaN(permissionId)) return;

    if (checkbox.checked) {
        assignmentState.assignments.add(permissionId);
        checkbox.closest('.permission-chip')?.classList.add('is-active');
    } else {
        assignmentState.assignments.delete(permissionId);
        checkbox.closest('.permission-chip')?.classList.remove('is-active');
    }

    assignmentState.dirty = !areSetsEqual(assignmentState.assignments, assignmentState.originalAssignments);
    updateAssignmentSummary();
    setAssignmentControlsState();
}

function handleModuleSelectToggle(event) {
    const checkbox = event.target;
    const moduleName = checkbox.dataset.module;
    if (!moduleName) {
        return;
    }

    const permisos = assignmentState.modules.get(moduleName);
    if (!Array.isArray(permisos)) {
        return;
    }

    const shouldAssign = checkbox.checked;

    permisos.forEach(permiso => {
        if (permiso.estado !== 'ACTIVO') {
            return;
        }
        const permissionId = permiso.id;
        if (permissionId == null) {
            return;
        }
        if (shouldAssign) {
            assignmentState.assignments.add(permissionId);
        } else {
            assignmentState.assignments.delete(permissionId);
        }
    });

    assignmentState.dirty = !areSetsEqual(assignmentState.assignments, assignmentState.originalAssignments);
    updateAssignmentSummary();
    setAssignmentControlsState();
    renderPermissionsMatrix();
}

function selectAllVisiblePermissions() {
    if (!dom.permissionsMatrix) return;
    const checkboxes = dom.permissionsMatrix.querySelectorAll('input.permission-toggle:not(:disabled)');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const permissionId = Number(checkbox.dataset.permissionId);
        if (!Number.isNaN(permissionId)) assignmentState.assignments.add(permissionId);
        checkbox.closest('.permission-chip')?.classList.add('is-active');
    });
    assignmentState.dirty = !areSetsEqual(assignmentState.assignments, assignmentState.originalAssignments);
    updateAssignmentSummary();
    setAssignmentControlsState();
    renderPermissionsMatrix();
}

function clearAllAssignments() {
    if (!dom.permissionsMatrix) return;
    const checkboxes = dom.permissionsMatrix.querySelectorAll('input.permission-toggle:not(:disabled)');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        const permissionId = Number(checkbox.dataset.permissionId);
        if (!Number.isNaN(permissionId)) assignmentState.assignments.delete(permissionId);
        checkbox.closest('.permission-chip')?.classList.remove('is-active');
    });
    assignmentState.dirty = !areSetsEqual(assignmentState.assignments, assignmentState.originalAssignments);
    updateAssignmentSummary();
    setAssignmentControlsState();
    renderPermissionsMatrix();
}

async function saveAssignments() {
    if (!assignmentState.selectedRoleId) {
        showNotification('Selecciona un rol antes de guardar.', 'warning');
        return;
    }

    if (assignmentState.isSaving) return;
    assignmentState.isSaving = true;
    toggleButtonLoading(dom.saveAssignmentsBtn, true);

    try {
        // Filter assignment IDs to valid permiso ids that are present in state.items
        const validIds = Array.from(assignmentState.assignments)
            .map(id => Number(id))
            .filter(id => !Number.isNaN(id))
            .filter(id => {
                const item = state.items.find(it => Number(it.id) === id);
                return item && !/auditor/i.test(String(item.modulo || ''));
            });
        const payload = { permisoIds: validIds };
        const response = await fetch(ROLE_PERMISSIONS_URL(assignmentState.selectedRoleId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const body = await tryParseJson(response);
            throw new Error(body?.message || 'No se pudieron guardar las asignaciones');
        }

        const data = await response.json();
        assignmentState.assignments = new Set((data.permisos || []).map(p => Number(p.id ?? p.idPermiso ?? p.id_permiso)));
        assignmentState.originalAssignments = new Set(assignmentState.assignments);
        assignmentState.dirty = false;
        renderPermissionsMatrix();
        updateAssignmentSummary();
        setAssignmentControlsState();
        showNotification('Asignaciones actualizadas correctamente.', 'success');
    } catch (error) {
        showNotification(error?.message || 'No se pudieron guardar las asignaciones', 'error');
    } finally {
        assignmentState.isSaving = false;
        toggleButtonLoading(dom.saveAssignmentsBtn, false);
    }
}

function updateAssignmentSummary() {
    if (dom.assignedCount) {
        const totalAsignados = state.items.filter(item => assignmentState.assignments.has(item.id)).length;
        dom.assignedCount.textContent = String(totalAsignados);
    }

    if (dom.availableCount) {
        const totalDisponibles = state.items.filter(item => item.estado === 'ACTIVO').length;
        dom.availableCount.textContent = String(totalDisponibles);
    }
}

function setAssignmentControlsState() {
    const hasRole = Boolean(assignmentState.selectedRoleId);
    const isBusy = assignmentState.isLoadingAssignments || assignmentState.isSaving;
    const hasVisiblePermissions = dom.permissionsMatrix && !!dom.permissionsMatrix.querySelector('input.permission-toggle');

    if (dom.saveAssignmentsBtn) {
        dom.saveAssignmentsBtn.disabled = !hasRole || isBusy || !assignmentState.dirty;
    }
    if (dom.selectAllBtn) {
        dom.selectAllBtn.disabled = !hasRole || isBusy || !hasVisiblePermissions;
    }
    if (dom.clearAllBtn) {
        dom.clearAllBtn.disabled = !hasRole || isBusy || !hasVisiblePermissions;
    }
    if (dom.refreshRoleAssignmentsBtn) {
        dom.refreshRoleAssignmentsBtn.disabled = !hasRole || isBusy;
    }
}

function areSetsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const value of a) {
        if (!b.has(value)) return false;
    }
    return true;
}

function handleCatalogActionClick(event) {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;
    const card = actionBtn.closest('[data-permission-id]');
    if (!card) return;
    const permissionId = Number(card.dataset.permissionId);
    const permiso = state.items.find(item => item.id === permissionId);
    if (!permiso) {
        showNotification('No se encontró la información del permiso seleccionado.', 'error');
        return;
    }

    const action = actionBtn.dataset.action;
    switch (action) {
    case 'view':
        openDetailsModal(permissionId);
        break;
    case 'edit':
        openPermissionModal('edit', permiso);
        break;
    case 'delete':
        openConfirmModal(permiso);
        break;
    default:
        break;
    }
}

function openPermissionModal(mode, permiso = null) {
    if (!dom.permissionModal) return;

    state.currentPermissionId = permiso?.id ?? null;
    dom.permissionModal.dataset.mode = mode;

    if (mode === 'edit' && permiso) {
    dom.permissionModalTitle.textContent = 'Editar permiso';
    if (dom.permissionModule) {
        dom.permissionModule.value = permiso.modulo || '';
    }
    dom.permissionName.value = permiso.nombre || '';
        dom.permissionDescription.value = permiso.descripcion === 'Sin descripción' ? '' : permiso.descripcion;
        dom.permissionStatus.value = permiso.estado || 'ACTIVO';
    } else {
        dom.permissionModalTitle.textContent = 'Nuevo permiso';
        dom.permissionForm.reset();
        dom.permissionStatus.value = 'ACTIVO';
    }

    dom.permissionModal.setAttribute('aria-hidden', 'false');
    dom.permissionModal.classList.add('is-open');
    document.body.classList.add('modal-open');
    (dom.permissionModule || dom.permissionName)?.focus();
}

function closePermissionModal() {
    if (!dom.permissionModal) return;
    dom.permissionModal.setAttribute('aria-hidden', 'true');
    dom.permissionModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    dom.permissionForm?.reset();
    state.currentPermissionId = null;
}

async function handlePermissionSubmit(event) {
    event.preventDefault();
    if (!dom.permissionForm) return;

    const payload = {
        modulo: dom.permissionModule.value.trim(),
        nombre: dom.permissionName.value.trim(),
        descripcion: dom.permissionDescription.value.trim() || null,
        estado: dom.permissionStatus.value || 'ACTIVO'
    };

    if (!payload.modulo || !payload.nombre) {
        showNotification('Completa el módulo y el nombre del permiso.', 'warning');
        return;
    }

    payload.modulo = toTitleCase(payload.modulo);

    toggleButtonLoading(dom.permissionModalSubmit, true);

    try {
        const method = dom.permissionModal.dataset.mode === 'edit' ? 'PUT' : 'POST';
        const url = method === 'PUT'
            ? `${PERMISSIONS_API_URL}/${state.currentPermissionId}`
            : PERMISSIONS_API_URL;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const body = await tryParseJson(response);
            throw new Error(body?.message || 'No se pudo guardar el permiso');
        }

        showNotification('Permiso guardado correctamente.', 'success');
        closePermissionModal();
        await fetchAndRenderPermissions();
    } catch (error) {
        showNotification(error.message || 'No se pudo guardar el permiso', 'error');
    } finally {
        toggleButtonLoading(dom.permissionModalSubmit, false);
    }
}

function openConfirmModal(permiso) {
    if (!dom.confirmModal) return;

    state.deleteTarget = permiso;
    const confirmName = permiso.nombre && permiso.nombre.trim() !== '' ? permiso.nombre : permiso.codigo;
    if (dom.confirmMessage) {
        dom.confirmMessage.textContent = `¿Quieres eliminar el permiso "${confirmName}"?`;
    }

    const bloqueado = (permiso.totalRoles ?? 0) > 0 || (permiso.totalUsuarios ?? 0) > 0;
    if (dom.confirmWarning) {
        dom.confirmWarning.textContent = bloqueado
            ? 'No se puede eliminar porque está asignado a roles o usuarios.'
            : 'Esta acción no se puede deshacer.';
    }
    if (dom.confirmAcceptBtn) {
        dom.confirmAcceptBtn.disabled = bloqueado;
    }

    dom.confirmModal.setAttribute('aria-hidden', 'false');
    dom.confirmModal.classList.add('is-open');
    document.body.classList.add('modal-open');
}

function closeConfirmModal() {
    if (!dom.confirmModal) return;
    dom.confirmModal.setAttribute('aria-hidden', 'true');
    dom.confirmModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    state.deleteTarget = null;
}

async function executeDelete() {
    if (!state.deleteTarget) return;

    toggleButtonLoading(dom.confirmAcceptBtn, true);

    try {
        const url = `${PERMISSIONS_API_URL}/${state.deleteTarget.id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const body = await tryParseJson(response);
            throw new Error(body?.message || 'No se pudo eliminar el permiso');
        }

        showNotification('Permiso eliminado.', 'success');
        closeConfirmModal();
        await fetchAndRenderPermissions();
    } catch (error) {
        showNotification(error.message || 'No se pudo eliminar el permiso', 'error');
    } finally {
        toggleButtonLoading(dom.confirmAcceptBtn, false);
    }
}

async function openDetailsModal(permissionId) {
    if (!dom.detailsModal) return;

    dom.detailsModal.setAttribute('aria-hidden', 'false');
    dom.detailsModal.classList.add('is-open');
    document.body.classList.add('modal-open');

    state.detailsId = permissionId;
    renderDetailsSkeleton();

    try {
        const permiso = await fetchPermissionDetails(permissionId);
        renderDetails(permiso);
    } catch (error) {
        showNotification(error.message || 'No se pudo cargar el detalle del permiso', 'error');
        renderDetailsSkeleton();
    }
}

function closeDetailsModal() {
    if (!dom.detailsModal) return;
    dom.detailsModal.setAttribute('aria-hidden', 'true');
    dom.detailsModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    state.detailsId = null;
}

async function fetchPermissionDetails(id) {
    const response = await fetch(`${PERMISSIONS_API_URL}/${id}`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
    });

    if (!response.ok) {
        const body = await tryParseJson(response);
        throw new Error(body?.message || 'No se encontró el permiso seleccionado');
    }

    const data = await response.json();
    return mapPermissionResponse(data);
}

async function loadAuditTimeline(permissionId) {
    // audit timeline removed
}

function renderDetailsSkeleton() {
    if (!dom.detailsName) return;
    dom.detailsCode.textContent = '...';
    dom.detailsName.textContent = 'Cargando';
    dom.detailsDescription.textContent = 'Obteniendo información del permiso';
    dom.detailsStatus.textContent = '...';
    dom.detailsStatus.className = 'status-badge';
    dom.detailsRoles.textContent = '—';
    dom.detailsUsers.textContent = '—';
    dom.detailsCreatedBy.textContent = '—';
    dom.detailsCreatedAt.textContent = '—';
    dom.detailsUpdated.textContent = '—';
    dom.detailsUpdatedBy.textContent = '—';
    if (dom.detailsRoleList) {
        dom.detailsRoleList.innerHTML = '<span class="roles-list-empty">Cargando roles...</span>';
    }
    // audit timeline removed
}

function renderDetails(permiso) {
    const codigo = permiso.codigo || (permiso.id != null ? `ID-${permiso.id}` : null);
    const modulo = permiso.modulo || DEFAULT_MODULE_NAME;
    if (dom.detailsCode) {
        dom.detailsCode.textContent = modulo;
        if (codigo) {
            dom.detailsCode.title = `Código: ${codigo}`;
        } else {
            dom.detailsCode.removeAttribute('title');
        }
    }
    dom.detailsName.textContent = permiso.nombre;
    const descripcionTexto = permiso.descripcion && permiso.descripcion !== 'Sin descripción'
        ? permiso.descripcion
        : 'Sin descripción';
    if (codigo) {
        dom.detailsDescription.innerHTML = `${escapeHtml(descripcionTexto)} <span class="details-inline-code">${escapeHtml(codigo)}</span>`;
    } else {
        dom.detailsDescription.textContent = descripcionTexto;
    }
    dom.detailsStatus.textContent = permiso.estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
    dom.detailsStatus.className = `status-badge ${permiso.estado === 'ACTIVO' ? 'status-active' : 'status-inactive'}`;
    dom.detailsRoles.textContent = permiso.totalRoles ?? 0;
    dom.detailsUsers.textContent = permiso.totalUsuarios ?? 0;
    dom.detailsCreatedBy.textContent = '—';
    dom.detailsCreatedAt.textContent = permiso.fechaCreacion ? formatDateTime(permiso.fechaCreacion) : '—';
    dom.detailsUpdated.textContent = permiso.fechaActualizacion ? formatDateTime(permiso.fechaActualizacion) : '—';
    dom.detailsUpdatedBy.textContent = '—';
    if (dom.detailsRoleList) {
        if (permiso.roles.length) {
            dom.detailsRoleList.innerHTML = permiso.roles
                .map(rol => `<span class="role-chip">${escapeHtml(rol)}</span>`)
                .join('');
        } else {
            dom.detailsRoleList.innerHTML = '<span class="roles-list-empty">Sin roles asignados</span>';
        }
    }
}

// audit rendering removed

function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
        if (dom.permissionModal?.classList.contains('is-open')) closePermissionModal();
        if (dom.confirmModal?.classList.contains('is-open')) closeConfirmModal();
        if (dom.detailsModal?.classList.contains('is-open')) closeDetailsModal();
    }
}

function formatDateTime(value) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function debounce(fn, delay = 250) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(null, args), delay);
    };
}

function toggleButtonLoading(button, isLoading) {
    if (!button) return;
    button.disabled = Boolean(isLoading);
    button.classList.toggle('is-loading', Boolean(isLoading));
}

async function tryParseJson(response) {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}

function getFirstNonEmpty(...values) {
    for (const value of values) {
        if (value == null) continue;
        const trimmed = String(value).trim();
        if (trimmed) return trimmed;
    }
    return '';
}

function buildCodeFromName(nombre, id) {
    if (!nombre && !id) return '';
    if (nombre) {
        const slug = nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '.')
            .replace(/(^\.|\.$)/g, '');
        if (slug) {
            return slug;
        }
    }
    return id != null ? `perm.${id}` : '';
}

function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showNotification(message, type = 'info') {
    if (!dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button type="button" class="toast-close" aria-label="Cerrar notificación">
            <i class="fas fa-times"></i>
        </button>
    `;

    const close = () => {
        toast.classList.add('is-hiding');
        setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector('.toast-close').addEventListener('click', close);
    dom.toastContainer.appendChild(toast);
    setTimeout(close, 5000);
}
