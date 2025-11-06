// permisos-asignar.js - Modal para asignar permisos a roles

const ASSIGN_ROLES_API = '/api/roles';
const ASSIGN_PERMISSIONS_BY_ROLE_API = (rolId) => `/api/permisos/roles/${rolId}`;
const ASSIGN_PERMISSIONS_UPDATE_API = (rolId) => `/api/permisos/roles/${rolId}`; // PUT

let assignState = {
    currentRoleId: null,
    loadedPermisos: [], // flat list
    permisosPorModulo: {},
    selectedIds: new Set(),
    isSaving: false
};

function initAssignPermissions() {
    const assignBtn = document.getElementById('assignPermissionsBtn');
    if (assignBtn) assignBtn.addEventListener('click', openAssignModal);

    const closeBtn = document.getElementById('assignModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeAssignModal);

    const cancelBtn = document.getElementById('assignCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeAssignModal);

    const saveBtn = document.getElementById('assignSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveAssignments);

    const reloadBtn = document.getElementById('reloadAssignBtn');
    if (reloadBtn) reloadBtn.addEventListener('click', () => {
        if (assignState.currentRoleId) loadPermissionsForRole(assignState.currentRoleId);
    });

    const roleSelect = document.getElementById('assignRoleSelect');
    if (roleSelect) roleSelect.addEventListener('change', (e) => {
        const val = Number(e.target.value);
        if (!Number.isNaN(val)) {
            assignState.currentRoleId = val;
            loadPermissionsForRole(val);
        }
    });

    // close modal when clicking backdrop
    const modal = document.getElementById('assignPermissionsModal');
    if (modal) {
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) closeAssignModal();
        });
    }
}

async function openAssignModal() {
    const modal = document.getElementById('assignPermissionsModal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');

    renderAssignPlaceholder('Cargando roles...');
    try {
        await populateRoleSelect();
        // do not auto-load until user selects a role
    } catch (err) {
        renderAssignPlaceholder('No se pudieron cargar los roles');
        showNotification(err?.message || 'Error al cargar roles', 'error');
    }
}

function closeAssignModal() {
    const modal = document.getElementById('assignPermissionsModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    assignState = { currentRoleId: null, loadedPermisos: [], permisosPorModulo: {}, selectedIds: new Set(), isSaving: false };
    const roleSelect = document.getElementById('assignRoleSelect');
    if (roleSelect) roleSelect.selectedIndex = -1;
    renderAssignPlaceholder('Selecciona un rol para cargar permisos');
}

async function populateRoleSelect() {
    const select = document.getElementById('assignRoleSelect');
    if (!select) return;
    select.innerHTML = '';

    const res = await fetch(ASSIGN_ROLES_API, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
    if (!res.ok) {
        const body = await tryParseJson(res);
        throw new Error(body?.message || 'Error al obtener roles');
    }
    const roles = await res.json();

    // Expecting roles as array of { idRol, nombreRol } or similar; try common keys
    roles.forEach(r => {
        const id = r.idRol ?? r.id ?? r.id_rol ?? r.idRole ?? r.idRole;
        const name = r.nombreRol ?? r.nombre ?? r.name ?? r.descripcion ?? `Rol ${id}`;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        select.appendChild(opt);
    });
}

function renderAssignPlaceholder(message) {
    const container = document.getElementById('assignGridContainer');
    if (!container) return;
    container.innerHTML = `<div class="assign-placeholder">${escapeHtml(message)}</div>`;
}

async function loadPermissionsForRole(rolId) {
    renderAssignPlaceholder('Cargando permisos...');
    try {
        const url = ASSIGN_PERMISSIONS_BY_ROLE_API(rolId);
        const res = await fetch(url, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
        if (!res.ok) {
            const body = await tryParseJson(res);
            throw new Error(body?.message || 'Error al cargar permisos por rol');
        }
        const data = await res.json();
        // data is PermisoRolDetalleResponse with permisos and permisosPorModulo
        assignState.loadedPermisos = Array.isArray(data.permisos) ? data.permisos : [];
        assignState.permisosPorModulo = data.permisosPorModulo || {}; // map of module -> list

        // build selected set
        const currentIds = (assignState.loadedPermisos || [])
            .map(p => p.id ?? p.idPermiso ?? p.id_permiso)
            .filter((id) => id !== null && id !== undefined)
            .map((id) => String(id));
        assignState.selectedIds = new Set(currentIds);

        renderAssignGrid(assignState.permisosPorModulo, assignState.selectedIds);
    } catch (err) {
        renderAssignPlaceholder('No se pudieron cargar los permisos');
        showNotification(err?.message || 'Error al cargar permisos', 'error');
    }
}

function renderAssignGrid(permisosPorModulo, selectedIds) {
    const container = document.getElementById('assignGridContainer');
    if (!container) return;

    const modules = Object.keys(permisosPorModulo || {});
    if (!modules.length) {
        renderAssignPlaceholder('No hay permisos para mostrar');
        return;
    }

    // create grid container
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'assign-grid';

    modules.forEach(mod => {
        const col = document.createElement('div');
        col.className = 'assign-column';
        const header = document.createElement('h4');
        header.className = 'assign-module-title';
        header.textContent = mod;
        col.appendChild(header);

        const list = document.createElement('div');
        list.className = 'assign-perm-list';

        (permisosPorModulo[mod] || []).forEach(p => {
            const rawId = p.id ?? p.idPermiso ?? p.id_permiso;
            if (rawId === null || rawId === undefined) {
                return;
            }
            const id = String(rawId);
            const label = document.createElement('label');
            label.className = 'assign-perm-item';
            label.htmlFor = `assign_perm_${id}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `assign_perm_${id}`;
            checkbox.dataset.permissionId = id;
            checkbox.checked = selectedIds.has(id);
            checkbox.addEventListener('change', (e) => {
                const pid = e.target.dataset.permissionId;
                if (!pid) {
                    e.target.checked = false;
                    return;
                }
                if (e.target.checked) assignState.selectedIds.add(pid);
                else assignState.selectedIds.delete(pid);
            });

            const span = document.createElement('span');
            span.className = 'assign-perm-label';
            span.textContent = p.nombrePermiso ?? p.nombre ?? p.codigo ?? p.codigoPermiso ?? p.name ?? '';

            label.appendChild(checkbox);
            label.appendChild(span);
            list.appendChild(label);
        });

        col.appendChild(list);
        grid.appendChild(col);
    });

    container.appendChild(grid);
}

async function saveAssignments() {
    if (!assignState.currentRoleId) {
        showNotification('Selecciona un rol antes de guardar.', 'warning');
        return;
    }

    if (assignState.isSaving) return;
    assignState.isSaving = true;
    const saveBtn = document.getElementById('assignSaveBtn');
    toggleButtonLoading(saveBtn, true);

    try {
        const url = ASSIGN_PERMISSIONS_UPDATE_API(assignState.currentRoleId);
        const payloadIds = Array.from(assignState.selectedIds)
            .map((id) => Number.parseInt(id, 10))
            .filter((id) => Number.isFinite(id));
        const payload = { permisoIds: payloadIds };
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const body = await tryParseJson(res);
            throw new Error(body?.message || 'No se pudo guardar las asignaciones');
        }

        showNotification('Asignaciones guardadas.', 'success');
        // refresh main permissions list if permisos.js exposes fetchAndRenderPermissions
        if (typeof fetchAndRenderPermissions === 'function') fetchAndRenderPermissions();
        closeAssignModal();
    } catch (err) {
        showNotification(err?.message || 'Error al guardar asignaciones', 'error');
    } finally {
        assignState.isSaving = false;
        toggleButtonLoading(saveBtn, false);
    }
}

// Initialize when permisos.js and sidebar loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a tick so permisos.js registers first functions
    setTimeout(initAssignPermissions, 50);
});
