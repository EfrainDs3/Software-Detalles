document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const comprasTableBody = document.getElementById('comprasTableBody');
    const addCompraBtn = document.getElementById('addCompraBtn');
    const compraModal = document.getElementById('compraModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const compraForm = document.getElementById('compraForm');
    const modalTitle = document.getElementById('modalTitle');
    const addProductBtn = document.getElementById('addProductBtn');
    const productosContainer = document.getElementById('productosContainer');
    const compraTotalSpan = document.getElementById('compraTotal');
    const aplicaIgvToggle = document.getElementById('aplicaIgvToggle');
    const proveedorSearchInput = document.getElementById('proveedorSearchInput');
    const proveedorSearchResults = document.getElementById('proveedorSearchResults');
    const proveedorSelectContainer = document.getElementById('proveedorSelectContainer');

    // Referencias de los campos del formulario
    const compraIdInput = document.getElementById('compraId');
    const compraProveedorSelect = document.getElementById('compraProveedor');
    const compraRucInput = document.getElementById('compraRuc');
    const compraFechaPedidoInput = document.getElementById('compraFechaPedido');
    const compraFechaEntregaInput = document.getElementById('compraFechaEntrega');
    const compraSubtotalSpan = document.getElementById('compraSubtotal');
    const compraIgvSpan = document.getElementById('compraIgv');

    // Modal de detalle
    const detalleCompraModal = document.getElementById('detalleCompraModal');
    const closeDetalleModalBtn = document.getElementById('closeDetalleModal');
    const aceptarDetalleBtn = document.getElementById('aceptarDetalleBtn');
    const detalleCompraId = document.getElementById('detalleCompraId');
    const detalleCompraProveedor = document.getElementById('detalleCompraProveedor');
    const detalleCompraRuc = document.getElementById('detalleCompraRuc');
    const detalleCompraFechaPedido = document.getElementById('detalleCompraFechaPedido');
    const detalleCompraFechaEntrega = document.getElementById('detalleCompraFechaEntrega');
    const detalleCompraEstado = document.getElementById('detalleCompraEstado');
    const detalleCompraMetodoPago = document.getElementById('detalleCompraMetodoPago');
    const detalleCompraReferencia = document.getElementById('detalleCompraReferencia');
    const detalleCompraObservaciones = document.getElementById('detalleCompraObservaciones');
    const detalleCompraSubtotal = document.getElementById('detalleCompraSubtotal');
    const detalleCompraIgv = document.getElementById('detalleCompraIgv');
    const detalleCompraTotal = document.getElementById('detalleCompraTotal');
    const detalleCompraIgvEstado = document.getElementById('detalleCompraIgvEstado');
    const detalleProductosTableBody = document.getElementById('detalleProductosTableBody');

    // Variables globales
    let proveedoresData = [];
    let productosDelProveedor = [];
    let proveedorSeleccionado = null;
    let productosTallasCache = {}; // Cache para tallas de productos
    let proveedorDropdownItems = [];
    let proveedorHighlightedIndex = -1;

    // --- Funciones de API ---

    async function cargarProveedores() {
        try {
            const response = await fetch('/compras/api/proveedores');
            if (!response.ok) throw new Error('Error al cargar proveedores');

            proveedoresData = await response.json();

            // Llenar el select de proveedores
            compraProveedorSelect.innerHTML = '<option value="">Seleccionar proveedor</option>';
            proveedoresData.forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.idProveedor;
                option.textContent = proveedor.nombreComercial || proveedor.razonSocial;
                option.dataset.ruc = proveedor.ruc;
                compraProveedorSelect.appendChild(option);
            });

            if (proveedorSearchInput) {
                rebuildProveedorSearchResults();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar proveedores');
        }
    }

    async function cargarTiposPago() {
        try {
            const response = await fetch('/compras/api/tipospago');
            if (!response.ok) throw new Error('Error al cargar tipos de pago');

            const tiposPago = await response.json();
            const tipoPagoSelect = document.getElementById('compraTipoPago');

            tipoPagoSelect.innerHTML = '<option value="">Seleccionar método</option>';
            tiposPago.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.nombre;
                tipoPagoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function cargarProductosPorProveedor(idProveedor) {
        try {
            const response = await fetch(`/compras/api/productos/proveedor/${idProveedor}`);
            if (!response.ok) throw new Error('Error al cargar productos');

            productosDelProveedor = await response.json();
            return productosDelProveedor;
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar productos del proveedor');
            return [];
        }
    }

    async function cargarTallasProducto(idProducto) {
        // Verificar cache primero
        if (productosTallasCache[idProducto]) {
            return productosTallasCache[idProducto];
        }

        try {
            const response = await fetch(`/compras/api/productos/${idProducto}/tallas`);
            if (!response.ok) throw new Error('Error al cargar tallas');

            const data = await response.json();
            productosTallasCache[idProducto] = data;
            return data;
        } catch (error) {
            console.error('Error:', error);
            return { tieneTallas: false, tallas: [] };
        }
    }

    async function cargarCompras() {
        try {
            const response = await fetch('/compras/api');
            if (!response.ok) throw new Error('Error al cargar compras');

            const compras = await response.json();
            renderCompras(compras);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar compras');
        }
    }

    async function guardarCompra(compraData) {
        try {
            const response = await fetch('/compras/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(compraData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al guardar compra');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function actualizarEstadoCompra(idCompra, nuevoEstado) {
        try {
            const response = await fetch(`/compras/api/${idCompra}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al actualizar estado');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function anularCompra(idCompra) {
        try {
            const response = await fetch(`/compras/api/${idCompra}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al anular compra');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function obtenerDetalleCompra(idCompra) {
        try {
            const response = await fetch(`/compras/api/${idCompra}`);
            if (!response.ok) throw new Error('Error al obtener detalle');

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // --- Componentes de búsqueda ---

    function obtenerNombreProveedor(proveedor) {
        if (!proveedor) {
            return '';
        }
        return proveedor.nombreComercial || proveedor.razonSocial || 'Proveedor sin nombre';
    }

    function obtenerMetaProveedor(proveedor) {
        if (!proveedor) {
            return '';
        }

        const meta = [];
        if (proveedor.ruc) {
            meta.push(`RUC ${proveedor.ruc}`);
        }
        if (proveedor.rubro) {
            meta.push(proveedor.rubro);
        }
        if (proveedor.telefono) {
            meta.push(`Tel. ${proveedor.telefono}`);
        }
        return meta.join(' · ');
    }

    function closeProveedorDropdown() {
        if (proveedorSearchResults) {
            proveedorSearchResults.classList.remove('visible');
            proveedorSearchResults.scrollTop = 0;
        }
        proveedorDropdownItems = [];
        proveedorHighlightedIndex = -1;
    }

    function openProveedorDropdown() {
        if (proveedorSearchResults && proveedorDropdownItems.length > 0) {
            proveedorSearchResults.classList.add('visible');
        }
    }

    function highlightProveedorOption(index) {
        if (!proveedorDropdownItems.length) {
            proveedorHighlightedIndex = -1;
            return;
        }

        proveedorDropdownItems.forEach(item => item.classList.remove('active'));

        if (index >= 0 && index < proveedorDropdownItems.length) {
            proveedorDropdownItems[index].classList.add('active');
            proveedorHighlightedIndex = index;

            const itemElement = proveedorDropdownItems[index];
            const container = proveedorSearchResults;
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
            proveedorHighlightedIndex = -1;
        }
    }

    function rebuildProveedorSearchResults() {
        if (!proveedorSearchResults) {
            return;
        }

        const searchTerm = (proveedorSearchInput?.value || '').trim().toLowerCase();
        proveedorSearchResults.innerHTML = '';

        const resultados = proveedoresData.filter(proveedor => {
            if (!proveedor) {
                return false;
            }

            const searchable = [
                proveedor.nombreComercial,
                proveedor.razonSocial,
                proveedor.ruc,
                proveedor.rubro,
                proveedor.telefono,
                proveedor.email
            ].filter(Boolean).join(' ').toLowerCase();

            return !searchTerm || searchable.includes(searchTerm);
        });

        if (resultados.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'searchable-option-empty';
            if (proveedoresData.length === 0) {
                emptyItem.textContent = 'No hay proveedores registrados';
            } else if (searchTerm) {
                emptyItem.textContent = 'Sin resultados para tu búsqueda';
            } else {
                emptyItem.textContent = 'Empieza a escribir para buscar un proveedor';
            }
            proveedorSearchResults.appendChild(emptyItem);

            proveedorDropdownItems = [];
            if (document.activeElement === proveedorSearchInput && (searchTerm || proveedoresData.length === 0)) {
                proveedorSearchResults.classList.add('visible');
            } else {
                closeProveedorDropdown();
            }
            return;
        }

        resultados.forEach((proveedor, index) => {
            const item = document.createElement('li');
            item.dataset.id = proveedor.idProveedor;

            const title = document.createElement('span');
            title.className = 'searchable-option-title';
            title.textContent = obtenerNombreProveedor(proveedor);
            item.appendChild(title);

            const metaText = obtenerMetaProveedor(proveedor);
            if (metaText) {
                const meta = document.createElement('span');
                meta.className = 'searchable-option-meta';
                meta.textContent = metaText;
                item.appendChild(meta);
            }

            item.addEventListener('mousedown', (event) => {
                event.preventDefault();
                manejarProveedorSeleccion(proveedor).catch(console.error);
                closeProveedorDropdown();
            });

            item.addEventListener('mouseenter', () => {
                highlightProveedorOption(index);
            });

            proveedorSearchResults.appendChild(item);
        });

        proveedorDropdownItems = Array.from(proveedorSearchResults.querySelectorAll('li[data-id]'));

        if (proveedorSearchInput && proveedorSearchInput.dataset.selectedId) {
            const selectedIndex = proveedorDropdownItems.findIndex(item => item.dataset.id === proveedorSearchInput.dataset.selectedId);
            if (selectedIndex >= 0) {
                highlightProveedorOption(selectedIndex);
            }
        }

        if (document.activeElement === proveedorSearchInput && proveedorDropdownItems.length > 0) {
            openProveedorDropdown();
            if (proveedorHighlightedIndex === -1) {
                highlightProveedorOption(0);
            }
        } else {
            closeProveedorDropdown();
        }
    }

    function desvincularProveedorSeleccionado() {
        if (proveedorSearchInput) {
            delete proveedorSearchInput.dataset.selectedId;
            delete proveedorSearchInput.dataset.selectedLabel;
        }

        if (proveedorSeleccionado !== null) {
            proveedorSeleccionado = null;
            compraProveedorSelect.value = '';
            compraRucInput.value = '';
            productosDelProveedor = [];
            productosTallasCache = {};
            limpiarProductosAgregados();
            calcularTotales();
        }
    }

    async function manejarProveedorSeleccion(proveedor) {
        if (!proveedor) {
            desvincularProveedorSeleccionado();
            return;
        }

        proveedorSeleccionado = proveedor.idProveedor;
        compraProveedorSelect.value = proveedor.idProveedor;

        if (proveedorSearchInput) {
            const etiqueta = obtenerNombreProveedor(proveedor);
            proveedorSearchInput.value = etiqueta;
            proveedorSearchInput.dataset.selectedId = String(proveedor.idProveedor);
            proveedorSearchInput.dataset.selectedLabel = etiqueta.trim().toLowerCase();
        }

        compraRucInput.value = proveedor.ruc || '';
        productosTallasCache = {};

        limpiarProductosAgregados();
        calcularTotales();

        await cargarProductosPorProveedor(proveedorSeleccionado);
        closeProveedorDropdown();
    }

    function limpiarProductosAgregados() {
        const filas = Array.from(productosContainer.querySelectorAll('.producto-row'));
        filas.forEach(fila => {
            if (typeof fila._destroySearch === 'function') {
                fila._destroySearch();
            }
        });
        productosContainer.innerHTML = '';
    }

    // --- Funciones de Renderizado ---

    function renderCompras(compras) {
        comprasTableBody.innerHTML = '';

        if (compras.length === 0) {
            comprasTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">No hay compras registradas</td>
                </tr>
            `;
            return;
        }

        compras.forEach(compra => {
            const row = document.createElement('tr');

            const estadoBadge = getEstadoBadge(compra.estadoPedido);
            const fechaPedido = new Date(compra.fechaPedido).toLocaleDateString('es-PE');
            const fechaEntrega = compra.fechaEntregaEsperada ?
                new Date(compra.fechaEntregaEsperada).toLocaleDateString('es-PE') : '-';

            row.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${compra.idPedidoCompra}</td>
                <td>${compra.nombreProveedor}</td>
                <td>${compra.rucProveedor}</td>
                <td>${fechaPedido}</td>
                <td>${fechaEntrega}</td>
                <td><span class="badge ${estadoBadge.class}">${compra.estadoPedido}</span></td>
                <td>S/ ${compra.totalPedido.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="window.comprasModule.verDetalle(${compra.idPedidoCompra})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${compra.estadoPedido === 'Pendiente' ? `
                        <button class="btn btn-sm btn-success" onclick="window.comprasModule.completarCompra(${compra.idPedidoCompra})" title="Completar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.comprasModule.anular(${compra.idPedidoCompra})" title="Anular">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            `;

            comprasTableBody.appendChild(row);
        });
    }

    function getEstadoBadge(estado) {
        const badges = {
            'Pendiente': { class: 'bg-warning' },
            'Completado': { class: 'bg-success' },
            'Cancelado': { class: 'bg-danger' }
        };
        return badges[estado] || { class: 'bg-secondary' };
    }

    // --- Gestión de Productos en el Formulario ---

    function obtenerEtiquetaProducto(producto) {
        if (!producto) {
            return '';
        }
        const costo = Number(producto.costoCompra);
        const costoTexto = Number.isFinite(costo) ? ` · S/ ${costo.toFixed(2)}` : '';
        return `${producto.nombre}${costoTexto}`;
    }

    function obtenerMetaProducto(producto) {
        if (!producto) {
            return '';
        }
        const meta = [];
        const costo = Number(producto.costoCompra);
        if (Number.isFinite(costo)) {
            meta.push(`Costo S/ ${costo.toFixed(2)}`);
        }
        if (producto.precioVenta !== undefined && producto.precioVenta !== null) {
            const venta = Number(producto.precioVenta);
            if (Number.isFinite(venta)) {
                meta.push(`Venta S/ ${venta.toFixed(2)}`);
            }
        }
        return meta.join(' · ');
    }

    function setupProductoSearch(productoRow, searchInput, resultsList, hiddenSelect) {
        if (!productoRow || !searchInput || !resultsList || !hiddenSelect) {
            return null;
        }

        let dropdownItems = [];
        let highlightedIndex = -1;

        const closeDropdown = () => {
            resultsList.classList.remove('visible');
            resultsList.scrollTop = 0;
            dropdownItems = [];
            highlightedIndex = -1;
        };

        const openDropdown = () => {
            if (dropdownItems.length > 0) {
                resultsList.classList.add('visible');
            }
        };

        const highlightOption = (index) => {
            if (!dropdownItems.length) {
                highlightedIndex = -1;
                return;
            }

            dropdownItems.forEach(item => item.classList.remove('active'));

            if (index >= 0 && index < dropdownItems.length) {
                dropdownItems[index].classList.add('active');
                highlightedIndex = index;

                const itemElement = dropdownItems[index];
                const container = resultsList;
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
                highlightedIndex = -1;
            }
        };

        const applySelection = (producto) => {
            if (!producto) {
                searchInput.value = '';
                delete searchInput.dataset.selectedId;
                delete searchInput.dataset.selectedLabel;
                hiddenSelect.value = '';
                hiddenSelect.dispatchEvent(new Event('change'));
                closeDropdown();
                return;
            }

            const etiqueta = obtenerEtiquetaProducto(producto);
            searchInput.value = etiqueta;
            searchInput.dataset.selectedId = String(producto.id);
            searchInput.dataset.selectedLabel = etiqueta.trim().toLowerCase();
            hiddenSelect.value = producto.id;
            hiddenSelect.dispatchEvent(new Event('change'));
            closeDropdown();
        };

        const rebuildResults = () => {
            const searchTerm = (searchInput.value || '').trim().toLowerCase();
            resultsList.innerHTML = '';

            const disponibles = Array.isArray(productosDelProveedor) ? productosDelProveedor : [];
            const resultados = [];

            disponibles.forEach(producto => {
                if (!producto) {
                    return;
                }

                const searchable = [
                    producto.nombre,
                    producto.costoCompra,
                    producto.precioVenta
                ].filter(Boolean).join(' ').toLowerCase();

                if (!searchTerm || searchable.includes(searchTerm)) {
                    resultados.push(producto);
                }
            });

            if (resultados.length === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'searchable-option-empty';
                if (!disponibles.length) {
                    emptyItem.textContent = 'El proveedor seleccionado no tiene productos disponibles';
                } else if (searchTerm) {
                    emptyItem.textContent = 'Sin resultados para tu búsqueda';
                } else {
                    emptyItem.textContent = 'Empieza a escribir para buscar un producto';
                }
                resultsList.appendChild(emptyItem);
                dropdownItems = [];

                if (document.activeElement === searchInput && (searchTerm || !disponibles.length)) {
                    resultsList.classList.add('visible');
                } else {
                    closeDropdown();
                }
                return;
            }

            resultados.forEach((producto, index) => {
                const item = document.createElement('li');
                item.dataset.id = producto.id;

                const title = document.createElement('span');
                title.className = 'searchable-option-title';
                title.textContent = producto.nombre;
                item.appendChild(title);

                const metaText = obtenerMetaProducto(producto);
                if (metaText) {
                    const meta = document.createElement('span');
                    meta.className = 'searchable-option-meta';
                    meta.textContent = metaText;
                    item.appendChild(meta);
                }

                item.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    applySelection(producto);
                });

                item.addEventListener('mouseenter', () => {
                    highlightOption(index);
                });

                resultsList.appendChild(item);
            });

            dropdownItems = Array.from(resultsList.querySelectorAll('li[data-id]'));

            if (searchInput.dataset.selectedId) {
                const selectedIndex = dropdownItems.findIndex(item => item.dataset.id === searchInput.dataset.selectedId);
                if (selectedIndex >= 0) {
                    highlightOption(selectedIndex);
                }
            }

            if (document.activeElement === searchInput) {
                openDropdown();
                if (highlightedIndex === -1) {
                    highlightOption(dropdownItems.length ? 0 : -1);
                }
            } else {
                closeDropdown();
            }
        };

        const handleOutsideClick = (event) => {
            if (!productoRow.contains(event.target)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        searchInput.addEventListener('focus', () => {
            rebuildResults();
            if (dropdownItems.length > 0) {
                openDropdown();
            }
        });

        searchInput.addEventListener('input', () => {
            if (searchInput.dataset.selectedId) {
                const normalized = searchInput.value.trim().toLowerCase();
                if (normalized !== (searchInput.dataset.selectedLabel || '')) {
                    delete searchInput.dataset.selectedId;
                    delete searchInput.dataset.selectedLabel;
                    hiddenSelect.value = '';
                    hiddenSelect.dispatchEvent(new Event('change'));
                }
            }
            rebuildResults();
        });

        searchInput.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    if (!dropdownItems.length) {
                        rebuildResults();
                    }
                    if (dropdownItems.length) {
                        const nextIndex = highlightedIndex + 1 >= dropdownItems.length ? 0 : highlightedIndex + 1;
                        highlightOption(nextIndex);
                        openDropdown();
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    if (!dropdownItems.length) {
                        rebuildResults();
                    }
                    if (dropdownItems.length) {
                        const prevIndex = highlightedIndex - 1 < 0 ? dropdownItems.length - 1 : highlightedIndex - 1;
                        highlightOption(prevIndex);
                        openDropdown();
                    }
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (highlightedIndex >= 0 && dropdownItems[highlightedIndex]) {
                        const idSeleccionado = dropdownItems[highlightedIndex].dataset.id;
                        const producto = (productosDelProveedor || []).find(p => String(p.id) === String(idSeleccionado));
                        applySelection(producto || null);
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    closeDropdown();
                    searchInput.blur();
                    break;
                default:
                    break;
            }
        });

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }

    async function agregarProducto() {
        if (!proveedorSeleccionado) {
            alert('Primero seleccione un proveedor');
            return;
        }

        const productoRow = document.createElement('div');
        productoRow.className = 'producto-row';
        productoRow.dataset.index = Date.now();

        const productoOptions = productosDelProveedor.map(p => `
            <option value="${p.id}" data-costo="${p.costoCompra}">
                ${p.nombre} - S/ ${Number(p.costoCompra).toFixed(2)}
            </option>
        `).join('');

        productoRow.innerHTML = `
            <div class="producto-main-grid">
                <div class="form-group">
                    <label>Producto</label>
                    <div class="searchable-select producto-searchable">
                        <input type="text" class="producto-search-input" placeholder="Buscar producto por nombre o precio" autocomplete="off">
                        <ul class="searchable-options producto-search-results"></ul>
                    </div>
                    <select class="producto-select" required hidden>
                        <option value="">Seleccionar producto</option>
                        ${productoOptions}
                    </select>
                </div>
                <div class="form-group producto-cantidad-container">
                    <label>Cantidad</label>
                    <input type="number" class="producto-cantidad" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Costo Unitario</label>
                    <input type="number" class="producto-costo" step="0.01" min="0" required>
                </div>
                <div class="producto-actions">
                    <button type="button" class="btn btn-danger btn-remove-producto" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="producto-secondary-grid">
                <div class="form-group">
                    <label>Subtotal</label>
                    <input type="text" class="producto-subtotal" readonly>
                </div>
            </div>
            <div class="tallas-container" style="display: none;">
                <div class="tallas-alert">
                    <strong><i class="fas fa-ruler"></i> Este producto maneja tallas</strong>
                    <p class="tallas-note">Agregue las tallas y cantidades necesarias:</p>
                    <div class="tallas-list"></div>
                    <div class="tallas-controls">
                        <select class="talla-select">
                            <option value="">Seleccionar talla</option>
                        </select>
                        <input type="number" class="talla-cantidad" placeholder="Cantidad" min="1" value="1">
                        <button type="button" class="btn btn-primary btn-add-talla">
                            <i class="fas fa-plus"></i> Agregar Talla
                        </button>
                    </div>
                </div>
            </div>
        `;

        productosContainer.appendChild(productoRow);

        // Event listeners
        const productoSelect = productoRow.querySelector('.producto-select');
        const productoSearchInput = productoRow.querySelector('.producto-search-input');
        const productoSearchResults = productoRow.querySelector('.producto-search-results');
        const cantidadInput = productoRow.querySelector('.producto-cantidad');
        const costoInput = productoRow.querySelector('.producto-costo');
        const removeBtn = productoRow.querySelector('.btn-remove-producto');
        const addTallaBtn = productoRow.querySelector('.btn-add-talla');

        const destroySearch = setupProductoSearch(productoRow, productoSearchInput, productoSearchResults, productoSelect);
        if (typeof destroySearch === 'function') {
            productoRow._destroySearch = destroySearch;
        }

        productoSelect.addEventListener('change', async (e) => {
            const selectedId = e.target.value ? parseInt(e.target.value, 10) : null;
            const producto = (productosDelProveedor || []).find(p => String(p.id) === String(selectedId));
            const tallasList = productoRow.querySelector('.tallas-list');

            if (!selectedId || !producto) {
                if (tallasList) {
                    tallasList.innerHTML = '';
                }
                ocultarUITallas(productoRow);
                costoInput.value = '';
                calcularSubtotalProducto(productoRow);
                return;
            }

            if (productoSearchInput) {
                const etiqueta = obtenerEtiquetaProducto(producto);
                productoSearchInput.value = etiqueta;
                productoSearchInput.dataset.selectedId = String(producto.id);
                productoSearchInput.dataset.selectedLabel = etiqueta.trim().toLowerCase();
            }

            const costo = Number(producto.costoCompra);
            costoInput.value = Number.isFinite(costo) ? costo.toFixed(2) : '';

            if (tallasList) {
                tallasList.innerHTML = '';
            }

            const tallasData = await cargarTallasProducto(producto.id);
            if (tallasData.tieneTallas) {
                mostrarUITallas(productoRow, tallasData.tallas);
            } else {
                ocultarUITallas(productoRow);
            }

            calcularSubtotalProducto(productoRow);
        });

        cantidadInput.addEventListener('input', () => calcularSubtotalProducto(productoRow));
        costoInput.addEventListener('input', () => calcularSubtotalProducto(productoRow));
        removeBtn.addEventListener('click', () => {
            if (typeof productoRow._destroySearch === 'function') {
                productoRow._destroySearch();
            }
            productoRow.remove();
            calcularTotales();
        });

        if (addTallaBtn) {
            addTallaBtn.addEventListener('click', () => agregarTallaAProducto(productoRow));
        }
    }

    function mostrarUITallas(productoRow, tallas) {
        const tallasContainer = productoRow.querySelector('.tallas-container');
        const cantidadContainer = productoRow.querySelector('.producto-cantidad-container');
        const tallaSelect = productoRow.querySelector('.talla-select');

        // Ocultar input de cantidad normal
        cantidadContainer.style.display = 'none';

        // Mostrar contenedor de tallas
        tallasContainer.style.display = 'block';

        // Llenar select de tallas
        tallaSelect.innerHTML = '<option value="">Seleccionar talla</option>';
        tallas.forEach(t => {
            const option = document.createElement('option');
            option.value = t.talla;
            option.textContent = `Talla ${t.talla}`;
            tallaSelect.appendChild(option);
        });

        // Marcar que este producto tiene tallas
        productoRow.dataset.tieneTallas = 'true';
    }

    function ocultarUITallas(productoRow) {
        const tallasContainer = productoRow.querySelector('.tallas-container');
        const cantidadContainer = productoRow.querySelector('.producto-cantidad-container');

        cantidadContainer.style.display = 'block';
        tallasContainer.style.display = 'none';
        productoRow.dataset.tieneTallas = 'false';
    }

    function agregarTallaAProducto(productoRow) {
        const tallaSelect = productoRow.querySelector('.talla-select');
        const tallaCantidadInput = productoRow.querySelector('.talla-cantidad');
        const tallasList = productoRow.querySelector('.tallas-list');

        const talla = tallaSelect.value;
        const cantidad = parseInt(tallaCantidadInput.value);

        if (!talla) {
            alert('Seleccione una talla');
            return;
        }

        if (!cantidad || cantidad <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }

        // Crear elemento de talla
        const tallaItem = document.createElement('div');
        tallaItem.className = 'talla-item';
        tallaItem.dataset.talla = talla;
        tallaItem.dataset.cantidad = cantidad;

        tallaItem.innerHTML = `
            <span><strong>Talla ${talla}:</strong> ${cantidad} unidades</span>
            <button type="button" class="btn btn-sm btn-danger btn-remove-talla">
                <i class="fas fa-times"></i>
            </button>
        `;

        tallasList.appendChild(tallaItem);

        // Event listener para eliminar
        tallaItem.querySelector('.btn-remove-talla').addEventListener('click', () => {
            // Volver a agregar la talla al select
            const option = document.createElement('option');
            option.value = talla;
            option.textContent = `Talla ${talla}`;
            tallaSelect.appendChild(option);

            // Eliminar el item
            tallaItem.remove();
            calcularSubtotalProducto(productoRow);
        });

        // Eliminar la talla del select (ya fue seleccionada)
        const selectedOption = tallaSelect.querySelector(`option[value="${talla}"]`);
        if (selectedOption) {
            selectedOption.remove();
        }

        // Limpiar inputs
        tallaSelect.value = '';
        tallaCantidadInput.value = '1';

        // Recalcular subtotal
        calcularSubtotalProducto(productoRow);
    }

    function calcularSubtotalProducto(productoRow) {
        const costoInput = productoRow.querySelector('.producto-costo');
        const subtotalInput = productoRow.querySelector('.producto-subtotal');
        const tieneTallas = productoRow.dataset.tieneTallas === 'true';

        const costo = parseFloat(costoInput.value) || 0;
        let cantidad = 0;

        if (tieneTallas) {
            // Sumar cantidades de todas las tallas
            const tallasItems = productoRow.querySelectorAll('.talla-item');
            tallasItems.forEach(item => {
                cantidad += parseInt(item.dataset.cantidad) || 0;
            });
        } else {
            const cantidadInput = productoRow.querySelector('.producto-cantidad');
            cantidad = parseInt(cantidadInput.value) || 0;
        }

        const subtotal = costo * cantidad;
        subtotalInput.value = `S/ ${subtotal.toFixed(2)}`;

        calcularTotales();
    }

    function calcularTotales() {
        let importeTotal = 0;

        document.querySelectorAll('.producto-row').forEach(row => {
            const subtotalText = row.querySelector('.producto-subtotal').value;
            const valor = parseFloat(subtotalText.replace('S/ ', '')) || 0;
            importeTotal += valor;
        });

        const aplicaIgv = aplicaIgvToggle ? aplicaIgvToggle.checked : true;
        let subtotalBase = importeTotal;
        let igv = 0;

        if (aplicaIgv && importeTotal > 0) {
            subtotalBase = importeTotal / 1.18;
            igv = importeTotal - subtotalBase;
        }

        compraSubtotalSpan.textContent = `S/ ${subtotalBase.toFixed(2)}`;
        compraIgvSpan.textContent = `S/ ${igv.toFixed(2)}`;
        compraTotalSpan.textContent = `S/ ${importeTotal.toFixed(2)}`;
    }

    // --- Recopilación de Datos del Formulario ---

    function recopilarDatosCompra() {
        const detalles = [];

        document.querySelectorAll('.producto-row').forEach(row => {
            const productoSelect = row.querySelector('.producto-select');
            const cantidadInput = row.querySelector('.producto-cantidad');
            const costoInput = row.querySelector('.producto-costo');
            const tieneTallas = row.dataset.tieneTallas === 'true';

            if (!productoSelect.value) return;

            const detalle = {
                idProducto: parseInt(productoSelect.value),
                costoUnitario: parseFloat(costoInput.value),
                tieneTallas: tieneTallas
            };

            if (tieneTallas) {
                // Recopilar tallas
                const tallas = [];
                let cantidadTotal = 0;

                row.querySelectorAll('.talla-item').forEach(item => {
                    const cantidad = parseInt(item.dataset.cantidad);
                    tallas.push({
                        talla: item.dataset.talla,
                        cantidad: cantidad
                    });
                    cantidadTotal += cantidad;
                });

                detalle.cantidad = cantidadTotal;
                detalle.tallas = tallas;
            } else {
                detalle.cantidad = parseInt(cantidadInput.value);
                detalle.tallas = null;
            }

            detalles.push(detalle);
        });

        const tipoPagoSelect = document.getElementById('compraTipoPago');
        const referenciaInput = document.getElementById('compraReferencia');
        const observacionesInput = document.getElementById('compraObservaciones');

        return {
            idProveedor: parseInt(compraProveedorSelect.value),
            fechaEntregaEsperada: compraFechaEntregaInput.value,
            idTipoPago: tipoPagoSelect.value ? parseInt(tipoPagoSelect.value) : null,
            referencia: referenciaInput.value || null,
            observaciones: observacionesInput.value || null,
            detalles: detalles,
            aplicaIgv: aplicaIgvToggle ? aplicaIgvToggle.checked : true
        };
    }

    // --- Mostrar Detalle de Compra ---

    async function mostrarDetalleCompra(idCompra) {
        try {
            const compra = await obtenerDetalleCompra(idCompra);

            detalleCompraId.textContent = compra.idPedidoCompra;
            detalleCompraProveedor.textContent = compra.nombreProveedor;
            detalleCompraRuc.textContent = compra.rucProveedor;
            detalleCompraFechaPedido.textContent = new Date(compra.fechaPedido).toLocaleDateString('es-PE');
            detalleCompraFechaEntrega.textContent = compra.fechaEntregaEsperada ?
                new Date(compra.fechaEntregaEsperada).toLocaleDateString('es-PE') : '-';
            detalleCompraEstado.textContent = compra.estadoPedido;
            if (detalleCompraMetodoPago) {
                detalleCompraMetodoPago.textContent = compra.tipoPago || '-';
            }
            if (detalleCompraReferencia) {
                detalleCompraReferencia.textContent = compra.referencia || '-';
            }
            if (detalleCompraObservaciones) {
                detalleCompraObservaciones.textContent = compra.observaciones || '-';
            }

            const aplicaIgv = compra.aplicaIgv !== undefined && compra.aplicaIgv !== null ? compra.aplicaIgv : true;
            const totalPedido = Number(compra.totalPedido) || 0;
            let subtotal = totalPedido;
            let igv = 0;

            if (aplicaIgv && totalPedido > 0) {
                subtotal = totalPedido / 1.18;
                igv = totalPedido - subtotal;
            }

            detalleCompraSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
            detalleCompraIgv.textContent = `S/ ${igv.toFixed(2)}`;
            detalleCompraTotal.textContent = `S/ ${totalPedido.toFixed(2)}`;
            if (detalleCompraIgvEstado) {
                detalleCompraIgvEstado.textContent = aplicaIgv ? 'Aplicado (18%)' : 'No aplicado';
            }

            // Renderizar productos
            detalleProductosTableBody.innerHTML = '';
            compra.detalles.forEach(detalle => {
                if (detalle.tieneTallas && detalle.tallas && detalle.tallas.length > 0) {
                    // Producto con tallas - mostrar tabla expandida
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td colspan="5">
                            <strong>${detalle.nombreProducto}</strong>
                            <table class="table table-sm table-bordered mt-2 mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Talla</th>
                                        <th>Cant. Pedida</th>
                                        <th>Cant. Recibida</th>
                                        <th>Costo Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${detalle.tallas.map(t => `
                                        <tr>
                                            <td>${t.talla}</td>
                                            <td>${t.cantidad}</td>
                                            <td>${t.cantidadRecibida}</td>
                                            <td>S/ ${t.costoUnitario.toFixed(2)}</td>
                                            <td>S/ ${t.subtotal.toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                    <tr class="table-secondary">
                                        <td><strong>TOTAL</strong></td>
                                        <td><strong>${detalle.cantidad}</strong></td>
                                        <td><strong>${detalle.cantidadRecibida}</strong></td>
                                        <td></td>
                                        <td><strong>S/ ${detalle.subtotal.toFixed(2)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    `;
                    detalleProductosTableBody.appendChild(row);
                } else {
                    // Producto sin tallas - fila normal
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${detalle.nombreProducto}</td>
                        <td>${detalle.cantidad}</td>
                        <td>${detalle.cantidadRecibida}</td>
                        <td>S/ ${detalle.costoUnitario.toFixed(2)}</td>
                        <td>S/ ${detalle.subtotal.toFixed(2)}</td>
                    `;
                    detalleProductosTableBody.appendChild(row);
                }
            });

            detalleCompraModal.style.display = 'block';
        } catch (error) {
            alert('Error al cargar el detalle de la compra');
        }
    }

    // --- Event Listeners ---

    if (proveedorSearchInput) {
        proveedorSearchInput.addEventListener('focus', () => {
            rebuildProveedorSearchResults();
            openProveedorDropdown();
        });

        proveedorSearchInput.addEventListener('input', () => {
            if (proveedorSearchInput.dataset.selectedId) {
                const normalized = proveedorSearchInput.value.trim().toLowerCase();
                if (normalized !== (proveedorSearchInput.dataset.selectedLabel || '')) {
                    desvincularProveedorSeleccionado();
                }
            }
            rebuildProveedorSearchResults();
        });

        proveedorSearchInput.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    if (!proveedorDropdownItems.length) {
                        rebuildProveedorSearchResults();
                    }
                    if (proveedorDropdownItems.length) {
                        const nextIndex = proveedorHighlightedIndex + 1 >= proveedorDropdownItems.length ? 0 : proveedorHighlightedIndex + 1;
                        highlightProveedorOption(nextIndex);
                        openProveedorDropdown();
                    }
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    if (!proveedorDropdownItems.length) {
                        rebuildProveedorSearchResults();
                    }
                    if (proveedorDropdownItems.length) {
                        const prevIndex = proveedorHighlightedIndex - 1 < 0 ? proveedorDropdownItems.length - 1 : proveedorHighlightedIndex - 1;
                        highlightProveedorOption(prevIndex);
                        openProveedorDropdown();
                    }
                    break;
                case 'Enter':
                    event.preventDefault();
                    if (proveedorHighlightedIndex >= 0 && proveedorDropdownItems[proveedorHighlightedIndex]) {
                        const idSeleccionado = proveedorDropdownItems[proveedorHighlightedIndex].dataset.id;
                        const proveedor = proveedoresData.find(p => String(p.idProveedor) === String(idSeleccionado));
                        if (proveedor) {
                            manejarProveedorSeleccion(proveedor).catch(console.error);
                        }
                        closeProveedorDropdown();
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    closeProveedorDropdown();
                    proveedorSearchInput.blur();
                    break;
                default:
                    break;
            }
        });
    }

    if (proveedorSelectContainer) {
        document.addEventListener('mousedown', (event) => {
            if (!proveedorSelectContainer.contains(event.target)) {
                closeProveedorDropdown();
            }
        });
    }

    compraProveedorSelect.addEventListener('change', async (e) => {
        const selectedId = e.target.value ? parseInt(e.target.value, 10) : null;
        if (selectedId) {
            const proveedor = proveedoresData.find(p => String(p.idProveedor) === String(selectedId));
            if (proveedor) {
                await manejarProveedorSeleccion(proveedor);
                return;
            }
        }

        desvincularProveedorSeleccionado();
        if (proveedorSearchInput) {
            proveedorSearchInput.value = '';
            rebuildProveedorSearchResults();
        }
    });

    addProductBtn.addEventListener('click', agregarProducto);

    addCompraBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Nueva Compra';
        compraForm.reset();
        limpiarProductosAgregados();
        proveedorSeleccionado = null;
        productosDelProveedor = [];
        productosTallasCache = {};
        compraProveedorSelect.value = '';
        compraRucInput.value = '';
        if (proveedorSearchInput) {
            proveedorSearchInput.value = '';
            delete proveedorSearchInput.dataset.selectedId;
            delete proveedorSearchInput.dataset.selectedLabel;
            rebuildProveedorSearchResults();
        }

        if (aplicaIgvToggle) {
            aplicaIgvToggle.checked = true;
        }

        // Establecer fecha actual
        const hoy = new Date().toISOString().split('T')[0];
        compraFechaPedidoInput.value = hoy;

        calcularTotales();
        compraModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        compraModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        compraModal.style.display = 'none';
    });

    closeDetalleModalBtn.addEventListener('click', () => {
        detalleCompraModal.style.display = 'none';
    });

    aceptarDetalleBtn.addEventListener('click', () => {
        detalleCompraModal.style.display = 'none';
    });

    if (aplicaIgvToggle) {
        aplicaIgvToggle.addEventListener('change', calcularTotales);
    }

    compraForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!compraProveedorSelect.value) {
            alert('Debe seleccionar un proveedor');
            return;
        }

        const compraData = recopilarDatosCompra();

        if (compraData.detalles.length === 0) {
            alert('Debe agregar al menos un producto');
            return;
        }

        // Validar que productos con tallas tengan al menos una talla
        for (const detalle of compraData.detalles) {
            if (detalle.tieneTallas && (!detalle.tallas || detalle.tallas.length === 0)) {
                alert('Debe agregar al menos una talla para los productos que las requieren');
                return;
            }
        }

        try {
            await guardarCompra(compraData);
            alert('Compra registrada exitosamente');
            compraModal.style.display = 'none';
            cargarCompras();
        } catch (error) {
            alert(error.message || 'Error al guardar la compra');
        }
    });

    // --- Funciones Públicas (expuestas globalmente) ---

    window.comprasModule = {
        verDetalle: mostrarDetalleCompra,

        completarCompra: async (idCompra) => {
            if (!confirm('¿Está seguro de completar esta compra? Se actualizará el inventario automáticamente.')) {
                return;
            }

            try {
                await actualizarEstadoCompra(idCompra, 'Completado');
                alert('Compra completada exitosamente. El inventario ha sido actualizado.');
                cargarCompras();
            } catch (error) {
                alert(error.message || 'Error al completar la compra');
            }
        },

        anular: async (idCompra) => {
            if (!confirm('¿Está seguro de anular esta compra?')) {
                return;
            }

            try {
                await anularCompra(idCompra);
                alert('Compra anulada exitosamente');
                cargarCompras();
            } catch (error) {
                alert(error.message || 'Error al anular la compra');
            }
        }
    };

    // --- Inicialización ---
    cargarProveedores();
    cargarTiposPago();
    cargarCompras();
});
