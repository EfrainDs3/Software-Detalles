// permisos.js - Módulo para la gestión dinámica de permisos

const PERMISSIONS_API_URL = '/api/permisos';
const PERMISSIONS_AUDIT_URL = '/api/permisos/auditoria';

const state = {
    items: [],
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

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    bindEvents();
    fetchAndRenderPermissions();
});

function cacheDom() {
    dom.catalogContainer = document.getElementById('catalogContainer');
    dom.catalogSearchInput = document.getElementById('catalogSearchInput');
    dom.catalogStatusFilter = document.getElementById('catalogStatusFilter');
    dom.refreshCatalogBtn = document.getElementById('refreshCatalogBtn');
    dom.addPermissionBtn = document.getElementById('addPermissionBtn');
    dom.summaryTotal = document.getElementById('totalPermits');
    dom.summaryActive = document.getElementById('activePermits');
    dom.summaryInactive = document.getElementById('inactivePermits');
    dom.summaryUpdated = document.getElementById('lastUpdated');

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
    dom.auditTimeline = document.getElementById('auditTimeline');
    dom.refreshAuditBtn = document.getElementById('refreshAuditBtn');

    dom.toastContainer = document.getElementById('toastContainer');
}

function bindEvents() {
    if (dom.catalogSearchInput) {
        dom.catalogSearchInput.addEventListener('input', debounce(() => {
            state.filters.termino = dom.catalogSearchInput.value.trim();
            fetchAndRenderPermissions();
        }, 300));
    }

    if (dom.catalogStatusFilter) {
        dom.catalogStatusFilter.addEventListener('change', () => {
            state.filters.estado = dom.catalogStatusFilter.value;
            fetchAndRenderPermissions();
        });
    }

    if (dom.refreshCatalogBtn) {
        dom.refreshCatalogBtn.addEventListener('click', () => fetchAndRenderPermissions());
    }

    if (dom.addPermissionBtn) {
        dom.addPermissionBtn.addEventListener('click', () => openPermissionModal('create'));
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

    if (dom.refreshAuditBtn) {
        dom.refreshAuditBtn.addEventListener('click', () => {
            if (state.detailsId != null) {
                loadAuditTimeline(state.detailsId);
            }
        });
    }

    if (dom.catalogContainer) {
        dom.catalogContainer.addEventListener('click', handleCatalogClick);
    }

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

async function fetchAndRenderPermissions() {
    state.isLoading = true;
    renderLoadingState();
    try {
        const data = await fetchPermissionsFromApi();
        state.items = data.map(mapPermissionResponse);
        state.error = null;
        state.lastUpdated = new Date();
        renderPermissions();
        renderSummary();
    } catch (error) {
        state.error = error.message || 'No se pudieron cargar los permisos';
        renderErrorState();
        showNotification(state.error, 'error');
    } finally {
        state.isLoading = false;
    }
}

async function fetchPermissionsFromApi() {
    const params = new URLSearchParams();
    if (state.filters.estado && state.filters.estado !== 'TODOS') {
        params.append('estado', state.filters.estado);
    }
    if (state.filters.termino) {
        params.append('termino', state.filters.termino);
    }

    const url = params.toString()
        ? `${PERMISSIONS_API_URL}?${params.toString()}`
        : PERMISSIONS_API_URL;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        const body = await tryParseJson(response);
        const message = body?.message || body?.error || 'Error al cargar los permisos';
        throw new Error(message);
    }

    return response.json();
}

function mapPermissionResponse(permiso) {
    const id = permiso.id ?? permiso.idPermiso ?? null;
    const modulo = permiso.modulo ?? permiso.module ?? 'GENERAL';
    const nombre = permiso.nombre ?? permiso.nombrePermiso ?? `Permiso ${formatId(id)}`;
    const descripcion = permiso.descripcion ?? permiso.detalle ?? '';
    const estado = (permiso.estado ?? 'ACTIVO').toUpperCase();
    const rolesAsignados = Array.isArray(permiso.rolesAsignados) ? permiso.rolesAsignados : [];

    return {
        id,
        modulo,
        codigo: permiso.codigo ?? buildPermissionCode(modulo, nombre, id),
        nombre,
        descripcion,
        estado,
        totalRoles: Number(permiso.totalRoles ?? rolesAsignados.length ?? 0),
        roles: rolesAsignados,
        totalUsuarios: Number(permiso.totalUsuarios ?? 0),
        creadoPor: permiso.creadoPor,
        fechaCreacion: permiso.fechaCreacion ? new Date(permiso.fechaCreacion) : null,
        actualizadoPor: permiso.actualizadoPor,
        fechaActualizacion: permiso.fechaActualizacion ? new Date(permiso.fechaActualizacion) : null
    };
}

function renderLoadingState() {
    if (!dom.catalogContainer) return;
    dom.catalogContainer.innerHTML = `
        <div class="catalog-placeholder">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando permisos...</span>
        </div>
    `;
}

function renderErrorState() {
    if (!dom.catalogContainer) return;
    dom.catalogContainer.innerHTML = `
        <div class="catalog-placeholder">
            <i class="fas fa-triangle-exclamation"></i>
            <span>${escapeHtml(state.error || 'Error al cargar los permisos')}</span>
        </div>
    `;
    renderSummary();
}

function renderPermissions() {
    if (!dom.catalogContainer) return;

    if (!state.items.length) {
        dom.catalogContainer.innerHTML = `
            <div class="catalog-placeholder">
                <i class="fas fa-inbox"></i>
                <span>No se encontraron permisos con los filtros actuales</span>
            </div>
        `;
        return;
    }

    const grouped = state.items.reduce((acc, permiso) => {
        const key = permiso.modulo || 'GENERAL';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(permiso);
        return acc;
    }, {});

    const fragment = document.createDocumentFragment();
    const modules = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    modules.forEach((moduleName) => {
        const permisos = grouped[moduleName].slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
        const section = document.createElement('section');
        section.className = 'catalog-module';
        section.dataset.module = moduleName;

        const moduleCountLabel = `${permisos.length} ${permisos.length === 1 ? 'permiso' : 'permisos'}`;
        section.innerHTML = `
            <div class="catalog-module-header">
                <div>
                    <h4 class="catalog-module-title">${escapeHtml(moduleName)}</h4>
                    <p class="catalog-module-subtitle">Permisos registrados para este módulo.</p>
                </div>
                <span class="catalog-module-counter">${moduleCountLabel}</span>
            </div>
        `;

        const body = document.createElement('div');
        body.className = 'catalog-module-body';

        permisos.forEach((permiso) => {
            body.appendChild(createPermissionCard(permiso));
        });

        section.appendChild(body);
        fragment.appendChild(section);
    });

    dom.catalogContainer.innerHTML = '';
    dom.catalogContainer.appendChild(fragment);
}

function createPermissionCard(permiso) {
    const card = document.createElement('div');
    card.className = 'catalog-permission';
    card.dataset.permissionId = permiso.id ?? '';

    const rolesLabel = `${permiso.totalRoles ?? 0} ${(permiso.totalRoles ?? 0) === 1 ? 'rol' : 'roles'}`;
    const usuariosLabel = `${permiso.totalUsuarios ?? 0} ${(permiso.totalUsuarios ?? 0) === 1 ? 'usuario' : 'usuarios'}`;
    const descripcion = permiso.descripcion && permiso.descripcion.trim().length
        ? permiso.descripcion
        : 'Sin descripción';

    card.innerHTML = `
        <div class="catalog-permission-info">
            <div class="catalog-permission-heading">
                <h5>${escapeHtml(permiso.nombre)}</h5>
                <span class="catalog-permission-code">${escapeHtml(permiso.codigo)}</span>
            </div>
            <p class="catalog-permission-description">${escapeHtml(descripcion)}</p>
            <div class="catalog-permission-badges">
                <span class="badge badge-status ${permiso.estado === 'ACTIVO' ? '' : 'inactive'}">
                    ${permiso.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                </span>
                <span class="badge badge-assignment"><i class="fas fa-user-shield"></i> ${rolesLabel}</span>
                <span class="badge badge-assignment"><i class="fas fa-user-check"></i> ${usuariosLabel}</span>
            </div>
        </div>
        <div class="catalog-permission-actions">
            <button type="button" class="btn btn-light" data-action="view" title="Ver detalle">
                <i class="fas fa-eye"></i>
            </button>
            <button type="button" class="btn btn-light" data-action="edit" title="Editar permiso">
                <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="btn btn-danger" data-action="delete" title="Eliminar permiso">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}

function renderSummary() {
    if (!dom.summaryTotal || !dom.summaryActive || !dom.summaryInactive || !dom.summaryUpdated) {
        return;
    }

    const total = state.items.length;
    const activos = state.items.filter(item => item.estado === 'ACTIVO').length;
    const inactivos = total - activos;

    dom.summaryTotal.textContent = total;
    dom.summaryActive.textContent = activos;
    dom.summaryInactive.textContent = inactivos;
    dom.summaryUpdated.textContent = state.lastUpdated ? formatDateTime(state.lastUpdated) : '—';
}

function handleCatalogClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const card = button.closest('.catalog-permission');
    if (!card) {
        return;
    }

    const idAttr = card.dataset.permissionId;
    const id = idAttr ? Number(idAttr) : null;
    if (id == null || Number.isNaN(id)) {
        showNotification('No se pudo identificar el permiso seleccionado.', 'error');
        return;
    }

    const permiso = state.items.find(item => item.id === id);
    if (!permiso) {
        showNotification('No se encontró la información del permiso seleccionado.', 'error');
        return;
    }

    const action = button.dataset.action;
    switch (action) {
        case 'view':
            openDetailsModal(id);
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
        dom.permissionModule.value = permiso.modulo || '';
        dom.permissionName.value = permiso.nombre;
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
    dom.permissionModule?.focus();
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
            const message = body?.message || body?.error || 'No se pudo guardar el permiso';
            throw new Error(message);
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
    const confirmName = permiso.nombre && permiso.nombre.trim().length ? permiso.nombre : permiso.codigo;
    dom.confirmMessage.textContent = `¿Quieres eliminar el permiso \"${confirmName}\"?`;

    if ((permiso.totalRoles ?? 0) > 0 || (permiso.totalUsuarios ?? 0) > 0) {
        dom.confirmWarning.textContent = 'No se puede eliminar porque está asignado a roles o usuarios.';
        dom.confirmWarning.classList.remove('hidden');
        dom.confirmAcceptBtn.disabled = true;
        dom.confirmAcceptBtn.classList.add('disabled');
    } else {
        dom.confirmWarning.textContent = 'Esta acción no se puede deshacer.';
        dom.confirmWarning.classList.remove('hidden');
        dom.confirmAcceptBtn.disabled = false;
        dom.confirmAcceptBtn.classList.remove('disabled');
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
            const message = body?.message || body?.error || 'No se pudo eliminar el permiso';
            throw new Error(message);
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
        const [permiso, audit] = await Promise.all([
            fetchPermissionDetails(permissionId),
            loadAuditTimeline(permissionId)
        ]);
        renderDetails(permiso);
        renderAudit(audit);
    } catch (error) {
        showNotification(error.message || 'No se pudo cargar el detalle del permiso', 'error');
        renderDetailsError(error.message);
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
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        const body = await tryParseJson(response);
        const message = body?.message || body?.error || 'No se encontró el permiso seleccionado';
        throw new Error(message);
    }

    const data = await response.json();
    return mapPermissionResponse(data);
}

async function loadAuditTimeline(permissionId) {
    const params = new URLSearchParams({ permisoId: permissionId, limite: '20' });
    const response = await fetch(`${PERMISSIONS_AUDIT_URL}?${params.toString()}`, {
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'include'
    });

    if (!response.ok) {
        const body = await tryParseJson(response);
        const message = body?.message || body?.error || 'No se pudo cargar el historial de auditoría';
        throw new Error(message);
    }

    const data = await response.json();
    renderAudit(data);
    return data;
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
    if (dom.auditTimeline) {
        dom.auditTimeline.innerHTML = `
            <li class="audit-placeholder">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Cargando historial...</span>
            </li>
        `;
    }
}

function renderDetails(permiso) {
    dom.detailsCode.textContent = permiso.codigo;
    dom.detailsName.textContent = permiso.nombre;
    dom.detailsDescription.textContent = permiso.descripcion && permiso.descripcion.trim().length ? permiso.descripcion : 'Sin descripción';
    dom.detailsStatus.textContent = permiso.estado === 'ACTIVO' ? 'Activo' : 'Inactivo';
    dom.detailsStatus.className = `status-badge ${permiso.estado === 'ACTIVO' ? 'status-active' : 'status-inactive'}`;
    dom.detailsRoles.textContent = permiso.totalRoles ?? 0;
    dom.detailsUsers.textContent = permiso.totalUsuarios ?? 0;
    dom.detailsCreatedBy.textContent = permiso.creadoPor || '—';
    dom.detailsCreatedAt.textContent = permiso.fechaCreacion ? formatDateTime(permiso.fechaCreacion) : '—';
    dom.detailsUpdated.textContent = permiso.fechaActualizacion ? formatDateTime(permiso.fechaActualizacion) : '—';
    dom.detailsUpdatedBy.textContent = permiso.actualizadoPor || '—';
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

function renderDetailsError(message) {
    if (!dom.auditTimeline) return;
    dom.auditTimeline.innerHTML = `
        <li class="audit-placeholder error">
            <i class="fas fa-triangle-exclamation"></i>
            <span>${message || 'No se pudo obtener la auditoría.'}</span>
        </li>
    `;
}

function renderAudit(auditItems) {
    if (!dom.auditTimeline) return;

    if (!Array.isArray(auditItems) || !auditItems.length) {
        dom.auditTimeline.innerHTML = `
            <li class="audit-placeholder">
                <i class="fas fa-circle-info"></i>
                <span>Sin movimientos recientes</span>
            </li>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    auditItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'audit-item';
        const fecha = item.fecha ? formatDateTime(new Date(item.fecha)) : '—';
        const detalle = item.detalle || '';
        const usuario = item.usuario || 'sistema';

        li.innerHTML = `
            <div class="audit-icon">
                <i class="fas fa-history"></i>
            </div>
            <div class="audit-content">
                <div class="audit-header">
                    <span class="audit-action">${escapeHtml(item.accion || 'ACCION')}</span>
                    <span class="audit-date">${fecha}</span>
                </div>
                ${detalle ? `<p class="audit-detail">${escapeHtml(detalle)}</p>` : ''}
                <small class="audit-meta">Registrado por ${escapeHtml(usuario)}</small>
            </div>
        `;
        fragment.appendChild(li);
    });

    dom.auditTimeline.innerHTML = '';
    dom.auditTimeline.appendChild(fragment);
}

function handleGlobalKeydown(event) {
    if (event.key === 'Escape') {
        if (dom.permissionModal?.classList.contains('is-open')) {
            closePermissionModal();
        }
        if (dom.confirmModal?.classList.contains('is-open')) {
            closeConfirmModal();
        }
        if (dom.detailsModal?.classList.contains('is-open')) {
            closeDetailsModal();
        }
    }
}

function formatId(id) {
    if (id == null) return '--';
    return String(id).padStart(3, '0');
}

function buildPermissionCode(modulo, nombre, id) {
    const base = [modulo, nombre].filter(Boolean).join(' ').trim();
    if (!base) {
        return `PERMISO_${formatId(id)}`;
    }
    const sanitized = base
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    return sanitized || `PERMISO_${formatId(id)}`;
}

function formatDateTime(value) {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }
    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
}

function debounce(fn, delay = 250) {
    let timeout;
    return (...args) => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => fn.apply(null, args), delay);
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
