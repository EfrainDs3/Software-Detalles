// proveedores.js - Gestión de Proveedores con integración REST

const API_URL = '/api/proveedores';
const PERMISSION_WARNING = 'No tienes permisos para gestionar proveedores. Puedes visualizar el módulo pero no realizar cambios.';

const bodyElement = document.body;
const canManageComprasFlag = bodyElement && bodyElement.dataset && typeof bodyElement.dataset.canManageCompras === 'string'
    ? bodyElement.dataset.canManageCompras
    : 'true';
const canManageCompras = canManageComprasFlag === 'true';

let proveedores = [];
let currentPage = 1;
const itemsPerPage = 10;
let isEditing = false;
let editingId = null;

const proveedoresTableBody = document.getElementById('proveedores-table-body');
const searchInput = document.getElementById('search-proveedores');
const proveedorModal = document.getElementById('proveedor-modal');
const detalleProveedorModal = document.getElementById('detalle-proveedor-modal');
const modalTitle = document.getElementById('modal-title');
const proveedorForm = document.getElementById('proveedor-form');

const fieldIds = {
    razonSocial: 'razon-social',
    nombreComercial: 'nombre-comercial',
    ruc: 'ruc',
    rubro: 'rubro',
    direccion: 'direccion',
    telefono: 'telefono',
    email: 'email'
};

const detalleIds = {
    razonSocial: 'detalle-razon-social',
    nombreComercial: 'detalle-nombre-comercial',
    ruc: 'detalle-ruc',
    rubro: 'detalle-rubro',
    direccion: 'detalle-direccion',
    telefono: 'detalle-telefono',
    email: 'detalle-email'
};

async function askConfirmation(options){
    if (window.confirmationModal?.confirm){
        return window.confirmationModal.confirm(options);
    }
    const message = options?.message || '¿Deseas continuar con esta acción?';
    return Promise.resolve(window.confirm(message));
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    applyReadOnlyState();
    loadProveedores();
});

function applyReadOnlyState() {
    if (canManageCompras) {
        return;
    }

    const addButton = document.getElementById('btn-agregar-proveedor');
    if (addButton) {
        addButton.disabled = true;
        addButton.classList.add('btn-disabled');
        addButton.title = PERMISSION_WARNING;
    }

    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.disabled = true;
        selectAll.checked = false;
    }

    document.body.classList.add('proveedores-readonly');
}

function notifyReadOnlyAction() {
    showNotification(PERMISSION_WARNING, 'warning');
}

function initializeEventListeners() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    const addButton = document.getElementById('btn-agregar-proveedor');
    if (addButton) {
        addButton.addEventListener('click', () => {
            if (!canManageCompras) {
                notifyReadOnlyAction();
                return;
            }
            openAddProveedorModal();
        });
    }

    document.querySelectorAll('.modal-close, .btn-cancel').forEach(button => {
        button.addEventListener('click', closeModals);
    });

    window.addEventListener('click', event => {
        if (event.target === proveedorModal || event.target === detalleProveedorModal) {
            closeModals();
        }
    });

    if (proveedorForm) {
        proveedorForm.addEventListener('submit', handleProveedorSubmit);
    }

    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    }

    const selectAll = document.getElementById('selectAll');
    if (selectAll && canManageCompras) {
        selectAll.addEventListener('change', function () {
            const rowCheckboxes = document.querySelectorAll('.row-checkbox');
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    if (proveedoresTableBody && canManageCompras) {
        proveedoresTableBody.addEventListener('change', event => {
            if (event.target.classList.contains('row-checkbox')) {
                updateSelectAllCheckbox();
            }
        });
    }
}

async function loadProveedores() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            if (response.status === 403) {
                proveedores = [];
                renderProveedoresTable();
                notifyReadOnlyAction();
                return;
            }
            throw new Error('No se pudo cargar la lista de proveedores');
        }
        proveedores = await response.json();
        renderProveedoresTable();
    } catch (error) {
        console.error(error);
        showNotification('Error al cargar los proveedores.', 'error');
        proveedores = [];
        renderProveedoresTable();
    }
}

function renderProveedoresTable(data = proveedores) {
    if (!proveedoresTableBody) {
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    proveedoresTableBody.innerHTML = '';

    if (paginatedData.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                    No se encontraron proveedores
                </td>
            </tr>
        `;
        updatePagination(0);
        return;
    }

    paginatedData.forEach(proveedor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="row-checkbox" value="${proveedor.idProveedor}" ${canManageCompras ? '' : 'disabled'}>
            </td>
            <td>
                <div style="font-weight: 500; color: #b30000; font-size: 16px;">${String(proveedor.idProveedor).padStart(3, '0')}</div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 500; color: #333;">${proveedor.razonSocial ?? ''}</div>
                    <div style="font-size: 12px; color: #666;">${proveedor.nombreComercial ?? 'Sin nombre comercial'}</div>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 500;">${proveedor.ruc ?? 'Sin RUC'}</div>
                    <div style="font-size: 12px; color: #666;">${proveedor.rubro ?? 'Sin rubro'}</div>
                </div>
            </td>
            <td>
                <div>
                    <div>${proveedor.telefono ?? 'Sin teléfono'}</div>
                    <div style="font-size: 12px; color: #666;">${proveedor.email ?? 'Sin email'}</div>
                </div>
            </td>
            <td>
                <div style="font-size: 12px; color: #666;">${proveedor.direccion ?? 'Sin dirección'}</div>
            </td>
            <td>
                <div class="action-buttons-cell">
                    ${canManageCompras ? `
                        <button class="btn-icon btn-edit" data-action="edit" data-id="${proveedor.idProveedor}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-action="delete" data-id="${proveedor.idProveedor}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-view" data-action="view" data-id="${proveedor.idProveedor}" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        proveedoresTableBody.appendChild(row);
    });

    if (canManageCompras) {
        proveedoresTableBody.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', async () => {
                const id = Number(button.dataset.id);
                const proveedor = proveedores.find(p => p.idProveedor === id);
                const nombre = proveedor?.razonSocial || `Proveedor #${id}`;
                const confirmed = await askConfirmation({
                    title: 'Editar proveedor',
                    message: `¿Deseas editar al proveedor "${nombre}"?`,
                    confirmText: 'Sí, editar',
                    cancelText: 'Cancelar'
                });
                if (!confirmed) return;
                editProveedor(id);
            });
        });

        proveedoresTableBody.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async () => {
                const id = Number(button.dataset.id);
                await deleteProveedor(id);
            });
        });
    } else {
        proveedoresTableBody.querySelectorAll('.btn-edit, .btn-delete').forEach(button => {
            button.addEventListener('click', notifyReadOnlyAction);
        });
    }

    proveedoresTableBody.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', () => viewProveedorDetails(Number(button.dataset.id)));
    });

    updatePagination(data.length);
    updateSelectAllCheckbox();
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        currentPage = 1;
        renderProveedoresTable();
        return;
    }

    const filtered = proveedores.filter(proveedor =>
        (proveedor.razonSocial && proveedor.razonSocial.toLowerCase().includes(searchTerm)) ||
        (proveedor.nombreComercial && proveedor.nombreComercial.toLowerCase().includes(searchTerm)) ||
        (proveedor.ruc && proveedor.ruc.includes(searchTerm)) ||
        (proveedor.rubro && proveedor.rubro.toLowerCase().includes(searchTerm)) ||
        (proveedor.email && proveedor.email.toLowerCase().includes(searchTerm))
    );

    currentPage = 1;
    renderProveedoresTable(filtered);
}

function openAddProveedorModal() {
    if (!canManageCompras) {
        notifyReadOnlyAction();
        return;
    }
    modalTitle.textContent = 'Nuevo Proveedor';
    proveedorForm.reset();
    isEditing = false;
    editingId = null;
    document.body.style.overflow = 'hidden';
    proveedorModal.style.display = 'block';
}

async function editProveedor(id) {
    if (!canManageCompras) {
        notifyReadOnlyAction();
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Proveedor no encontrado');
        }

        const proveedor = await response.json();

        modalTitle.textContent = 'Editar Proveedor';
        Object.entries(fieldIds).forEach(([key, inputId]) => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = proveedor[key] ?? '';
            }
        });

        isEditing = true;
        editingId = id;
        document.body.style.overflow = 'hidden';
        proveedorModal.style.display = 'block';
    } catch (error) {
        console.error(error);
        showNotification('No se pudo cargar el proveedor seleccionado.', 'error');
    }
}

function viewProveedorDetails(id) {
    const proveedor = proveedores.find(p => p.idProveedor === id);

    if (!proveedor) {
        showNotification('Proveedor no encontrado en la lista.', 'error');
        return;
    }

    Object.entries(detalleIds).forEach(([key, spanId]) => {
        const span = document.getElementById(spanId);
        if (!span) {
            return;
        }
        span.textContent = proveedor[key] && proveedor[key].toString().trim() !== ''
            ? proveedor[key]
            : 'No especificado';
    });

    document.body.style.overflow = 'hidden';
    detalleProveedorModal.style.display = 'block';
}

async function deleteProveedor(id) {
    if (!canManageCompras) {
        notifyReadOnlyAction();
        return;
    }
    const proveedor = proveedores.find(p => p.idProveedor === id);
    if (!proveedor) {
        showNotification('Proveedor no encontrado en la lista.', 'error');
        return;
    }

    const confirmado = await askConfirmation({
        title: 'Eliminar proveedor',
        message: `Esta acción eliminará al proveedor "${proveedor.razonSocial}". ¿Deseas continuar?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        variant: 'danger'
    });
    if (!confirmado) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            showNotification('Proveedor eliminado correctamente.', 'success');
            await loadProveedores();
        } else {
            showNotification(result.message ?? 'No se pudo eliminar el proveedor.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Error de conexión al eliminar el proveedor.', 'error');
    }
}

async function handleProveedorSubmit(event) {
    event.preventDefault();

    if (!canManageCompras) {
        notifyReadOnlyAction();
        return;
    }

    const proveedorData = {
        razonSocial: getInputValue('razon-social'),
        nombreComercial: getInputValue('nombre-comercial', true),
        ruc: getInputValue('ruc'),
        rubro: getInputValue('rubro'),
        direccion: getInputValue('direccion', true),
        telefono: getInputValue('telefono', true),
        email: getInputValue('email', true)
    };

    const validationErrors = validateProveedor(proveedorData);
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join(', '), 'error');
        return;
    }

    try {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proveedorData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message ?? 'Operación realizada correctamente.', 'success');
            closeModals();
            await loadProveedores();
        } else {
            showNotification(result.message ?? 'No se pudo guardar el proveedor.', 'error');
        }
    } catch (error) {
        console.error(error);
        showNotification('Error de conexión al guardar el proveedor.', 'error');
    }
}

function getInputValue(id, optional = false) {
    const input = document.getElementById(id);
    if (!input) {
        return '';
    }
    const value = input.value.trim();
    return optional ? value || '' : value;
}

function validateProveedor(proveedor) {
    const errors = [];

    if (!proveedor.razonSocial) {
        errors.push('La razón social es obligatoria');
    }

    if (!proveedor.ruc) {
        errors.push('El RUC es obligatorio');
    } else if (!/^\d{11}$/.test(proveedor.ruc)) {
        errors.push('El RUC debe tener 11 dígitos');
    }

    if (!proveedor.rubro) {
        errors.push('El rubro es obligatorio');
    }

    if (proveedor.telefono && !/^\d{9}$/.test(proveedor.telefono)) {
        errors.push('El teléfono debe tener 9 dígitos');
    }

    if (proveedor.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(proveedor.email)) {
        errors.push('El email no es válido');
    }

    return errors;
}

function closeModals() {
    if (proveedorModal) {
        proveedorModal.style.display = 'none';
    }
    if (detalleProveedorModal) {
        detalleProveedorModal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
    if (proveedorForm) {
        proveedorForm.reset();
    }
    isEditing = false;
    editingId = null;
    updateSelectAllCheckbox();
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const infoLabel = document.getElementById('pagination-info');
    if (infoLabel) {
        infoLabel.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} proveedores`;
    }

    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }

    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    updatePageNumbers(totalPages);
}

function updatePageNumbers(totalPages) {
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (!pageNumbersContainer) {
        return;
    }

    pageNumbersContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `btn-pagination ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i.toString();
        pageButton.addEventListener('click', () => changePage(i));
        pageNumbersContainer.appendChild(pageButton);
    }
}

function changePage(page) {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const data = searchTerm
        ? proveedores.filter(proveedor =>
            (proveedor.razonSocial && proveedor.razonSocial.toLowerCase().includes(searchTerm)) ||
            (proveedor.nombreComercial && proveedor.nombreComercial.toLowerCase().includes(searchTerm)) ||
            (proveedor.ruc && proveedor.ruc.includes(searchTerm)) ||
            (proveedor.rubro && proveedor.rubro.toLowerCase().includes(searchTerm)) ||
            (proveedor.email && proveedor.email.toLowerCase().includes(searchTerm)))
        : proveedores;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProveedoresTable(data);
    }
}

function updateSelectAllCheckbox() {
    const selectAll = document.getElementById('selectAll');
    if (!selectAll) {
        return;
    }

    if (!canManageCompras) {
        selectAll.indeterminate = false;
        selectAll.checked = false;
        return;
    }

    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const checkedBoxes = document.querySelectorAll('.row-checkbox:checked');

    if (rowCheckboxes.length === 0) {
        selectAll.indeterminate = false;
        selectAll.checked = false;
    } else if (checkedBoxes.length === rowCheckboxes.length) {
        selectAll.indeterminate = false;
        selectAll.checked = true;
    } else if (checkedBoxes.length > 0) {
        selectAll.indeterminate = true;
        selectAll.checked = false;
    } else {
        selectAll.indeterminate = false;
        selectAll.checked = false;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#333';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
