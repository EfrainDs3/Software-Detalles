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

    // Referencias del modal de gestión de tallas
    const gestionTallasModal = document.getElementById('gestionTallasModal');
    const closeGestionTallasModal = document.getElementById('closeGestionTallasModal');
    const cerrarGestionTallasBtn = document.getElementById('cerrarGestionTallasBtn');
    const tallasContainer = document.getElementById('tallasContainer');
    const tallaActionsSection = document.getElementById('tallaActionsSection');
    const selectedTalla = document.getElementById('selectedTalla');
    const ajustarTallaBtn = document.getElementById('ajustarTallaBtn');
    const transferirTallaBtn = document.getElementById('transferirTallaBtn');
    const eliminarTallaBtn = document.getElementById('eliminarTallaBtn');

    // Referencias del modal de ajuste de talla
    const ajusteTallaModal = document.getElementById('ajusteTallaModal');
    const closeAjusteTallaModal = document.getElementById('closeAjusteTallaModal');
    const cancelAjusteTallaBtn = document.getElementById('cancelAjusteTallaBtn');
    const ajusteTallaForm = document.getElementById('ajusteTallaForm');
    const tipoMovimientoTallaSelect = document.getElementById('tipoMovimientoTalla');
    const cantidadAjusteTallaInput = document.getElementById('cantidadAjusteTalla');

    // Referencias del modal de agregar tallas
    const agregarTallasModal = document.getElementById('agregarTallasModal');
    const closeAgregarTallasModal = document.getElementById('closeAgregarTallasModal');
    const cancelAgregarTallasBtn = document.getElementById('cancelAgregarTallasBtn');
    const agregarTallasForm = document.getElementById('agregarTallasForm');
    const tallasList = document.getElementById('tallasList');
    const addTallaBtn = document.getElementById('addTallaBtn');

    // Referencias del modal de registrar producto
    const registrarProductoModal = document.getElementById('registrarProductoModal');
    const closeRegistrarModal = document.getElementById('closeRegistrarModal');
    const cancelRegistrarBtn = document.getElementById('cancelRegistrarBtn');
    const registrarProductoForm = document.getElementById('registrarProductoForm');
    const productoSelect = document.getElementById('productoSelect');
    const productoSearchInput = document.getElementById('productoSearchInput');
    const productoSearchResults = document.getElementById('productoSearchResults');
    const productoSelectContainer = document.getElementById('productoSelectContainer');
    const codigoBarraDisplay = document.getElementById('codigoBarraDisplay');
    const almacenSelect = document.getElementById('almacenSelect');
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
    let tallasDisponiblesActuales = []; // Para almacenar las tallas del producto actual
    let selectedTallaData = null; // Para almacenar los datos de la talla seleccionada
    let productoDropdownItems = [];
    let productoHighlightedIndex = -1;

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
        const manejaTallas = rawInventario.tiene_tallas ?? rawInventario.tieneTallas ?? false;

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
            tiene_tallas: manejaTallas === true,
            tieneTallas: manejaTallas === true,
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

    function formatProductoLabel(producto) {
        if (!producto) {
            return '';
        }

        const detalles = [producto.talla, producto.color]
            .filter(valor => valor && valor !== '-' && valor !== 'Sin dato')
            .join(' · ');

        return detalles
            ? `${producto.nombre_producto} · ${detalles}`
            : producto.nombre_producto;
    }

    function formatProductoMeta(producto) {
        if (!producto) {
            return '';
        }

        const meta = [];
        if (producto.codigo_barra) {
            meta.push(`Código: ${producto.codigo_barra}`);
        }
        if (producto.marca && producto.marca !== '-') {
            meta.push(`Marca: ${producto.marca}`);
        }
        if (producto.categoria && producto.categoria !== 'Sin categoría') {
            meta.push(producto.categoria);
        }
        return meta.join(' · ');
    }

    function findProductoById(id) {
        if (id == null) {
            return null;
        }
        return productosDisponibles.find(producto => String(producto.id) === String(id));
    }

    function closeProductoDropdown() {
        if (productoSearchResults) {
            productoSearchResults.classList.remove('visible');
        }
        productoDropdownItems = [];
        productoHighlightedIndex = -1;
    }

    function openProductoDropdown() {
        if (productoSearchResults && productoDropdownItems.length > 0 && document.activeElement === productoSearchInput) {
            productoSearchResults.classList.add('visible');
        }
    }

    function highlightProductoDropdownItem(index) {
        if (!productoDropdownItems.length) {
            productoHighlightedIndex = -1;
            return;
        }

        productoDropdownItems.forEach(item => item.classList.remove('active'));

        if (index >= 0 && index < productoDropdownItems.length) {
            productoDropdownItems[index].classList.add('active');
            productoHighlightedIndex = index;

            const itemElement = productoDropdownItems[index];
            const container = productoSearchResults;
            if (itemElement && container) {
                const itemTop = itemElement.offsetTop;
                const itemBottom = itemTop + itemElement.offsetHeight;
                if (itemTop < container.scrollTop) {
                    container.scrollTop = itemTop;
                } else if (itemBottom > container.scrollTop + container.clientHeight) {
                    container.scrollTop = itemBottom - container.clientHeight;
                }
            }
        } else {
            productoHighlightedIndex = -1;
        }
    }

    function selectProducto(producto) {
        if (!productoSelect) {
            return;
        }

        if (!producto) {
            productoSelect.value = '';
            if (productoSearchInput) {
                productoSearchInput.value = '';
            }
            updateProductDetails();
            closeProductoDropdown();
            return;
        }

        productoSelect.value = producto.id;
        if (productoSearchInput) {
            productoSearchInput.value = formatProductoLabel(producto);
        }
        updateProductDetails();
        closeProductoDropdown();
    }

    function rebuildProductoSelectOptions(selectedId = '') {
        if (!productoSelect) {
            return;
        }

        const searchTerm = (productoSearchInput?.value || '').trim().toLowerCase();

        productoSelect.innerHTML = '<option value="">Seleccionar producto</option>';

        const resultados = [];

        productosDisponibles.forEach(producto => {
            if (!producto) {
                return;
            }

            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = producto.nombre_producto;
            productoSelect.appendChild(option);

            const searchable = [
                producto.nombre_producto,
                producto.codigo_barra,
                producto.talla,
                producto.color,
                producto.marca,
                producto.descripcion
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchTerm || searchable.includes(searchTerm)) {
                resultados.push(producto);
            }
        });

        if (productoSearchResults) {
            productoSearchResults.innerHTML = '';

            if (resultados.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'searchable-option-empty';
                emptyItem.textContent = searchTerm
                    ? 'Sin resultados para tu búsqueda'
                    : 'No hay productos disponibles para registrar';
                productoSearchResults.appendChild(emptyItem);
                productoDropdownItems = [];
                if (document.activeElement === productoSearchInput && searchTerm) {
                    productoSearchResults.classList.add('visible');
                } else {
                    productoSearchResults.classList.remove('visible');
                }
            } else {
                resultados.forEach((producto, index) => {
                    const item = document.createElement('li');
                    item.dataset.id = producto.id;

                    const title = document.createElement('span');
                    title.className = 'searchable-option-title';
                    title.textContent = formatProductoLabel(producto);

                    const meta = document.createElement('span');
                    meta.className = 'searchable-option-meta';
                    meta.textContent = formatProductoMeta(producto);

                    item.appendChild(title);
                    if (meta.textContent) {
                        item.appendChild(meta);
                    }

                    item.addEventListener('mousedown', (event) => {
                        event.preventDefault();
                        selectProducto(producto);
                    });

                    item.addEventListener('mouseenter', () => {
                        highlightProductoDropdownItem(index);
                    });

                    productoSearchResults.appendChild(item);
                });

                productoDropdownItems = Array.from(productoSearchResults.querySelectorAll('li[data-id]'));
            }

            if (document.activeElement === productoSearchInput) {
                if (resultados.length > 0) {
                    openProductoDropdown();
                    highlightProductoDropdownItem(0);
                } else if (!searchTerm) {
                    closeProductoDropdown();
                }
            } else {
                closeProductoDropdown();
            }
        }

        if (selectedId) {
            const selectedProducto = productosDisponibles.find(producto => String(producto.id) === String(selectedId));
            if (selectedProducto) {
                productoSelect.value = selectedId;
                if (productoSearchInput) {
                    productoSearchInput.value = formatProductoLabel(selectedProducto);
                }
            } else {
                productoSelect.value = '';
                if (productoSearchInput && !searchTerm) {
                    productoSearchInput.value = '';
                }
            }
        } else if (!searchTerm && productoSearchInput) {
            productoSearchInput.value = '';
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
            const hasTallas = item.tiene_tallas === true || item.tieneTallas === true;
            const tallasCellHtml = hasTallas
                ? `<button class="btn btn-sm btn-outline-primary" onclick="gestionarTallas(${item.id_inventario})" title="Gestionar Tallas">
                        <i class="fas fa-tags"></i>
                        Ver Tallas
                   </button>`
                : `<span class="talla-indicator" title="Este producto no gestiona tallas">Sin tallas</span>`;
            const ajusteButtonHtml = hasTallas
                ? `<button class="btn-icon edit disabled" type="button" title="Gestiona el stock por tallas" disabled>
                        <i class="fas fa-edit"></i>
                   </button>`
                : `<button class="btn-icon edit" type="button" onclick="openAjusteModal(${item.id_inventario})" title="Ajustar Stock Total">
                        <i class="fas fa-edit"></i>
                   </button>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.codigo_barra || '-'}</td>
                <td>
                    <div class="product-info">
                        <strong>${item.nombre_producto}</strong>
                        <small>Color: ${item.color}</small>
                    </div>
                </td>
                <td>${item.categoria}</td>
                <td>${item.nombre_almacen}</td>
                <td class="text-center">${tallasCellHtml}</td>
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
                        ${ajusteButtonHtml}
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
        if (productoSearchInput) {
            productoSearchInput.value = '';
        }
        if (productoSelect) {
            productoSelect.value = '';
        }
        closeProductoDropdown();
        if (productoSearchResults) {
            productoSearchResults.scrollTop = 0;
        }
        rebuildProductoSelectOptions();
        if (productoSearchInput) {
            setTimeout(() => productoSearchInput.focus(), 0);
        }
        
        productCategoriaDisplay.textContent = '-';
        productMarcaDisplay.textContent = '-';
        productTallaDisplay.textContent = '-';
        productColorDisplay.textContent = '-';
        productDescripcionDisplay.textContent = '-';
        productPrecioDisplay.textContent = '-';

        registrarProductoModal.style.display = 'block';
    }

    function updateProductDetails() {
        const selectedId = productoSelect ? productoSelect.value : '';
        const producto = productosDisponibles.find(item => String(item.id) === String(selectedId));

        if (producto) {
            codigoBarraDisplay.value = producto.codigo_barra || '';
            productCategoriaDisplay.textContent = producto.categoria || '-';
            productMarcaDisplay.textContent = producto.marca || '-';
            productTallaDisplay.textContent = producto.talla || '-';
            productColorDisplay.textContent = producto.color || '-';

            const descripcion = (producto.descripcion || '').trim();
            productDescripcionDisplay.textContent = descripcion.length > 0 ? descripcion : '-';

            if (producto.precio_venta != null && producto.precio_venta !== '') {
                const parsedPrice = Number(producto.precio_venta);
                productPrecioDisplay.textContent = Number.isFinite(parsedPrice)
                    ? formatCurrency(parsedPrice)
                    : '-';
            } else {
                productPrecioDisplay.textContent = '-';
            }

            if (productoSearchInput && productoSearchInput.value.trim() === '') {
                productoSearchInput.value = formatProductoLabel(producto);
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
        const item = inventarioData.find(inv => String(inv.id_inventario) === String(inventarioId));
        if (!item) return;

        if (item.tiene_tallas === true || item.tieneTallas === true) {
            showNotification('Este producto gestiona su stock por tallas. Ajusta las cantidades desde "Ver Tallas".', 'warning');
            return;
        }

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

    function openAjusteTallaModal(inventarioId, talla, tallaData = null) {
        console.log('openAjusteTallaModal called with:', { inventarioId, talla, tallaData });
        
        // Convertir a número para comparación
        const idToFind = parseInt(inventarioId);
        console.log('Buscando inventario con ID:', idToFind, 'en', inventarioData.length, 'items');
        
        // Buscar información del inventario
        const item = inventarioData.find(inv => {
            const invId = parseInt(inv.id_inventario);
            console.log('Comparando:', invId, '===', idToFind, '?', invId === idToFind);
            return invId === idToFind;
        });
        
        if (!item) {
            console.error('No se encontró el inventario con ID:', inventarioId);
            console.error('IDs disponibles:', inventarioData.map(inv => inv.id_inventario));
            showNotification('Error: No se encontró el producto en el inventario. Intente recargar la página.', 'error');
            return;
        }

        console.log('Item de inventario encontrado:', item);

        // Llenar información del producto
        document.getElementById('ajusteTallaInventarioId').value = inventarioId;
        document.getElementById('ajusteTallaTalla').value = talla;
        document.getElementById('ajusteTallaProductoNombre').textContent = item.nombre_producto;
        document.getElementById('ajusteTallaTallaDisplay').textContent = talla;

        // Cargar stock actual de la talla
        const stockActual = tallaData ? (tallaData.cantidadStock || 0) : 0;
        console.log('Stock actual de la talla:', stockActual);
        document.getElementById('ajusteTallaStockActual').textContent = stockActual;

        // Reset form
        ajusteTallaForm.reset();

        // Cargar tipos de movimiento en el select de talla
        rebuildTipoMovimientoOptionsTalla();

        // Actualizar preview
        updateTallaStockPreview();

        ajusteTallaModal.style.display = 'block';
        console.log('Modal de ajuste de talla abierto');
    }

    function rebuildTipoMovimientoOptionsTalla() {
        const previousValue = tipoMovimientoTallaSelect.value;
        tipoMovimientoTallaSelect.innerHTML = '<option value="">Seleccionar tipo</option>';

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
            tipoMovimientoTallaSelect.appendChild(option);
        });

        if (previousValue && tiposMovimientoData[previousValue]) {
            tipoMovimientoTallaSelect.value = previousValue;
        } else if (tiposOrdenados.length === 1) {
            tipoMovimientoTallaSelect.value = tiposOrdenados[0].id;
        }

        updateTallaStockPreview();
    }

    function updateTallaStockPreview() {
        const cantidad = parseInt(cantidadAjusteTallaInput.value) || 0;
        const tipoMovimiento = tipoMovimientoTallaSelect.value;
        const stockActual = parseInt(document.getElementById('ajusteTallaStockActual').textContent) || 0;

        document.getElementById('previewTallaStockActual').textContent = stockActual;
        document.getElementById('previewTallaCantidad').textContent = cantidad;

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

        document.getElementById('previewTallaNuevoStock').textContent = nuevoStock;

        // Cambiar color según el resultado
        const nuevoStockElement = document.getElementById('previewTallaNuevoStock');
        if (nuevoStock <= 0) {
            nuevoStockElement.style.color = '#dc3545';
            nuevoStockElement.style.backgroundColor = '#f8d7da';
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

    window.gestionarTallas = gestionarTallas;

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

    // --- Funciones de Gestión de Tallas ---

    function gestionarTallas(inventarioId) {
        const item = inventarioData.find(inv => inv.id_inventario === inventarioId);
        if (!item) return;

        // Cargar datos del inventario con tallas
        cargarInventarioConTallas(inventarioId);
    }

    async function openAgregarTallasModal(inventarioId) {
        console.log('openAgregarTallasModal called with inventarioId:', inventarioId);
        console.log('inventarioData:', inventarioData);
        console.log('Buscando en inventarioData, total items:', inventarioData.length);
        
        // Convertir a número para comparación
        const idToFind = parseInt(inventarioId);
        
        const item = inventarioData.find(inv => {
            const invId = parseInt(inv.id_inventario);
            console.log('Comparando:', invId, '===', idToFind, '?', invId === idToFind);
            return invId === idToFind;
        });
        
        if (!item) {
            console.error('No se encontró el item de inventario con ID:', inventarioId);
            console.error('IDs disponibles en inventarioData:', inventarioData.map(inv => inv.id_inventario));
            showNotification('Error: No se encontró el producto en el inventario. Intente recargar la página.', 'error');
            return;
        }

        console.log('Item encontrado:', item);

        // Cerrar el modal de gestión de tallas si está abierto
        if (gestionTallasModal) {
            gestionTallasModal.style.display = 'none';
        }

        // Llenar información del producto
        document.getElementById('agregarTallasInventarioId').value = inventarioId;
        document.getElementById('agregarTallasProductoNombre').textContent = item.nombre_producto;
        document.getElementById('agregarTallasAlmacenNombre').textContent = item.nombre_almacen;

        // Reset form
        agregarTallasForm.reset();
        tallasList.innerHTML = '';

        // Cargar las tallas disponibles del producto
        try {
            const productoId = item.id_producto;
            console.log('Cargando tallas del producto ID:', productoId);
            
            // Obtener las tallas del producto desde el backend
            const tallasDisponibles = await obtenerTallasProducto(productoId);
            console.log('Tallas disponibles del producto:', tallasDisponibles);
            
            // Guardar las tallas disponibles para uso posterior
            tallasDisponiblesActuales = tallasDisponibles;
            
            if (!tallasDisponibles || tallasDisponibles.length === 0) {
                showNotification('Este producto no tiene tallas registradas en la base de datos', 'warning');
                tallasList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay tallas disponibles para este producto. Por favor, registre las tallas del producto primero.</p>';
            } else {
                // Agregar primera fila con las tallas disponibles
                agregarFilaTallaConSelect(tallasDisponibles[0], tallasDisponibles);
            }

            agregarTallasModal.style.display = 'block';
            console.log('Modal de agregar tallas abierto correctamente');
        } catch (error) {
            console.error('Error cargando tallas del producto:', error);
            showNotification('Error al cargar las tallas del producto', 'error');
        }
    }

    // Nueva función para obtener las tallas de un producto
    async function obtenerTallasProducto(productoId) {
        try {
            // Primero intentamos obtener el producto completo
            const producto = productosDisponibles.find(p => p.id === productoId || p.id_producto === productoId);
            
            if (producto && producto.tallas && Array.isArray(producto.tallas)) {
                return producto.tallas.map(t => ({
                    talla: t.talla,
                    precioVenta: t.precioVenta || t.precio_venta,
                    costoCompra: t.costoCompra || t.costo_compra
                }));
            }
            
            // Si no está en la lista local, intentar obtenerlo del backend
            // Aquí asumimos que las tallas vienen en la respuesta del producto
            const response = await fetch(`/api/productos/calzados/${productoId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.tallas && Array.isArray(data.tallas)) {
                    return data.tallas;
                }
            }
            
            // Intentar con accesorios si no es calzado
            const response2 = await fetch(`/api/productos/accesorios/${productoId}`);
            if (response2.ok) {
                const data = await response2.json();
                if (data.tallas && Array.isArray(data.tallas)) {
                    return data.tallas;
                }
            }
            
            return [];
        } catch (error) {
            console.error('Error obteniendo tallas del producto:', error);
            return [];
        }
    }

    // Nueva función para agregar fila con select de tallas disponibles
    function agregarFilaTallaConSelect(tallaSeleccionada = null, tallasDisponibles = []) {
        const tallaIndex = tallasList.children.length;
        
        // Generar opciones del select
        let optionsHtml = '<option value="">Seleccione una talla</option>';
        tallasDisponibles.forEach(t => {
            const selected = tallaSeleccionada && t.talla === tallaSeleccionada.talla ? 'selected' : '';
            optionsHtml += `<option value="${t.talla}" ${selected}>${t.talla}</option>`;
        });
        
        const filaHtml = `
            <div class="talla-row" data-index="${tallaIndex}">
                <div class="form-row">
                    <div class="form-group">
                        <label>Talla *</label>
                        <select class="talla-input" required>
                            ${optionsHtml}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cantidad Inicial *</label>
                        <input type="number" class="cantidad-inicial-input" value="0" min="0" placeholder="0" required>
                    </div>
                    <div class="form-group">
                        <label>Stock Mínimo *</label>
                        <input type="number" class="stock-minimo-input" value="0" min="0" placeholder="0" required>
                    </div>
                    <div class="form-group action-group">
                        <button type="button" class="btn btn-sm btn-danger remove-talla-btn" onclick="removerFilaTalla(${tallaIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        tallasList.insertAdjacentHTML('beforeend', filaHtml);
    }

    function agregarFilaTalla(talla = '', cantidadInicial = 0, stockMinimo = 0) {
        const tallaIndex = tallasList.children.length;
        const filaHtml = `
            <div class="talla-row" data-index="${tallaIndex}">
                <div class="form-row">
                    <div class="form-group">
                        <label>Talla *</label>
                        <input type="text" class="talla-input" value="${talla}" placeholder="Ej: M, L, XL" required>
                    </div>
                    <div class="form-group">
                        <label>Cantidad Inicial *</label>
                        <input type="number" class="cantidad-inicial-input" value="${cantidadInicial}" min="0" placeholder="0" required>
                    </div>
                    <div class="form-group">
                        <label>Stock Mínimo *</label>
                        <input type="number" class="stock-minimo-input" value="${stockMinimo}" min="0" placeholder="0" required>
                    </div>
                    <div class="form-group action-group">
                        <button type="button" class="btn btn-sm btn-danger remove-talla-btn" onclick="removerFilaTalla(${tallaIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        tallasList.insertAdjacentHTML('beforeend', filaHtml);
    }

    function removerFilaTalla(index) {
        const filas = tallasList.querySelectorAll('.talla-row');
        if (filas.length > 1) {
            filas[index].remove();
            // Reindexar las filas restantes
            tallasList.querySelectorAll('.talla-row').forEach((fila, idx) => {
                fila.dataset.index = idx;
                fila.querySelector('.remove-talla-btn').onclick = () => removerFilaTalla(idx);
            });
        } else {
            showNotification('Debe mantener al menos una talla', 'warning');
        }
    }

    window.removerFilaTalla = removerFilaTalla;

    async function cargarInventarioConTallas(inventarioId) {
        try {
            const response = await fetch(`/inventario/api/${inventarioId}/tallas`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar las tallas del inventario');
            }

            const data = await response.json();

            // Llenar información del producto
            document.getElementById('gestionTallasInventarioId').value = inventarioId;
            document.getElementById('gestionTallasProductoNombre').textContent = data.nombreProducto;
            document.getElementById('gestionTallasAlmacenNombre').textContent = data.nombreAlmacen;
            document.getElementById('gestionTallasStockTotal').textContent = data.stockTotal;

            // Renderizar tallas
            renderizarTallas(data.tallas);

            // Ocultar sección de acciones de talla
            tallaActionsSection.style.display = 'none';

            gestionTallasModal.style.display = 'block';
        } catch (error) {
            console.error('Error cargando inventario con tallas:', error);
            showNotification('Error al cargar las tallas del inventario', 'error');
        }
    }

    function renderizarTallas(tallas) {
        tallasContainer.innerHTML = '';

        if (!tallas || tallas.length === 0) {
            tallasContainer.innerHTML = `
                <div class="no-tallas-message">
                    <i class="fas fa-tags" style="font-size: 24px; color: #ccc;"></i>
                    <p style="color: #999; margin: 10px 0;">No hay tallas registradas para este producto</p>
                    <p style="color: #666; font-size: 14px;">Registra las tallas desde el catálogo del producto</p>
                </div>
            `;
            return;
        }

        tallas.forEach(talla => {
            const tallaElement = document.createElement('div');
            tallaElement.className = `talla-item ${talla.agotado ? 'agotado' : ''} ${talla.stockBajo ? 'stock-bajo' : ''}`;
            tallaElement.onclick = () => seleccionarTalla(talla.talla, talla);

            tallaElement.innerHTML = `
                <div class="talla-header">
                    <span class="talla-nombre">${talla.talla}</span>
                    <span class="talla-status ${talla.agotado ? 'agotado' : talla.stockBajo ? 'bajo' : 'disponible'}">
                        ${talla.agotado ? 'Agotado' : talla.stockBajo ? 'Stock Bajo' : 'Disponible'}
                    </span>
                </div>
                <div class="talla-stock">
                    <div class="stock-info">
                        <span class="stock-actual">${talla.cantidadStock}</span>
                        <span class="stock-separator">/</span>
                        <span class="stock-minimo">${talla.stockMinimo}</span>
                    </div>
                    <div class="stock-bar">
                        <div class="stock-bar-fill" style="width: ${Math.min((talla.cantidadStock / Math.max(talla.stockMinimo * 2, 1)) * 100, 100)}%"></div>
                    </div>
                </div>
            `;

            tallasContainer.appendChild(tallaElement);
        });
    }

    function seleccionarTalla(talla, tallaData) {
        // Remover selección anterior
        document.querySelectorAll('.talla-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Seleccionar nueva talla
        event.currentTarget.classList.add('selected');

        // Almacenar datos de la talla seleccionada
        selectedTallaData = tallaData;

        // Mostrar información de la talla seleccionada
        selectedTalla.value = talla;
        document.getElementById('selectedTallaDisplay').textContent = talla;
        document.getElementById('selectedTallaStock').textContent = tallaData.cantidadStock;
        document.getElementById('selectedTallaMinimo').textContent = tallaData.stockMinimo;

        // Mostrar sección de acciones
        tallaActionsSection.style.display = 'block';
    }

    // --- Event Listeners ---

    // Búsqueda y filtros
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    almacenFilter.addEventListener('change', applyFilters);
    categoriaFilter.addEventListener('change', applyFilters);
    stockFilter.addEventListener('change', applyFilters);

    if (productoSearchInput) {
        productoSearchInput.addEventListener('input', () => {
            if (productoSelect) {
                productoSelect.value = '';
            }
            updateProductDetails();
            rebuildProductoSelectOptions();
            openProductoDropdown();
        });

        productoSearchInput.addEventListener('focus', () => {
            rebuildProductoSelectOptions(productoSelect ? productoSelect.value : '');
            openProductoDropdown();
        });

        productoSearchInput.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (!productoDropdownItems.length) {
                    rebuildProductoSelectOptions(productoSelect ? productoSelect.value : '');
                }
                const nextIndex = productoHighlightedIndex + 1 >= productoDropdownItems.length
                    ? 0
                    : productoHighlightedIndex + 1;
                highlightProductoDropdownItem(nextIndex);
                openProductoDropdown();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (!productoDropdownItems.length) {
                    rebuildProductoSelectOptions(productoSelect ? productoSelect.value : '');
                }
                let nextIndex = productoHighlightedIndex - 1;
                if (nextIndex < 0) {
                    nextIndex = productoDropdownItems.length - 1;
                }
                highlightProductoDropdownItem(nextIndex);
                openProductoDropdown();
            } else if (event.key === 'Enter') {
                if (!productoDropdownItems.length) {
                    return;
                }
                event.preventDefault();
                const index = productoHighlightedIndex >= 0 ? productoHighlightedIndex : 0;
                const item = productoDropdownItems[index];
                if (item && item.dataset.id) {
                    const producto = findProductoById(item.dataset.id);
                    if (producto) {
                        selectProducto(producto);
                    }
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                closeProductoDropdown();
            }
        });

        productoSearchInput.addEventListener('blur', () => {
            setTimeout(() => closeProductoDropdown(), 150);
        });
    }

    if (productoSelectContainer) {
        document.addEventListener('click', (event) => {
            if (!productoSelectContainer.contains(event.target)) {
                closeProductoDropdown();
            }
        });
    }

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
        const stockMinimo = 0;
        const cantidadInicial = 0;
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

    // Modal de gestión de tallas
    closeGestionTallasModal.addEventListener('click', () => {
        gestionTallasModal.style.display = 'none';
        tallaActionsSection.style.display = 'none';
    });

    cerrarGestionTallasBtn.addEventListener('click', () => {
        gestionTallasModal.style.display = 'none';
        tallaActionsSection.style.display = 'none';
    });


    ajustarTallaBtn.addEventListener('click', () => {
        console.log('Botón ajustar talla clicked');
        const talla = selectedTalla.value;
        const inventarioId = document.getElementById('gestionTallasInventarioId').value;
        console.log('Datos obtenidos:', { talla, inventarioId, selectedTallaData });
        
        if (talla && inventarioId && selectedTallaData) {
            console.log('Abriendo modal de ajuste de talla...');
            openAjusteTallaModal(inventarioId, talla, selectedTallaData);
        } else {
            console.error('Faltan datos para abrir el modal:', { 
                talla, 
                inventarioId, 
                tieneSelectedTallaData: !!selectedTallaData 
            });
            showNotification('Por favor seleccione una talla primero', 'warning');
        }
    });

    transferirTallaBtn.addEventListener('click', () => {
        // Implementar transferencia de talla
        showNotification('Funcionalidad de transferencia por talla próximamente', 'info');
    });

    eliminarTallaBtn.addEventListener('click', () => {
        // Implementar eliminar talla
        showNotification('Funcionalidad de eliminar talla próximamente', 'info');
    });

    // Modal de ajuste de talla
    closeAjusteTallaModal.addEventListener('click', () => {
        const inventarioId = document.getElementById('ajusteTallaInventarioId').value;
        ajusteTallaModal.style.display = 'none';
        // Reabrir el modal de gestión de tallas
        if (inventarioId) {
            cargarInventarioConTallas(inventarioId);
        }
    });

    cancelAjusteTallaBtn.addEventListener('click', () => {
        const inventarioId = document.getElementById('ajusteTallaInventarioId').value;
        ajusteTallaModal.style.display = 'none';
        // Reabrir el modal de gestión de tallas
        if (inventarioId) {
            cargarInventarioConTallas(inventarioId);
        }
    });

    tipoMovimientoTallaSelect.addEventListener('change', updateTallaStockPreview);
    cantidadAjusteTallaInput.addEventListener('input', updateTallaStockPreview);

    // Envío del formulario de ajuste de talla
    ajusteTallaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inventarioId = document.getElementById('ajusteTallaInventarioId').value;
        const talla = document.getElementById('ajusteTallaTalla').value;
        const tipoMovimientoId = tipoMovimientoTallaSelect.value;
        const cantidad = parseInt(cantidadAjusteTallaInput.value);
        const referencia = (document.getElementById('referenciaTalla').value || '').trim();
        const observaciones = (document.getElementById('observacionesTalla').value || '').trim();

        if (!inventarioId || !talla || !tipoMovimientoId || !cantidad || cantidad <= 0) {
            showNotification('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        try {
            const payload = new URLSearchParams();
            payload.append('talla', talla);
            payload.append('tipoMovimientoId', tipoMovimientoId);
            payload.append('cantidad', cantidad);
            if (referencia) payload.append('referencia', referencia);
            if (observaciones) payload.append('observaciones', observaciones);

            const response = await fetch(`/inventario/api/${inventarioId}/talla/ajuste`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            if (!response.ok) {
                let errorMessage = 'No se pudo aplicar el ajuste de stock por talla';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (parseError) {
                    // Mantener mensaje por defecto
                }
                showNotification(errorMessage, 'error');
                return;
            }

            showNotification('Ajuste de stock por talla aplicado correctamente');

            ajusteTallaForm.reset();
            ajusteTallaModal.style.display = 'none';

            // Recargar datos
            await Promise.all([
                loadInventarioData(),
                loadMovimientosData()
            ]);
            await updateSummaryCards();

            // Reabrir el modal de gestión de tallas para ver el stock actualizado
            if (inventarioId) {
                await cargarInventarioConTallas(inventarioId);
            }

        } catch (error) {
            console.error('Error aplicando ajuste de talla:', error);
            showNotification('Error al aplicar el ajuste de stock por talla', 'error');
        }
    });

    // Modal de agregar tallas
    closeAgregarTallasModal.addEventListener('click', () => {
        const inventarioId = document.getElementById('agregarTallasInventarioId').value;
        agregarTallasModal.style.display = 'none';
        // Reabrir el modal de gestión de tallas
        if (inventarioId) {
            cargarInventarioConTallas(inventarioId);
        }
    });

    cancelAgregarTallasBtn.addEventListener('click', () => {
        const inventarioId = document.getElementById('agregarTallasInventarioId').value;
        agregarTallasModal.style.display = 'none';
        // Reabrir el modal de gestión de tallas
        if (inventarioId) {
            cargarInventarioConTallas(inventarioId);
        }
    });

    addTallaBtn.addEventListener('click', () => {
        if (tallasDisponiblesActuales && tallasDisponiblesActuales.length > 0) {
            agregarFilaTallaConSelect(null, tallasDisponiblesActuales);
        } else {
            showNotification('No hay tallas disponibles para agregar', 'warning');
        }
    });

    // Envío del formulario de agregar tallas
    agregarTallasForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inventarioId = document.getElementById('agregarTallasInventarioId').value;
        const referencia = (document.getElementById('referenciaAgregarTallas').value || '').trim();
        const observaciones = (document.getElementById('observacionesAgregarTallas').value || '').trim();

        // Recopilar datos de tallas
        const tallasData = [];
        const filasTalla = tallasList.querySelectorAll('.talla-row');

        for (const fila of filasTalla) {
            const talla = fila.querySelector('.talla-input').value.trim();
            const cantidadInicial = parseInt(fila.querySelector('.cantidad-inicial-input').value) || 0;
            const stockMinimo = parseInt(fila.querySelector('.stock-minimo-input').value) || 0;

            if (!talla) {
                showNotification('Todas las tallas deben tener un nombre', 'error');
                return;
            }

            if (cantidadInicial < 0 || stockMinimo < 0) {
                showNotification('Las cantidades deben ser valores positivos', 'error');
                return;
            }

            tallasData.push({
                talla: talla,
                cantidadInicial: cantidadInicial,
                stockMinimo: stockMinimo
            });
        }

        if (tallasData.length === 0) {
            showNotification('Debe agregar al menos una talla', 'error');
            return;
        }

        try {
            const payload = new URLSearchParams();
            payload.append('tallasJson', JSON.stringify(tallasData));
            if (referencia) payload.append('referencia', referencia);
            if (observaciones) payload.append('observaciones', observaciones);

            const response = await fetch(`/inventario/api/${inventarioId}/agregar-tallas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            if (!response.ok) {
                let errorMessage = 'No se pudieron agregar las tallas';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (parseError) {
                    // Mantener mensaje por defecto
                }
                showNotification(errorMessage, 'error');
                return;
            }

            showNotification('Tallas agregadas correctamente');

            agregarTallasForm.reset();
            tallasList.innerHTML = '';
            agregarTallasModal.style.display = 'none';

            // Recargar datos
            await Promise.all([
                loadInventarioData(),
                loadMovimientosData()
            ]);
            await updateSummaryCards();

            // Reabrir el modal de gestión de tallas para ver las tallas agregadas
            if (inventarioId) {
                await cargarInventarioConTallas(inventarioId);
            }

        } catch (error) {
            console.error('Error agregando tallas:', error);
            showNotification('Error al agregar las tallas', 'error');
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
        if (e.target === gestionTallasModal) {
            gestionTallasModal.style.display = 'none';
            tallaActionsSection.style.display = 'none';
        }
        if (e.target === ajusteTallaModal) {
            ajusteTallaModal.style.display = 'none';
        }
        if (e.target === agregarTallasModal) {
            agregarTallasModal.style.display = 'none';
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
            console.log('Datos crudos del inventario:', inventarioRaw);
            
            inventarioData = (Array.isArray(inventarioRaw) ? inventarioRaw : [])
                .map(normalizeInventarioItem)
                .filter(Boolean);

            console.log('Datos normalizados del inventario:', inventarioData);
            console.log('IDs de inventario disponibles:', inventarioData.map(inv => ({
                id: inv.id_inventario,
                tipo: typeof inv.id_inventario,
                nombre: inv.nombre_producto
            })));

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