// Accesorios Module JavaScript

// Global variables
let accesorios = [
    {
        id: '001',
        name: 'Cinturón de Cuero Premium',
        brand: 'Levi\'s',
        color: 'Negro',
        material: 'Cuero',
        description: 'Cinturón elegante de cuero genuino con hebilla metálica',
        dimensions: '120 x 4 x 0.5 cm',
        weight: '250 g',
        proveedor: 'Accesorios Fashion',
        unidad: 'Unidad',
        category: 'Cinturones',
        tallas: [
            { talla: 'S', precioVenta: 89.90, precioCompra: 65.00 },
            { talla: 'M', precioVenta: 94.90, precioCompra: 70.00 }
        ],
        stock: 15,
        image: '../../../static/img/accesorio-default.jpg',
        status: 'active'
    },
    {
        id: '002',
        name: 'Cartera de Cuero Coach',
        brand: 'Coach',
        color: 'Marrón',
        material: 'Cuero',
        description: 'Cartera elegante con múltiples compartimentos para tarjetas',
        dimensions: '20 x 10 x 2 cm',
        weight: '180 g',
        proveedor: 'Calzados Premium Ltda.',
        unidad: 'Unidad',
        category: 'Carteras',
        tallas: [
            { talla: 'Única', precioVenta: 299.90, precioCompra: 210.00 }
        ],
        stock: 8,
        image: '../../../static/img/accesorio-default.jpg',
        status: 'active'
    },
    {
        id: '003',
        name: 'Gafas de Sol Ray-Ban',
        brand: 'Ray-Ban',
        color: 'Negro',
        material: 'Metal',
        description: 'Gafas de sol clásicas estilo aviador con protección UV400',
        dimensions: '14 x 5 x 14 cm',
        weight: '35 g',
        proveedor: 'Sportswear Internacional',
        unidad: 'Unidad',
        category: 'Gafas',
        tallas: [
            { talla: 'Única', precioVenta: 189.90, precioCompra: 135.00 }
        ],
        stock: 12,
        image: '../../../static/img/accesorio-default.jpg',
        status: 'active'
    }
];

let currentAccesorio = null;
let editingIndex = -1;

// DOM Elements
const modal = document.getElementById('accesorioModal');
const modalTitle = document.getElementById('modalTitle');
const form = document.getElementById('accesorioForm');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const addAccesorioBtn = document.getElementById('addAccesorioBtn');
const tableBody = document.getElementById('accesoriosTableBody');
const selectAllCheckbox = document.getElementById('selectAll');

// Form Elements
const nameInput = document.getElementById('accesorioName');
const brandInput = document.getElementById('accesorioBrand');
const colorInput = document.getElementById('accesorioColor');
const materialInput = document.getElementById('accesorioMaterial');
const dimensionsInput = document.getElementById('accesorioDimensions');
const weightInput = document.getElementById('accesorioWeight');
const proveedorInput = document.getElementById('accesorioProveedor');
const unidadInput = document.getElementById('accesorioUnidad');
const categoryInput = document.getElementById('accesorioCategory');
const addTallaBtn = document.getElementById('addTallaBtn');
const tallasContainer = document.getElementById('tallasContainer');
const descriptionInput = document.getElementById('accesorioDescription');
const imageInput = document.getElementById('accesorioImage');
const imagePreview = document.getElementById('imagePreview');
const selectImageBtn = document.getElementById('selectImageBtn');

// Preview Elements
const previewName = document.getElementById('previewAccesorioName');
const previewDetails = document.getElementById('previewAccesorioDetails');
const previewColor = document.querySelector('.preview-color');
const previewMaterial = document.querySelector('.preview-material');
const previewDimensions = document.querySelector('.preview-dimensions');
const previewWeight = document.querySelector('.preview-weight');
const previewPriceSale = document.querySelector('.preview-price-sale');
const previewPricePurchase = document.querySelector('.preview-price-purchase');
const previewSize = document.querySelector('.preview-size');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadAccesorios();
    initializeEventListeners();
    updatePreview();
});

function initializeEventListeners() {
    // Modal controls
    addAccesorioBtn?.addEventListener('click', openAddModal);
    closeModalBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    form?.addEventListener('submit', handleFormSubmit);

    // Image upload
    selectImageBtn?.addEventListener('click', () => imageInput?.click());
    imageInput?.addEventListener('change', handleImageUpload);

    // Form inputs for preview
    nameInput?.addEventListener('input', updatePreview);
    brandInput?.addEventListener('change', updatePreview);
    colorInput?.addEventListener('change', updatePreview);
    materialInput?.addEventListener('change', updatePreview);
    dimensionsInput?.addEventListener('input', updatePreview);
    weightInput?.addEventListener('input', updatePreview);

    // Tallas controls
    addTallaBtn?.addEventListener('click', () => addTallaInput());

    // Select all checkbox
    selectAllCheckbox?.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.accesorio-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Setup filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilter);
    }

    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

// Modal Functions
function openAddModal() {
    currentAccesorio = null;
    editingIndex = -1;
    modalTitle.textContent = 'Nuevo Accesorio';
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Accesorio';
    form.reset();
    resetImagePreview();
    // Reset tallas section
    if (tallasContainer) tallasContainer.innerHTML = '';
    addTallaInput();
    updatePreview();
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function openEditModal(accesorio, index) {
    currentAccesorio = accesorio;
    editingIndex = index;
    modalTitle.textContent = 'Editar Accesorio';
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Accesorio';
    
    // Fill form with accesorio data
    nameInput.value = accesorio.name || '';
    brandInput.value = accesorio.brand || '';
    colorInput.value = accesorio.color || '';
    materialInput.value = accesorio.material || '';
    dimensionsInput.value = accesorio.dimensions || '';
    weightInput.value = accesorio.weight || '';
    proveedorInput.value = accesorio.proveedor || '';
    unidadInput.value = accesorio.unidad || '';
    categoryInput.value = accesorio.category || '';
    descriptionInput.value = accesorio.description || '';

    // Populate tallas
    if (tallasContainer) {
        tallasContainer.innerHTML = '';
        if (accesorio.tallas && accesorio.tallas.length) {
            accesorio.tallas.forEach(t => addTallaInput(t));
        } else {
            addTallaInput();
        }
    }
    
    updatePreview();
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        form.reset();
        resetImagePreview();
        currentAccesorio = null;
        editingIndex = -1;
    }, 300);
}

// Form Handling
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(form);
    // Collect tallas
    const tallas = [];
    const tallaItems = tallasContainer?.querySelectorAll('.talla-item') || [];
    tallaItems.forEach(item => {
        const talla = item.querySelector('.talla-select')?.value || '';
        const pv = parseFloat(item.querySelector('.talla-precio-venta')?.value || '');
        const pc = parseFloat(item.querySelector('.talla-precio-compra')?.value || '');
        if (talla && !isNaN(pv) && !isNaN(pc)) {
            tallas.push({ talla, precioVenta: pv, precioCompra: pc });
        }
    });

    if (tallas.length === 0) {
        showNotification('Agrega al menos una talla con precios válidos.', 'error');
        return;
    }

    const accesorioData = {
        name: formData.get('name'),
        brand: formData.get('brand'),
        color: formData.get('color'),
        material: formData.get('material'),
        description: formData.get('description'),
        dimensions: formData.get('dimensions'),
        weight: formData.get('weight'),
        proveedor: formData.get('proveedor'),
        unidad: formData.get('unidad'),
        category: formData.get('category'),
        tallas,
        status: 'active'
    };

    if (editingIndex >= 0) {
        // Update existing accesorio
        accesorioData.id = currentAccesorio.id;
        accesorios[editingIndex] = { ...accesorios[editingIndex], ...accesorioData };
        showNotification('Accesorio actualizado correctamente.', 'success');
        console.log('Accesorio updated:', accesorios[editingIndex]);
    } else {
        // Add new accesorio
        accesorioData.id = generateAccesorioId();
        accesorioData.image = '../../../static/img/accesorio-default.jpg';
        accesorios.push(accesorioData);
        showNotification('Accesorio creado correctamente.', 'success');
        console.log('New accesorio added:', accesorioData);
    }

    loadAccesorios();
    updatePaginationInfo();
    closeModal();
}

function generateAccesorioId() {
    const maxId = accesorios.reduce((max, accesorio) => {
        const id = parseInt(accesorio.id);
        return id > max ? id : max;
    }, 0);
    return String(maxId + 1).padStart(3, '0');
}

// Image Handling
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.style.backgroundImage = `url(${e.target.result})`;
            imagePreview.style.backgroundSize = 'cover';
            imagePreview.style.backgroundPosition = 'center';
            imagePreview.innerHTML = '';
        };
        reader.readAsDataURL(file);
    }
}

function resetImagePreview() {
    imagePreview.style.backgroundImage = '';
    imagePreview.innerHTML = '<i class="fas fa-camera"></i><span>Click para subir imagen</span>';
}

// Preview Functions
function updatePreview() {
    const name = nameInput?.value || 'Nombre del Accesorio';
    const brand = brandInput?.value || 'Marca del accesorio';
    const color = colorInput?.value || '--';
    const material = materialInput?.value || '--';
    const dimensions = dimensionsInput?.value || '--';
    const weight = weightInput?.value || '--';

    const preciosVenta = Array.from(tallasContainer?.querySelectorAll('.talla-precio-venta') || [])
        .map(inp => parseFloat(inp.value))
        .filter(v => !isNaN(v));
    const preciosCompra = Array.from(tallasContainer?.querySelectorAll('.talla-precio-compra') || [])
        .map(inp => parseFloat(inp.value))
        .filter(v => !isNaN(v));
    const minVenta = preciosVenta.length ? Math.min(...preciosVenta) : 0;
    const minCompra = preciosCompra.length ? Math.min(...preciosCompra) : 0;
    const tallasCount = (tallasContainer?.querySelectorAll('.talla-item') || []).length;

    if (previewName) previewName.textContent = name;
    if (previewDetails) previewDetails.textContent = brand;
    if (previewColor) previewColor.textContent = `Color: ${color}`;
    if (previewMaterial) previewMaterial.textContent = `Material: ${material}`;
    if (previewDimensions) previewDimensions.textContent = `Dimensiones: ${dimensions}`;
    if (previewWeight) previewWeight.textContent = `Peso: ${weight}`;
    if (previewSize) previewSize.textContent = `Tallas: ${tallasCount} registradas`;
    if (previewPriceSale) previewPriceSale.textContent = `Venta desde: S/ ${minVenta.toFixed(2)}`;
    if (previewPricePurchase) previewPricePurchase.textContent = `Compra desde: S/ ${minCompra.toFixed(2)}`;
}

// Table Functions
function loadAccesorios() {
    if (!tableBody) return;

    tableBody.innerHTML = '';
    accesorios.forEach((accesorio) => {
        const row = createAccesorioRow(accesorio, 0); // Pass 0 as placeholder since we use globalIndex inside the function
        tableBody.appendChild(row);
    });
}

function createAccesorioRow(accesorio, index) {
    const row = document.createElement('tr');
    // Store the actual index in the global array, not the filtered index
    const globalIndex = accesorios.findIndex(a => a.id === accesorio.id);
    
    row.innerHTML = `
        <td><input type="checkbox" class="accesorio-checkbox"></td>
        <td>${accesorio.id}</td>
        <td>
            <div class="product-image">
                <div class="placeholder-image">
                    <i class="fas fa-gem"></i>
                </div>
            </div>
        </td>
        <td>
            <div class="product-info">
                <div class="product-details">
                    <span class="product-name">${accesorio.name}</span>
                    <span class="product-category">${accesorio.category}</span>
                </div>
            </div>
        </td>
        <td><span class="color-badge ${accesorio.color.toLowerCase()}">${accesorio.color}</span></td>
        <td><span class="brand-badge">${accesorio.brand}</span></td>
    <td><span class="material-badge">${accesorio.material}</span></td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" title="Editar" onclick="editAccesorio(${globalIndex})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" title="Eliminar" onclick="deleteAccesorio(${globalIndex})">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" title="Ver detalles" onclick="viewAccesorio(${globalIndex})">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

// Action Functions
function editAccesorio(index) {
    const accesorio = accesorios[index];
    openEditModal(accesorio, index);
}

function deleteAccesorio(index) {
    const accesorio = accesorios[index];
    if (confirm(`¿Estás seguro de que deseas eliminar el accesorio "${accesorio.name}"?`)) {
        accesorios.splice(index, 1);
        loadAccesorios();
        updatePaginationInfo();
        showNotification('Accesorio eliminado correctamente.', 'success');
        console.log('Accesorio deleted at index:', index);
    }
}

function viewAccesorio(index) {
    const accesorio = accesorios[index];
    const modal = createViewAccesorioModal(accesorio, index);
    document.body.appendChild(modal);
}

// Create view accesorio modal
function createViewAccesorioModal(accesorio, index) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    // Compute min prices from tallas
    const preciosVenta = (accesorio.tallas || []).map(t => t.precioVenta);
    const preciosCompra = (accesorio.tallas || []).map(t => t.precioCompra);
    const minVenta = preciosVenta.length ? Math.min(...preciosVenta) : 0;
    const minCompra = preciosCompra.length ? Math.min(...preciosCompra) : 0;
    const formattedPrice = `S/ ${minVenta.toFixed(2)}`;
    const formattedPurchasePrice = `S/ ${minCompra.toFixed(2)}`;

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Accesorio</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="accesorio-details-view">
                    <div class="accesorio-image-large">
                        <div class="placeholder-image" style="width: 150px; height: 150px; font-size: 60px;">
                            <i class="fas fa-gem"></i>
                        </div>
                    </div>
                    <div class="accesorio-info-details">
                        <h4>${accesorio.name}</h4>
                        <p><strong>ID:</strong> ${accesorio.id}</p>
                        <p><strong>Marca:</strong> <span class="brand-badge">${accesorio.brand}</span></p>
                        <p><strong>Color:</strong> <span class="color-badge ${accesorio.color.toLowerCase()}">${accesorio.color}</span></p>
                        <p><strong>Material:</strong> <span class="material-badge">${accesorio.material}</span></p>
                        <p><strong>Tipo Producto:</strong> <span class="product-category ${accesorio.category.toLowerCase()}">${accesorio.category}</span></p>
                        <p><strong>Proveedor:</strong> ${accesorio.proveedor || '-'}</p>
                        <p><strong>Unidad de Medida:</strong> ${accesorio.unidad || '-'}</p>
                        <p><strong>Dimensiones:</strong> ${accesorio.dimensions || '-'}</p>
                        <p><strong>Peso:</strong> ${accesorio.weight || '-'}</p>
                        <p><strong>Descripción:</strong> ${accesorio.description}</p>
                        <div class="tallas-details">
                            <h5><i class="fas fa-ruler"></i> Tallas Registradas</h5>
                            <div class="productos-table-container">
                                <table class="detalle-productos-table">
                                    <thead>
                                        <tr>
                                            <th>Talla</th>
                                            <th class="text-right">Precio Venta</th>
                                            <th class="text-right">Precio Compra</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(accesorio.tallas || []).map(t => `
                                            <tr>
                                                <td><span class=\"size-badge\">${t.talla}</span></td>
                                                <td class=\"text-right\">S/ ${Number(t.precioVenta || 0).toFixed(2)}</td>
                                                <td class=\"text-right\">S/ ${Number(t.precioCompra || 0).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="editAccesorio(${index}); this.closest('.modal').remove();">Editar Accesorio</button>
            </div>
        </div>
    `;

    return modal;
}

// Filter Functions
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
                <h3>Filtros de Accesorios</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterCategory">Tipo Producto</label>
                        <select id="filterCategory">
                            <option value="">Todas las categorías</option>
                            <option value="Cinturones">Cinturones</option>
                            <option value="Carteras">Carteras</option>
                            <option value="Sombreros">Sombreros</option>
                            <option value="Joyas">Joyas</option>
                            <option value="Gafas">Gafas</option>
                            <option value="Relojes">Relojes</option>
                            <option value="Bufandas">Bufandas</option>
                            <option value="Otros">Otros</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterBrand">Marca</label>
                        <select id="filterBrand">
                            <option value="">Todas las marcas</option>
                            <option value="Levi's">Levi's</option>
                            <option value="Tommy Hilfiger">Tommy Hilfiger</option>
                            <option value="Coach">Coach</option>
                            <option value="Michael Kors">Michael Kors</option>
                            <option value="Ray-Ban">Ray-Ban</option>
                            <option value="Fossil">Fossil</option>
                            <option value="Gucci">Gucci</option>
                            <option value="Prada">Prada</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterColor">Color</label>
                        <select id="filterColor">
                            <option value="">Todos los colores</option>
                            <option value="Negro">Negro</option>
                            <option value="Blanco">Blanco</option>
                            <option value="Marrón">Marrón</option>
                            <option value="Café">Café</option>
                            <option value="Azul">Azul</option>
                            <option value="Rojo">Rojo</option>
                            <option value="Verde">Verde</option>
                            <option value="Gris">Gris</option>
                            <option value="Beige">Beige</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterMaterial">Material</label>
                        <select id="filterMaterial">
                            <option value="">Todos los materiales</option>
                            <option value="Cuero">Cuero</option>
                            <option value="Metal">Metal</option>
                            <option value="Tela">Tela</option>
                            <option value="Plástico">Plástico</option>
                            <option value="Oro">Oro</option>
                            <option value="Plata">Plata</option>
                            <option value="Algodón">Algodón</option>
                            <option value="Lana">Lana</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterPriceRange">Rango de Precio</label>
                        <select id="filterPriceRange">
                            <option value="">Todos los precios</option>
                            <option value="0-50">S/ 0 - S/ 50</option>
                            <option value="50-100">S/ 50 - S/ 100</option>
                            <option value="100-200">S/ 100 - S/ 200</option>
                            <option value="200-300">S/ 200 - S/ 300</option>
                            <option value="300+">S/ 300+</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterStock">Stock</label>
                        <select id="filterStock">
                            <option value="">Cualquier stock</option>
                            <option value="low">Stock bajo (1-5)</option>
                            <option value="medium">Stock medio (6-15)</option>
                            <option value="high">Stock alto (16+)</option>
                            <option value="out">Sin stock</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="clearFiltersAndClose()">Limpiar Filtros</button>
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="applyFilters()">Aplicar Filtros</button>
            </div>
        </div>
    `;
    
    return modal;
}

function applyFilters() {
    const categoryFilter = document.getElementById('filterCategory').value;
    const brandFilter = document.getElementById('filterBrand').value;
    const colorFilter = document.getElementById('filterColor').value;
    const materialFilter = document.getElementById('filterMaterial').value;
    const priceRangeFilter = document.getElementById('filterPriceRange').value;
    const stockFilter = document.getElementById('filterStock').value;
    
    let filteredAccesorios = accesorios;
    
    if (categoryFilter) {
        filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.category === categoryFilter);
    }
    
    if (brandFilter) {
        filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.brand === brandFilter);
    }
    
    if (colorFilter) {
        filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.color === colorFilter);
    }
    
    if (materialFilter) {
        filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.material === materialFilter);
    }
    
    if (priceRangeFilter) {
        if (priceRangeFilter === '300+') {
            filteredAccesorios = filteredAccesorios.filter(accesorio => {
                const minVenta = Math.min(...(accesorio.tallas || []).map(t => t.precioVenta));
                return isFinite(minVenta) && minVenta >= 300;
            });
        } else {
            const [minStr, maxStr] = priceRangeFilter.split('-');
            const min = parseFloat(minStr) || 0;
            const max = maxStr ? parseFloat(maxStr) : Infinity;
            filteredAccesorios = filteredAccesorios.filter(accesorio => {
                const minVenta = Math.min(...(accesorio.tallas || []).map(t => t.precioVenta));
                if (!isFinite(minVenta)) return false;
                return minVenta >= min && minVenta <= max;
            });
        }
    }
    
    if (stockFilter) {
        switch(stockFilter) {
            case 'low':
                filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.stock >= 1 && accesorio.stock <= 5);
                break;
            case 'medium':
                filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.stock >= 6 && accesorio.stock <= 15);
                break;
            case 'high':
                filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.stock >= 16);
                break;
            case 'out':
                filteredAccesorios = filteredAccesorios.filter(accesorio => accesorio.stock === 0);
                break;
        }
    }
    
    // Update table with filtered data
    const tbody = document.getElementById('accesoriosTableBody');
    tbody.innerHTML = '';
    
    filteredAccesorios.forEach((accesorio) => {
        const row = createAccesorioRow(accesorio, 0); // Pass 0 as placeholder since we use globalIndex inside the function
        tbody.appendChild(row);
    });
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Update pagination info
    updatePaginationInfo(filteredAccesorios.length);
    
    // Show notification
    showNotification(`Filtros aplicados. Mostrando ${filteredAccesorios.length} accesorio(s).`, 'success');
}

function clearFiltersAndClose() {
    // Reset to show all accesorios
    loadAccesorios();
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Show notification
    showNotification('Filtros eliminados. Mostrando todos los accesorios.', 'info');
}

function clearFilters() {
    // This function is kept for backward compatibility but calls the new function
    clearFiltersAndClose();
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#accesoriosTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
    });
}

// Utility Functions
function closeAccesorioModal() {
    closeModal();
}

// Update pagination info
function updatePaginationInfo(count = null) {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        const total = count !== null ? count : accesorios.length;
        paginationInfo.textContent = `Mostrando 1-${total} de ${total} accesorio${total !== 1 ? 's' : ''}`;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 350px;
            }
            .notification.success {
                border-left: 4px solid #28a745;
                color: #28a745;
            }
            .notification.error {
                border-left: 4px solid #dc3545;
                color: #dc3545;
            }
            .notification.info {
                border-left: 4px solid #17a2b8;
                color: #17a2b8;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ESC key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        const detailModals = document.querySelectorAll('.modal');
        detailModals.forEach(modal => {
            if (modal.id !== 'accesorioModal') {
                modal.remove();
            }
        });
    }
});

// --------- Tallas (crear/editar) helpers ---------
function addTallaInput(initial = null) {
    if (!tallasContainer) return;

    const item = document.createElement('div');
    item.className = 'talla-item';
    // Disposición en una sola fila como en calzados
    item.style.display = 'grid';
    item.style.gridTemplateColumns = '1fr 1fr 1fr auto';
    item.style.gap = '12px';
    item.style.alignItems = 'end';

    item.innerHTML = `
        <div class="form-group">
            <label>Talla</label>
            <select class="talla-select">
                <option value="">Seleccionar talla</option>
                <option value="XS" ${initial?.talla === 'XS' ? 'selected' : ''}>XS</option>
                <option value="S" ${initial?.talla === 'S' ? 'selected' : ''}>S</option>
                <option value="M" ${initial?.talla === 'M' ? 'selected' : ''}>M</option>
                <option value="L" ${initial?.talla === 'L' ? 'selected' : ''}>L</option>
                <option value="XL" ${initial?.talla === 'XL' ? 'selected' : ''}>XL</option>
                <option value="Única" ${initial?.talla === 'Única' ? 'selected' : ''}>Única</option>
            </select>
        </div>
        <div class="form-group">
            <label>Precio Venta (S/)</label>
            <input type="number" class="talla-precio-venta" value="${initial?.precioVenta ?? ''}" step="0.01" min="0" placeholder="0.00">
        </div>
        <div class="form-group">
            <label>Precio Compra (S/)</label>
            <input type="number" class="talla-precio-compra" value="${initial?.precioCompra ?? ''}" step="0.01" min="0" placeholder="0.00">
        </div>
        <button type="button" class="btn-icon btn-delete remove-talla-btn" title="Eliminar Talla">
            <i class="fas fa-minus-circle"></i>
        </button>
    `;

    tallasContainer.appendChild(item);

    const select = item.querySelector('.talla-select');
    const pv = item.querySelector('.talla-precio-venta');
    const pc = item.querySelector('.talla-precio-compra');
    const removeBtn = item.querySelector('.remove-talla-btn');

    select.addEventListener('change', updatePreview);
    pv.addEventListener('input', updatePreview);
    pc.addEventListener('input', updatePreview);
    removeBtn.addEventListener('click', () => {
        item.remove();
        updatePreview();
    });

    updatePreview();
}
