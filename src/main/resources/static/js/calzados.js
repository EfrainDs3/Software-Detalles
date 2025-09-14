// Calzados Module JavaScript

// Global variables
let calzados = [
    {
        id: '001',
        name: 'Zapatillas Deportivas Nike',
        brand: 'Nike',
        model: 'Air Max 270',
        color: 'Negro',
        type: 'Unisex',
        size: '42',
        price: 249.90,
        purchasePrice: 180.00,
        material: 'Mesh',
        category: 'Deportivo',
        image: '../../../static/img/calzado-default.jpg',
        stock: 15,
        status: 'active'
    },
    {
        id: '002',
        name: 'Zapatos Formales Clarks',
        brand: 'Clarks',
        model: 'Desert Boot',
        color: 'Marrón',
        type: 'Hombre',
        size: '41',
        price: 189.90,
        purchasePrice: 135.00,
        material: 'Cuero',
        category: 'Formal',
        image: '../../../static/img/calzado-default.jpg',
        stock: 8,
        status: 'active'
    },
    {
        id: '003',
        name: 'Botas de Cuero Timberland',
        brand: 'Timberland',
        model: '6 Inch Premium',
        color: 'Café',
        type: 'Mujer',
        size: '43',
        price: 389.90,
        purchasePrice: 280.00,
        material: 'Cuero',
        category: 'Casual',
        image: '../../../static/img/calzado-default.jpg',
        stock: 5,
        status: 'active'
    }
];

let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize calzados module
    initCalzadosModule();
    // Load initial data
    loadCalzados();
});

function initCalzadosModule() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const addCalzadoBtn = document.getElementById('addCalzadoBtn');
    const filterBtn = document.getElementById('filterBtn');
    const calzadoModal = document.getElementById('calzadoModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const calzadoForm = document.getElementById('calzadoForm');
    const selectAllCheckbox = document.getElementById('selectAll');
    const selectImageBtn = document.getElementById('selectImageBtn');
    const calzadoImage = document.getElementById('calzadoImage');
    const imagePreview = document.getElementById('imagePreview');
    const logoutBtn = document.querySelector('.logout-btn');

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (addCalzadoBtn) {
        addCalzadoBtn.addEventListener('click', openAddCalzadoModal);
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilter);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunction);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModalFunction);
    }

    if (calzadoForm) {
        calzadoForm.addEventListener('submit', handleFormSubmit);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    if (selectImageBtn) {
        selectImageBtn.addEventListener('click', () => {
            calzadoImage.click();
        });
    }

    if (calzadoImage) {
        calzadoImage.addEventListener('change', handleImageUpload);
    }

    if (imagePreview) {
        imagePreview.addEventListener('click', () => {
            calzadoImage.click();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Close modal when clicking outside
    if (calzadoModal) {
        calzadoModal.addEventListener('click', (e) => {
            if (e.target === calzadoModal) {
                closeModalFunction();
            }
        });
    }

    // Add event listeners to action buttons
    addActionButtonListeners();
    
    // Add real-time preview updates
    addPreviewUpdates();
}

// Load calzados into table
function loadCalzados() {
    const tbody = document.getElementById('calzadosTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    calzados.forEach(calzado => {
        const row = createCalzadoRow(calzado);
        tbody.appendChild(row);
    });

    // Re-add event listeners to new elements
    addActionButtonListeners();

    // Update pagination info
    updatePaginationInfo();
}

// Create calzado row
function createCalzadoRow(calzado) {
    const row = document.createElement('tr');
    
    // Format price
    const formattedPrice = `S/ ${calzado.price.toFixed(2)}`;

    row.innerHTML = `
        <td><input type="checkbox" class="calzado-checkbox" data-calzado-id="${calzado.id}"></td>
        <td>${calzado.id}</td>
        <td>
            <div class="product-image">
                <div class="placeholder-image">
                    <i class="fas fa-shoe-prints"></i>
                </div>
            </div>
        </td>
        <td>
            <div class="product-info">
                <div class="product-details">
                    <span class="product-name">${calzado.name}</span>
                    <span class="product-category ${calzado.category.toLowerCase()}">${calzado.category}</span>
                </div>
            </div>
        </td>
        <td><span class="brand-badge">${calzado.brand}</span></td>
        <td>${calzado.model}</td>
        <td><span class="color-badge ${calzado.color.toLowerCase()}">${calzado.color}</span></td>
        <td><span class="type-badge ${calzado.type.toLowerCase()}">${calzado.type}</span></td>
        <td><span class="size-badge">${calzado.size}</span></td>
        <td><span class="price">${formattedPrice}</span></td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" title="Editar" data-calzado-id="${calzado.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" title="Eliminar" data-calzado-id="${calzado.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" title="Ver detalles" data-calzado-id="${calzado.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#calzadosTableBody tr');

    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const shouldShow = text.includes(searchTerm);
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Filter functionality
function handleFilter() {
    const filterModal = createFilterModal();
    document.body.appendChild(filterModal);
}

function createFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Filtros de Calzados</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterBrand">Marca</label>
                        <select id="filterBrand">
                            <option value="">Todas las marcas</option>
                            <option value="Nike">Nike</option>
                            <option value="Adidas">Adidas</option>
                            <option value="Clarks">Clarks</option>
                            <option value="Timberland">Timberland</option>
                            <option value="Converse">Converse</option>
                            <option value="Vans">Vans</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterCategory">Categoría</label>
                        <select id="filterCategory">
                            <option value="">Todas las categorías</option>
                            <option value="Deportivo">Deportivo</option>
                            <option value="Formal">Formal</option>
                            <option value="Casual">Casual</option>
                            <option value="Botas">Botas</option>
                            <option value="Sandalias">Sandalias</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterSize">Talla</label>
                        <select id="filterSize">
                            <option value="">Todas las tallas</option>
                            <option value="38">38</option>
                            <option value="39">39</option>
                            <option value="40">40</option>
                            <option value="41">41</option>
                            <option value="42">42</option>
                            <option value="43">43</option>
                            <option value="44">44</option>
                            <option value="45">45</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterPriceRange">Rango de Precio</label>
                        <select id="filterPriceRange">
                            <option value="">Todos los precios</option>
                            <option value="0-100">S/ 0 - S/ 100</option>
                            <option value="100-200">S/ 100 - S/ 200</option>
                            <option value="200-300">S/ 200 - S/ 300</option>
                            <option value="300+">S/ 300+</option>
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
    const brandFilter = document.getElementById('filterBrand').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const sizeFilter = document.getElementById('filterSize').value;
    const priceRangeFilter = document.getElementById('filterPriceRange').value;
    
    let filteredCalzados = calzados;
    
    if (brandFilter) {
        filteredCalzados = filteredCalzados.filter(calzado => calzado.brand === brandFilter);
    }
    
    if (categoryFilter) {
        filteredCalzados = filteredCalzados.filter(calzado => calzado.category === categoryFilter);
    }
    
    if (sizeFilter) {
        filteredCalzados = filteredCalzados.filter(calzado => calzado.size === sizeFilter);
    }
    
    if (priceRangeFilter) {
        const [min, max] = priceRangeFilter.split('-').map(p => parseFloat(p) || 0);
        if (priceRangeFilter === '300+') {
            filteredCalzados = filteredCalzados.filter(calzado => calzado.price >= 300);
        } else {
            filteredCalzados = filteredCalzados.filter(calzado => 
                calzado.price >= min && (max ? calzado.price <= max : true)
            );
        }
    }
    
    // Update table with filtered data
    const tbody = document.getElementById('calzadosTableBody');
    tbody.innerHTML = '';
    
    filteredCalzados.forEach(calzado => {
        const row = createCalzadoRow(calzado);
        tbody.appendChild(row);
    });
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Re-add event listeners
    addActionButtonListeners();
    
    showNotification(`Filtros aplicados: ${filteredCalzados.length} calzados encontrados`);
}

// Modal functions
function openAddCalzadoModal() {
    const modal = document.getElementById('calzadoModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('calzadoForm');

    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Calzado';
    }

    if (form) {
        form.reset();
        currentEditId = null;
    }

    // Reset image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = `
            <i class="fas fa-camera"></i>
            <span>Click para subir imagen</span>
        `;
    }

    if (modal) {
        modal.style.display = 'block';
    }

    updateCalzadoPreview();
}

function openEditCalzadoModal(calzadoId) {
    const modal = document.getElementById('calzadoModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('calzadoForm');

    if (modalTitle) {
        modalTitle.textContent = 'Editar Calzado';
    }

    if (form) {
        populateCalzadoForm(calzadoId);
        currentEditId = calzadoId;
    }

    if (modal) {
        modal.style.display = 'block';
    }

    updateCalzadoPreview();
}

function closeModalFunction() {
    const modal = document.getElementById('calzadoModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditId = null;
}

// Image upload handling
function handleImageUpload(e) {
    const file = e.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    
    if (file && imagePreview) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const calzadoData = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateCalzadoForm(calzadoData)) {
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
        if (currentEditId) {
            calzadoData.id = currentEditId;
            updateCalzado(calzadoData);
        } else {
            createCalzado(calzadoData);
        }

        closeModalFunction();
        
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Calzado';
            saveBtn.disabled = false;
        }
    }, 1500);
}

function validateCalzadoForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.brand) {
        errors.push('Debe seleccionar una marca');
    }

    if (!data.model || data.model.trim().length < 2) {
        errors.push('El modelo debe tener al menos 2 caracteres');
    }

    if (!data.size) {
        errors.push('Debe seleccionar una talla');
    }

    if (!data.price || parseFloat(data.price) <= 0) {
        errors.push('El precio debe ser mayor a 0');
    }

    if (errors.length > 0) {
        showNotification('Por favor corrige los siguientes errores:\n• ' + errors.join('\n• '), 'error');
        return false;
    }

    return true;
}

// Calzado CRUD operations
function createCalzado(calzadoData) {
    // Generate new ID
    const newId = String(calzados.length + 1).padStart(3, '0');
    
    // Create new calzado object
    const newCalzado = {
        id: newId,
        name: calzadoData.name,
        brand: calzadoData.brand,
        model: calzadoData.model,
        size: calzadoData.size,
        price: parseFloat(calzadoData.price),
        category: calzadoData.category || 'Casual',
        image: '../../../static/img/calzado-default.jpg',
        stock: 0,
        status: 'active'
    };
    
    // Add to calzados array
    calzados.push(newCalzado);
    
    // Refresh table
    loadCalzados();
    
    showNotification('Calzado creado exitosamente', 'success');
}

function updateCalzado(calzadoData) {
    // Find calzado index
    const calzadoIndex = calzados.findIndex(calzado => calzado.id === calzadoData.id);
    
    if (calzadoIndex !== -1) {
        // Update calzado data
        calzados[calzadoIndex] = {
            ...calzados[calzadoIndex],
            name: calzadoData.name,
            brand: calzadoData.brand,
            model: calzadoData.model,
            size: calzadoData.size,
            price: parseFloat(calzadoData.price),
            category: calzadoData.category || 'Casual'
        };
        
        // Refresh table
        loadCalzados();
        
        showNotification('Calzado actualizado exitosamente', 'success');
    }
}

function deleteCalzado(calzadoId) {
    if (confirm('¿Está seguro de que desea eliminar este calzado?')) {
        // Find and remove calzado
        const calzadoIndex = calzados.findIndex(calzado => calzado.id === calzadoId);
        
        if (calzadoIndex !== -1) {
            calzados.splice(calzadoIndex, 1);
            loadCalzados();
            showNotification('Calzado eliminado exitosamente', 'success');
        }
    }
}

function viewCalzado(calzadoId) {
    const calzado = calzados.find(c => c.id === calzadoId);
    
    if (calzado) {
        const viewModal = createViewCalzadoModal(calzado);
        document.body.appendChild(viewModal);
    }
}

function createViewCalzadoModal(calzado) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const formattedPrice = `S/ ${calzado.price.toFixed(2)}`;
    const formattedPurchasePrice = `S/ ${calzado.purchasePrice.toFixed(2)}`;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Calzado</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="calzado-details-view">
                    <div class="calzado-image-large">
                        <div class="placeholder-image" style="width: 150px; height: 150px; font-size: 60px;">
                            <i class="fas fa-shoe-prints"></i>
                        </div>
                    </div>
                    <div class="calzado-info-details">
                        <h4>${calzado.name}</h4>
                        <p><strong>ID:</strong> ${calzado.id}</p>
                        <p><strong>Marca:</strong> <span class="brand-badge">${calzado.brand}</span></p>
                        <p><strong>Modelo:</strong> ${calzado.model}</p>
                        <p><strong>Color:</strong> <span class="color-badge ${calzado.color.toLowerCase()}">${calzado.color}</span></p>
                        <p><strong>Tipo:</strong> <span class="type-badge ${calzado.type.toLowerCase()}">${calzado.type}</span></p>
                        <p><strong>Talla:</strong> <span class="size-badge">${calzado.size}</span></p>
                        <p><strong>Material:</strong> ${calzado.material}</p>
                        <p><strong>Categoría:</strong> <span class="product-category ${calzado.category.toLowerCase()}">${calzado.category}</span></p>
                        <div class="price-details">
                            <p><strong>Precio de Venta:</strong> <span class="price">${formattedPrice}</span></p>
                            <p><strong>Precio de Compra:</strong> <span class="purchase-price">${formattedPurchasePrice}</span></p>
                        </div>
                        <p><strong>Stock:</strong> ${calzado.stock} unidades</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="openEditCalzadoModal('${calzado.id}'); this.closest('.modal').remove();">Editar Calzado</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Table management
function refreshCalzadosTable() {
    loadCalzados();
}

function populateCalzadoForm(calzadoId) {
    const calzado = calzados.find(c => c.id === calzadoId);
    if (calzado) {
        document.getElementById('calzadoName').value = calzado.name;
        document.getElementById('calzadoBrand').value = calzado.brand;
        document.getElementById('calzadoModel').value = calzado.model;
        document.getElementById('calzadoSize').value = calzado.size;
        document.getElementById('calzadoPrice').value = calzado.price;
        document.getElementById('calzadoCategory').value = calzado.category;
        
        // Update image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview && calzado.image) {
            imagePreview.innerHTML = `<img src="${calzado.image}" alt="Preview">`;
        }
    }
}

// Checkbox management
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.calzado-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function handleIndividualCheckbox() {
    const checkboxes = document.querySelectorAll('.calzado-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    const someChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
}

// Action button listeners
function addActionButtonListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const calzadoId = e.currentTarget.getAttribute('data-calzado-id');
            openEditCalzadoModal(calzadoId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            const calzadoId = e.currentTarget.getAttribute('data-calzado-id');
            deleteCalzado(calzadoId);
        });
    });

    // View buttons
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', (e) => {
            const calzadoId = e.currentTarget.getAttribute('data-calzado-id');
            viewCalzado(calzadoId);
        });
    });

    // Individual checkboxes
    document.querySelectorAll('.calzado-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

// Logout functionality
function handleLogout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        window.location.href = '../login.html';
    }
}

// Update pagination info
function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        const total = calzados.length;
        paginationInfo.textContent = `Mostrando 1-${total} de ${total} calzados`;
    }
}

// Preview updates
function addPreviewUpdates() {
    const inputs = ['calzadoName', 'calzadoBrand', 'calzadoModel', 'calzadoSize', 'calzadoPrice', 'calzadoCategory'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateCalzadoPreview);
        }
    });
}

function updateCalzadoPreview() {
    const name = document.getElementById('calzadoName')?.value || 'Nombre del Calzado';
    const brand = document.getElementById('calzadoBrand')?.value || 'Marca';
    const model = document.getElementById('calzadoModel')?.value || 'Modelo';
    const size = document.getElementById('calzadoSize')?.value || '--';
    const price = document.getElementById('calzadoPrice')?.value || '0.00';
    
    const previewName = document.getElementById('previewCalzadoName');
    const previewDetails = document.getElementById('previewCalzadoDetails');
    const previewSize = document.querySelector('.preview-size');
    const previewPrice = document.querySelector('.preview-price');
    
    if (previewName) previewName.textContent = name;
    if (previewDetails) previewDetails.textContent = `${brand} - ${model}`;
    if (previewSize) previewSize.textContent = `Talla: ${size}`;
    if (previewPrice) previewPrice.textContent = `S/ ${parseFloat(price || 0).toFixed(2)}`;
}

// Utility functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: auto;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
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
    
    .calzado-details-view {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .calzado-info-details {
        flex: 1;
    }
    
    .calzado-info-details h4 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 24px;
    }
    
    .calzado-info-details p {
        margin: 8px 0;
        color: #666;
        font-size: 14px;
    }
    
    .calzado-info-details strong {
        color: #333;
        font-weight: 600;
    }
`;
document.head.appendChild(style);
