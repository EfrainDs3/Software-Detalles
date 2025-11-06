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
    const productCategoriaDisplay = document.getElementById('productCategoria');
    const productMarcaDisplay = document.getElementById('productMarca');
    const productTallaDisplay = document.getElementById('productTalla');
    const productColorDisplay = document.getElementById('productColor');
    const productDescripcionDisplay = document.getElementById('productDescripcion');
    const productPrecioDisplay = document.getElementById('productPrecio');

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
    let productosDisponibles = [];
    let almacenesData = [];
    let categoriasData = [];
    let tiposMovimientoData = {};
    let inventarioData = [];
    let movimientosData = [];

    let currentProductoAjuste = null;
    let isSubmittingRegistrar = false;
    let isSubmittingAjuste = false;

    // --- Funciones Utilitarias ---

    async function fetchJson(url, options) {
        const response = await fetch(url, options);
        const rawBody = await response.text().catch(() => '');

        if (!response.ok) {
            const snippet = rawBody ? `: ${rawBody.slice(0, 200)}` : '';
            throw new Error(`HTTP ${response.status} - ${url}${snippet}`);
        }

        if (!rawBody || !rawBody.trim()) {
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('application/json')) {
            throw new Error(`Respuesta no JSON recibida (${contentType || 'sin content-type'}) en ${url}`);
        }

        try {
            return JSON.parse(rawBody);
        } catch (parseError) {
            throw new Error(`JSON inválido en ${url}: ${parseError.message}`);
        }
    }

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

    function normalizeProductoData(rawProducto) {
        if (!rawProducto) {
            return null;
        }

        const id = rawProducto.id_producto ?? rawProducto.id ?? rawProducto.productoId ?? null;
        if (id === null) {
            return null;
        }

        const nombre = rawProducto.nombre_producto ?? rawProducto.nombre ?? rawProducto.nombreProducto ?? `Producto ${id}`;
        const codigoBarra = rawProducto.codigo_barra ?? rawProducto.codigoBarra ?? '';
        const categoria = rawProducto.categoria_nombre ?? rawProducto.categoria?.nombre ?? rawProducto.categoria ?? rawProducto.tipo ?? 'Sin categoría';
        const marca = rawProducto.marca ?? rawProducto.proveedor?.nombre ?? '-';
        const talla = rawProducto.talla ?? '-';
        const color = rawProducto.color ?? '-';
        const descripcion = rawProducto.descripcion ?? '-';
        const precioVenta = rawProducto.precio_venta ?? rawProducto.precioVenta ?? null;

        return {
            id,
            nombre_producto: nombre,
            codigo_barra: codigoBarra,
            categoria,
            marca,
            talla,
            color,
            descripcion,
            precio_venta: precioVenta
        };
    }

    function normalizeInventarioItem(rawInventario) {
        if (!rawInventario) {
            return null;
        }

        const productoNormalizado = rawInventario.producto
            ? normalizeProductoData(rawInventario.producto)
            : normalizeProductoData({
                id_producto: rawInventario.id_producto ?? rawInventario.productoId ?? null,
                nombre_producto: rawInventario.nombre_producto,
                nombre: rawInventario.nombre_producto,
                codigo_barra: rawInventario.codigo_barra,
                categoria: rawInventario.categoria,
                categoria_nombre: rawInventario.categoria_nombre,
                marca: rawInventario.marca,
                color: rawInventario.color,
                talla: rawInventario.talla
            });
        const almacen = rawInventario.almacen || {};

        const idInventario = rawInventario.id_inventario ?? rawInventario.id ?? rawInventario.idInventario ?? null;
        const idProducto = rawInventario.id_producto ?? productoNormalizado?.id ?? null;
        const idAlmacen = rawInventario.id_almacen ?? almacen.id ?? null;

        const cantidadStock = rawInventario.cantidad_stock ?? rawInventario.cantidadStock ?? 0;
        const stockMinimo = rawInventario.stock_minimo ?? rawInventario.stockMinimo ?? 0;
        const fechaActualizacion = rawInventario.fecha_ultima_actualizacion ?? rawInventario.fechaUltimaActualizacion ?? new Date().toISOString();

        return {
            id_inventario: idInventario,
            id_producto: idProducto,
            codigo_barra: productoNormalizado?.codigo_barra ?? rawInventario.codigo_barra ?? '',
            nombre_producto: productoNormalizado?.nombre_producto ?? rawInventario.nombre_producto ?? 'Producto sin nombre',
            categoria: productoNormalizado?.categoria ?? rawInventario.categoria ?? 'Sin categoría',
            id_almacen: idAlmacen,
            nombre_almacen: rawInventario.nombre_almacen ?? almacen.nombre ?? 'Sin almacén',
            cantidad_stock: cantidadStock,
            stock_minimo: stockMinimo,
            talla: productoNormalizado?.talla ?? rawInventario.talla ?? '-',
            color: productoNormalizado?.color ?? rawInventario.color ?? '-',
            marca: productoNormalizado?.marca ?? rawInventario.marca ?? 'Sin marca',
            fecha_ultima_actualizacion: fechaActualizacion
        };
    }

    function normalizeMovimientoItem(rawMovimiento) {
        if (!rawMovimiento) {
            return null;
        }

        const productoNormalizado = rawMovimiento.producto
            ? normalizeProductoData(rawMovimiento.producto)
            : normalizeProductoData({
                id_producto: rawMovimiento.id_producto ?? rawMovimiento.productoId ?? null,
                nombre_producto: rawMovimiento.nombre_producto,
                nombre: rawMovimiento.nombre_producto,
                codigo_barra: rawMovimiento.codigo_barra,
                categoria: rawMovimiento.categoria,
                categoria_nombre: rawMovimiento.categoria_nombre,
                marca: rawMovimiento.marca,
                color: rawMovimiento.color,
                talla: rawMovimiento.talla
            });
        const almacen = rawMovimiento.almacen || {};
        const tipoMovimiento = rawMovimiento.tipo_movimiento ?? rawMovimiento.tipoMovimiento?.nombre ?? '';
        const esEntrada = rawMovimiento.esEntrada ?? rawMovimiento.tipoMovimiento?.esEntrada ?? (tipoMovimiento ? tipoMovimiento.toLowerCase().includes('entrada') : true);

        return {
            id_movimiento: rawMovimiento.id_movimiento ?? rawMovimiento.id ?? rawMovimiento.idMovimiento ?? null,
            id_producto: rawMovimiento.id_producto ?? productoNormalizado?.id ?? null,
            nombre_producto: rawMovimiento.nombre_producto ?? productoNormalizado?.nombre_producto ?? 'Producto',
            id_almacen: rawMovimiento.id_almacen ?? almacen.id ?? null,
            nombre_almacen: rawMovimiento.nombre_almacen ?? almacen.nombre ?? 'Sin almacén',
            tipo_movimiento: tipoMovimiento || (esEntrada ? 'Entrada' : 'Salida'),
            cantidad: rawMovimiento.cantidad ?? 0,
            fecha_movimiento: rawMovimiento.fecha_movimiento ?? rawMovimiento.fechaMovimiento ?? new Date().toISOString(),
            usuario: rawMovimiento.usuario ?? rawMovimiento.usuario_nombre ?? rawMovimiento.usuarioNombre ?? rawMovimiento.usuario?.username ?? 'Usuario',
            referencia_doc: rawMovimiento.referencia_doc ?? rawMovimiento.referenciaDoc ?? null,
            observaciones: rawMovimiento.observaciones ?? null
        };
    }

    function rebuildProductoSelectOptions(selectedId = '') {
        productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';

        productosDisponibles.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre_producto} (${producto.talla} - ${producto.color})`;
            option.dataset.codigo = producto.codigo_barra || '';
            option.dataset.categoria = producto.categoria || 'Sin categoría';
            option.dataset.marca = producto.marca || '-';
            option.dataset.talla = producto.talla || '-';
            option.dataset.color = producto.color || '-';
            option.dataset.descripcion = producto.descripcion || '-';
            option.dataset.precio = producto.precio_venta != null ? producto.precio_venta : '';
            productoSelect.appendChild(option);
        });

        if (selectedId) {
            productoSelect.value = selectedId;
        }
    }

    function updateCategoriaFilterOptions() {
        const previousValue = categoriaFilter.value;

        const categoriasDesdeInventario = Array.from(new Set(
            inventarioData
                .map(item => item.categoria)
                .filter(categoria => categoria && categoria !== 'Sin categoría')
        ));

        const categoriasDesdeApi = categoriasData.map(cat => {
            if (typeof cat === 'string') {
                return cat;
            }
            return cat.nombre || cat.nombre_categoria || cat.nombreCategoria || null;
        }).filter(Boolean);

        const categoriasUnicas = Array.from(new Set([
            ...categoriasDesdeApi,
            ...categoriasDesdeInventario
        ].map(nombre => nombre.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

        categoriaFilter.innerHTML = '<option value="">Todas las categorías</option>';

        categoriasUnicas.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriaFilter.appendChild(option);
        });

        if (previousValue && categoriasUnicas.includes(previousValue)) {
            categoriaFilter.value = previousValue;
        }
    }

    function rebuildTipoMovimientoOptions() {
        const previousValue = tipoMovimientoSelect.value;
        tipoMovimientoSelect.innerHTML = '<option value="">Seleccionar tipo</option>';

        const tiposOrdenados = Object.entries(tiposMovimientoData)
            .map(([id, data]) => ({
                id,
                nombre: data.nombre,
                esEntrada: data.es_entrada === true || data.es_entrada === 'true' || data.es_entrada === 1 || data.es_entrada === '1'
            }))
            .sort((a, b) => Number(a.esEntrada) - Number(b.esEntrada));

        tiposOrdenados.forEach(tipo => {
            const option = document.createElement('option');
            option.value = String(tipo.id);
            option.textContent = tipo.esEntrada ? 'Entrada' : 'Salida';
            option.dataset.nombre = tipo.nombre || (tipo.esEntrada ? 'Entrada' : 'Salida');
            option.dataset.esEntrada = tipo.esEntrada ? '1' : '0';
            tipoMovimientoSelect.appendChild(option);
        });

        if (previousValue && tiposMovimientoData[previousValue]) {
            tipoMovimientoSelect.value = previousValue;
        } else if (tiposOrdenados.length === 1) {
            tipoMovimientoSelect.value = tiposOrdenados[0].id;
        }

        updateStockPreview();
    }

    // --- Funciones de Inicialización ---

    async function initializeFilters() {
        try {
            // Cargar almacenes
            const almacenesRaw = await fetchJson('/inventario/api/almacenes');
            almacenesData = Array.isArray(almacenesRaw) ? almacenesRaw : [];

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

            // Cargar categorías
            try {
                const categoriasRaw = await fetchJson('/api/catalogos/categorias');
                categoriasData = (Array.isArray(categoriasRaw) ? categoriasRaw : [])
                    .map(cat => ({
                        id: cat.id ?? cat.id_categoria ?? cat.idCategoria ?? null,
                        nombre: cat.nombre ?? cat.nombre_categoria ?? cat.nombreCategoria ?? null
                    }))
                    .filter(cat => cat.nombre);
            } catch (errorCategorias) {
                console.warn('No se pudieron cargar las categorías del catálogo:', errorCategorias);
                categoriasData = [];
            }

            updateCategoriaFilterOptions();

            // Cargar tipos de movimiento
            const tiposData = await fetchJson('/inventario/api/tipos-movimiento');
            tiposMovimientoData = {};
            (Array.isArray(tiposData) ? tiposData : []).forEach(tipo => {
                const id = tipo.id ?? tipo.id_tipo ?? tipo.tipoMovimientoId;
                if (id == null) {
                    return;
                }
                const esEntrada = tipo.esEntrada === true || tipo.esEntrada === 'true' || tipo.esEntrada === 1 || tipo.esEntrada === '1';
                const nombre = tipo.nombre || (esEntrada ? 'Entrada' : 'Salida');
                tiposMovimientoData[String(id)] = {
                    nombre,
                    es_entrada: esEntrada
                };
            });
            rebuildTipoMovimientoOptions();

            await refreshProductosDisponibles();

            // Establecer fechas por defecto para movimientos
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            fechaDesde.value = firstDay.toISOString().split('T')[0];
            fechaHasta.value = today.toISOString().split('T')[0];

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            showNotification('Error al cargar datos iniciales', 'error');
        }
    }

    async function updateSummaryCards() {
        try {
            const stats = await fetchJson('/inventario/api/estadisticas') || {};

            totalProductos.textContent = stats.totalProductos || 0;
            stockTotal.textContent = (stats.totalStock || 0).toLocaleString();
            productosStockMinimo.textContent = stats.productosStockBajo || 0;
            totalAlmacenes.textContent = stats.totalAlmacenes || 0;
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            totalProductos.textContent = '0';
            stockTotal.textContent = '0';
            productosStockMinimo.textContent = '0';
            totalAlmacenes.textContent = '0';
        }
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
        
        productCategoriaDisplay.textContent = '-';
        productMarcaDisplay.textContent = '-';
        productTallaDisplay.textContent = '-';
        productColorDisplay.textContent = '-';
        productDescripcionDisplay.textContent = '-';
        productPrecioDisplay.textContent = '-';

        registrarProductoModal.style.display = 'block';
    }

    function updateProductDetails() {
        const selectedOption = productoSelect.options[productoSelect.selectedIndex];
        
        if (selectedOption.value) {
            codigoBarraDisplay.value = selectedOption.dataset.codigo || '';

            productCategoriaDisplay.textContent = selectedOption.dataset.categoria || '-';
            productMarcaDisplay.textContent = selectedOption.dataset.marca || '-';
            productTallaDisplay.textContent = selectedOption.dataset.talla || '-';
            productColorDisplay.textContent = selectedOption.dataset.color || '-';

            const descripcion = selectedOption.dataset.descripcion?.trim();
            productDescripcionDisplay.textContent = descripcion && descripcion.length > 0 ? descripcion : '-';

            const rawPrice = selectedOption.dataset.precio;
            if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
                const parsedPrice = Number(rawPrice);
                productPrecioDisplay.textContent = Number.isFinite(parsedPrice)
                    ? formatCurrency(parsedPrice)
                    : '-';
            } else {
                productPrecioDisplay.textContent = '-';
            }

            productDetailsDisplay.style.display = 'block';
        } else {
            codigoBarraDisplay.value = '';
            productDetailsDisplay.style.display = 'none';
            productCategoriaDisplay.textContent = '-';
            productMarcaDisplay.textContent = '-';
            productTallaDisplay.textContent = '-';
            productColorDisplay.textContent = '-';
            productDescripcionDisplay.textContent = '-';
            productPrecioDisplay.textContent = '-';
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
    almacenDestinoGroup.style.display = 'none';
    almacenDestinoSelect.required = false;
    almacenDestinoSelect.value = '';

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
    registrarProductoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmittingRegistrar) {
            return;
        }

        const formData = new FormData(registrarProductoForm);
        const productoId = Number(formData.get('producto'));
        const almacenId = Number(formData.get('almacen'));
        const stockMinimo = Number(formData.get('stockMinimo'));
        const cantidadInicial = Number(formData.get('stockInicial'));
        const referencia = (formData.get('referencia') || '').trim();
        const observaciones = (formData.get('observaciones') || '').trim();

        if (!Number.isFinite(productoId) || productoId <= 0) {
            showNotification('Selecciona un producto válido', 'error');
            return;
        }

        if (!Number.isFinite(almacenId) || almacenId <= 0) {
            showNotification('Selecciona un almacén válido', 'error');
            return;
        }

        if (!Number.isFinite(stockMinimo) || stockMinimo < 0) {
            showNotification('Ingresa un stock mínimo válido', 'error');
            return;
        }

        if (!Number.isFinite(cantidadInicial) || cantidadInicial < 0) {
            showNotification('Ingresa una cantidad inicial válida', 'error');
            return;
        }

        const productoData = productosDisponibles.find(p => p.id === productoId);
        const almacenData = almacenesData.find(a => a.id === almacenId);

        if (!productoData || !almacenData) {
            showNotification('El producto o almacén seleccionado no es válido', 'error');
            return;
        }

        const existeEnInventario = inventarioData.some(item =>
            item.id_producto === productoId && item.id_almacen === almacenId
        );

        if (existeEnInventario) {
            showNotification('Este producto ya está registrado en el almacén seleccionado', 'error');
            return;
        }

        const payload = new URLSearchParams();
        payload.append('productoId', productoId);
        payload.append('almacenId', almacenId);
        payload.append('stockMinimo', stockMinimo);
        payload.append('cantidadInicial', cantidadInicial);
        if (referencia) {
            payload.append('referencia', referencia);
        }
        if (observaciones) {
            payload.append('observaciones', observaciones);
        }

        try {
            isSubmittingRegistrar = true;
            const response = await fetch('/inventario/api/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            if (!response.ok) {
                let errorMessage = 'No se pudo registrar el producto en el inventario';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (parseError) {
                    // Ignorar errores de parseo y mantener el mensaje por defecto
                }
                showNotification(errorMessage, 'error');
                return;
            }

            showNotification('Producto registrado exitosamente en el inventario');

            registrarProductoForm.reset();
            productDetailsDisplay.style.display = 'none';
            codigoBarraDisplay.value = '';
            productCategoriaDisplay.textContent = '-';
            productMarcaDisplay.textContent = '-';
            productTallaDisplay.textContent = '-';
            productColorDisplay.textContent = '-';
            productDescripcionDisplay.textContent = '-';
            productPrecioDisplay.textContent = '-';

            registrarProductoModal.style.display = 'none';

            await Promise.all([
                loadInventarioData(),
                loadMovimientosData(),
                refreshProductosDisponibles()
            ]);
            await updateSummaryCards();
        } catch (error) {
            console.error('Error registrando producto en inventario:', error);
            showNotification('Error al registrar el producto en el inventario', 'error');
        } finally {
            isSubmittingRegistrar = false;
        }
    });

    // Modal de ajuste
    closeAjusteModal.addEventListener('click', () => {
        ajusteStockModal.style.display = 'none';
        currentProductoAjuste = null;
        almacenDestinoGroup.style.display = 'none';
        almacenDestinoSelect.required = false;
    });

    cancelAjusteBtn.addEventListener('click', () => {
        ajusteStockModal.style.display = 'none';
        currentProductoAjuste = null;
        almacenDestinoGroup.style.display = 'none';
        almacenDestinoSelect.required = false;
    });

    // Controles del formulario de ajuste
    tipoMovimientoSelect.addEventListener('change', () => {
        almacenDestinoGroup.style.display = 'none';
        almacenDestinoSelect.required = false;
        updateStockPreview();
    });

    cantidadAjusteInput.addEventListener('input', updateStockPreview);

    // Envío del formulario de ajuste
    ajusteStockForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentProductoAjuste || isSubmittingAjuste) {
            return;
        }

        const formData = new FormData(ajusteStockForm);
        const cantidad = Number(formData.get('cantidad'));
        const tipoMovimientoId = formData.get('tipoMovimiento');
        const referencia = (formData.get('referencia') || '').trim();
        const observaciones = (formData.get('observaciones') || '').trim();

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            showNotification('Ingresa una cantidad válida para el movimiento', 'error');
            return;
        }

        if (!tipoMovimientoId) {
            showNotification('Selecciona un tipo de movimiento válido', 'error');
            return;
        }

        const tipoData = tiposMovimientoData[tipoMovimientoId];
        if (!tipoData) {
            showNotification('El tipo de movimiento seleccionado no es válido', 'error');
            return;
        }

        try {
            isSubmittingAjuste = true;
            const payload = new URLSearchParams();
            payload.append('tipoMovimientoId', tipoMovimientoId);
            payload.append('cantidad', cantidad);
            if (referencia) {
                payload.append('referencia', referencia);
            }
            if (observaciones) {
                payload.append('observaciones', observaciones);
            }

            const response = await fetch(`/inventario/api/${currentProductoAjuste.id_inventario}/ajuste`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            if (!response.ok) {
                let errorMessage = 'No se pudo aplicar el ajuste de stock';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (parseError) {
                    // Mantener mensaje por defecto si no hay cuerpo JSON
                }
                showNotification(errorMessage, 'error');
                return;
            }

            showNotification('Ajuste de stock aplicado correctamente');

            ajusteStockForm.reset();
            almacenDestinoSelect.value = '';
            almacenDestinoGroup.style.display = 'none';
            almacenDestinoSelect.required = false;

            ajusteStockModal.style.display = 'none';
            currentProductoAjuste = null;

            await Promise.all([
                loadInventarioData(),
                loadMovimientosData()
            ]);
            await updateSummaryCards();
        } catch (error) {
            console.error('Error aplicando ajuste de stock:', error);
            showNotification('Error al aplicar el ajuste de stock', 'error');
        } finally {
            isSubmittingAjuste = false;
        }
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

    // --- Funciones de API ---

    async function refreshProductosDisponibles(selectedId = '') {
        try {
            const productosRaw = await fetchJson('/inventario/api/productos');
            productosDisponibles = (Array.isArray(productosRaw) ? productosRaw : [])
                .map(normalizeProductoData)
                .filter(Boolean);

            rebuildProductoSelectOptions(selectedId);
            if (selectedId) {
                updateProductDetails();
            }
        } catch (error) {
            console.error('Error cargando productos disponibles:', error);
            productosDisponibles = [];
            rebuildProductoSelectOptions();
            showNotification('Error al cargar productos disponibles', 'error');
        }
    }

    async function loadInventarioData() {
        try {
            const inventarioRaw = await fetchJson('/inventario/api');
            inventarioData = (Array.isArray(inventarioRaw) ? inventarioRaw : [])
                .map(normalizeInventarioItem)
                .filter(Boolean);

            updateCategoriaFilterOptions();
            applyFilters();
        } catch (error) {
            console.error('Error cargando inventario:', error);
            showNotification('Error al cargar datos del inventario', 'error');
        }
    }

    async function loadMovimientosData() {
        try {
            const movimientosRaw = await fetchJson('/inventario/api/movimientos');
            movimientosData = (Array.isArray(movimientosRaw) ? movimientosRaw : [])
                .map(normalizeMovimientoItem)
                .filter(Boolean);
        } catch (error) {
            console.error('Error cargando movimientos:', error);
            movimientosData = [];
        }
    }

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

    // --- Inicialización ---

    async function init() {
        await initializeFilters();
        await loadInventarioData();
        await loadMovimientosData();
        updateSummaryCards();
    }

    // Ejecutar inicialización
    init();
});