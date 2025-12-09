document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 caja.js: Script inicializado');
    // alert('DEBUG: caja.js se ha cargado correctamente (Versión Debug)'); // Comentado tras verificación

    // ========================================
    // SISTEMA DE TOAST NOTIFICATIONS
    // ========================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="toast-content">
                <h4>${type === 'success' ? '¡Éxito!' : '¡Error!'}</h4>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    function createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    // --- Referencias del DOM y Estado Global ---
    const API_BASE_URL = '/api/caja';

    // Referencias para Historial y Estado
    // Referencias para Historial y Estado
    const cajaTableBody = document.getElementById('cajaTableBody');
    if (!cajaTableBody) {
        console.log('ℹ️ modal caja logic: Tabla de caja no encontrada, pero se cargará la lógica de cierre/apertura si existen los modales.');
    }

    const cashierStatusText = document.getElementById('cashierStatusText');

    // Referencias para Abrir/Cerrar Caja
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const checkInModal = document.getElementById('checkInModal');
    const checkOutModal = document.getElementById('checkOutModal');
    const checkInForm = document.getElementById('checkInForm');
    const checkOutForm = document.getElementById('checkOutForm');
    const initialAmountInput = document.getElementById('initialAmount');
    const checkoutInitialAmountInput = document.getElementById('checkoutInitialAmount');
    const finalAmountInput = document.getElementById('finalAmount');
    const cashierNameInput = document.getElementById('cashierName');
    const cashierNameCheckoutInput = document.getElementById('cashierNameCheckout');
    const cajaSelect = document.getElementById('cajaSelect');

    // Referencias para NUEVA CAJA MODAL
    const modalNuevaCaja = document.getElementById('modalNuevaCaja');
    const btnAbrirModalCaja = document.getElementById('btnAbrirModalCaja');
    const cerrarModalCaja = document.getElementById('cerrarModalCaja');
    const formNuevaCaja = document.getElementById('formNuevaCaja');
    const mensajeCaja = document.getElementById('mensajeCaja');

    let currentAperturaId = null; // ID de la apertura activa para el cierre
    let currentMontoInicial = null; // Monto inicial de la caja activa
    let historialCajaData = []; // ✅ VARIABLE GLOBAL PARA HISTORIAL

    // --- Funciones de Utilidad ---

    function formatCurrency(amount) {
        // Asegura que el monto sea un número antes de formatear
        const number = parseFloat(amount);
        return `S/ ${isNaN(number) ? '0.00' : number.toFixed(2)}`;
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // --- Funciones de Renderizado ---

    // Función para renderizar la tabla del historial de caja
    function renderCajaHistory(history) {
        historialCajaData = history || []; // ✅ ACTUALIZAR DATOS GLOBALES
        if (!cajaTableBody) return;
        cajaTableBody.innerHTML = '';
        if (history.length === 0) {
            cajaTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No hay movimientos de caja registrados.</td></tr>';
            return;
        }

        history.forEach(movimiento => {
            const estadoTexto = movimiento.estado;
            const estadoClase = estadoTexto.toLowerCase();
            const estaAbierta = estadoTexto.toLowerCase() === 'abierta';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movimiento.id}</td>
                <td>${movimiento.trabajador}</td>
                <td>${formatDate(movimiento.fecha)}</td>
                <td>${movimiento.horaApertura || '-'}</td>
                <td>${formatCurrency(movimiento.montoInicial)}</td>
                <td>${movimiento.horaCierre || '-'}</td>
                <td>${movimiento.montoFinal ? formatCurrency(movimiento.montoFinal) : '-'}</td>
                <td><span class="status-badge ${estadoClase}">${estadoTexto}</span></td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-view" data-id="${movimiento.id}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <!-- ✅ Botón PDF Reporte Apertura -->
                        <button class="btn-icon btn-pdf-report" data-id="${movimiento.id}" title="Ver Reporte de Ventas PDF" style="background-color: #17a2b8; color: white;">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        ${estaAbierta ? `
                            <button class="btn-icon btn-close-row" 
                                    data-id="${movimiento.id}" 
                                    style="background-color: #dc3545; color: white;"
                                    title="Cerrar caja">
                                <i class="fas fa-lock"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            cajaTableBody.appendChild(row);
        });
    }

    // Delegación de eventos para la tabla de caja (View Details / PDF / Close)
    if (cajaTableBody) {
        cajaTableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-icon');
            if (!btn) return;
            const id = btn.dataset.id;

            if (btn.classList.contains('btn-view')) {
                // Lógica existente para ver detalles
                const movimiento = historialCajaData.find(m => m.id == id); // Asegúrate de tener acceso a historialCajaData
                if (movimiento) abrirModalDetalles(movimiento);
            } else if (btn.classList.contains('btn-pdf-report')) {
                // ✅ Abrir Reporte PDF
                window.open(`/ventas/reporte/apertura/${id}/pdf`, '_blank');
            } else if (btn.classList.contains('btn-close-row')) {
                // Lógica para cerrar caja desde la fila (si existe)
                // Se podría implementar abrir el modal de cierre pre-cargado
            }
        });
    }

    // Función para actualizar el estado de la caja en la interfaz
    function updateCajaStatusUI(estado) {
        const isAbierta = estado.abierta;
        if (cashierStatusText) {
            cashierStatusText.textContent = isAbierta ? 'Abierta' : 'Cerrada';
            cashierStatusText.classList.remove('cerrada', 'abierta');
            cashierStatusText.classList.add(isAbierta ? 'abierta' : 'cerrada');
        }

        // Controlar visibilidad de botones (Abrir vs Cerrar)
        if (checkInBtn) checkInBtn.style.display = isAbierta ? 'none' : 'block';
        if (checkOutBtn) checkOutBtn.style.display = isAbierta ? 'block' : 'none';

        // Llenar el nombre del trabajador en los inputs de los modales
        const trabajadorNombre = estado.trabajador || 'Usuario Actual';
        if (cashierNameInput) cashierNameInput.value = trabajadorNombre;
        if (cashierNameCheckoutInput) cashierNameCheckoutInput.value = trabajadorNombre;

        // Guardar el estado activo
        currentAperturaId = estado.idAperturaActiva;
        currentMontoInicial = estado.montoInicial;
    }

    // --- Lógica de Comunicación con el Backend ---

    // 1. Obtener el estado actual de la caja (MEJORADO)
    async function fetchCajaStatus() {
        console.log('🔄 fetchCajaStatus: Solicitando estado de caja...');
        try {
            const response = await fetch(`${API_BASE_URL}/estado`, {
                credentials: 'include'
            });

            if (!response.ok) {
                console.error(`❌ Error ${response.status}: No se pudo obtener el estado de la caja`);
                return;
            }

            const estado = await response.json();
            console.log('✅ Estado recibido:', estado);

            if (estado && typeof estado.abierta === 'boolean') {
                updateCajaStatusUI(estado);
            } else {
                console.warn('⚠️ Estado inválido recibido del backend:', estado);
            }
        } catch (error) {
            console.error('❌ Error crítico al cargar estado de caja:', error);
        }
    }

    // 2. Obtener el historial de movimientos
    async function fetchCajaHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/historial`, { credentials: 'include' });
            if (!response.ok) throw new Error('Error al obtener historial de caja');
            const history = await response.json();
            renderCajaHistory(history);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        }
    }


    // ------------------------------------------
    // Lógica para Abrir/Cerrar la Modal de NUEVA CAJA
    // ------------------------------------------
    if (btnAbrirModalCaja && modalNuevaCaja) {
        // Al hacer clic en el botón "Nueva Caja"
        btnAbrirModalCaja.onclick = () => {
            mensajeCaja.textContent = ''; // Limpia mensajes anteriores
            formNuevaCaja.reset();
            modalNuevaCaja.style.display = 'block';
        }

        // Al hacer clic en la 'x'
        cerrarModalCaja.onclick = () => {
            modalNuevaCaja.style.display = 'none';
        }
    }

    // LÓGICA DE ENVÍO DEL FORMULARIO DE NUEVA CAJA
    if (formNuevaCaja) {
        formNuevaCaja.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Obtener y limpiar los valores
            const nombre = document.getElementById('nombreCaja').value.trim();
            const descripcion = document.getElementById('descripcionCaja').value.trim();

            // 2. VALIDACIÓN CRÍTICA: Aseguramos que el nombre no esté vacío.
            if (!nombre) {
                mensajeCaja.textContent = '❌ El Nombre/Identificador de Caja no puede estar vacío.';
                mensajeCaja.style.color = 'red';
                return; // Detiene el envío si está vacío
            }

            // 3. Crear el payload con los nombres de propiedad de su Entidad Java (camelCase)
            const data = {
                nombreCaja: nombre,
                ubicacionCaja: descripcion || null,
                estado: 'ACTIVO'
            };

            mensajeCaja.textContent = 'Guardando caja...';
            mensajeCaja.style.color = 'orange';

            try {
                const response = await fetch(`${API_BASE_URL}/cajas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });

                if (response.ok) {
                    const cajaCreada = await response.json();
                    mensajeCaja.textContent = `✅ Caja '${nombre}' creada con éxito.`;
                    mensajeCaja.style.color = 'green';
                    formNuevaCaja.reset();

                    // Actualizar lista y cerrar modal tras éxito
                    await fetchAndPopulateCajas(); // Actualizar el selector
                    setTimeout(() => {
                        modalNuevaCaja.style.display = 'none';
                    }, 1500);

                } else {
                    // Manejo de errores
                    const errorMsg = await response.text();
                    mensajeCaja.textContent = `❌ Error ${response.status}: El backend falló. ${errorMsg.substring(0, 100)}...`;
                    mensajeCaja.style.color = 'red';
                    console.error('Error al crear caja:', errorMsg);
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                mensajeCaja.textContent = '❌ Error de conexión o servidor no disponible.';
                mensajeCaja.style.color = 'red';
            }
        });
    }

    // ------------------------------------------
    // Lógica para Abrir y Cerrar Caja
    // ------------------------------------------

    // 3. Apertura de caja (Check-in)
    if (checkInForm) {
        checkInForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Usamos la referencia limpia
            const idCajaValue = cajaSelect.value;
            const montoInicial = parseFloat(initialAmountInput.value);

            if (!idCajaValue) {
                showToast('❌ Por favor, seleccione una caja.');
                return;
            }

            if (isNaN(montoInicial) || montoInicial < 0) {
                showToast('Por favor, ingrese un monto inicial válido.');
                return;
            }

            try {
                const requestBody = {
                    idCaja: parseInt(idCajaValue, 10),
                    montoInicial: montoInicial
                };

                const response = await fetch(`${API_BASE_URL}/abrir`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    credentials: 'include'
                });

                // MEJORA: Capturar el error específico del backend
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error del servidor:', errorText);

                    if (response.status === 409) {
                        showToast('❌ Error: La caja ya estaba abierta.');
                    } else if (response.status === 403) {
                        showToast('❌ Error: No tienes permisos o no estás autenticado.');
                    } else if (response.status === 400) {
                        showToast('❌ Error: Datos inválidos. Verifica la caja seleccionada.');
                    } else {
                        showToast(`❌ Error ${response.status}: ${errorText.substring(0, 200)}`);
                    }
                    return; // Detiene la ejecución
                }

                const estadoActualizado = await response.json();
                updateCajaStatusUI(estadoActualizado);
                await fetchCajaHistory();
                showToast(`✅ Caja ${idCajaValue} abierta exitosamente.`);
                checkInModal.style.display = 'none';
                initialAmountInput.value = '';
                finalAmountInput.value = '';

            } catch (error) {
                console.error('❌ Error de conexión:', error);
                showToast(`Hubo un error de red. No se pudo conectar con el servidor.`);
            }
        });
    }


    // 5. Obtener la lista de cajas activas y llenar el selector
    async function fetchAndPopulateCajas() {
        try {
            const response = await fetch(`${API_BASE_URL}/cajas/activas`, { credentials: 'include' });
            if (!response.ok) throw new Error(`Error ${response.status} al obtener lista de cajas`);

            const cajas = await response.json();

            if (cajaSelect) {
                cajaSelect.innerHTML = ''; // Limpiar opciones

                if (cajas.length === 0) {
                    cajaSelect.innerHTML = '<option value="">No hay cajas activas disponibles</option>';
                    cajaSelect.disabled = true;
                    return;
                }

                // Opción por defecto
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Seleccione una caja";
                cajaSelect.appendChild(defaultOption);

                cajas.forEach(caja => {
                    const option = document.createElement('option');
                    option.value = caja.idCaja;
                    option.textContent = `${caja.nombreCaja}`;
                    cajaSelect.appendChild(option);
                });
                cajaSelect.disabled = false;

            }
        } catch (error) {
            console.error('Error al cargar la lista de cajas:', error);
            if (cajaSelect) {
                cajaSelect.innerHTML = '<option value="">Error al cargar (Consola)</option>';
                cajaSelect.disabled = true;
            }
        }
    }

    // 4. Cierre de caja (Check-out)
    if (checkOutForm) {
    }


    // ------------------------------------------
    // Lógica para Abrir/Cerrar la Modal de NUEVA CAJA
    // ------------------------------------------
    if (btnAbrirModalCaja && modalNuevaCaja) {
        // Al hacer clic en el botón "Nueva Caja"
        btnAbrirModalCaja.onclick = () => {
            mensajeCaja.textContent = ''; // Limpia mensajes anteriores
            formNuevaCaja.reset();
            modalNuevaCaja.style.display = 'block';
        }

        // Al hacer clic en la 'x'
        cerrarModalCaja.onclick = () => {
            modalNuevaCaja.style.display = 'none';
        }
    }

    // LÓGICA DE ENVÍO DEL FORMULARIO DE NUEVA CAJA
    if (formNuevaCaja) {
        formNuevaCaja.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Obtener y limpiar los valores
            const nombre = document.getElementById('nombreCaja').value.trim();
            const descripcion = document.getElementById('descripcionCaja').value.trim();

            // 2. VALIDACIÓN CRÍTICA: Aseguramos que el nombre no esté vacío.
            if (!nombre) {
                mensajeCaja.textContent = '❌ El Nombre/Identificador de Caja no puede estar vacío.';
                mensajeCaja.style.color = 'red';
                return; // Detiene el envío si está vacío
            }

            // 3. Crear el payload con los nombres de propiedad de su Entidad Java (camelCase)
            const data = {
                nombreCaja: nombre,
                ubicacionCaja: descripcion || null,
                estado: 'ACTIVO'
            };

            mensajeCaja.textContent = 'Guardando caja...';
            mensajeCaja.style.color = 'orange';

            try {
                const response = await fetch(`${API_BASE_URL}/cajas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });

                if (response.ok) {
                    const cajaCreada = await response.json();
                    mensajeCaja.textContent = `✅ Caja '${nombre}' creada con éxito.`;
                    mensajeCaja.style.color = 'green';
                    formNuevaCaja.reset();

                    // Actualizar lista y cerrar modal tras éxito
                    await fetchAndPopulateCajas(); // Actualizar el selector
                    setTimeout(() => {
                        modalNuevaCaja.style.display = 'none';
                    }, 1500);

                } else {
                    // Manejo de errores
                    const errorMsg = await response.text();
                    mensajeCaja.textContent = `❌ Error ${response.status}: El backend falló. ${errorMsg.substring(0, 100)}...`;
                    mensajeCaja.style.color = 'red';
                    console.error('Error al crear caja:', errorMsg);
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                mensajeCaja.textContent = '❌ Error de conexión o servidor no disponible.';
                mensajeCaja.style.color = 'red';
            }
        });
    }
    // ------------------------------------------
    // Lógica para Abrir y Cerrar Caja
    // ------------------------------------------

    // ------------------------------------------
    // 3. Apertura de caja (Check-in) Logic
    // ------------------------------------------
    if (checkInForm) {
        checkInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = checkInForm.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.disabled = true;

            const idCajaValue = cajaSelect.value;
            const montoInicial = parseFloat(initialAmountInput.value);

            if (!idCajaValue) {
                showToast('❌ Por favor, seleccione una caja.');
                if (btnSubmit) btnSubmit.disabled = false;
                return;
            }

            if (isNaN(montoInicial) || montoInicial < 0) {
                showToast('Por favor, ingrese un monto inicial válido.');
                if (btnSubmit) btnSubmit.disabled = false;
                return;
            }

            try {
                const requestBody = {
                    idCaja: parseInt(idCajaValue, 10),
                    montoInicial: montoInicial
                };

                const response = await fetch(`${API_BASE_URL}/abrir`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error del servidor:', errorText);

                    if (response.status === 409) {
                        showToast('❌ Error: La caja ya estaba abierta.');
                    } else if (response.status === 403) {
                        showToast('❌ Error: No tienes permisos.');
                    } else {
                        showToast(`❌ Error ${response.status}: ${errorText.substring(0, 200)}`);
                    }
                    if (btnSubmit) btnSubmit.disabled = false;
                    return;
                }

                const estadoActualizado = await response.json();
                updateCajaStatusUI(estadoActualizado);
                await fetchCajaHistory();
                showToast(`✅ Caja ${idCajaValue} abierta exitosamente.`);
                checkInModal.style.display = 'none';
                initialAmountInput.value = '';
            } catch (error) {
                console.error('❌ Error de conexión:', error);
                showToast(`Hubo un error de red.`);
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
            }
        });
    }

    // ------------------------------------------
    // 4. Cierre de caja (Check-out) Logic
    // ------------------------------------------
    if (checkOutForm) {
        checkOutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = checkOutForm.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.disabled = true;

            const finalAmount = parseFloat(finalAmountInput.value);
            if (isNaN(finalAmount) || finalAmount < 0) {
                showToast('Por favor, ingrese un monto final válido.');
                if (btnSubmit) btnSubmit.disabled = false;
                return;
            }

            if (!currentAperturaId) {
                showToast('No hay una caja activa para cerrar.');
                if (btnSubmit) btnSubmit.disabled = false;
                return;
            }

            try {
                const requestBody = {
                    idApertura: currentAperturaId,
                    montoFinal: finalAmount
                };
                const response = await fetch(`${API_BASE_URL}/cerrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 409) {
                        showToast('❌ Error: Esta caja ya estaba cerrada.');
                    } else {
                        showToast(`❌ Error al cerrar caja: ${errorText || response.statusText}`);
                    }
                    if (btnSubmit) btnSubmit.disabled = false;
                    return;
                }

                await fetchCajaStatus();
                await fetchCajaHistory();
                showToast('✅ Caja cerrada exitosamente.');
                checkOutModal.style.display = 'none';
                finalAmountInput.value = '';
            } catch (error) {
                console.error('❌ Error al cerrar caja:', error);
                showToast(`Hubo un error al intentar cerrar la caja.`);
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
            }
        });
    }

    // ------------------------------------------
    // 5. Fetch Cajas Activas & Nueva Caja Modal
    // ------------------------------------------
    async function fetchAndPopulateCajas() {
        try {
            const response = await fetch(`${API_BASE_URL}/cajas/activas`, { credentials: 'include' });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            const cajas = await response.json();

            if (cajaSelect) {
                cajaSelect.innerHTML = '';
                if (cajas.length === 0) {
                    cajaSelect.innerHTML = '<option value="">No hay cajas activas disponibles</option>';
                    cajaSelect.disabled = true;
                    return;
                }
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "Seleccione una caja";
                cajaSelect.appendChild(defaultOption);

                cajas.forEach(caja => {
                    const option = document.createElement('option');
                    option.value = caja.idCaja;
                    option.textContent = `${caja.nombreCaja}`;
                    cajaSelect.appendChild(option);
                });
                cajaSelect.disabled = false;
            }
        } catch (error) {
            console.error('Error al cargar cajas:', error);
            if (cajaSelect) {
                cajaSelect.innerHTML = '<option value="">Error al cargar</option>';
                cajaSelect.disabled = true;
            }
        }
    }

    if (btnAbrirModalCaja && modalNuevaCaja) {
        btnAbrirModalCaja.onclick = () => {
            mensajeCaja.textContent = '';
            formNuevaCaja.reset();
            modalNuevaCaja.style.display = 'block';
        }
        if (cerrarModalCaja) cerrarModalCaja.onclick = () => modalNuevaCaja.style.display = 'none';
    }

    if (formNuevaCaja) {
        formNuevaCaja.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSubmit = formNuevaCaja.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.disabled = true;

            const nombre = document.getElementById('nombreCaja').value.trim();
            const descripcion = document.getElementById('descripcionCaja').value.trim();

            if (!nombre) {
                mensajeCaja.textContent = '❌ Nombre requerido';
                mensajeCaja.style.color = 'red';
                if (btnSubmit) btnSubmit.disabled = false;
                return;
            }

            const data = {
                nombreCaja: nombre,
                ubicacionCaja: descripcion || null,
                estado: 'ACTIVO'
            };

            mensajeCaja.textContent = 'Guardando...';
            mensajeCaja.style.color = 'orange';

            try {
                const response = await fetch(`${API_BASE_URL}/cajas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });

                if (response.ok) {
                    mensajeCaja.textContent = `✅ Caja creada.`;
                    mensajeCaja.style.color = 'green';
                    formNuevaCaja.reset();
                    await fetchAndPopulateCajas();
                    setTimeout(() => modalNuevaCaja.style.display = 'none', 1500);
                } else {
                    const errorMsg = await response.text();
                    mensajeCaja.textContent = `❌ ${errorMsg}`;
                    mensajeCaja.style.color = 'red';
                }
            } catch (error) {
                mensajeCaja.textContent = '❌ Error de conexión';
                mensajeCaja.style.color = 'red';
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
            }
        });
    }

    // ======================================================
    // LOGICA COMPARTIDA: ABRIR MODAL DE CIERRE CON HISTORIAL
    // ======================================================
    async function openCheckoutModalWithHistory(idApertura, montoInicial) {
        console.log('🔓 Iniciando proceso de cierre para Apertura ID:', idApertura);

        currentAperturaId = idApertura;
        currentMontoInicial = montoInicial;

        if (checkoutInitialAmountInput) checkoutInitialAmountInput.value = formatCurrency(montoInicial);
        if (checkOutModal) checkOutModal.style.display = 'block';

        const container = document.getElementById('checkoutSalesHistoryContainer');
        const tbody = document.getElementById('checkoutSalesListBody');
        const totalSpan = document.getElementById('checkoutTotalSales');

        if (container) container.style.display = 'block';
        if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px;"><i class="fas fa-spinner fa-spin"></i> Cargando historial...</td></tr>';
        if (totalSpan) totalSpan.textContent = '...';

        try {
            const response = await fetch(`/ventas/api/historial-apertura/${currentAperturaId}`, { credentials: 'include' });
            if (response.ok) {
                const ventas = await response.json();
                if (tbody) tbody.innerHTML = '';
                if (ventas.length === 0) {
                    if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:10px; color:#777;">No hay ventas registradas.</td></tr>';
                }
                let totalSum = 0;
                ventas.forEach(v => {
                    const estadoSafe = (v.estado || '').toString();
                    const isEmitido = estadoSafe.toLowerCase() === 'emitido';
                    if (isEmitido) totalSum += parseFloat(v.total);

                    const dateObj = new Date(v.fecha);
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const tr = document.createElement('tr');
                    if (!isEmitido) {
                        tr.style.color = '#999';
                        tr.style.textDecoration = 'line-through';
                    }
                    tr.innerHTML = `
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${timeStr}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">#${v.id} ${!isEmitido ? '<small>(' + estadoSafe + ')</small>' : ''}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(v.total)}</td>
                    `;
                    if (tbody) tbody.appendChild(tr);
                });
                if (totalSpan) totalSpan.textContent = formatCurrency(totalSum);
                const totalEsperado = montoInicial + totalSum;
                if (finalAmountInput) finalAmountInput.value = totalEsperado.toFixed(2);
                if (finalAmountInput) finalAmountInput.select();
            } else {
                if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Error al cargar ventas</td></tr>';
            }
        } catch (error) {
            console.error('Error sales history', error);
            if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Error de conexión</td></tr>';
        }
    }

    // ------------------------------------------
    // Funciones Auxiliares Modales
    // ------------------------------------------
    function setupModalClose(closeBtnId, cancelBtnId, modalId) {
        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);
        const modal = document.getElementById(modalId);
        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    }

    setupModalClose('closeCheckInModal', 'cancelCheckInBtn', 'checkInModal');
    setupModalClose('closeCheckOutModal', 'cancelCheckOutBtn', 'checkOutModal');

    // Referencia al modal de detalles (puede no existir en todas las páginas)
    const modalDetalles = document.getElementById('modalDetalles');
    const cerrarModalDetalles = document.getElementById('cerrarModalDetalles');
    const cerrarModalDetallesBtn = document.getElementById('cerrarModalDetallesBtn');

    window.addEventListener('click', (event) => {
        if (checkInModal && event.target === checkInModal) checkInModal.style.display = 'none';
        if (checkOutModal && event.target === checkOutModal) checkOutModal.style.display = 'none';
        if (modalNuevaCaja && event.target === modalNuevaCaja) modalNuevaCaja.style.display = 'none';
        if (modalDetalles && event.target === modalDetalles) modalDetalles.style.display = 'none';
    });

    // Función Detalles
    function abrirModalDetalles(movimiento) {
        if (modalDetalles) {
            document.getElementById('detalle-id').textContent = movimiento.id;
            document.getElementById('detalle-trabajador').textContent = movimiento.trabajador;
            document.getElementById('detalle-fecha').textContent = formatDate(movimiento.fecha);
            const estadoSpan = document.getElementById('detalle-estado');
            estadoSpan.textContent = movimiento.estado;
            estadoSpan.className = 'status-badge ' + movimiento.estado.toLowerCase();
            document.getElementById('detalle-hora-apertura').textContent = movimiento.horaApertura || '-';
            document.getElementById('detalle-monto-inicial').textContent = formatCurrency(movimiento.montoInicial);
            document.getElementById('detalle-hora-cierre').textContent = movimiento.horaCierre || '-';
            document.getElementById('detalle-monto-final').textContent = movimiento.montoFinal ? formatCurrency(movimiento.montoFinal) : '-';
            // Observaciones
            const obsEl = document.getElementById('detalle-observaciones');
            if (obsEl) obsEl.textContent = movimiento.observaciones || 'Sin observaciones';

            modalDetalles.style.display = 'block';
        }
    }

    if (cerrarModalDetalles) cerrarModalDetalles.onclick = () => modalDetalles.style.display = 'none';
    if (cerrarModalDetallesBtn) cerrarModalDetallesBtn.onclick = () => modalDetalles.style.display = 'none';

    // ======================================================
    // CLICK LISTENERS (Show Modals)
    // ======================================================

    // 1. Botón Abrir Caja (Header)
    if (checkInBtn) {
        checkInBtn.addEventListener('click', () => {
            if (checkInModal) {
                checkInModal.style.display = 'block';
                if (initialAmountInput) initialAmountInput.focus();
            }
        });
    }

    // 2. Botón Cerrar Caja (Header)
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', async () => {
            if (!currentAperturaId) await fetchCajaStatus();
            if (currentAperturaId) {
                openCheckoutModalWithHistory(currentAperturaId, currentMontoInicial);
            } else {
                showToast('La caja está cerrada. Debe abrirla primero.');
            }
        });
    }

    // 3. Tabla Delegación
    document.addEventListener('click', async (e) => {
        const btnView = e.target.closest('.btn-view');
        if (btnView) {
            const idMovimiento = btnView.getAttribute('data-id');
            try {
                const response = await fetch(`${API_BASE_URL}/historial`, { credentials: 'include' });
                if (response.ok) {
                    const history = await response.json();
                    const movimiento = history.find(m => m.id == idMovimiento);
                    if (movimiento) abrirModalDetalles(movimiento);
                }
            } catch (error) { console.error(error); }
            return;
        }

        const btnCloseRow = e.target.closest('.btn-close-row');
        if (btnCloseRow) {
            if (currentAperturaId) {
                openCheckoutModalWithHistory(currentAperturaId, currentMontoInicial);
            } else {
                await fetchCajaStatus();
                if (currentAperturaId) {
                    openCheckoutModalWithHistory(currentAperturaId, currentMontoInicial);
                } else {
                    showToast('Error: No se pudo identificar la apertura activa.');
                }
            }
        }
    });

    // --- Inicializar ---
    fetchCajaStatus();
    fetchCajaHistory();
    fetchAndPopulateCajas();
});