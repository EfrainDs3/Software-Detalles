document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const almacenesTableBody = document.getElementById('almacenesTableBody');
    const searchInput = document.getElementById('searchInput');
    const addAlmacenBtn = document.getElementById('addAlmacenBtn');

    // Referencias del modal
    const almacenModal = document.getElementById('almacenModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const almacenForm = document.getElementById('almacenForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveBtn');

    // Referencias del modal de eliminación
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteCloseBtn = document.getElementById('deleteCloseBtn');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');

    // Referencias para summary cards
    const totalAlmacenes = document.getElementById('totalAlmacenes');
    const productosEnAlmacenes = document.getElementById('productosEnAlmacenes');

    // Referencias para paginación
    const showingStart = document.getElementById('showingStart');
    const showingEnd = document.getElementById('showingEnd');
    const totalRegistros = document.getElementById('totalRegistros');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const paginationNumbers = document.getElementById('paginationNumbers');

    // --- Variables de Estado ---
    let currentPage = 1;
    let itemsPerPage = 10;
    let filteredData = [];
    let currentAlmacenId = null;
    let almacenesData = [];

    // --- Funciones Utilitarias ---

    function showNotification(message, type = 'success') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Mostrar notificación
        setTimeout(() => notification.classList.add('show'), 100);

        // Ocultar y remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // --- Funciones de API ---

    async function loadAlmacenes() {
        try {
            const response = await fetch('/api/almacenes');
            if (!response.ok) throw new Error('Error al cargar almacenes');

            almacenesData = await response.json();
            applyFilters();
            updateSummaryCards();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al cargar almacenes', 'error');
        }
    }

    async function saveAlmacen(almacenData) {
        try {
            const isEdit = currentAlmacenId !== null;
            const url = isEdit ? `/api/almacenes/${currentAlmacenId}` : '/api/almacenes';
            const method = isEdit ? 'PUT' : 'POST';

            const params = new URLSearchParams();
            params.append('nombre', almacenData.nombre);
            if (almacenData.ubicacion) {
                params.append('ubicacion', almacenData.ubicacion);
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar almacén');
            }

            const savedAlmacen = await response.json();
            showNotification(isEdit ? 'Almacén actualizado correctamente' : 'Almacén creado correctamente');

            await loadAlmacenes();
            closeAlmacenModal();

            return savedAlmacen;
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    }

    async function deleteAlmacen(id) {
        try {
            const response = await fetch(`/api/almacenes/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar almacén');
            }

            showNotification('Almacén eliminado correctamente');
            await loadAlmacenes();
            closeDeleteModal();
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message, 'error');
        }
    }

    // --- Funciones de Renderizado ---

    function renderAlmacenesTable() {
        almacenesTableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const pageData = filteredData.slice(startIndex, endIndex);

        if (pageData.length === 0) {
            almacenesTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-warehouse"></i>
                        <p>No se encontraron almacenes</p>
                    </td>
                </tr>
            `;
            return;
        }

        pageData.forEach(almacen => {
            const productosCount = almacen.inventarios ? almacen.inventarios.length : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${almacen.id}</td>
                <td>
                    <div class="almacen-info">
                        <strong>${almacen.nombre}</strong>
                    </div>
                </td>
                <td>${almacen.ubicacion || '-'}</td>
                <td class="text-center">
                    <span class="productos-count">${productosCount}</span>
                </td>
                <td class="text-center">
                    <span class="status-badge active">Activo</span>
                </td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon edit" onclick="editAlmacen(${almacen.id})"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="confirmDeleteAlmacen(${almacen.id})"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            almacenesTableBody.appendChild(row);
        });

        updatePaginationInfo();
    }

    function updateSummaryCards() {
        totalAlmacenes.textContent = almacenesData.length;

        // Calcular total de productos en almacenes
        const totalProductos = almacenesData.reduce((sum, almacen) => {
            return sum + (almacen.inventarios ? almacen.inventarios.length : 0);
        }, 0);
        productosEnAlmacenes.textContent = totalProductos;
    }

    function updatePaginationInfo() {
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);

        showingStart.textContent = startIndex;
        showingEnd.textContent = endIndex;
        totalRegistros.textContent = filteredData.length;

        // Actualizar botones de paginación
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        prevPage.disabled = currentPage <= 1;
        nextPage.disabled = currentPage >= totalPages;

        // Generar números de página
        paginationNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                const btn = document.createElement('button');
                btn.className = `btn-pagination ${i === currentPage ? 'active' : ''}`;
                btn.textContent = i;
                btn.addEventListener('click', () => goToPage(i));
                paginationNumbers.appendChild(btn);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.padding = '0 5px';
                paginationNumbers.appendChild(dots);
            }
        }
    }

    // --- Funciones de Filtrado ---

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();

        filteredData = almacenesData.filter(almacen => {
            // Filtro de búsqueda
            const matchesSearch = !searchTerm ||
                almacen.nombre.toLowerCase().includes(searchTerm) ||
                (almacen.ubicacion && almacen.ubicacion.toLowerCase().includes(searchTerm));

            return matchesSearch;
        });

        currentPage = 1;
        renderAlmacenesTable();
    }

    // --- Funciones de Paginación ---

    function goToPage(page) {
        currentPage = page;
        renderAlmacenesTable();
    }

    // --- Funciones del Modal ---

    function openModal(almacen = null) {
        currentAlmacenId = almacen ? almacen.id : null;

        if (almacen) {
            modalTitle.textContent = 'Editar Almacén';
            document.getElementById('almacenNombre').value = almacen.nombre;
            document.getElementById('almacenUbicacion').value = almacen.ubicacion || '';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Almacén';
        } else {
            modalTitle.textContent = 'Nuevo Almacén';
            almacenForm.reset();
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Almacén';
        }

        almacenModal.style.display = 'block';
    }

    function closeAlmacenModal() {
        almacenModal.style.display = 'none';
        currentAlmacenId = null;
        almacenForm.reset();
    }

    function confirmDeleteAlmacen(id) {
        const almacen = almacenesData.find(a => a.id === id);
        if (!almacen) return;

        document.getElementById('deleteAlmacenNombre').textContent = almacen.nombre;
        document.getElementById('deleteAlmacenUbicacion').textContent = almacen.ubicacion || 'Sin ubicación';

        deleteModal.style.display = 'block';
        confirmDeleteBtn.onclick = () => deleteAlmacen(id);
    }

    function closeDeleteModal() {
        deleteModal.style.display = 'none';
    }

    // --- Funciones Globales (para uso en HTML) ---

    window.editAlmacen = (id) => {
        const almacen = almacenesData.find(a => a.id === id);
        if (almacen) {
            openModal(almacen);
        }
    };

    window.confirmDeleteAlmacen = confirmDeleteAlmacen;

    // --- Event Listeners ---

    // Búsqueda
    searchInput.addEventListener('input', debounce(applyFilters, 300));

    // Botones principales
    addAlmacenBtn.addEventListener('click', () => openModal());

    // Modal
    if (closeModal) closeModal.addEventListener('click', closeAlmacenModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAlmacenModal);
    if (deleteCloseBtn) deleteCloseBtn.addEventListener('click', closeDeleteModal);
    if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteModal);

    // Envío del formulario
    almacenForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(almacenForm);
        const almacenData = {
            nombre: formData.get('nombre').trim(),
            ubicacion: formData.get('ubicacion').trim() || null
        };

        try {
            await saveAlmacen(almacenData);
        } catch (error) {
            // Error ya manejado en saveAlmacen
        }
    });

    // Paginación
    prevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    nextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === almacenModal) {
            closeAlmacenModal();
        }
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    // Función debounce para optimizar búsqueda
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Inicialización ---

    function init() {
        loadAlmacenes();
    }

    // Ejecutar inicialización
    init();
});