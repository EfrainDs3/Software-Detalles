// Función para agregar un campo de producto al modal
function addProductInput(product = { nombre: '', cantidad: 1, precio: '' }) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('product-item');

    // ✅ Generar ID único para la lista desplegable
    const uniqueId = `productos-dropdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    itemDiv.innerHTML = `
            <div class="form-group product-search-wrapper">
                <label>Nombre del Producto</label>
                <div class="custom-dropdown-container">
                    <input type="text" 
                           class="product-name-input" 
                           value="${product.nombre}" 
                           placeholder="Buscar producto..." 
                           autocomplete="off"
                           data-dropdown-id="${uniqueId}">
                    <div class="product-dropdown" id="${uniqueId}" style="display: none;"></div>
                </div>
            </div>
            <div class="form-group">
                <label>Cantidad</label>
                <input type="number" class="product-qty-input" value="${product.cantidad}" min="1">
            </div>
            <div class="form-group">
                <label>Precio (S/)</label>
                <input type="number" class="product-price-input" value="${product.precio}" step="0.01" min="0">
            </div>
            <button type="button" class="btn-icon btn-delete remove-product-btn" title="Eliminar Producto">
                <i class="fas fa-minus-circle"></i>
            </button>
        `;
    productosContainer.appendChild(itemDiv);

    // Referencias a los elementos
    const nameInput = itemDiv.querySelector('.product-name-input');
    const priceInput = itemDiv.querySelector('.product-price-input');
    const dropdown = itemDiv.querySelector('.product-dropdown');

    // Función para renderizar la lista de productos
    function renderProductDropdown(filteredProducts) {
        if (filteredProducts.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-item no-results">No se encontraron productos</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = filteredProducts.map(p => `
                <div class="dropdown-item" data-producto='${JSON.stringify(p)}'>
                    <div class="dropdown-item-name">${p.nombre}</div>
                    <div class="dropdown-item-price">S/ ${(p.precioVenta || 0).toFixed(2)}</div>
                </div>
            `).join('');
        dropdown.style.display = 'block';
    }

    // Evento de búsqueda en tiempo real
    nameInput.addEventListener('input', () => {
        const searchTerm = nameInput.value.toLowerCase().trim();

        if (searchTerm === '') {
            renderProductDropdown(productosDisponibles);
        } else {
            const filtered = productosDisponibles.filter(p =>
                p.nombre.toLowerCase().includes(searchTerm)
            );
            renderProductDropdown(filtered);
        }
    });

    // Evento de focus para mostrar la lista
    nameInput.addEventListener('focus', () => {
        const searchTerm = nameInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            renderProductDropdown(productosDisponibles);
        } else {
            const filtered = productosDisponibles.filter(p =>
                p.nombre.toLowerCase().includes(searchTerm)
            );
            renderProductDropdown(filtered);
        }
    });

    // Evento de clic en los items de la lista
    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (item && item.dataset.producto) {
            const selectedProduct = JSON.parse(item.dataset.producto);
            nameInput.value = selectedProduct.nombre;
            priceInput.value = (selectedProduct.precioVenta || 0).toFixed(2);
            dropdown.style.display = 'none';
            calculateTotal();
        }
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!itemDiv.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Actualizar el total en cada cambio de input
    itemDiv.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    // Eliminar producto
    itemDiv.querySelector('.remove-product-btn').addEventListener('click', () => {
        itemDiv.remove();
        calculateTotal();
    });
}
