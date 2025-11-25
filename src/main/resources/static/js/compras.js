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
    const detalleCompraSubtotal = document.getElementById('detalleCompraSubtotal');
    const detalleCompraIgv = document.getElementById('detalleCompraIgv');
    const detalleCompraTotal = document.getElementById('detalleCompraTotal');
    const detalleProductosTableBody = document.getElementById('detalleProductosTableBody');

    // Variables globales
    let proveedoresData = [];
    let productosDelProveedor = [];
    let proveedorSeleccionado = null;
    let productosTallasCache = {}; // Cache para tallas de productos

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

    async function agregarProducto() {
        if (!proveedorSeleccionado) {
            alert('Primero seleccione un proveedor');
            return;
        }

        const productoRow = document.createElement('div');
        productoRow.className = 'producto-row mb-3 p-3 border rounded';
        productoRow.dataset.index = Date.now();

        productoRow.innerHTML = `
            <div class="row align-items-start">
                <div class="col-md-4">
                    <label class="form-label">Producto</label>
                    <select class="form-select producto-select" required>
                        <option value="">Seleccionar producto</option>
                        ${productosDelProveedor.map(p => `
                            <option value="${p.id}" data-costo="${p.costoCompra}">
                                ${p.nombre} - S/ ${p.costoCompra}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="col-md-3 producto-cantidad-container">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control producto-cantidad" min="1" value="1" required>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Costo Unitario</label>
                    <input type="number" class="form-control producto-costo" step="0.01" min="0" required>
                </div>
                <div class="col-md-2 d-flex align-items-end justify-content-end">
                    <button type="button" class="btn btn-danger btn-remove-producto" title="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-md-4">
                    <label class="form-label">Subtotal</label>
                    <input type="text" class="form-control producto-subtotal" readonly>
                </div>
            </div>
            <div class="tallas-container mt-3" style="display: none;">
                <div class="tallas-alert">
                    <strong><i class="fas fa-ruler"></i> Este producto maneja tallas</strong>
                    <p class="mb-2">Agregue las tallas y cantidades necesarias:</p>
                    <div class="tallas-list mb-3"></div>
                    <div class="row">
                        <div class="col-md-4">
                            <select class="form-select talla-select">
                                <option value="">Seleccionar talla</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="number" class="form-control talla-cantidad" placeholder="Cantidad" min="1" value="1">
                        </div>
                        <div class="col-md-3">
                            <button type="button" class="btn btn-primary btn-add-talla">
                                <i class="fas fa-plus"></i> Agregar Talla
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        productosContainer.appendChild(productoRow);

        // Event listeners
        const productoSelect = productoRow.querySelector('.producto-select');
        const cantidadInput = productoRow.querySelector('.producto-cantidad');
        const costoInput = productoRow.querySelector('.producto-costo');
        const removeBtn = productoRow.querySelector('.btn-remove-producto');
        const addTallaBtn = productoRow.querySelector('.btn-add-talla');

        productoSelect.addEventListener('change', async (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption.value) {
                const costo = parseFloat(selectedOption.dataset.costo);
                costoInput.value = costo.toFixed(2);

                // Verificar si tiene tallas
                const idProducto = parseInt(selectedOption.value);
                const tallasData = await cargarTallasProducto(idProducto);

                if (tallasData.tieneTallas) {
                    mostrarUITallas(productoRow, tallasData.tallas);
                } else {
                    ocultarUITallas(productoRow);
                }

                calcularSubtotalProducto(productoRow);
            }
        });

        cantidadInput.addEventListener('input', () => calcularSubtotalProducto(productoRow));
        costoInput.addEventListener('input', () => calcularSubtotalProducto(productoRow));
        removeBtn.addEventListener('click', () => {
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
        let subtotal = 0;

        document.querySelectorAll('.producto-row').forEach(row => {
            const subtotalText = row.querySelector('.producto-subtotal').value;
            const valor = parseFloat(subtotalText.replace('S/ ', '')) || 0;
            subtotal += valor;
        });

        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        compraSubtotalSpan.textContent = `S/ ${subtotal.toFixed(2)}`;
        compraIgvSpan.textContent = `S/ ${igv.toFixed(2)}`;
        compraTotalSpan.textContent = `S/ ${total.toFixed(2)}`;
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
            detalles: detalles
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

            const subtotal = compra.totalPedido / 1.18;
            const igv = compra.totalPedido - subtotal;

            detalleCompraSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
            detalleCompraIgv.textContent = `S/ ${igv.toFixed(2)}`;
            detalleCompraTotal.textContent = `S/ ${compra.totalPedido.toFixed(2)}`;

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

    compraProveedorSelect.addEventListener('change', async (e) => {
        const selectedOption = e.target.selectedOptions[0];
        if (selectedOption.value) {
            proveedorSeleccionado = parseInt(selectedOption.value);
            compraRucInput.value = selectedOption.dataset.ruc;

            // Cargar productos del proveedor
            await cargarProductosPorProveedor(proveedorSeleccionado);

            // Limpiar productos agregados
            productosContainer.innerHTML = '';
            calcularTotales();
        } else {
            proveedorSeleccionado = null;
            compraRucInput.value = '';
            productosDelProveedor = [];
            productosContainer.innerHTML = '';
            calcularTotales();
        }
    });

    addProductBtn.addEventListener('click', agregarProducto);

    addCompraBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Nueva Compra';
        compraForm.reset();
        productosContainer.innerHTML = '';
        proveedorSeleccionado = null;
        productosDelProveedor = [];
        productosTallasCache = {};

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

    compraForm.addEventListener('submit', async (e) => {
        e.preventDefault();

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
