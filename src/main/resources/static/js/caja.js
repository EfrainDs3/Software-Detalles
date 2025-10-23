document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias del DOM y Estado Global ---
    const API_BASE_URL = '/api/caja'; 
    
    // Referencias para Historial y Estado
    const cajaTableBody = document.getElementById('cajaTableBody');
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
        if(checkInBtn) checkInBtn.style.display = isAbierta ? 'none' : 'block';
        if(checkOutBtn) checkOutBtn.style.display = isAbierta ? 'block' : 'none';

        // Llenar el nombre del trabajador en los inputs de los modales
        const trabajadorNombre = estado.trabajador || 'Usuario Actual';
        if(cashierNameInput) cashierNameInput.value = trabajadorNombre;
        if(cashierNameCheckoutInput) cashierNameCheckoutInput.value = trabajadorNombre;

        // Guardar el estado activo
        currentAperturaId = estado.idAperturaActiva;
        currentMontoInicial = estado.montoInicial;
    }

    // --- Lógica de Comunicación con el Backend ---

    // 1. Obtener el estado actual de la caja
    async function fetchCajaStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/estado`, { credentials: 'include' });
            if (!response.ok) throw new Error('Error al obtener estado de caja');
            const estado = await response.json();
            updateCajaStatusUI(estado);
        } catch (error) {
            console.error('Error al cargar estado de caja:', error);
            updateCajaStatusUI({ abierta: false, trabajador: 'Error de Conexión', montoInicial: 0 });
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
                alert('❌ Por favor, seleccione una caja.');
                return;
            }

            if (isNaN(montoInicial) || montoInicial < 0) {
                alert('Por favor, ingrese un monto inicial válido.');
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

                if (response.status === 409) {
                    alert('Error: La caja ya estaba abierta.');
                } else if (!response.ok) {
                    throw new Error(`Error en la Apertura: ${response.statusText}`);
                }

                const estadoActualizado = await response.json();
                updateCajaStatusUI(estadoActualizado);
                await fetchCajaHistory();
                alert(`Caja ${idCajaValue} abierta exitosamente.`);
                checkInModal.style.display = 'none';
                initialAmountInput.value = ''; 
                finalAmountInput.value = ''; 
            
            } catch (error) {
                console.error('Error al abrir caja:', error);
                alert(`Hubo un error al intentar abrir la caja. Consulte la consola.`);
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
                option.textContent = `${caja.nombreCaja}`; // Mostramos el ID para debug
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
                alert('Por favor, ingrese un monto final válido.');
                return;
            }
            
            if (!currentAperturaId) {
                alert('No hay una caja activa para cerrar.');
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

                if (response.status === 409) {
                    alert('Error: Esta sesión de caja ya estaba cerrada.');
                } else if (!response.ok) {
                    throw new Error(`Error en el Cierre: ${response.statusText}`);
                }

                await fetchCajaStatus();
                await fetchCajaHistory();
                alert('Caja cerrada exitosamente.');
                checkOutModal.style.display = 'none';
                finalAmountInput.value = '';

            } catch (error) {
                console.error('Error al cerrar caja:', error);
                alert(`Hubo un error al intentar cerrar la caja. Consulte la consola.`);
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
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', () => {
            if (currentAperturaId) {
                // Cargar el monto inicial en el modal de cierre
                if(checkoutInitialAmountInput) checkoutInitialAmountInput.value = formatCurrency(currentMontoInicial);
                if (checkOutModal) checkOutModal.style.display = 'block';
                finalAmountInput.focus();
            } else {
                alert('La caja está cerrada. Debe abrirla primero.');
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
    
    // --- Inicializar la Aplicación ---
    fetchCajaStatus();
    fetchCajaHistory();
    fetchAndPopulateCajas();
});