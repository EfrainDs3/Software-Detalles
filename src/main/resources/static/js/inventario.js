document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const inventarioTableBody = document.getElementById('inventarioTableBody');
    const searchInput = document.getElementById('searchInput');
    const almacenFilter = document.getElementById('almacenFilter');
    const categoriaFilter = document.getElementById('categoriaFilter');
    const stockFilter = document.getElementById('stockFilter');
    const movimientosBtn = document.getElementById('movimientosBtn');
    const registrarProductoBtn = document.getElementById('registrarProductoBtn');

    // Referencias del modal de ajuste
    const ajusteStockModal = document.getElementById('ajusteStockModal');
    const closeAjusteModal = document.getElementById('closeAjusteModal');
    const cancelAjusteBtn = document.getElementById('cancelAjusteBtn');
    const ajusteStockForm = document.getElementById('ajusteStockForm');
    const tipoMovimientoSelect = document.getElementById('tipoMovimiento');
    const cantidadAjusteInput = document.getElementById('cantidadAjuste');
    const almacenDestinoGroup = document.getElementById('almacenDestinoGroup');
    const almacenDestinoSelect = document.getElementById('almacenDestino');

    // Referencias del modal de movimientos
    const movimientosModal = document.getElementById('movimientosModal');
    const closeMovimientosModal = document.getElementById('closeMovimientosModal');
    const cerrarMovimientosBtn = document.getElementById('cerrarMovimientosBtn');
    const movimientosTableBody = document.getElementById('movimientosTableBody');
    const fechaDesde = document.getElementById('fechaDesde');
    const fechaHasta = document.getElementById('fechaHasta');
    const tipoMovimientoFilter = document.getElementById('tipoMovimientoFilter');
    const filtrarMovimientos = document.getElementById('filtrarMovimientos');

    // Referencias del modal de registrar producto
    const registrarProductoModal = document.getElementById('registrarProductoModal');
    const closeRegistrarModal = document.getElementById('closeRegistrarModal');
    const cancelRegistrarBtn = document.getElementById('cancelRegistrarBtn');
    const registrarProductoForm = document.getElementById('registrarProductoForm');
    const productoSelect = document.getElementById('productoSelect');
    const codigoBarraDisplay = document.getElementById('codigoBarraDisplay');
    const almacenSelect = document.getElementById('almacenSelect');
    const stockMinimoRegistro = document.getElementById('stockMinimoRegistro');
    const stockInicial = document.getElementById('stockInicial');
    const productDetailsDisplay = document.getElementById('productDetailsDisplay');

    // Referencias para summary cards
    const totalProductos = document.getElementById('totalProductos');
    const stockTotal = document.getElementById('stockTotal');
    const productosStockMinimo = document.getElementById('productosStockMinimo');
    const totalAlmacenes = document.getElementById('totalAlmacenes');

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
    // Datos de productos disponibles (que aún no están en inventario)
    const productosDisponibles = [
        {
            id_producto: 6,
            nombre_producto: 'Botas de Montaña Outdoor',
            codigo_barra: 'OUT001',
            categoria: 'Calzado Deportivo',
            marca: 'Mountain',
            talla: '43',
            color: 'Verde/Negro',
            precio_venta: 319.90
        },
        {
            id_producto: 7,
            nombre_producto: 'Sandalias de Cuero',
            codigo_barra: 'SAN001',
            categoria: 'Calzado Casual',
            marca: 'Comfort',
            talla: '38',
            color: 'Marrón',
            precio_venta: 89.90
        },
        {
            id_producto: 8,
            nombre_producto: 'Gorra Deportiva',
            codigo_barra: 'ACC002',
            categoria: 'Accesorios',
            marca: 'Sport',
            talla: 'Única',
            color: 'Azul',
            precio_venta: 39.90
        }
    ];

    let currentProductoAjuste = null;

    // --- Datos de Ejemplo (Simulación de una API) ---
    
    // Datos de almacenes
    const almacenesData = [
        { id: 1, nombre: 'Almacén Principal', ubicacion: 'Av. Principal 123' },
        { id: 2, nombre: 'Almacén Sucursal Norte', ubicacion: 'Jr. Los Andes 456' },
        { id: 3, nombre: 'Almacén Online', ubicacion: 'Centro de Distribución' }
    ];

    // Datos de categorías
    const categoriasData = [
        { id: 1, nombre: 'Calzado Deportivo' },
        { id: 2, nombre: 'Calzado Formal' },
        { id: 3, nombre: 'Accesorios' },
        { id: 4, nombre: 'Calzado Casual' }
    ];

    // Datos de tipos de movimiento
    const tiposMovimientoData = {
        '1': { nombre: 'Entrada - Compra', es_entrada: true },
        '2': { nombre: 'Entrada - Ajuste Positivo', es_entrada: true },
        '3': { nombre: 'Entrada - Devolución', es_entrada: true },
        '4': { nombre: 'Salida - Venta', es_entrada: false },
        '5': { nombre: 'Salida - Ajuste Negativo', es_entrada: false },
        '6': { nombre: 'Salida - Merma/Pérdida', es_entrada: false },
        '7': { nombre: 'Transferencia Entre Almacenes', es_entrada: null }
    };

    // Datos de inventario (simulando la vista combinada de la BD)
    let inventarioData = [
        {
            id_inventario: 1,
            id_producto: 1,
            codigo_barra: 'CAL001',
            nombre_producto: 'Nike Air Max 270',
            categoria: 'Calzado Deportivo',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            cantidad_stock: 25,
            stock_minimo: 5,
            costo_compra: 180.00,
            talla: '42',
            color: 'Negro/Blanco',
            marca: 'Nike',
            fecha_ultima_actualizacion: '2025-09-20T10:30:00'
        },
        {
            id_inventario: 2,
            id_producto: 1,
            codigo_barra: 'CAL001',
            nombre_producto: 'Nike Air Max 270',
            categoria: 'Calzado Deportivo',
            id_almacen: 2,
            nombre_almacen: 'Almacén Sucursal Norte',
            cantidad_stock: 12,
            stock_minimo: 3,
            talla: '42',
            color: 'Negro/Blanco',
            marca: 'Nike',
            fecha_ultima_actualizacion: '2025-09-19T14:15:00'
        },
        {
            id_inventario: 3,
            id_producto: 2,
            codigo_barra: 'CAL002',
            nombre_producto: 'Adidas Ultraboost 22',
            categoria: 'Calzado Deportivo',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            cantidad_stock: 3,
            stock_minimo: 5,
            talla: '41',
            color: 'Blanco/Azul',
            marca: 'Adidas',
            fecha_ultima_actualizacion: '2025-09-18T09:45:00'
        },
        {
            id_inventario: 4,
            id_producto: 3,
            codigo_barra: 'FOR001',
            nombre_producto: 'Zapatos Oxford Cuero',
            categoria: 'Calzado Formal',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            cantidad_stock: 0,
            stock_minimo: 2,
            talla: '40',
            color: 'Negro',
            marca: 'Clásico',
            fecha_ultima_actualizacion: '2025-09-15T16:20:00'
        },
        {
            id_inventario: 5,
            id_producto: 4,
            codigo_barra: 'ACC001',
            nombre_producto: 'Cinturón de Cuero Premium',
            categoria: 'Accesorios',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            cantidad_stock: 15,
            stock_minimo: 5,
            talla: 'L',
            color: 'Marrón',
            marca: 'Premium',
            fecha_ultima_actualizacion: '2025-09-21T11:10:00'
        },
        {
            id_inventario: 6,
            id_producto: 5,
            codigo_barra: 'CAS001',
            nombre_producto: 'Zapatillas Casual Urbanas',
            categoria: 'Calzado Casual',
            id_almacen: 2,
            nombre_almacen: 'Almacén Sucursal Norte',
            cantidad_stock: 8,
            stock_minimo: 4,
            talla: '39',
            color: 'Gris',
            marca: 'Urban',
            fecha_ultima_actualizacion: '2025-09-22T13:25:00'
        }
    ];

    // Datos de movimientos de inventario
    let movimientosData = [
        {
            id_movimiento: 1,
            id_producto: 1,
            nombre_producto: 'Nike Air Max 270',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            tipo_movimiento: 'Entrada - Compra',
            cantidad: 20,
            fecha_movimiento: '2025-09-20T10:30:00',
            usuario: 'Juan Pérez',
            referencia_doc: 'FAC-001',
            observaciones: 'Compra a proveedor Nike'
        },
        {
            id_movimiento: 2,
            id_producto: 1,
            nombre_producto: 'Nike Air Max 270',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            tipo_movimiento: 'Salida - Venta',
            cantidad: 2,
            fecha_movimiento: '2025-09-21T14:15:00',
            usuario: 'María García',
            referencia_doc: 'BOL-045',
            observaciones: 'Venta al público'
        },
        {
            id_movimiento: 3,
            id_producto: 2,
            nombre_producto: 'Adidas Ultraboost 22',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            tipo_movimiento: 'Entrada - Compra',
            cantidad: 8,
            fecha_movimiento: '2025-09-18T09:45:00',
            usuario: 'Carlos López',
            referencia_doc: 'FAC-002',
            observaciones: 'Restock productos populares'
        },
        {
            id_movimiento: 4,
            id_producto: 3,
            nombre_producto: 'Zapatos Oxford Cuero',
            id_almacen: 1,
            nombre_almacen: 'Almacén Principal',
            tipo_movimiento: 'Salida - Venta',
            cantidad: 1,
            fecha_movimiento: '2025-09-22T11:30:00',
            usuario: 'Ana Torres',
            referencia_doc: 'BOL-046',
            observaciones: 'Última unidad disponible'
        }
    ];

    // --- Funciones Utilitarias ---
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatCurrency(amount) {
        return `S/ ${parseFloat(amount).toFixed(2)}`;
    }

    function getStockStatus(stock, stockMinimo) {
        if (stock <= 0) return 'agotado';
        if (stock <= stockMinimo) return 'bajo';
        return 'disponible';
    }

    function getStockStatusText(status) {
        switch (status) {
            case 'agotado': return 'Agotado';
            case 'bajo': return 'Stock Bajo';
            case 'disponible': return 'Disponible';
            default: return 'Desconocido';
        }
    }

    // --- Funciones de Inicialización ---

    function initializeFilters() {
        // Cargar almacenes en el filtro
        almacenesData.forEach(almacen => {
            const option = document.createElement('option');
            option.value = almacen.id;
            option.textContent = almacen.nombre;
            almacenFilter.appendChild(option);

            // También agregar al selector de destino
            const optionDestino = document.createElement('option');
            optionDestino.value = almacen.id;
            optionDestino.textContent = almacen.nombre;
            almacenDestinoSelect.appendChild(optionDestino);

            // Agregar al selector de almacén del modal de registro
            const optionRegistro = document.createElement('option');
            optionRegistro.value = almacen.id;
            optionRegistro.textContent = almacen.nombre;
            almacenSelect.appendChild(optionRegistro);
        });

        // Cargar categorías en el filtro
        categoriasData.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nombre;
            option.textContent = categoria.nombre;
            categoriaFilter.appendChild(option);
        });

        // Cargar productos disponibles en el modal de registro
        productosDisponibles.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id_producto;
            option.textContent = `${producto.nombre_producto} (${producto.talla} - ${producto.color})`;
            option.dataset.codigo = producto.codigo_barra;
            option.dataset.categoria = producto.categoria;
            option.dataset.marca = producto.marca;
            option.dataset.talla = producto.talla;
            option.dataset.color = producto.color;
            productoSelect.appendChild(option);
        });

        // Establecer fechas por defecto para movimientos
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        fechaDesde.value = firstDay.toISOString().split('T')[0];
        fechaHasta.value = today.toISOString().split('T')[0];
    }

    function updateSummaryCards() {
        const uniqueProducts = new Set(inventarioData.map(item => item.id_producto));
        const totalStockCount = inventarioData.reduce((sum, item) => sum + item.cantidad_stock, 0);
        
        // Contar productos únicos que están en stock mínimo o por debajo
        const productosEnStockMinimo = new Set();
        inventarioData.forEach(item => {
            if (item.cantidad_stock <= item.stock_minimo) {
                productosEnStockMinimo.add(item.id_producto);
            }
        });

        totalProductos.textContent = uniqueProducts.size;
        stockTotal.textContent = totalStockCount.toLocaleString();
        productosStockMinimo.textContent = productosEnStockMinimo.size;
        totalAlmacenes.textContent = almacenesData.length;
    }

    // --- Funciones de Renderizado ---

    function renderInventarioTable() {
        inventarioTableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const pageData = filteredData.slice(startIndex, endIndex);

        pageData.forEach(item => {
            const status = getStockStatus(item.cantidad_stock, item.stock_minimo);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.codigo_barra || '-'}</td>
                <td>
                    <div class="product-info">
                        <strong>${item.nombre_producto}</strong>
                        <small>Talla: ${item.talla} | Color: ${item.color}</small>
                    </div>
                </td>
                <td>${item.categoria}</td>
                <td>${item.nombre_almacen}</td>
                <td class="text-center">
                    <span class="stock-quantity ${status}">${item.cantidad_stock}</span>
                </td>
                <td class="text-center">${item.stock_minimo}</td>
                <td class="text-center">
                    <span class="stock-badge ${status}">${getStockStatusText(status)}</span>
                </td>
                <td class="text-center">${formatDateTime(item.fecha_ultima_actualizacion)}</td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon edit" onclick="openAjusteModal(${item.id_inventario})" 
                                title="Ajustar Stock">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon history" onclick="viewProductHistory(${item.id_producto})" 
                                title="Historial">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn-icon info" onclick="viewProductDetails(${item.id_producto})" 
                                title="Detalles">
                            <i class="fas fa-info"></i>
                        </button>
                    </div>
                </td>
            `;
            inventarioTableBody.appendChild(row);
        });

        updatePaginationInfo();
    }

    function renderMovimientosTable(movimientos = movimientosData) {
        movimientosTableBody.innerHTML = '';

        if (movimientos.length === 0) {
            movimientosTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 24px; color: #ccc; margin-bottom: 10px;"></i>
                        <p style="color: #999; margin: 0;">No hay movimientos para mostrar</p>
                    </td>
                </tr>
            `;
            return;
        }

        movimientos.forEach(movimiento => {
            const isEntrada = movimiento.tipo_movimiento.includes('Entrada');
            const badgeClass = isEntrada ? 'entrada' : 'salida';
            const quantityClass = isEntrada ? 'entrada' : 'salida';
            const quantityPrefix = isEntrada ? '+' : '-';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDateTime(movimiento.fecha_movimiento)}</td>
                <td>
                    <strong>${movimiento.nombre_producto}</strong>
                </td>
                <td>${movimiento.nombre_almacen}</td>
                <td>
                    <span class="movement-badge ${badgeClass}">${movimiento.tipo_movimiento}</span>
                </td>
                <td class="text-center">
                    <span class="movement-quantity ${quantityClass}">
                        ${quantityPrefix}${movimiento.cantidad}
                    </span>
                </td>
                <td>${movimiento.usuario}</td>
                <td>${movimiento.referencia_doc || '-'}</td>
                <td>${movimiento.observaciones || '-'}</td>
            `;
            movimientosTableBody.appendChild(row);
        });
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
        const selectedAlmacen = almacenFilter.value;
        const selectedCategoria = categoriaFilter.value;
        const selectedStock = stockFilter.value;

        filteredData = inventarioData.filter(item => {
            // Filtro de búsqueda
            const matchesSearch = !searchTerm || 
                item.nombre_producto.toLowerCase().includes(searchTerm) ||
                item.codigo_barra?.toLowerCase().includes(searchTerm) ||
                item.marca.toLowerCase().includes(searchTerm);

            // Filtro de almacén
            const matchesAlmacen = !selectedAlmacen || item.id_almacen.toString() === selectedAlmacen;

            // Filtro de categoría
            const matchesCategoria = !selectedCategoria || item.categoria === selectedCategoria;

            // Filtro de stock
            let matchesStock = true;
            if (selectedStock) {
                const status = getStockStatus(item.cantidad_stock, item.stock_minimo);
                matchesStock = status === selectedStock;
            }

            return matchesSearch && matchesAlmacen && matchesCategoria && matchesStock;
        });

        currentPage = 1;
        renderInventarioTable();
    }

    // --- Funciones de Paginación ---

    function goToPage(page) {
        currentPage = page;
        renderInventarioTable();
    }

    // --- Funciones del Modal de Registrar Producto ---

    function openRegistrarProductoModal() {
        // Reset form
        registrarProductoForm.reset();
        productDetailsDisplay.style.display = 'none';
        codigoBarraDisplay.value = '';
        
        registrarProductoModal.style.display = 'block';
    }

    function updateProductDetails() {
        const selectedOption = productoSelect.options[productoSelect.selectedIndex];
        
        if (selectedOption.value) {
            codigoBarraDisplay.value = selectedOption.dataset.codigo || '';
            
            document.getElementById('productCategoria').textContent = selectedOption.dataset.categoria || '-';
            document.getElementById('productMarca').textContent = selectedOption.dataset.marca || '-';
            document.getElementById('productTalla').textContent = selectedOption.dataset.talla || '-';
            document.getElementById('productColor').textContent = selectedOption.dataset.color || '-';
            
            productDetailsDisplay.style.display = 'block';
        } else {
            codigoBarraDisplay.value = '';
            productDetailsDisplay.style.display = 'none';
        }
    }

    // --- Funciones del Modal de Ajuste ---

    function openAjusteModal(inventarioId) {
        const item = inventarioData.find(inv => inv.id_inventario === inventarioId);
        if (!item) return;

        currentProductoAjuste = item;

        // Llenar información del producto
        document.getElementById('ajusteProductoId').value = item.id_producto;
        document.getElementById('ajusteInventarioId').value = item.id_inventario;
        document.getElementById('ajusteProductoNombre').textContent = item.nombre_producto;
        document.getElementById('ajusteAlmacenNombre').textContent = item.nombre_almacen;
        document.getElementById('ajusteStockActual').textContent = item.cantidad_stock;

        // Reset form
        ajusteStockForm.reset();
        document.getElementById('ajusteProductoId').value = item.id_producto;
        document.getElementById('ajusteInventarioId').value = item.id_inventario;

        // Actualizar preview
        updateStockPreview();

        ajusteStockModal.style.display = 'block';
    }

    function updateStockPreview() {
        if (!currentProductoAjuste) return;

        const cantidad = parseInt(cantidadAjusteInput.value) || 0;
        const tipoMovimiento = tipoMovimientoSelect.value;
        const stockActual = currentProductoAjuste.cantidad_stock;
        
        document.getElementById('previewStockActual').textContent = stockActual;
        document.getElementById('previewCantidad').textContent = cantidad;

        let nuevoStock = stockActual;
        if (tipoMovimiento && cantidad > 0) {
            const tipoData = tiposMovimientoData[tipoMovimiento];
            if (tipoData) {
                if (tipoData.es_entrada === true) {
                    nuevoStock = stockActual + cantidad;
                } else if (tipoData.es_entrada === false) {
                    nuevoStock = Math.max(0, stockActual - cantidad);
                }
            }
        }

        document.getElementById('previewNuevoStock').textContent = nuevoStock;

        // Cambiar color según el resultado
        const nuevoStockElement = document.getElementById('previewNuevoStock');
        if (nuevoStock <= 0) {
            nuevoStockElement.style.color = '#dc3545';
            nuevoStockElement.style.backgroundColor = '#f8d7da';
        } else if (nuevoStock <= currentProductoAjuste.stock_minimo) {
            nuevoStockElement.style.color = '#856404';
            nuevoStockElement.style.backgroundColor = '#fff3cd';
        } else {
            nuevoStockElement.style.color = '#155724';
            nuevoStockElement.style.backgroundColor = '#d4edda';
        }
    }

    // --- Funciones de los Modales de Movimientos ---

    function openMovimientosModal() {
        renderMovimientosTable();
        movimientosModal.style.display = 'block';
    }

    function filterMovimientos() {
        const desde = fechaDesde.value;
        const hasta = fechaHasta.value;
        const tipoFiltro = tipoMovimientoFilter.value;

        let filteredMovimientos = movimientosData;

        if (desde) {
            filteredMovimientos = filteredMovimientos.filter(mov => 
                new Date(mov.fecha_movimiento) >= new Date(desde)
            );
        }

        if (hasta) {
            const hastaDate = new Date(hasta);
            hastaDate.setHours(23, 59, 59, 999);
            filteredMovimientos = filteredMovimientos.filter(mov => 
                new Date(mov.fecha_movimiento) <= hastaDate
            );
        }

        if (tipoFiltro) {
            if (tipoFiltro === 'entrada') {
                filteredMovimientos = filteredMovimientos.filter(mov => 
                    mov.tipo_movimiento.includes('Entrada')
                );
            } else if (tipoFiltro === 'salida') {
                filteredMovimientos = filteredMovimientos.filter(mov => 
                    mov.tipo_movimiento.includes('Salida')
                );
            }
        }

        renderMovimientosTable(filteredMovimientos);
    }

    // --- Funciones Globales (para uso en HTML) ---

    window.openAjusteModal = openAjusteModal;

    window.viewProductHistory = (productoId) => {
        // Filtrar movimientos por producto específico
        const productoMovimientos = movimientosData.filter(mov => mov.id_producto === productoId);
        renderMovimientosTable(productoMovimientos);
        movimientosModal.style.display = 'block';
    };

    window.viewProductDetails = (productoId) => {
        const producto = inventarioData.find(item => item.id_producto === productoId);
        if (producto) {
            alert(`Detalles del producto:\n\nNombre: ${producto.nombre_producto}\nCategoría: ${producto.categoria}\nMarca: ${producto.marca}\nTalla: ${producto.talla}\nColor: ${producto.color}\nStock actual: ${producto.cantidad_stock}\nStock mínimo: ${producto.stock_minimo}\nÚltima actualización: ${formatDateTime(producto.fecha_ultima_actualizacion)}`);
        }
    };

    // --- Event Listeners ---

    // Búsqueda y filtros
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    almacenFilter.addEventListener('change', applyFilters);
    categoriaFilter.addEventListener('change', applyFilters);
    stockFilter.addEventListener('change', applyFilters);

    // Botones principales
    registrarProductoBtn.addEventListener('click', openRegistrarProductoModal);

    movimientosBtn.addEventListener('click', openMovimientosModal);

    // Modal de registrar producto
    closeRegistrarModal.addEventListener('click', () => {
        registrarProductoModal.style.display = 'none';
    });

    cancelRegistrarBtn.addEventListener('click', () => {
        registrarProductoModal.style.display = 'none';
    });

    // Actualizar detalles del producto cuando se selecciona
    productoSelect.addEventListener('change', updateProductDetails);

    // Envío del formulario de registro
    registrarProductoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(registrarProductoForm);
        const productoId = parseInt(formData.get('producto'));
        const almacenId = parseInt(formData.get('almacen'));
        const stockMinimo = parseInt(formData.get('stockMinimo'));
        const cantidadInicial = parseInt(formData.get('stockInicial'));
        const referencia = formData.get('referencia');
        const observaciones = formData.get('observaciones');

        // Buscar datos del producto seleccionado
        const productoData = productosDisponibles.find(p => p.id_producto === productoId);
        const almacenData = almacenesData.find(a => a.id === almacenId);

        if (!productoData || !almacenData) {
            alert('Error: No se pudo encontrar el producto o almacén seleccionado');
            return;
        }

        // Verificar si ya existe el producto en ese almacén
        const existeEnInventario = inventarioData.find(item => 
            item.id_producto === productoId && item.id_almacen === almacenId
        );

        if (existeEnInventario) {
            alert('Este producto ya está registrado en el almacén seleccionado');
            return;
        }

        // Crear nuevo registro de inventario
        const nuevoInventario = {
            id_inventario: inventarioData.length + 1,
            id_producto: productoId,
            codigo_barra: productoData.codigo_barra,
            nombre_producto: productoData.nombre_producto,
            categoria: productoData.categoria,
            id_almacen: almacenId,
            nombre_almacen: almacenData.nombre,
            cantidad_stock: cantidadInicial,
            stock_minimo: stockMinimo,
            talla: productoData.talla,
            color: productoData.color,
            marca: productoData.marca,
            fecha_ultima_actualizacion: new Date().toISOString()
        };

        // Agregar al inventario
        inventarioData.push(nuevoInventario);

        // Remover el producto de los disponibles
        const index = productosDisponibles.findIndex(p => p.id_producto === productoId);
        if (index > -1) {
            productosDisponibles.splice(index, 1);
            // Actualizar el select
            productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';
            productosDisponibles.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.id_producto;
                option.textContent = `${producto.nombre_producto} (${producto.talla} - ${producto.color})`;
                option.dataset.codigo = producto.codigo_barra;
                option.dataset.categoria = producto.categoria;
                option.dataset.marca = producto.marca;
                option.dataset.talla = producto.talla;
                option.dataset.color = producto.color;
                productoSelect.appendChild(option);
            });
        }

        // Crear movimiento inicial si hay stock inicial
        if (cantidadInicial > 0) {
            const nuevoMovimiento = {
                id_movimiento: movimientosData.length + 1,
                id_producto: productoId,
                nombre_producto: productoData.nombre_producto,
                id_almacen: almacenId,
                nombre_almacen: almacenData.nombre,
                tipo_movimiento: 'Entrada - Registro Inicial',
                cantidad: cantidadInicial,
                fecha_movimiento: new Date().toISOString(),
                usuario: 'Usuario Actual',
                referencia_doc: referencia || 'REG-INICIAL',
                observaciones: observaciones || 'Registro inicial de producto en inventario'
            };
            movimientosData.unshift(nuevoMovimiento);
        }

        alert('Producto registrado exitosamente en el inventario');
        
        // Actualizar vista
        applyFilters();
        updateSummaryCards();
        
        // Cerrar modal
        registrarProductoModal.style.display = 'none';
    });

    // Modal de ajuste
    closeAjusteModal.addEventListener('click', () => {
        ajusteStockModal.style.display = 'none';
        currentProductoAjuste = null;
    });

    cancelAjusteBtn.addEventListener('click', () => {
        ajusteStockModal.style.display = 'none';
        currentProductoAjuste = null;
    });

    // Controles del formulario de ajuste
    tipoMovimientoSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        
        // Mostrar/ocultar almacén destino para transferencias
        if (selectedValue === '7') { // Transferencia
            almacenDestinoGroup.style.display = 'block';
            almacenDestinoSelect.required = true;
        } else {
            almacenDestinoGroup.style.display = 'none';
            almacenDestinoSelect.required = false;
        }

        updateStockPreview();
    });

    cantidadAjusteInput.addEventListener('input', updateStockPreview);

    // Envío del formulario de ajuste
    ajusteStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!currentProductoAjuste) return;

        const formData = new FormData(ajusteStockForm);
        const cantidad = parseInt(formData.get('cantidad'));
        const tipoMovimiento = formData.get('tipoMovimiento');
        const referencia = formData.get('referencia');
        const observaciones = formData.get('observaciones');

        // Simular el procesamiento del ajuste
        const tipoData = tiposMovimientoData[tipoMovimiento];
        let nuevoStock = currentProductoAjuste.cantidad_stock;

        if (tipoData.es_entrada === true) {
            nuevoStock += cantidad;
        } else if (tipoData.es_entrada === false) {
            nuevoStock = Math.max(0, nuevoStock - cantidad);
        }

        // Actualizar el inventario
        const inventarioItem = inventarioData.find(item => item.id_inventario === currentProductoAjuste.id_inventario);
        if (inventarioItem) {
            inventarioItem.cantidad_stock = nuevoStock;
            inventarioItem.fecha_ultima_actualizacion = new Date().toISOString();
        }

        // Agregar movimiento al historial
        const nuevoMovimiento = {
            id_movimiento: movimientosData.length + 1,
            id_producto: currentProductoAjuste.id_producto,
            nombre_producto: currentProductoAjuste.nombre_producto,
            id_almacen: currentProductoAjuste.id_almacen,
            nombre_almacen: currentProductoAjuste.nombre_almacen,
            tipo_movimiento: tipoData.nombre,
            cantidad: cantidad,
            fecha_movimiento: new Date().toISOString(),
            usuario: 'Usuario Actual', // En una aplicación real, esto vendría del login
            referencia_doc: referencia || null,
            observaciones: observaciones || null
        };

        movimientosData.unshift(nuevoMovimiento);

        alert('Ajuste de stock aplicado correctamente');
        
        // Actualizar vista
        applyFilters();
        updateSummaryCards();
        
        // Cerrar modal
        ajusteStockModal.style.display = 'none';
        currentProductoAjuste = null;
    });

    // Modal de movimientos
    closeMovimientosModal.addEventListener('click', () => {
        movimientosModal.style.display = 'none';
    });

    cerrarMovimientosBtn.addEventListener('click', () => {
        movimientosModal.style.display = 'none';
    });

    filtrarMovimientos.addEventListener('click', filterMovimientos);

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
        if (e.target === ajusteStockModal) {
            ajusteStockModal.style.display = 'none';
            currentProductoAjuste = null;
        }
        if (e.target === movimientosModal) {
            movimientosModal.style.display = 'none';
        }
        if (e.target === registrarProductoModal) {
            registrarProductoModal.style.display = 'none';
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
        initializeFilters();
        applyFilters(); // Esto también renderiza la tabla
        updateSummaryCards();
    }

    // Ejecutar inicialización
    init();
});