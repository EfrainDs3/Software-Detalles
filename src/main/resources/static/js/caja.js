document.addEventListener('DOMContentLoaded', () => {

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
    const cajaTableBody = document.getElementById('cajaTableBody');
    if (!cajaTableBody) {
        console.log('⚠️ caja.js: No se encontró la tabla de caja. Este script solo debe ejecutarse en /caja');
        return; // Salir del script si no estamos en la página correcta
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

    // Función para actualizar el estado de la caja en la interfaz
    function updateCajaStatusUI(estado) {
        const isAbierta = estado.abierta;
        cashierStatusText.textContent = isAbierta ? 'Abierta' : 'Cerrada';

        cashierStatusText.classList.remove('cerrada', 'abierta');
        cashierStatusText.classList.add(isAbierta ? 'abierta' : 'cerrada');

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
        try {
            const response = await fetch(`${API_BASE_URL}/estado`, {
                credentials: 'include'
            });

            if (!response.ok) {
                console.error(`Error ${response.status}: No se pudo obtener el estado de la caja`);
                // NO actualizar la UI si hay error - mantener el estado actual
                return;
            }

            const estado = await response.json();

            // Validar que el estado tenga la estructura esperada
            if (estado && typeof estado.abierta === 'boolean') {
                updateCajaStatusUI(estado);
            } else {
                console.warn('Estado inválido recibido del backend:', estado);
            }
        } catch (error) {
            console.error('Error al cargar estado de caja:', error);
            // NO actualizar la UI en caso de error de red
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

        } catch (error) {
            console.error('Error al cargar la lista de cajas:', error);
            cajaSelect.innerHTML = '<option value="">Error al cargar (Consola)</option>';
            cajaSelect.disabled = true;
        }
    }

    // 4. Cierre de caja (Check-out)
    if (checkOutForm) {
        checkOutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const finalAmount = parseFloat(finalAmountInput.value);
            if (isNaN(finalAmount) || finalAmount < 0) {
                showToast('Por favor, ingrese un monto final válido.');
                return;
            }

            if (!currentAperturaId) {
                showToast('No hay una caja activa para cerrar.');
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
                // ✅ CORRECCIÓN: No intentar parsear JSON de respuesta vacía
                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 409) {
                        showToast('❌ Error: Esta caja ya estaba cerrada.');
                    } else {
                        showToast(`❌ Error al cerrar caja: ${errorText || response.statusText}`);
                    }
                    return;
                }
                // ✅ Si llegamos aquí, el cierre fue exitoso
                await fetchCajaStatus();
                await fetchCajaHistory();
                showToast('✅ Caja cerrada exitosamente.');
                checkOutModal.style.display = 'none';
                finalAmountInput.value = '';
            } catch (error) {
                console.error('❌ Error al cerrar caja:', error);
                showToast(`Hubo un error al intentar cerrar la caja. Consulte la consola.`);
            }
        });
    }


    // --- Event Listeners para Modales (Abrir/Cerrar Caja) ---

    // Mostrar Modal Apertura
    if (checkInBtn) {
        checkInBtn.addEventListener('click', () => {
            if (checkInModal) checkInModal.style.display = 'block';
            initialAmountInput.focus();
        });
    }

    // Mostrar Modal Cierre
    // Mostrar Modal Cierre
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', async () => {
            if (currentAperturaId) {
                // Cargar el monto inicial en el modal de cierre
                if (checkoutInitialAmountInput) checkoutInitialAmountInput.value = formatCurrency(currentMontoInicial);

                // ✅ NUEVO: Cargar total de ventas y calcular monto esperado
                const checkoutSalesSummary = document.getElementById('checkoutSalesSummary');
                const checkoutTotalSales = document.getElementById('checkoutTotalSales');
                const checkoutExpectedTotal = document.getElementById('checkoutExpectedTotal');

                try {
                    // Mostrar "Cargando..." mientras se consulta
                    if (checkoutTotalSales) checkoutTotalSales.textContent = 'Cargando...';
                    if (checkoutExpectedTotal) checkoutExpectedTotal.textContent = '...';
                    if (checkoutSalesSummary) checkoutSalesSummary.style.display = 'block';

                    const response = await fetch(`/ventas/api/total-apertura/${currentAperturaId}`, { credentials: 'include' });
                    if (response.ok) {
                        const data = await response.json();
                        const totalVentas = parseFloat(data.total) || 0;
                        const totalEsperado = currentMontoInicial + totalVentas;

                        if (checkoutTotalSales) checkoutTotalSales.textContent = formatCurrency(totalVentas);
                        if (checkoutExpectedTotal) checkoutExpectedTotal.textContent = formatCurrency(totalEsperado);

                        // ✅ Pre-llenar el campo editable con el total esperado
                        if (finalAmountInput) finalAmountInput.value = totalEsperado.toFixed(2);
                    } else {
                        console.error('Error al obtener totales de venta');
                        if (checkoutTotalSales) checkoutTotalSales.textContent = 'Error';
                    }
                } catch (error) {
                    console.error('Error de conexión al obtener totales:', error);
                }

                if (checkOutModal) checkOutModal.style.display = 'block';
                // Seleccionar el texto para editar fácilmente si es necesario
                if (finalAmountInput) finalAmountInput.select();
            } else {
                showToast('La caja está cerrada. Debe abrirla primero.');
            }
        });
    }

    // Funciones genéricas para cerrar modales
    function setupModalClose(closeBtnId, cancelBtnId, modalId) {
        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);
        const modal = document.getElementById(modalId);

        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    }

    setupModalClose('closeCheckInModal', 'cancelCheckInBtn', 'checkInModal');
    setupModalClose('closeCheckOutModal', 'cancelCheckOutBtn', 'checkOutModal');

    // Cerrar modales al hacer clic fuera (incluye la modal de Nueva Caja)
    window.addEventListener('click', (event) => {
        if (event.target === checkInModal) checkInModal.style.display = 'none';
        if (event.target === checkOutModal) checkOutModal.style.display = 'none';
        if (event.target === modalNuevaCaja) modalNuevaCaja.style.display = 'none';
    });


    // ======================================================
    // FUNCIONALIDAD DE VER DETALLES
    // ======================================================

    const modalDetalles = document.getElementById('modalDetalles');
    const cerrarModalDetalles = document.getElementById('cerrarModalDetalles');
    const cerrarModalDetallesBtn = document.getElementById('cerrarModalDetallesBtn');

    // Función para abrir modal de detalles
    function abrirModalDetalles(movimiento) {
        // Datos básicos
        document.getElementById('detalle-id').textContent = movimiento.id;
        document.getElementById('detalle-trabajador').textContent = movimiento.trabajador;
        document.getElementById('detalle-fecha').textContent = formatDate(movimiento.fecha);

        // Estado
        const estadoSpan = document.getElementById('detalle-estado');
        estadoSpan.textContent = movimiento.estado;
        estadoSpan.className = 'status-badge ' + movimiento.estado.toLowerCase();

        // Horas y montos
        document.getElementById('detalle-hora-apertura').textContent = movimiento.horaApertura || '-';
        document.getElementById('detalle-monto-inicial').textContent = formatCurrency(movimiento.montoInicial);
        document.getElementById('detalle-hora-cierre').textContent = movimiento.horaCierre || '-';
        document.getElementById('detalle-monto-final').textContent = movimiento.montoFinal ? formatCurrency(movimiento.montoFinal) : '-';

        // Sección de diferencia (solo si está cerrada)
        const seccionDiferencia = document.getElementById('seccion-diferencia');
        if (movimiento.estado.toLowerCase() === 'cerrada' && movimiento.montoFinal) {
            seccionDiferencia.style.display = 'block';

            // Calcular monto esperado y diferencia (puedes ajustar esta lógica)
            const montoEsperado = movimiento.montoInicial + 500; // Ejemplo: ventas simuladas
            const diferencia = movimiento.montoFinal - montoEsperado;

            document.getElementById('detalle-monto-esperado').textContent = formatCurrency(montoEsperado);

            const diferenciaSpan = document.getElementById('detalle-diferencia');
            diferenciaSpan.textContent = formatCurrency(Math.abs(diferencia));

            // Colorear según positivo/negativo
            if (diferencia > 0) {
                diferenciaSpan.className = 'monto-positivo';
                diferenciaSpan.textContent = '+ ' + formatCurrency(diferencia);
            } else if (diferencia < 0) {
                diferenciaSpan.className = 'monto-negativo';
                diferenciaSpan.textContent = '- ' + formatCurrency(Math.abs(diferencia));
            } else {
                diferenciaSpan.className = 'monto-neutro';
                diferenciaSpan.textContent = formatCurrency(0);
            }
        } else {
            seccionDiferencia.style.display = 'none';
        }

        // Observaciones (si las tienes en el backend)
        document.getElementById('detalle-observaciones').textContent =
            movimiento.observaciones || 'Sin observaciones registradas';

        // Mostrar modal
        modalDetalles.style.display = 'block';
    }

    // Event listeners para cerrar modal de detalles
    if (cerrarModalDetalles) {
        cerrarModalDetalles.onclick = () => modalDetalles.style.display = 'none';
    }
    if (cerrarModalDetallesBtn) {
        cerrarModalDetallesBtn.onclick = () => modalDetalles.style.display = 'none';
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === modalDetalles) {
            modalDetalles.style.display = 'none';
        }
    });

    // ======================================================
    // DELEGACIÓN DE EVENTOS PARA BOTONES DE ACCIÓN
    // ======================================================

    // Delegación de eventos para los botones de "Ver" y "Cerrar desde tabla"
    document.addEventListener('click', async (e) => {
        // ========== BOTÓN VER DETALLES ==========
        const btnView = e.target.closest('.btn-view');

        if (btnView) {
            const idMovimiento = btnView.getAttribute('data-id');

            // Buscar el movimiento en el historial cargado
            try {
                const response = await fetch(`${API_BASE_URL}/historial`, { credentials: 'include' });
                if (!response.ok) throw new Error('Error al obtener historial');

                const history = await response.json();
                const movimiento = history.find(m => m.id == idMovimiento);

                if (movimiento) {
                    abrirModalDetalles(movimiento);
                } else {
                    showToast('No se encontró el movimiento solicitado');
                }
            } catch (error) {
                console.error('Error al cargar detalles:', error);
                showToast('Error al cargar los detalles del movimiento');
            }
            return; // Importante: salir después de manejar este evento
        }

        // ========== BOTÓN CERRAR CAJA DESDE TABLA ==========
        const btnCloseRow = e.target.closest('.btn-close-row');

        if (btnCloseRow) {
            const idApertura = btnCloseRow.getAttribute('data-id');

            // Buscar el movimiento para obtener el monto inicial
            try {
                const historyResponse = await fetch(`${API_BASE_URL}/historial`, { credentials: 'include' });
                if (!historyResponse.ok) throw new Error('Error al obtener historial');

                const history = await historyResponse.json();
                const movimiento = history.find(m => m.id == idApertura);

                if (!movimiento) {
                    showToast('❌ No se encontró el movimiento');
                    return;
                }

                // Verificar que esté abierta
                if (movimiento.estado.toLowerCase() !== 'abierta') {
                    showToast('Esta caja ya está cerrada', 'error');
                    return;
                }
                // ✅ Usar el modal de cierre existente
                currentAperturaId = idApertura;
                currentMontoInicial = movimiento.montoInicial;
                // Llenar datos en el modal
                if (cashierNameCheckoutInput) cashierNameCheckoutInput.value = movimiento.trabajador;
                if (checkoutInitialAmountInput) checkoutInitialAmountInput.value = formatCurrency(movimiento.montoInicial);
                if (finalAmountInput) finalAmountInput.value = '';
                // Mostrar modal
                if (checkOutModal) {
                    checkOutModal.style.display = 'block';
                    finalAmountInput.focus();
                }
                return; // El modal manejará el cierre

                console.log('🔍 DEBUG - Datos a enviar:', {
                    idApertura: parseInt(idApertura, 10),
                    montoFinal: parseFloat(monto.toFixed(2)),
                    movimiento: movimiento
                });

                const response = await fetch(`${API_BASE_URL}/cerrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        idApertura: parseInt(idApertura, 10),
                        montoFinal: parseFloat(monto.toFixed(2))
                    }),
                    credentials: 'include'
                });

                console.log('📡 Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Error del servidor:', errorText);
                    console.error('📋 Response completo:', {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });

                    if (response.status === 409) {
                        showToast('❌ Conflicto: Esta caja ya está cerrada o el ID no coincide.');
                    } else if (response.status === 404) {
                        showToast('❌ No se encontró la apertura de caja con ID ' + idApertura);
                    } else if (response.status === 500) {
                        alert('❌ Error del servidor.\n\nPosibles causas:\n' +
                            '- La caja no existe en la base de datos\n' +
                            '- Error de validación en el backend\n' +
                            '- Problema con el formato de datos\n\n' +
                            'Revisa la consola del navegador (F12) para más detalles.');
                    } else {
                        showToast(`❌ Error ${response.status} al cerrar la caja.\n\n${errorText.substring(0, 200)}`);
                    }
                    return;
                }

                // ✅ CORRECCIÓN: No intentar parsear JSON de respuesta vacía
                console.log('✅ Cierre exitoso desde tabla');

                showToast('✅ Caja cerrada exitosamente');
                await fetchCajaStatus();
                await fetchCajaHistory();
            } catch (error) {
                console.error('❌ Error completo:', error);
                console.error('📋 Stack trace:', error.stack);
                showToast(`❌ Error de conexión: ${error.message}\n\nRevisa la consola del navegador para más detalles.`);
            }
            return;
        }
    });

    // --- Inicializar la Aplicación ---
    fetchCajaStatus();
    fetchCajaHistory();
    fetchAndPopulateCajas();

});