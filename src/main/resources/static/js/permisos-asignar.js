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

// Parent grouping map: parent module -> array of child module names
const PARENT_MODULE_MAP = {
    'Seguridad': ['Usuarios', 'Roles', 'Permisos']
};

function normalizeModuleName(raw) {
    if (!raw || typeof raw !== 'string') return '';
    const s = raw.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mergeParentModules(permisosPorModulo) {
    if (!permisosPorModulo || typeof permisosPorModulo !== 'object') return permisosPorModulo;
    const map = { ...permisosPorModulo };

    // Detect module keys that encode submodules using common separators
    const keys = Object.keys(map);
    const splitRegex = /[\\/\-:>]+/; // separators: \\ , /, -, :, >

    keys.forEach(rawKey => {
        if (typeof rawKey !== 'string' || !rawKey.trim()) return;
        const key = rawKey.trim();

        // dot notation
        let parts = key.split('.').map(s => s.trim()).filter(Boolean);
        if (parts.length <= 1) {
            // try other separators
            parts = key.split(splitRegex).map(s => s.trim()).filter(Boolean);
        }

        if (parts.length > 1) {
            const parentName = normalizeModuleName(parts[0]);
            const subName = normalizeModuleName(parts.slice(1).join(' '));
            const list = Array.isArray(map[rawKey]) ? map[rawKey] : [];
            // move entries to parent, marking submodule
            map[parentName] = (map[parentName] || []).concat(list.map(p => {
                p.modulo = parentName;
                if (!p.submodule) p.submodule = subName;
                return p;
            }));
            delete map[rawKey];
        }
    });

    // Merge configured child modules under parent modules so UI shows a
    // hierarchical view (e.g. Seguridad -> Usuarios, Roles, Permisos).
    Object.keys(PARENT_MODULE_MAP).forEach(parentRaw => {
        const parentName = normalizeModuleName(parentRaw);
        const children = Array.isArray(PARENT_MODULE_MAP[parentRaw]) ? PARENT_MODULE_MAP[parentRaw] : [];
        if (!children.length) return;

        const merged = Array.isArray(map[parentName]) ? [...map[parentName]] : [];

        children.forEach(childRaw => {
            const childName = normalizeModuleName(childRaw);
            if (!map[childName]) return;
            const childList = Array.isArray(map[childName]) ? map[childName] : [];
            // Move each permiso to parent, marking the child as submodule when
            // not already present.
            childList.forEach(p => {
                p.modulo = parentName;
                if (!p.submodule) p.submodule = childName;
                merged.push(p);
            });
            delete map[childName];
        });

        if (merged.length) {
            map[parentName] = merged;
        }
    });

    return map;
}

function initAssignPermissions() {
    const assignBtn = document.getElementById('assignPermissionsBtn');
    if (assignBtn) assignBtn.addEventListener('click', openAssignModal);

    const closeBtn = document.getElementById('assignModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeAssignModal);

    const cancelBtn = document.getElementById('assignCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeAssignModal);

    const saveBtn = document.getElementById('assignSaveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveAssignments);
    // keep save disabled until a role is selected
    if (saveBtn) saveBtn.disabled = true;

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
            // enable save when a role is chosen
            const saveBtnInner = document.getElementById('assignSaveBtn');
            if (saveBtnInner) saveBtnInner.disabled = false;
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
    // enable select UI
    select.disabled = false;
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
        assignState.permisosPorModulo = mergeParentModules(data.permisosPorModulo || {}); // map of module -> list

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
        const permisos = permisosPorModulo[mod] || [];
        const total = permisos.length;
        const selectedCount = permisos.reduce((acc, permiso) => {
            const pid = permiso.id ?? permiso.idPermiso ?? permiso.id_permiso;
            if (pid === null || pid === undefined) {
                return acc;
            }
            return selectedIds.has(String(pid)) ? acc + 1 : acc;
        }, 0);

        const col = document.createElement('div');
        col.className = 'assign-column';
        col.dataset.module = mod;

        const header = document.createElement('div');
        header.className = 'assign-module-header';

        const heading = document.createElement('div');
        heading.className = 'assign-module-heading';

        const title = document.createElement('h4');
        title.className = 'assign-module-title';
        title.textContent = mod;

        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'assign-module-toggle';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.className = 'assign-module-toggle-input';
        toggle.dataset.module = mod;
        toggle.disabled = total === 0;
        if (total > 0) {
            toggle.checked = selectedCount === total;
            toggle.indeterminate = selectedCount > 0 && selectedCount < total;
        }
        toggle.addEventListener('change', handleAssignModuleToggle);

        toggleLabel.appendChild(toggle);

        heading.appendChild(title);
        heading.appendChild(toggleLabel);

        const counter = document.createElement('span');
        counter.className = 'assign-module-counter';
        counter.textContent = `${selectedCount}/${total}`;

        header.appendChild(heading);
        header.appendChild(counter);
        col.appendChild(header);

        const list = document.createElement('div');
        list.className = 'assign-perm-list';

        // Group permissions by submodule (if present) for hierarchical display
        const grouped = permisos.reduce((acc, permiso) => {
            const key = permiso.submodule || '';
            if (!acc[key]) acc[key] = [];
            acc[key].push(permiso);
            return acc;
        }, {});

        Object.keys(grouped).forEach(subKey => {
            const group = grouped[subKey];
            if (subKey) {
                const subHeader = document.createElement('div');
                subHeader.className = 'assign-submodule-header';
                subHeader.textContent = subKey;
                list.appendChild(subHeader);
            }

            group.forEach(p => {
                const rawId = p.id ?? p.idPermiso ?? p.id_permiso;
                if (rawId === null || rawId === undefined) return;
                const id = String(rawId);
                const label = document.createElement('label');
                label.className = 'assign-perm-item';
                label.htmlFor = `assign_perm_${id}`;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `assign_perm_${id}`;
                checkbox.dataset.permissionId = id;
                checkbox.dataset.module = mod;
                checkbox.className = 'assign-perm-checkbox';
                checkbox.checked = selectedIds.has(id);
                checkbox.addEventListener('change', handleAssignPermissionToggle);

                const span = document.createElement('span');
                span.className = 'assign-perm-label';
                span.textContent = p.nombrePermiso ?? p.nombre ?? p.codigo ?? p.codigoPermiso ?? p.name ?? '';

                label.appendChild(checkbox);
                label.appendChild(span);
                list.appendChild(label);
            });
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

function handleAssignModuleToggle(event) {
    const checkbox = event.target;
    const moduleName = checkbox.dataset.module;
    if (!moduleName) return;

    const column = checkbox.closest('.assign-column');
    const shouldSelect = checkbox.checked;

    if (column) {
        const checkboxes = column.querySelectorAll('input.assign-perm-checkbox');
        checkboxes.forEach(cb => {
            const permissionId = cb.dataset.permissionId;
            if (!permissionId) return;

            cb.checked = shouldSelect;
            if (shouldSelect) {
                assignState.selectedIds.add(permissionId);
            } else {
                assignState.selectedIds.delete(permissionId);
            }
        });

        updateAssignModuleHeaderState(column);
    }
}

function handleAssignPermissionToggle(event) {
    const checkbox = event.target;
    const permissionId = checkbox.dataset.permissionId;
    if (!permissionId) return;

    if (checkbox.checked) {
        assignState.selectedIds.add(permissionId);
    } else {
        assignState.selectedIds.delete(permissionId);
    }

    const column = checkbox.closest('.assign-column');
    if (column) {
        updateAssignModuleHeaderState(column);
    }
}

function updateAssignModuleHeaderState(column) {
    const moduleName = column?.dataset?.module;
    if (!moduleName) return;

    const permissions = assignState.permisosPorModulo?.[moduleName] || [];
    const total = permissions.length;
    let selectedCount = 0;

    permissions.forEach(permiso => {
        const rawId = permiso.id ?? permiso.idPermiso ?? permiso.id_permiso;
        if (rawId === null || rawId === undefined) {
            return;
        }
        if (assignState.selectedIds.has(String(rawId))) {
            selectedCount += 1;
        }
    });

    const counter = column.querySelector('.assign-module-counter');
    if (counter) {
        counter.textContent = `${selectedCount}/${total}`;
    }

    const toggle = column.querySelector('.assign-module-toggle-input');
    if (toggle) {
        toggle.checked = total > 0 && selectedCount === total;
        toggle.indeterminate = selectedCount > 0 && selectedCount < total;
    }
}

// Initialize when permisos.js and sidebar loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a tick so permisos.js registers first functions
    setTimeout(initAssignPermissions, 50);
});
