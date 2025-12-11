/**
 * Product Modal System
 * Sistema de modal profesional para mostrar información detallada de productos
 */

// Variable global para almacenar el producto actual
let currentProduct = null;

/**
 * Inicializar el modal cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function () {
    createModalStructure();
    setupModalEventListeners();
});

/**
 * Crear la estructura HTML del modal
 */
function createModalStructure() {
    // Verificar si ya existe el modal
    if (document.getElementById('productDetailModal')) {
        return;
    }

    const modalHTML = `
        <div id="productDetailModal" class="product-modal">
            <div class="product-modal-overlay"></div>
            <div class="product-modal-container">
                <button class="product-modal-close" aria-label="Cerrar modal">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="product-modal-content">
                    <div class="product-modal-left">
                        <div class="product-modal-image-container">
                            <img id="modalProductImage" src="" alt="Product Image" class="product-modal-image">
                            <div class="product-modal-badge" id="modalBadge"></div>
                        </div>
                    </div>
                    
                    <div class="product-modal-right">
                        <div class="product-modal-header">
                            <div class="product-modal-brand" id="modalBrand"></div>
                            <h2 class="product-modal-title" id="modalTitle"></h2>
                            <div class="product-modal-code" id="modalCode"></div>
                        </div>
                        
                        <div class="product-modal-price-section">
                            <div class="product-modal-price" id="modalPrice"></div>
                            <div class="product-modal-stock" id="modalStock"></div>
                        </div>
                        
                        <div class="product-modal-divider"></div>
                        
                        <div class="product-modal-description">
                            <h3>Descripción</h3>
                            <p id="modalDescription"></p>
                        </div>
                        
                        <div class="product-modal-specifications">
                            <h3>Especificaciones</h3>
                            <div class="specifications-grid" id="modalSpecifications"></div>
                        </div>
                        
                        <div class="product-modal-actions">
                            <div class="quantity-selector">
                                <button class="quantity-btn" onclick="decreaseQuantity()">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" id="modalQuantity" value="1" min="1" max="99" readonly>
                                <button class="quantity-btn" onclick="increaseQuantity()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <button class="btn-add-to-cart-modal" onclick="addToCartFromModal()">
                                <i class="fas fa-shopping-cart"></i>
                                Añadir al Carrito
                            </button>
                            
                            <button class="btn-add-to-favorites-modal" onclick="addToFavoritesFromModal()">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>          
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Configurar event listeners del modal
 */
function setupModalEventListeners() {
    const modal = document.getElementById('productDetailModal');
    const closeBtn = document.querySelector('.product-modal-close');
    const overlay = document.querySelector('.product-modal-overlay');

    // Cerrar modal con el botón X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }

    // Cerrar modal al hacer click en el overlay
    if (overlay) {
        overlay.addEventListener('click', closeProductModal);
    }

    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
}

/**
 * Abrir modal con información del producto
 * Esta función debe ser llamada cuando se hace click en un producto
 */
async function openProductModal(productId) {
    try {
        console.log('Abriendo modal para producto ID:', productId);

        // Mostrar loading
        showModalLoading();

        // Obtener información del producto desde la API
        const producto = await fetchProductDetails(productId);

        if (!producto) {
            console.error('No se pudo cargar la información del producto');
            closeProductModal();
            return;
        }

        currentProduct = producto;

        // Rellenar el modal con la información del producto
        populateModalWithProduct(producto);

        // Mostrar el modal
        const modal = document.getElementById('productDetailModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        }

    } catch (error) {
        console.error('Error al abrir el modal:', error);
        closeProductModal();
    }
}

/**
 * Mostrar loading en el modal
 */
function showModalLoading() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.add('active', 'loading');
    }
}

/**
 * Obtener detalles del producto desde la API
 */
async function fetchProductDetails(productId) {
    try {
        // Primero buscar en los productos ya cargados (si están disponibles)
        if (typeof todosLosProductos !== 'undefined' && todosLosProductos.length > 0) {
            const producto = todosLosProductos.find(p => p.id === productId);
            if (producto) {
                console.log('Producto encontrado en cache:', producto);
                return producto;
            }
        }

        // Si no está en cache, hacer petición a la API
        console.log('Buscando producto en API...');
        const response = await fetch(`/api/productos/${productId}`);

        if (!response.ok) {
            throw new Error('Error al obtener detalles del producto');
        }

        const producto = await response.json();
        console.log('Producto obtenido de API:', producto);
        return producto;

    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
}

/**
 * Rellenar el modal con la información del producto
 */
function populateModalWithProduct(producto) {
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    // Remover clase loading
    modal.classList.remove('loading');

    // Imagen
    const imgElement = document.getElementById('modalProductImage');
    if (imgElement) {
        imgElement.src = producto.imagen || '/img/Upload/productos/producto-default.jpg';
        imgElement.alt = producto.nombre || 'Producto';
        imgElement.onerror = function () {
            this.src = '/img/Upload/productos/producto-default.jpg';
        };
    }

    // Marca
    const brandElement = document.getElementById('modalBrand');
    if (brandElement) {
        const marca = producto.marca?.nombre || extractBrandFromName(producto.nombre);
        brandElement.textContent = marca;
    }

    // Título
    const titleElement = document.getElementById('modalTitle');
    if (titleElement) {
        titleElement.textContent = producto.nombre || 'Producto sin nombre';
    }

    // Código de barra
    const codeElement = document.getElementById('modalCode');
    if (codeElement) {
        codeElement.textContent = `Código: ${producto.codigoBarra || 'N/A'}`;
    }

    // Precio
    const priceElement = document.getElementById('modalPrice');
    if (priceElement) {
        const precio = producto.precio_venta || producto.precioVenta || producto.costoCompra || 0;
        priceElement.textContent = `S/ ${parseFloat(precio).toFixed(2)}`;
    }

    // Stock
    const stockElement = document.getElementById('modalStock');
    if (stockElement) {
        const stock = producto.pesoGramos || 0;
        if (stock > 0) {
            stockElement.innerHTML = `<i class="fas fa-check-circle"></i> Disponible (${stock} unidades)`;
            stockElement.className = 'product-modal-stock in-stock';
        } else {
            stockElement.innerHTML = `<i class="fas fa-times-circle"></i> Agotado`;
            stockElement.className = 'product-modal-stock out-of-stock';
        }
    }

    // Descripción
    const descElement = document.getElementById('modalDescription');
    if (descElement) {
        descElement.textContent = producto.descripcion || 'Sin descripción disponible';
    }

    // Especificaciones
    const specsElement = document.getElementById('modalSpecifications');
    if (specsElement) {
        const specs = buildSpecifications(producto);
        specsElement.innerHTML = specs;
    }

    // Badge (nuevo, oferta, etc.)
    const badgeElement = document.getElementById('modalBadge');
    if (badgeElement && producto.activo) {
        badgeElement.textContent = 'Disponible';
        badgeElement.style.display = 'block';
    } else if (badgeElement) {
        badgeElement.style.display = 'none';
    }
}

/**
 * Construir HTML de especificaciones
 */
function buildSpecifications(producto) {
    const specs = [];

    // Color
    if (producto.color) {
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Color:</span>
                <span class="spec-value">${producto.color}</span>
            </div>
        `);
    }

    // Dimensiones
    if (producto.dimensiones) {
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Dimensiones:</span>
                <span class="spec-value">${producto.dimensiones}</span>
            </div>
        `);
    }

    // Material
    if (producto.material?.nombre) {
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Material:</span>
                <span class="spec-value">${producto.material.nombre}</span>
            </div>
        `);
    }

    // Modelo
    if (producto.modelo?.nombre) {
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Modelo:</span>
                <span class="spec-value">${producto.modelo.nombre}</span>
            </div>
        `);
    }

    // Tipo de producto
    if (producto.tiposProducto && producto.tiposProducto.length > 0) {
        const tipos = producto.tiposProducto.map(tp => tp.nombre).join(', ');
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Tipo:</span>
                <span class="spec-value">${tipos}</span>
            </div>
        `);
    }

    // Proveedor
    if (producto.proveedor?.razonSocial) {
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Proveedor:</span>
                <span class="spec-value">${producto.proveedor.razonSocial}</span>
            </div>
        `);
    }

    // Peso
    if (producto.pesoGramos) {
        specs.push(`
            <div class="spec-item">
                <span class="spec-label">Stock:</span>
                <span class="spec-value">${producto.pesoGramos} unidades</span>
            </div>
        `);
    }

    return specs.join('') || '<p class="no-specs">No hay especificaciones disponibles</p>';
}

/**
 * Extraer marca del nombre del producto
 */
function extractBrandFromName(nombre) {
    if (!nombre) return 'MARCA';
    const palabras = nombre.split(' ');
    return palabras[0] || 'MARCA';
}

/**
 * Cerrar el modal
 */
function closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.remove('active', 'loading');
        document.body.style.overflow = ''; // Restaurar scroll del body
        currentProduct = null;

        // Reset quantity
        const quantityInput = document.getElementById('modalQuantity');
        if (quantityInput) {
            quantityInput.value = 1;
        }
    }
}

/**
 * Funciones de cantidad
 */
function increaseQuantity() {
    const input = document.getElementById('modalQuantity');
    if (input) {
        let value = parseInt(input.value) || 1;
        const max = parseInt(input.max) || 99;
        if (value < max) {
            input.value = value + 1;
        }
    }
}

function decreaseQuantity() {
    const input = document.getElementById('modalQuantity');
    if (input) {
        let value = parseInt(input.value) || 1;
        const min = parseInt(input.min) || 1;
        if (value > min) {
            input.value = value - 1;
        }
    }
}

/**
 * Añadir al carrito desde el modal
 */
function addToCartFromModal() {
    if (!currentProduct) return;

    const quantity = parseInt(document.getElementById('modalQuantity')?.value) || 1;

    console.log('Añadiendo al carrito:', {
        producto: currentProduct,
        cantidad: quantity
    });

    // Llamar a la función existente de agregar al carrito
    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(currentProduct.id, quantity);
    } else {
        alert(`Producto "${currentProduct.nombre}" agregado al carrito (cantidad: ${quantity})`);
    }

    // Cerrar modal después de añadir
    closeProductModal();
}

/**
 * Añadir a favoritos desde el modal
 */
function addToFavoritesFromModal() {
    if (!currentProduct) return;

    console.log('Añadiendo a favoritos:', currentProduct);

    // Llamar a la función existente de agregar a favoritos
    if (typeof agregarFavoritos === 'function') {
        agregarFavoritos(currentProduct.id);
    } else {
        alert(`Producto "${currentProduct.nombre}" agregado a favoritos`);
    }
}

/**
 * Función auxiliar para abrir modal desde la tarjeta de producto
 * Puede ser llamada directamente desde el HTML
 */
function abrirModalProducto(productId) {
    openProductModal(productId);
}
