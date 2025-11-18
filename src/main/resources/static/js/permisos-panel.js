// permisos-panel.js - Init script to populate roles list and permissions matrix

(function () {

const ROLES_API = '/api/roles';
const PERMISSIONS_BY_ROLE_API = (rolId) => `/api/permisos/roles/${rolId}`;
const UPDATE_PERMISSIONS_API = (rolId) => `/api/permisos/roles/${rolId}`;
const ALL_PERMISSIONS_API = '/api/permisos';

const MODULE_GROUPS = [
    { name: 'Seguridad', modules: ['USUARIOS', 'ROLES', 'PERMISOS'] },
    { name: 'Productos', modules: ['PRODUCTOS', 'CALZADOS', 'ACCESORIOS', 'CATÁLOGOS', 'CATALOGOS'] },
    { name: 'Clientes', modules: ['CLIENTES'] },
    { name: 'Ventas', modules: ['VENTAS', 'CAJA'] },
    { name: 'Compras', modules: ['COMPRAS', 'PROVEEDORES'] },
    { name: 'Inventario', modules: ['INVENTARIO', 'ALMACENES'] },
    { name: 'Reportes', modules: ['REPORTES'] },
    { name: 'Integraciones', modules: ['INTEGRACIONES'] },
    { name: 'Dashboard', modules: ['DASHBOARD'] }
];

const panelState = {
    roles: [],
    currentRoleId: null,
    permisosPorModulo: {},
    loadedPermisos: [],
    selectedIds: new Set(),
    catalogPerModulo: {},
    catalogOrdModules: []
};

document.addEventListener('DOMContentLoaded', () => {
    initPanel();
});

function initPanel() {
    const roleSearch = document.getElementById('roleSearchInput');
    const permissionSearch = document.getElementById('permissionSearchInput');
    const saveBtn = document.getElementById('saveAssignmentsBtn');
    const refreshBtn = document.getElementById('refreshRoleAssignmentsBtn');
    const selectAll = document.getElementById('selectAllBtn');
    const clearAll = document.getElementById('clearAllBtn');

    if (roleSearch) roleSearch.addEventListener('input', debounce(renderRolesList, 200));
    if (permissionSearch) permissionSearch.addEventListener('input', debounce(() => renderPermissionsMatrix(), 200));
    if (saveBtn) saveBtn.addEventListener('click', saveAssignments);
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        if (panelState.currentRoleId) loadPermissionsForRole(panelState.currentRoleId);
    });
    if (selectAll) selectAll.addEventListener('click', () => toggleSelectAll(true));
    if (clearAll) clearAll.addEventListener('click', () => toggleSelectAll(false));

    // Ensure select/clear buttons are disabled until a role is selected
    if (selectAll) selectAll.disabled = true;
    if (clearAll) clearAll.disabled = true;

    fetchRoles();
}

async function fetchRoles() {
    try {
        const res = await fetch(ROLES_API, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
        if (!res.ok) throw new Error('No se pudieron cargar los roles');
        const roles = await res.json();
        panelState.roles = Array.isArray(roles) ? roles : [];
        renderRolesList();
    } catch (err) {
        console.error(err);
        const container = document.getElementById('rolesList');
        if (container) container.innerHTML = `<div class="list-placeholder"><i class="fas fa-triangle-exclamation"></i><span>Error cargando roles</span></div>`;
    }
}

function renderRolesList() {
    const container = document.getElementById('rolesList');
    const countEl = document.getElementById('rolesCount');
    if (!container) return;
    const term = (document.getElementById('roleSearchInput')?.value || '').toLowerCase().trim();
    const roles = panelState.roles.filter(r => {
        const name = (r.nombre ?? r.name ?? r.nombreRol ?? '').toLowerCase();
        return !term || name.includes(term) || String(r.id ?? r.idRol ?? '').includes(term);
    });

    countEl && (countEl.textContent = String(roles.length));

    if (!roles.length) {
        container.innerHTML = `<div class="list-placeholder"><i class="fas fa-inbox"></i><span>Selecciona un rol para comenzar</span></div>`;
        return;
    }

    container.innerHTML = '';
    roles.forEach(r => {
        const id = r.id ?? r.idRol ?? r.id_rol ?? r.idRole ?? r.id;
        const name = r.nombre ?? r.nombreRol ?? r.name ?? `Rol ${id}`;
        const descriptionRaw = typeof r.descripcion === 'string' ? r.descripcion.trim() : '';
        const hasDescription = descriptionRaw.length > 0;
        const description = hasDescription ? descriptionRaw : 'Sin descripción';
        const descriptionClass = hasDescription ? 'role-description' : 'role-description role-description--empty';
        const userCount = Number.isFinite(Number(r.totalUsuarios)) ? Number(r.totalUsuarios) : 0;
        const usuariosLabel = `${userCount} ${userCount === 1 ? 'usuario' : 'usuarios'}`;
        const isActive = r.estado === undefined ? true : Boolean(r.estado);
        const statusText = isActive ? 'Activo' : 'Inactivo';
        const statusClass = isActive ? 'is-active' : 'is-inactive';
        const iconClass = isActive ? 'fa-user-shield' : 'fa-user-lock';

        const item = document.createElement('div');
        item.className = 'role-item';
        item.dataset.roleId = id;
        item.innerHTML = `
            <div class="role-item-inner">
                <div class="role-avatar"><i class="fas ${iconClass}"></i></div>
                <div class="role-info">
                    <div class="role-name">${escapeHtml(name)}</div>
                    <div class="${descriptionClass}">${escapeHtml(description)}</div>
                    <div class="role-meta">
                        <span class="role-tag"><i class="fas fa-users"></i> ${escapeHtml(usuariosLabel)}</span>
                        <span class="role-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
        item.addEventListener('click', () => onRoleSelected(Number(id), name));
        container.appendChild(item);
    });
}

async function onRoleSelected(roleId, roleName) {
    panelState.currentRoleId = roleId;
    const title = document.getElementById('selectedRoleName');
    const desc = document.getElementById('selectedRoleDescription');
    const saveBtn = document.getElementById('saveAssignmentsBtn');
    const refreshBtn = document.getElementById('refreshRoleAssignmentsBtn');
    const selectAll = document.getElementById('selectAllBtn');
    const clearAll = document.getElementById('clearAllBtn');
    title && (title.textContent = roleName || `Rol ${roleId}`);
    desc && (desc.textContent = `Gestión de permisos para el rol seleccionado.`);
    if (saveBtn) { saveBtn.disabled = false; }
    if (refreshBtn) { refreshBtn.disabled = false; }
    if (selectAll) selectAll.disabled = false;
    if (clearAll) clearAll.disabled = false;

    // Update visual selection in the roles list
    try {
        document.querySelectorAll('.role-item.is-active, .role-item.active').forEach(el => el.classList.remove('is-active', 'active'));
        const el = document.querySelector(`.role-item[data-role-id="${roleId}"]`);
        if (el) {
            el.classList.add('is-active');
            // ensure visible
            if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    } catch (e) {
        // silent
    }
    await loadPermissionsForRole(roleId);
}

async function loadPermissionsForRole(roleId) {
    const container = document.getElementById('permissionsMatrix');
    if (!container) return;
    container.innerHTML = `<div class="matrix-placeholder"><i class="fas fa-spinner fa-spin"></i><span>Cargando permisos...</span></div>`;
    try {
        // Fetch all permissions (catalog) and the role's assigned permisos in parallel
        const [allRes, roleRes] = await Promise.all([
            fetch(ALL_PERMISSIONS_API, { headers: { 'Accept': 'application/json' }, credentials: 'include' }),
            fetch(PERMISSIONS_BY_ROLE_API(roleId), { headers: { 'Accept': 'application/json' }, credentials: 'include' })
        ]);

        if (!allRes.ok) throw new Error('No se pudo cargar el catálogo de permisos');
        if (!roleRes.ok) throw new Error('No se pudo cargar permisos para el rol');

        const allPerms = await allRes.json();
        const roleData = await roleRes.json();

        panelState.loadedPermisos = Array.isArray(allPerms) ? allPerms : [];
        buildCatalogFromPermissions(panelState.loadedPermisos);

        // roleData.permisos contains the permisos assigned to the role (summaries)
        const assignedIds = Array.isArray(roleData.permisos)
            ? roleData.permisos.map(x => x.id).filter(Boolean).map(String)
            : [];
        panelState.selectedIds = new Set(assignedIds);

        renderPermissionsMatrix();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="matrix-placeholder"><i class="fas fa-triangle-exclamation"></i><span>Error al cargar permisos</span></div>`;
    }
}

function renderPermissionsMatrix() {
    const container = document.getElementById('permissionsMatrix');
    if (!container) return;
    const search = (document.getElementById('permissionSearchInput')?.value || '').toLowerCase().trim();
    const groups = buildPermissionGroups(search);
    const totalVisible = groups.reduce((acc, group) => acc + group.total, 0);

    if (!totalVisible) {
        container.innerHTML = `<div class="matrix-placeholder"><i class="fas fa-inbox"></i><span>Sin permisos para mostrar</span></div>`;
        updateCounters();
        return;
    }

    const fragment = document.createDocumentFragment();

    groups.forEach(group => {
        const section = document.createElement('section');
        section.className = 'catalog-module catalog-module--matrix matrix-group';
        section.dataset.group = group.name;
        section.appendChild(createModuleHeader(group.name, group.total));
        section.appendChild(createGroupModules(group.modules));
        fragment.appendChild(section);
    });

    container.innerHTML = '';
    container.classList.add('modules-container--grouped');
    container.appendChild(fragment);

    updateCounters();
}

function updateCounters() {
    const assigned = panelState.selectedIds.size;
    const total = (panelState.catalogOrdModules || []).reduce((acc, module) => {
        const list = panelState.catalogPerModulo[module] || [];
        return acc + list.length;
    }, 0);
    const assignedEl = document.getElementById('assignedCount');
    const availableEl = document.getElementById('availableCount');
    if (assignedEl) assignedEl.textContent = String(assigned);
    if (availableEl) availableEl.textContent = String(Math.max(0, total - assigned));
}

function toggleSelectAll(shouldSelect) {
    (panelState.catalogOrdModules || []).forEach(module => {
        const permisos = panelState.catalogPerModulo[module] || [];
        permisos.forEach(p => {
            const id = String(p.id);
            if (!id) return;
            if (shouldSelect) {
                panelState.selectedIds.add(id);
            } else {
                panelState.selectedIds.delete(id);
            }
        });
    });
    renderPermissionsMatrix();
}

async function saveAssignments() {
    if (!panelState.currentRoleId) return showNotification('Selecciona un rol antes de guardar.', 'warning');
    const saveBtn = document.getElementById('saveAssignmentsBtn');
    toggleButtonLoading(saveBtn, true);
    try {
        const url = UPDATE_PERMISSIONS_API(panelState.currentRoleId);
        const payload = { permisoIds: Array.from(panelState.selectedIds).map(id => Number.parseInt(id, 10)).filter(n => Number.isFinite(n)) };
        const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
        if (!res.ok) {
            const body = await tryParseJson(res);
            throw new Error(body?.message || 'No se pudo guardar las asignaciones');
        }
        showNotification('Asignaciones guardadas.', 'success');
    } catch (err) {
        console.error(err);
        showNotification(err?.message || 'Error al guardar asignaciones', 'error');
    } finally {
        toggleButtonLoading(saveBtn, false);
    }
}

// Utility helpers (small copies from permisos.js)
function debounce(fn, delay = 250) { let timeout; return (...args) => { window.clearTimeout(timeout); timeout = window.setTimeout(() => fn.apply(null, args), delay); }; }
function toggleButtonLoading(button, isLoading) { if (!button) return; button.disabled = Boolean(isLoading); button.classList.toggle('is-loading', Boolean(isLoading)); }
async function tryParseJson(response) { try { return await response.json(); } catch (error) { return null; } }
function escapeHtml(value) { if (value == null) return ''; return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

function buildCatalogFromPermissions(permisos) {
    const byModule = permisos.reduce((acc, raw) => {
        if (!raw) return acc;
        const normalized = normalizePermission(raw);
        if (!normalized || normalized.id == null) return acc;
        const moduleUpper = normalized.module.toUpperCase();
        if (moduleUpper === 'AUDITORÍA' || moduleUpper === 'AUDITORIA') {
            return acc;
        }
        const module = normalized.module;
        if (!acc[module]) acc[module] = [];
        acc[module].push(normalized);
        return acc;
    }, {});

    const orderedModules = Object.keys(byModule)
        .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    orderedModules.forEach(module => {
        byModule[module].sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    });

    panelState.catalogPerModulo = byModule;
    panelState.catalogOrdModules = orderedModules;

    panelState.permisosPorModulo = byModule;
}

function normalizePermission(raw) {
    const id = raw.id ?? raw.idPermiso ?? raw.id_permiso ?? raw.id;
    const module = String(raw.modulo ?? raw.module ?? 'GENERAL');
    const name = String(raw.nombre ?? raw.nombrePermiso ?? raw.codigo ?? 'Permiso').trim();
    const code = raw.codigo ?? raw.codigoPermiso ?? buildPermissionCode(module, name, id);
    const description = raw.descripcion ?? raw.detalle ?? '';

    return {
        id,
        module,
        name,
        code,
        description,
        raw
    };
}

function createModuleHeader(moduleName, count) {
    const header = document.createElement('div');
    header.className = 'catalog-module-header';
    const label = count === 1 ? 'permiso' : 'permisos';
    header.innerHTML = `
        <div>
            <h4 class="catalog-module-title">${escapeHtml(moduleName)}</h4>
            <p class="catalog-module-subtitle">Permisos registrados para este módulo.</p>
        </div>
        <span class="catalog-module-counter">${count} ${label}</span>
    `;
    return header;
}

function createGroupModules(modules) {
    const wrapper = document.createElement('div');
    wrapper.className = 'catalog-module-body catalog-module-body--matrix';

    modules.forEach(module => {
        const block = document.createElement('div');
        block.className = 'matrix-module-block';

        const heading = document.createElement('div');
        heading.className = 'matrix-module-heading';
        const title = document.createElement('h5');
        title.className = 'matrix-module-title';
        title.textContent = module.name;
        const counter = document.createElement('span');
        counter.className = 'matrix-module-count';
        counter.textContent = `${module.permissions.length} ${module.permissions.length === 1 ? 'permiso' : 'permisos'}`;
        heading.appendChild(title);
        heading.appendChild(counter);

        block.appendChild(heading);

        module.permissions.forEach(permission => {
            block.appendChild(createPermissionCard(permission));
        });

        wrapper.appendChild(block);
    });

    return wrapper;
}

function createPermissionCard(permission) {
    const isSelected = panelState.selectedIds.has(String(permission.id));
    const card = document.createElement('label');
    card.className = `catalog-permission catalog-permission--matrix ${isSelected ? 'is-selected' : ''}`;
    card.htmlFor = `perm_cb_${permission.id}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `perm_cb_${permission.id}`;
    checkbox.dataset.permissionId = String(permission.id);
    checkbox.checked = isSelected;
    checkbox.addEventListener('change', (event) => {
        const id = String(permission.id);
        if (event.target.checked) {
            panelState.selectedIds.add(id);
            card.classList.add('is-selected');
        } else {
            panelState.selectedIds.delete(id);
            card.classList.remove('is-selected');
        }
        updateCounters();
    });

    const info = document.createElement('div');
    info.className = 'catalog-permission-info';
    info.innerHTML = `
        <div class="catalog-permission-heading">
            <h5>${escapeHtml(permission.name)}</h5>
            <span class="catalog-permission-code">${escapeHtml(permission.code)}</span>
        </div>
        <p class="catalog-permission-description">${escapeHtml(permission.description || 'Sin descripción')}</p>
    `;

    card.appendChild(checkbox);
    card.appendChild(info);

    return card;
}

function buildPermissionCode(modulo, nombre, id) {
    const base = [modulo, nombre].filter(Boolean).join(' ').trim();
    if (!base) {
        return `PERMISO_${id ?? 'SIN_ID'}`;
    }
    return base
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function permissionMatchesSearch(permission, searchTerm) {
    if (!searchTerm) return true;
    const haystack = [permission.name, permission.code, permission.description]
        .filter(Boolean)
        .map(text => String(text).toLowerCase());
    return haystack.some(text => text.includes(searchTerm));
}

function buildPermissionGroups(search) {
    const moduleMap = panelState.catalogPerModulo || {};
    const entries = Object.entries(moduleMap).map(([name, permisos]) => ({
        name,
        normalized: normalizeKey(name),
        permissions: permisos
    }));

    const used = new Set();
    const groups = [];

    const filterPermissions = (list) => {
        if (!search) return list.slice();
        return list.filter(permiso => permissionMatchesSearch(permiso, search));
    };

    MODULE_GROUPS.forEach(config => {
        const modules = [];
        const seen = new Set();

        config.modules.forEach(key => {
            const normalizedKey = normalizeKey(key);
            const entry = entries.find(item => item.normalized === normalizedKey && !used.has(item.name));
            if (!entry || seen.has(entry.normalized)) return;

            const filtered = filterPermissions(entry.permissions);
            if (filtered.length) {
                modules.push({ name: entry.name, permissions: filtered });
            }
            used.add(entry.name);
            seen.add(entry.normalized);
        });

        if (modules.length) {
            const total = modules.reduce((acc, module) => acc + module.permissions.length, 0);
            if (total > 0) {
                groups.push({ name: config.name, modules, total });
            }
        }
    });

    const leftoverModules = entries
        .filter(entry => !used.has(entry.name))
        .map(entry => ({
            name: entry.name,
            permissions: filterPermissions(entry.permissions)
        }))
        .filter(module => module.permissions.length);

    if (leftoverModules.length) {
        const total = leftoverModules.reduce((acc, module) => acc + module.permissions.length, 0);
        groups.push({ name: 'Otros', modules: leftoverModules, total });
    }

    return groups;
}

function normalizeKey(value) {
    if (value == null) return '';
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
}

})();
