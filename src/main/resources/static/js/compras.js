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
    const productosEmptyMessage = document.getElementById('productosEmptyMessage');
    const compraTotalSpan = document.getElementById('compraTotal');
    const aplicaIgvToggle = document.getElementById('aplicaIgvToggle');
    const toastContainer = document.getElementById('toastContainer');
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmAcceptBtn = document.getElementById('confirmAcceptBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmIcon = document.getElementById('confirmIcon');
    const proveedorSearchInput = document.getElementById('proveedorSearchInput');
    const proveedorSearchResults = document.getElementById('proveedorSearchResults');
    const proveedorSelectContainer = document.getElementById('proveedorSelectContainer');
    const proveedorErrorMessage = document.getElementById('proveedorErrorMessage');
    const proveedorErrorMessageText = document.getElementById('proveedorErrorMessageText');

    // Referencias de los campos del formulario
    const compraIdInput = document.getElementById('compraId');
    const compraProveedorSelect = document.getElementById('compraProveedor');
    const compraRucInput = document.getElementById('compraRuc');
    const compraFechaPedidoInput = document.getElementById('compraFechaPedido');
    const compraFechaEntregaInput = document.getElementById('compraFechaEntrega');
    const compraSubtotalSpan = document.getElementById('compraSubtotal');
    const compraIgvSpan = document.getElementById('compraIgv');
    const compraTipoPagoSelect = document.getElementById('compraTipoPago');

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

    const recepcionModal = document.getElementById('recepcionModal');
    const closeRecepcionModalBtn = document.getElementById('closeRecepcionModal');
    const cancelRecepcionBtn = document.getElementById('cancelRecepcionBtn');
    const confirmRecepcionBtn = document.getElementById('confirmRecepcionBtn');
    const recepcionTableBody = document.getElementById('recepcionTableBody');
    const recepcionSinPendientes = document.getElementById('recepcionSinPendientes');
    const recepcionModoRadios = document.querySelectorAll('input[name="recepcionModo"]');
    const recepcionCompraId = document.getElementById('recepcionCompraId');
    const recepcionProveedor = document.getElementById('recepcionProveedor');
    const recepcionEstado = document.getElementById('recepcionEstado');
    const recepcionPendienteTotal = document.getElementById('recepcionPendienteTotal');

    // Variables globales
    let proveedoresData = [];
    let productosDelProveedor = [];
    let proveedorSeleccionado = null;
    let productosTallasCache = {}; // Cache para tallas de productos
    let proveedorDropdownItems = [];
    let proveedorHighlightedIndex = -1;
    let compraSeleccionadaDetalle = null;
    let recepcionDetalleActual = [];
    let recepcionModoActual = 'parcial';
    const unidadesFormatter = new Intl.NumberFormat('es-PE');
    const MENSAJE_SIN_INVENTARIO = 'Este proveedor no tiene productos registrados en inventario. Registre primero el producto en inventario para poder realizar la compra.';
    const MENSAJE_ERROR_PRODUCTOS = 'No se pudieron cargar los productos del proveedor. Intenta nuevamente mas tarde.';
    const MENSAJE_PROVEEDOR_OBLIGATORIO = 'Debe seleccionar un proveedor.';
    const TOAST_TYPES = {
        success: { icon: 'fa-circle-check', title: 'Éxito' },
        error: { icon: 'fa-circle-xmark', title: 'Error' },
        warning: { icon: 'fa-triangle-exclamation', title: 'Atención' },
        info: { icon: 'fa-circle-info', title: 'Información' }
    };
    let confirmResolve = null;
    let confirmKeyListener = null;

    if (aplicaIgvToggle) {
        aplicaIgvToggle.checked = false;
    }

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
            mostrarNotificacion({ tipo: 'error', mensaje: 'Error al cargar proveedores' });
        }
    }

    async function cargarTiposPago() {
        try {
            const response = await fetch('/compras/api/tipospago');
            if (!response.ok) throw new Error('Error al cargar tipos de pago');

            const tiposPago = await response.json();
            if (!compraTipoPagoSelect) {
                return;
            }

            compraTipoPagoSelect.innerHTML = '<option value="">Seleccionar método</option>';
            tiposPago.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.nombre;
                compraTipoPagoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function cargarProductosPorProveedor(idProveedor) {
        try {
            mostrarMensajeProductos('');
            const response = await fetch(`/compras/api/productos/proveedor/${idProveedor}`);
            if (!response.ok) throw new Error('Error al cargar productos');

            productosDelProveedor = await response.json();
            actualizarDisponibilidadProductos();
            return productosDelProveedor;
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion({ tipo: 'error', mensaje: MENSAJE_ERROR_PRODUCTOS });
            productosDelProveedor = [];
            actualizarDisponibilidadProductos();
            if (addProductBtn && proveedorSeleccionado !== null) {
                addProductBtn.title = MENSAJE_ERROR_PRODUCTOS;
            }
            if (proveedorSeleccionado !== null) {
                mostrarMensajeProductos(MENSAJE_ERROR_PRODUCTOS);
            }
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
            mostrarNotificacion({ tipo: 'error', mensaje: 'Error al cargar compras' });
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

    function toNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function mostrarErrorProveedor(mensaje) {
        if (!proveedorErrorMessage) {
            return;
        }
        if (proveedorErrorMessageText) {
            proveedorErrorMessageText.textContent = mensaje || MENSAJE_PROVEEDOR_OBLIGATORIO;
        }
        proveedorErrorMessage.hidden = false;
    }

    function ocultarErrorProveedor() {
        if (!proveedorErrorMessage) {
            return;
        }
        proveedorErrorMessage.hidden = true;
    }

    function getTodayDate() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    function formatDateISO(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return '';
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseDateInput(value) {
        if (!value) {
            return null;
        }
        const [year, month, day] = value.split('-').map(Number);
        if ([year, month, day].some(Number.isNaN)) {
            return null;
        }
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function actualizarRestriccionesFechas() {
        if (!compraFechaPedidoInput || !compraFechaEntregaInput) {
            return;
        }

        const today = getTodayDate();
        const todayISO = formatDateISO(today);
        compraFechaPedidoInput.min = todayISO;

        const pedidoDate = parseDateInput(compraFechaPedidoInput.value) || today;
        const minEntregaDate = pedidoDate > today ? pedidoDate : today;
        compraFechaEntregaInput.min = formatDateISO(minEntregaDate);

        const entregaDate = parseDateInput(compraFechaEntregaInput.value);
        if (entregaDate && entregaDate < minEntregaDate) {
            compraFechaEntregaInput.value = formatDateISO(minEntregaDate);
        }
    }

    function cerrarToast(toast) {
        if (!toast) {
            return;
        }
        toast.classList.remove('toast--visible');
        toast.classList.add('toast--closing');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }

    function mostrarNotificacion(opciones) {
        const config = typeof opciones === 'string' ? { mensaje: opciones } : { ...opciones };
        const tipo = TOAST_TYPES[config.tipo] ? config.tipo : 'info';
        const titulo = config.titulo || TOAST_TYPES[tipo].title;
        const mensaje = config.mensaje || '';
        const duracion = Number.isFinite(config.duracion) && config.duracion > 0 ? config.duracion : 5000;
        const persistente = Boolean(config.persistente);

        if (!toastContainer) {
            window.alert(mensaje);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast--${tipo}`;
        toast.style.setProperty('--toast-duration', `${duracion}ms`);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast-icon';
        iconSpan.innerHTML = `<i class="fas ${TOAST_TYPES[tipo].icon}"></i>`;
        toast.appendChild(iconSpan);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'toast-content';
        const titleEl = document.createElement('span');
        titleEl.className = 'toast-title';
        titleEl.textContent = titulo;
        const messageEl = document.createElement('span');
        messageEl.className = 'toast-message';
        messageEl.textContent = mensaje;
        contentWrapper.append(titleEl, messageEl);
        toast.appendChild(contentWrapper);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', 'Cerrar notificación');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        toast.appendChild(closeBtn);

        if (!persistente) {
            const progress = document.createElement('span');
            progress.className = 'toast-progress';
            toast.appendChild(progress);
        } else {
            toast.classList.add('toast--persistent');
        }

        toastContainer.prepend(toast);

        requestAnimationFrame(() => {
            toast.classList.add('toast--visible');
        });

        let timeoutId = null;
        if (!persistente) {
            timeoutId = setTimeout(() => cerrarToast(toast), duracion);
        }

        closeBtn.addEventListener('click', () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            cerrarToast(toast);
        });
    }

    function actualizarClaseConfirmacion(tipo) {
        if (!confirmModal) {
            return 'info';
        }
        const tipos = ['success', 'error', 'warning', 'info'];
        const tipoValido = TOAST_TYPES[tipo] ? tipo : 'info';
        confirmModal.classList.remove(...tipos.map(t => `confirm-modal--${t}`));
        confirmModal.classList.add(`confirm-modal--${tipoValido}`);
        if (confirmIcon) {
            confirmIcon.innerHTML = `<i class="fas ${TOAST_TYPES[tipoValido].icon}"></i>`;
        }
        return tipoValido;
    }

    function cerrarConfirmacion(resultado) {
        if (confirmModal) {
            confirmModal.style.display = 'none';
            confirmModal.setAttribute('hidden', '');
        }
        if (confirmKeyListener) {
            document.removeEventListener('keydown', confirmKeyListener);
            confirmKeyListener = null;
        }
        const resolver = confirmResolve;
        confirmResolve = null;
        if (typeof resolver === 'function') {
            resolver(Boolean(resultado));
        }
    }

    function manejarConfirmKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            cerrarConfirmacion(false);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            cerrarConfirmacion(true);
        }
    }

    function mostrarConfirmacion(opciones = {}) {
        const {
            mensaje = '',
            titulo = 'Confirmar acción',
            tipo = 'warning',
            textoConfirmar = 'Aceptar',
            textoCancelar = 'Cancelar'
        } = opciones;

        if (!confirmModal || !confirmTitle || !confirmMessage || !confirmAcceptBtn || !confirmCancelBtn) {
            const fallback = window.confirm(mensaje || titulo);
            return Promise.resolve(fallback);
        }

        actualizarClaseConfirmacion(tipo);
        confirmTitle.textContent = titulo;
        confirmMessage.textContent = mensaje;
        confirmAcceptBtn.textContent = textoConfirmar;
        confirmCancelBtn.textContent = textoCancelar;

        confirmModal.removeAttribute('hidden');
        confirmModal.style.display = 'flex';

        if (confirmKeyListener) {
            document.removeEventListener('keydown', confirmKeyListener);
        }
        confirmKeyListener = manejarConfirmKeydown;
        document.addEventListener('keydown', confirmKeyListener);

        return new Promise(resolve => {
            confirmResolve = resolve;
            setTimeout(() => {
                confirmAcceptBtn.focus();
            }, 50);
        });
    }

    if (confirmAcceptBtn) {
        confirmAcceptBtn.addEventListener('click', () => cerrarConfirmacion(true));
    }

    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => cerrarConfirmacion(false));
    }

    if (confirmModal) {
        confirmModal.addEventListener('click', (event) => {
            if (event.target === confirmModal) {
                cerrarConfirmacion(false);
            }
        });
    }

    function mostrarMensajeProductos(mensaje) {
        if (!productosEmptyMessage) {
            return;
        }

        if (mensaje) {
            productosEmptyMessage.textContent = mensaje;
            productosEmptyMessage.hidden = false;
            return;
        }

        productosEmptyMessage.hidden = true;
    }

    function actualizarDisponibilidadProductos() {
        const hayProductos = Array.isArray(productosDelProveedor) && productosDelProveedor.length > 0;
        const proveedorActivo = proveedorSeleccionado !== null;

        if (addProductBtn) {
            if (!proveedorActivo) {
                addProductBtn.disabled = false;
                addProductBtn.removeAttribute('title');
            } else if (!hayProductos) {
                addProductBtn.disabled = true;
                addProductBtn.title = MENSAJE_SIN_INVENTARIO;
            } else {
                addProductBtn.disabled = false;
                addProductBtn.removeAttribute('title');
            }
        }

        if (proveedorActivo && !hayProductos) {
            mostrarMensajeProductos(MENSAJE_SIN_INVENTARIO);
            return;
        }

        mostrarMensajeProductos('');
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
            actualizarDisponibilidadProductos();
        }
        ocultarErrorProveedor();
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
        productosDelProveedor = [];

        limpiarProductosAgregados();
        calcularTotales();

        if (addProductBtn) {
            addProductBtn.disabled = true;
            addProductBtn.title = 'Cargando productos del proveedor...';
        }
        mostrarMensajeProductos('');
        ocultarErrorProveedor();

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
            const puedeRecepcionar = compra.estadoPedido === 'Pendiente' || compra.estadoPedido === 'Parcial';
            const puedeAnular = compra.estadoPedido === 'Pendiente';

            const actionButtons = [`
                <button class="btn btn-sm btn-info" onclick="window.comprasModule.verDetalle(${compra.idPedidoCompra})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
            `];

            if (puedeRecepcionar) {
                actionButtons.push(`
                    <button class="btn btn-sm btn-success" onclick="window.comprasModule.recepcionarCompra(${compra.idPedidoCompra})" title="Registrar recepción">
                        <i class="fas fa-truck-loading"></i>
                    </button>
                `);
            }

            if (puedeAnular) {
                actionButtons.push(`
                    <button class="btn btn-sm btn-danger" onclick="window.comprasModule.anular(${compra.idPedidoCompra})" title="Anular">
                        <i class="fas fa-times"></i>
                    </button>
                `);
            }

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
                    <div class="action-buttons-cell">
                        ${actionButtons.join('')}
                    </div>
                </td>
            `;

            comprasTableBody.appendChild(row);
        });
    }

    function getEstadoBadge(estado) {
        const badges = {
            'Pendiente': { class: 'bg-warning' },
            'Parcial': { class: 'bg-info' },
            'Completado': { class: 'bg-success' },
            'Cancelado': { class: 'bg-danger' }
        };
        return badges[estado] || { class: 'bg-secondary' };
    }

    // --- Recepción de Compras ---

    function calcularPendienteTotal(detalles) {
        if (!Array.isArray(detalles)) {
            return 0;
        }
        return detalles.reduce((total, detalle) => {
            if (detalle?.tieneTallas && Array.isArray(detalle.tallas) && detalle.tallas.length > 0) {
                const subtotal = detalle.tallas.reduce((acc, talla) => acc + toNumber(talla.cantidadPendiente), 0);
                return total + subtotal;
            }
            return total + toNumber(detalle?.cantidadPendiente);
        }, 0);
    }

    function actualizarResumenRecepcion(compra) {
        recepcionCompraId.textContent = compra.idPedidoCompra || '-';
        recepcionProveedor.textContent = compra.nombreProveedor || '-';
        recepcionEstado.textContent = compra.estadoPedido || '-';
        const pendienteTotal = calcularPendienteTotal(compra.detalles);
        recepcionPendienteTotal.textContent = `${unidadesFormatter.format(pendienteTotal)} unidades`;
    }

    function renderRecepcionTabla(detalles) {
        recepcionTableBody.innerHTML = '';

        if (!Array.isArray(detalles) || detalles.length === 0) {
            recepcionSinPendientes.hidden = false;
            confirmRecepcionBtn.disabled = true;
            recepcionModoRadios.forEach(radio => {
                radio.disabled = true;
            });
            return;
        }

        let hayPendientes = false;

        detalles.forEach(detalle => {
            const tieneTallas = Boolean(detalle?.tieneTallas);
            const tallas = Array.isArray(detalle?.tallas) ? detalle.tallas : [];
            const pendienteDetalle = tieneTallas
                ? tallas.reduce((acc, talla) => acc + toNumber(talla.cantidadPendiente), 0)
                : toNumber(detalle?.cantidadPendiente);

            const row = document.createElement('tr');
            row.className = 'detalle-row';
            row.dataset.detalleId = detalle.idDetallePedido;
            row.dataset.tieneTallas = tieneTallas ? 'true' : 'false';

            const pendienteTexto = pendienteDetalle === 0
                ? '<span class="recepcion-pendiente-cero">0</span>'
                : unidadesFormatter.format(pendienteDetalle);

            const inputHtml = tieneTallas
                ? '-'
                : `<input type="number" class="recepcion-detalle-input" min="0" max="${pendienteDetalle}" data-max="${pendienteDetalle}" value="0" ${pendienteDetalle === 0 ? 'disabled' : ''}>`;

            row.innerHTML = `
                <td>
                    <div><strong>${detalle?.nombreProducto || 'Producto'}</strong></div>
                    ${tieneTallas ? '<div class="text-muted">Gestiona por tallas</div>' : ''}
                </td>
                <td>${unidadesFormatter.format(toNumber(detalle?.cantidad))}</td>
                <td>${unidadesFormatter.format(toNumber(detalle?.cantidadRecibida))}</td>
                <td>${pendienteTexto}</td>
                <td>${inputHtml}</td>
            `;

            recepcionTableBody.appendChild(row);

            if (pendienteDetalle > 0) {
                hayPendientes = true;
            }

            if (!tieneTallas) {
                const input = row.querySelector('input[type="number"]');
                if (input) {
                    input.addEventListener('input', limitarEntradaCantidad);
                    input.addEventListener('blur', limitarEntradaCantidad);
                }
                return;
            }

            tallas.forEach(talla => {
                const pendienteTalla = toNumber(talla?.cantidadPendiente);
                const tallaRow = document.createElement('tr');
                tallaRow.className = 'talla-row';
                tallaRow.dataset.detalleId = detalle.idDetallePedido;
                tallaRow.dataset.tallaId = talla.idDetalleTalla;

                const pendienteTallaTexto = pendienteTalla === 0
                    ? '<span class="recepcion-pendiente-cero">0</span>'
                    : unidadesFormatter.format(pendienteTalla);

                tallaRow.innerHTML = `
                    <td>Talla ${talla?.talla || '-'}</td>
                    <td>${unidadesFormatter.format(toNumber(talla?.cantidad))}</td>
                    <td>${unidadesFormatter.format(toNumber(talla?.cantidadRecibida))}</td>
                    <td>${pendienteTallaTexto}</td>
                    <td>
                        <input type="number" class="recepcion-talla-input" min="0" max="${pendienteTalla}" data-max="${pendienteTalla}" value="0" ${pendienteTalla === 0 ? 'disabled' : ''}>
                    </td>
                `;

                recepcionTableBody.appendChild(tallaRow);

                if (pendienteTalla > 0) {
                    hayPendientes = true;
                }

                const input = tallaRow.querySelector('input[type="number"]');
                if (input) {
                    input.addEventListener('input', limitarEntradaCantidad);
                    input.addEventListener('blur', limitarEntradaCantidad);
                }
            });
        });

        recepcionSinPendientes.hidden = hayPendientes;
        confirmRecepcionBtn.disabled = !hayPendientes;
        recepcionModoRadios.forEach(radio => {
            radio.disabled = !hayPendientes;
        });

        aplicarModoRecepcion(recepcionModoActual);
    }

    function aplicarModoRecepcion(modo) {
        recepcionModoActual = modo;
        const inputs = recepcionTableBody.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const max = toNumber(input.dataset.max || input.getAttribute('max'));
            if (input.disabled) {
                input.value = 0;
                return;
            }
            if (modo === 'total') {
                input.value = max;
            } else {
                input.value = 0;
            }
        });
    }

    function limitarEntradaCantidad(event) {
        const input = event.target;
        const max = toNumber(input.dataset.max || input.getAttribute('max'));
        const min = toNumber(input.getAttribute('min'));
        let valor = toNumber(input.value);
        valor = Math.max(min, Math.min(max, valor));
        input.value = valor;
    }

    function construirPayloadRecepcion() {
        const payload = {
            completarCompra: recepcionModoActual === 'total',
            detalles: []
        };

        const detalleRows = recepcionTableBody.querySelectorAll('tr.detalle-row');
        detalleRows.forEach(row => {
            const idDetalle = Number(row.dataset.detalleId);
            const tieneTallas = row.dataset.tieneTallas === 'true';

            if (tieneTallas) {
                const tallasRows = recepcionTableBody.querySelectorAll(`tr.talla-row[data-detalle-id="${idDetalle}"]`);
                const tallasPayload = [];
                let totalDetalle = 0;

                tallasRows.forEach(tallaRow => {
                    const input = tallaRow.querySelector('input[type="number"]');
                    if (!input || input.disabled) {
                        return;
                    }
                    const cantidad = toNumber(input.value);
                    const max = toNumber(input.dataset.max || input.getAttribute('max'));
                    const cantidadNormalizada = Math.max(0, Math.min(max, cantidad));
                    if (cantidadNormalizada > 0) {
                        tallasPayload.push({
                            idDetalleTalla: Number(tallaRow.dataset.tallaId),
                            cantidad: cantidadNormalizada
                        });
                        totalDetalle += cantidadNormalizada;
                    }
                });

                if (tallasPayload.length > 0) {
                    payload.detalles.push({
                        idDetallePedido: idDetalle,
                        cantidad: totalDetalle,
                        tallas: tallasPayload
                    });
                }
                return;
            }

            const input = row.querySelector('input[type="number"]');
            if (!input || input.disabled) {
                return;
            }

            const max = toNumber(input.dataset.max || input.getAttribute('max'));
            const cantidad = Math.max(0, Math.min(max, toNumber(input.value)));

            if (cantidad > 0) {
                payload.detalles.push({
                    idDetallePedido: idDetalle,
                    cantidad
                });
            }
        });

        return payload;
    }

    async function abrirRecepcionModal(idCompra) {
        try {
            const compra = await obtenerDetalleCompra(idCompra);
            compraSeleccionadaDetalle = compra;
            recepcionDetalleActual = Array.isArray(compra.detalles) ? compra.detalles : [];
            recepcionModoActual = 'parcial';

            recepcionModoRadios.forEach(radio => {
                radio.checked = radio.value === 'parcial';
                radio.disabled = false;
            });

            actualizarResumenRecepcion(compra);
            renderRecepcionTabla(recepcionDetalleActual);

            recepcionModal.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion({ tipo: 'error', mensaje: error.message || 'Error al cargar la compra' });
        }
    }

    function cerrarRecepcionModal() {
        recepcionModal.style.display = 'none';
        recepcionTableBody.innerHTML = '';
        recepcionSinPendientes.hidden = true;
        confirmRecepcionBtn.disabled = false;
        recepcionModoRadios.forEach(radio => {
            radio.checked = radio.value === 'parcial';
            radio.disabled = false;
        });
        compraSeleccionadaDetalle = null;
        recepcionDetalleActual = [];
        recepcionModoActual = 'parcial';
    }

    async function registrarRecepcion() {
        if (!compraSeleccionadaDetalle) {
            return;
        }

        const payload = construirPayloadRecepcion();

        if (payload.detalles.length === 0) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe ingresar al menos una cantidad para registrar la recepción.' });
            return;
        }

        if (recepcionModoActual === 'total') {
            const confirmar = await mostrarConfirmacion({
                mensaje: 'Se registrará la recepción total de los pendientes. ¿Desea continuar?',
                titulo: 'Confirmar recepción total',
                tipo: 'warning',
                textoConfirmar: 'Recibir todo',
                textoCancelar: 'Volver'
            });
            if (!confirmar) {
                return;
            }
        }

        try {
            confirmRecepcionBtn.disabled = true;

            const response = await fetch(`/compras/api/${compraSeleccionadaDetalle.idPedidoCompra}/recepciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || 'Error al registrar la recepción');
            }

            await response.json();
            mostrarNotificacion({ tipo: 'success', mensaje: 'Recepción registrada exitosamente' });
            cerrarRecepcionModal();
            cargarCompras();
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion({ tipo: 'error', mensaje: error.message || 'Error al registrar la recepción' });
        } finally {
            confirmRecepcionBtn.disabled = false;
        }
    }

    // --- Gestión de Productos en el Formulario ---

    function obtenerEtiquetaProducto(producto) {
        if (!producto) {
            return '';
        }
        return producto.nombre || '';
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
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Primero seleccione un proveedor' });
            return;
        }

        if (!Array.isArray(productosDelProveedor) || productosDelProveedor.length === 0) {
            mostrarMensajeProductos(MENSAJE_SIN_INVENTARIO);
            mostrarNotificacion({ tipo: 'warning', mensaje: MENSAJE_SIN_INVENTARIO });
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
                <div class="form-group producto-costo-container">
                    <label>Costo Unitario</label>
                    <input type="number" class="producto-costo" step="0.01" min="0" required readonly>
                </div>
                <div class="producto-actions">
                    <button type="button" class="btn btn-danger btn-remove-producto" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="producto-secondary-grid">
                <div class="form-group producto-subtotal-container">
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
                delete productoRow.dataset.costoBase;
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
            if (Number.isFinite(costo)) {
                const costoFormateado = costo.toFixed(2);
                costoInput.value = costoFormateado;
                productoRow.dataset.costoBase = costoFormateado;
            } else {
                costoInput.value = '';
                delete productoRow.dataset.costoBase;
            }

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
        const costoContainer = productoRow.querySelector('.producto-costo-container');
        const costoInput = productoRow.querySelector('.producto-costo');
        const subtotalContainer = productoRow.querySelector('.producto-subtotal-container');
        const productoMainGrid = productoRow.querySelector('.producto-main-grid');
        const productoSecondaryGrid = productoRow.querySelector('.producto-secondary-grid');
        const productoActions = productoRow.querySelector('.producto-actions');

        // Ocultar input de cantidad normal
        cantidadContainer.style.display = 'none';

        // Mostrar contenedor de tallas
        tallasContainer.style.display = 'block';

        if (costoContainer) {
            costoContainer.style.display = 'none';
        }
        if (costoInput) {
            costoInput.value = '';
            costoInput.removeAttribute('required');
        }

        if (subtotalContainer && productoMainGrid && productoActions) {
            subtotalContainer.classList.add('subtotal-inline');
            productoMainGrid.insertBefore(subtotalContainer, productoActions);
        }

        if (productoSecondaryGrid && productoSecondaryGrid.contains(subtotalContainer)) {
            productoSecondaryGrid.removeChild(subtotalContainer);
        }

        // Llenar select de tallas
        tallaSelect.innerHTML = '<option value="">Seleccionar talla</option>';
        (tallas || []).forEach(t => {
            const option = document.createElement('option');
            option.value = t.talla;
            const costoRaw = t.costoCompra;
            const costo = (costoRaw !== null && costoRaw !== undefined) ? Number(costoRaw) : NaN;
            option.textContent = Number.isFinite(costo)
                ? `Talla ${t.talla} · S/ ${costo.toFixed(2)}`
                : `Talla ${t.talla}`;
            if (Number.isFinite(costo)) {
                option.dataset.costoCompra = costo.toFixed(2);
            }
            tallaSelect.appendChild(option);
        });

        // Marcar que este producto tiene tallas
        productoRow.dataset.tieneTallas = 'true';
    }

    function ocultarUITallas(productoRow) {
        const tallasContainer = productoRow.querySelector('.tallas-container');
        const cantidadContainer = productoRow.querySelector('.producto-cantidad-container');
        const costoContainer = productoRow.querySelector('.producto-costo-container');
        const costoInput = productoRow.querySelector('.producto-costo');
        const subtotalContainer = productoRow.querySelector('.producto-subtotal-container');
        const productoSecondaryGrid = productoRow.querySelector('.producto-secondary-grid');

        cantidadContainer.style.display = 'block';
        tallasContainer.style.display = 'none';
        productoRow.dataset.tieneTallas = 'false';

        if (costoContainer) {
            costoContainer.style.display = 'block';
        }

        if (costoInput) {
            costoInput.required = true;
            if (!costoInput.value && productoRow.dataset.costoBase) {
                const costoBase = Number(productoRow.dataset.costoBase);
                if (Number.isFinite(costoBase)) {
                    costoInput.value = costoBase.toFixed(2);
                } else {
                    costoInput.value = '';
                }
            }
        }

        if (subtotalContainer && productoSecondaryGrid && !productoSecondaryGrid.contains(subtotalContainer)) {
            subtotalContainer.classList.remove('subtotal-inline');
            productoSecondaryGrid.appendChild(subtotalContainer);
        }

    }

    function agregarTallaAProducto(productoRow) {
        const tallaSelect = productoRow.querySelector('.talla-select');
        const tallaCantidadInput = productoRow.querySelector('.talla-cantidad');
        const tallasList = productoRow.querySelector('.tallas-list');
        const costoInput = productoRow.querySelector('.producto-costo');

        const talla = tallaSelect.value;
        const cantidad = parseInt(tallaCantidadInput.value, 10);

        if (!talla) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Seleccione una talla' });
            return;
        }

        if (!cantidad || cantidad <= 0) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Ingrese una cantidad válida' });
            return;
        }

        const optionSeleccionada = tallaSelect.options[tallaSelect.selectedIndex];
        const costoDesdeOpcion = optionSeleccionada && optionSeleccionada.dataset.costoCompra
            ? parseFloat(optionSeleccionada.dataset.costoCompra)
            : NaN;
        const costoBaseFallback = parseFloat(productoRow.dataset.costoBase || costoInput.value) || 0;
        const costoUnitario = Number.isFinite(costoDesdeOpcion)
            ? Number(costoDesdeOpcion.toFixed(2))
            : Number(costoBaseFallback.toFixed(2));

        const cantidadTexto = cantidad === 1 ? '1 unidad' : `${cantidad} unidades`;

        const tallaItem = document.createElement('div');
        tallaItem.className = 'talla-item';
        tallaItem.dataset.talla = talla;
        tallaItem.dataset.cantidad = cantidad;
        tallaItem.dataset.costo = costoUnitario.toFixed(2);

        tallaItem.innerHTML = `
            <span><strong>Talla ${talla}:</strong> ${cantidadTexto} · Precio unitario: S/ ${costoUnitario.toFixed(2)}</span>
            <button type="button" class="btn btn-sm btn-danger btn-remove-talla">
                <i class="fas fa-times"></i>
            </button>
        `;

        tallasList.appendChild(tallaItem);

        tallaItem.querySelector('.btn-remove-talla').addEventListener('click', () => {
            const costoGuardado = parseFloat(tallaItem.dataset.costo);
            const option = document.createElement('option');
            option.value = talla;
            if (Number.isFinite(costoGuardado)) {
                option.dataset.costoCompra = costoGuardado.toFixed(2);
                option.textContent = `Talla ${talla} · S/ ${costoGuardado.toFixed(2)}`;
            } else {
                option.textContent = `Talla ${talla}`;
            }
            tallaSelect.appendChild(option);

            tallaItem.remove();
            calcularSubtotalProducto(productoRow);
        });

        if (optionSeleccionada) {
            optionSeleccionada.remove();
        } else {
            const optionFallback = tallaSelect.querySelector(`option[value="${talla}"]`);
            if (optionFallback) {
                optionFallback.remove();
            }
        }

        tallaSelect.value = '';
        tallaCantidadInput.value = '1';

        calcularSubtotalProducto(productoRow);
    }

    function calcularSubtotalProducto(productoRow) {
        const costoInput = productoRow.querySelector('.producto-costo');
        const subtotalInput = productoRow.querySelector('.producto-subtotal');
        const tieneTallas = productoRow.dataset.tieneTallas === 'true';

        const costoBase = parseFloat(costoInput.value) || 0;
        let cantidad = 0;
        let subtotal = 0;

        if (tieneTallas) {
            // Sumar cantidades de todas las tallas
            const tallasItems = productoRow.querySelectorAll('.talla-item');
            tallasItems.forEach(item => {
                const cantidadTalla = parseInt(item.dataset.cantidad, 10) || 0;
                const costoTalla = parseFloat(item.dataset.costo);
                const costoUnitario = Number.isFinite(costoTalla) ? costoTalla : costoBase;
                cantidad += cantidadTalla;
                subtotal += costoUnitario * cantidadTalla;
            });
        } else {
            const cantidadInput = productoRow.querySelector('.producto-cantidad');
            cantidad = parseInt(cantidadInput.value) || 0;
            subtotal = costoBase * cantidad;
        }

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
                idProducto: parseInt(productoSelect.value, 10),
                costoUnitario: parseFloat(costoInput.value) || 0,
                tieneTallas: tieneTallas
            };

            if (tieneTallas) {
                // Recopilar tallas
                const tallas = [];
                let cantidadTotal = 0;
                let subtotalTotal = 0;

                row.querySelectorAll('.talla-item').forEach(item => {
                    const cantidad = parseInt(item.dataset.cantidad, 10);
                    const costo = parseFloat(item.dataset.costo);
                    const costoUnitario = Number.isFinite(costo)
                        ? costo
                        : parseFloat(row.dataset.costoBase || costoInput.value) || 0;
                    const subtotal = Number((costoUnitario * cantidad).toFixed(2));
                    tallas.push({
                        talla: item.dataset.talla,
                        cantidad: cantidad,
                        costoUnitario: costoUnitario,
                        subtotal: subtotal
                    });
                    cantidadTotal += cantidad;
                    subtotalTotal = Number((subtotalTotal + subtotal).toFixed(2));
                });

                detalle.cantidad = cantidadTotal;
                detalle.tallas = tallas;
                detalle.costoUnitario = cantidadTotal > 0 ? Number((subtotalTotal / cantidadTotal).toFixed(2)) : 0;
                detalle.subtotal = Number(subtotalTotal.toFixed(2));
            } else {
                detalle.cantidad = parseInt(cantidadInput.value);
                detalle.tallas = null;
                detalle.subtotal = Number((detalle.cantidad * (detalle.costoUnitario || 0)).toFixed(2));
            }

            detalles.push(detalle);
        });

        const referenciaInput = document.getElementById('compraReferencia');
        const observacionesInput = document.getElementById('compraObservaciones');

        return {
            idProveedor: parseInt(compraProveedorSelect.value),
            fechaPedido: compraFechaPedidoInput.value,
            fechaEntregaEsperada: compraFechaEntregaInput.value,
            idTipoPago: compraTipoPagoSelect && compraTipoPagoSelect.value ? parseInt(compraTipoPagoSelect.value, 10) : null,
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
                const tieneTallas = detalle.tieneTallas && Array.isArray(detalle.tallas) && detalle.tallas.length > 0;

                if (tieneTallas) {
                    const totalRow = document.createElement('tr');
                    totalRow.className = 'detalle-producto-con-tallas';
                    totalRow.innerHTML = `
                        <td><strong>${detalle.nombreProducto}</strong></td>
                        <td><strong>${detalle.cantidad}</strong></td>
                        <td><strong>${detalle.cantidadRecibida}</strong></td>
                        <td class="detalle-costounitario-total">-</td>
                        <td><strong>S/ ${(Number(detalle.subtotal) || 0).toFixed(2)}</strong></td>
                    `;
                    detalleProductosTableBody.appendChild(totalRow);

                    detalle.tallas.forEach(talla => {
                        const subRow = document.createElement('tr');
                        subRow.className = 'detalle-producto-talla';
                        subRow.innerHTML = `
                            <td><span class="detalle-talla-label">Talla ${talla.talla}</span></td>
                            <td>${Number(talla.cantidad || 0)}</td>
                            <td>${Number(talla.cantidadRecibida || 0)}</td>
                            <td>S/ ${(Number(talla.costoUnitario) || 0).toFixed(2)}</td>
                            <td>S/ ${(Number(talla.subtotal) || 0).toFixed(2)}</td>
                        `;
                        detalleProductosTableBody.appendChild(subRow);
                    });

                    return;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${detalle.nombreProducto}</td>
                    <td>${detalle.cantidad}</td>
                    <td>${detalle.cantidadRecibida}</td>
                    <td>S/ ${(Number(detalle.costoUnitario) || 0).toFixed(2)}</td>
                    <td>S/ ${(Number(detalle.subtotal) || 0).toFixed(2)}</td>
                `;
                detalleProductosTableBody.appendChild(row);
            });

            detalleCompraModal.style.display = 'block';
        } catch (error) {
            mostrarNotificacion({ tipo: 'error', mensaje: 'Error al cargar el detalle de la compra' });
        }
    }

    actualizarDisponibilidadProductos();
    actualizarRestriccionesFechas();

    // --- Event Listeners ---

    if (compraFechaPedidoInput) {
        compraFechaPedidoInput.addEventListener('change', actualizarRestriccionesFechas);
    }

    if (compraFechaEntregaInput) {
        compraFechaEntregaInput.addEventListener('change', actualizarRestriccionesFechas);
    }

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

        mostrarMensajeProductos('');
        actualizarDisponibilidadProductos();

        if (aplicaIgvToggle) {
            aplicaIgvToggle.checked = false;
        }

        // Establecer fecha actual
        const hoyDate = getTodayDate();
        const hoyISO = formatDateISO(hoyDate);
        if (compraFechaPedidoInput) {
            compraFechaPedidoInput.value = hoyISO;
        }
        if (compraFechaEntregaInput) {
            compraFechaEntregaInput.value = hoyISO;
        }
        if (compraTipoPagoSelect) {
            compraTipoPagoSelect.value = '';
        }

        actualizarRestriccionesFechas();
        ocultarErrorProveedor();

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

    closeRecepcionModalBtn.addEventListener('click', cerrarRecepcionModal);
    cancelRecepcionBtn.addEventListener('click', cerrarRecepcionModal);
    confirmRecepcionBtn.addEventListener('click', registrarRecepcion);
    recepcionModoRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.checked) {
                aplicarModoRecepcion(event.target.value);
            }
        });
    });

    if (aplicaIgvToggle) {
        aplicaIgvToggle.addEventListener('change', calcularTotales);
    }

    compraForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!proveedorSeleccionado || !compraProveedorSelect.value) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe seleccionar un proveedor' });
            mostrarErrorProveedor(MENSAJE_PROVEEDOR_OBLIGATORIO);
            if (proveedorSearchInput) {
                proveedorSearchInput.focus();
            }
            return;
        }

        const hoyDate = getTodayDate();
        const fechaPedidoValor = compraFechaPedidoInput ? compraFechaPedidoInput.value : '';
        const fechaEntregaValor = compraFechaEntregaInput ? compraFechaEntregaInput.value : '';
        const fechaPedidoDate = parseDateInput(fechaPedidoValor);
        const fechaEntregaDate = parseDateInput(fechaEntregaValor);

        if (!fechaPedidoDate) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe ingresar una fecha de pedido válida' });
            return;
        }

        if (fechaPedidoDate < hoyDate) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'La fecha de pedido no puede ser anterior a la fecha actual' });
            return;
        }

        if (!fechaEntregaDate) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe ingresar una fecha de entrega válida' });
            return;
        }

        if (fechaEntregaDate < hoyDate) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'La fecha de entrega no puede ser anterior a la fecha actual' });
            return;
        }

        if (fechaEntregaDate < fechaPedidoDate) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'La fecha de entrega no puede ser anterior a la fecha de pedido' });
            return;
        }

        if (!compraTipoPagoSelect || !compraTipoPagoSelect.value) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe seleccionar un método de pago' });
            return;
        }

        const compraData = recopilarDatosCompra();

        if (compraData.detalles.length === 0) {
            mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe agregar al menos un producto' });
            return;
        }

        // Validar que productos con tallas tengan al menos una talla
        for (const detalle of compraData.detalles) {
            if (detalle.tieneTallas && (!detalle.tallas || detalle.tallas.length === 0)) {
                mostrarNotificacion({ tipo: 'warning', mensaje: 'Debe agregar al menos una talla para los productos que las requieren' });
                return;
            }
        }

        try {
            await guardarCompra(compraData);
            mostrarNotificacion({ tipo: 'success', mensaje: 'Compra registrada exitosamente' });
            compraModal.style.display = 'none';
            cargarCompras();
        } catch (error) {
            mostrarNotificacion({ tipo: 'error', mensaje: error.message || 'Error al guardar la compra' });
        }
    });

    // --- Funciones Públicas (expuestas globalmente) ---

    window.comprasModule = {
        verDetalle: mostrarDetalleCompra,

        recepcionarCompra: abrirRecepcionModal,

        anular: async (idCompra) => {
            const confirmado = await mostrarConfirmacion({
                mensaje: '¿Está seguro de anular esta compra?',
                titulo: 'Confirmar anulación',
                tipo: 'warning',
                textoConfirmar: 'Anular',
                textoCancelar: 'Mantener'
            });

            if (!confirmado) {
                return;
            }

            try {
                await anularCompra(idCompra);
                mostrarNotificacion({ tipo: 'success', mensaje: 'Compra anulada exitosamente' });
                cargarCompras();
            } catch (error) {
                mostrarNotificacion({ tipo: 'error', mensaje: error.message || 'Error al anular la compra' });
            }
        }
    };

    // --- Inicialización ---
    cargarProveedores();
    cargarTiposPago();
    cargarCompras();
});
