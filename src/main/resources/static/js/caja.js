// Archivo: caja.js (ACTUALIZADO)

document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias del DOM y Estado Global ---
    const API_BASE_URL = '/api/caja'; 
    
    const cajaTableBody = document.getElementById('cajaTableBody');
    const cashierStatusText = document.getElementById('cashierStatusText');
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

    let currentAperturaId = null; // ID de la apertura activa para el cierre
    let currentMontoInicial = null; // Monto inicial de la caja activa

    // --- Funciones de Utilidad ---

    function formatCurrency(amount) {
        return `S/ ${parseFloat(amount).toFixed(2)}`;
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
        
        checkInBtn.style.display = isAbierta ? 'none' : 'block';
        checkOutBtn.style.display = isAbierta ? 'block' : 'none';

        // Llenar el nombre del trabajador en los modales
        const trabajadorNombre = estado.trabajador || 'Usuario Actual';
        cashierNameInput.value = trabajadorNombre;
        cashierNameCheckoutInput.value = trabajadorNombre;

        // Guardar el estado activo
        currentAperturaId = estado.idAperturaActiva;
        currentMontoInicial = estado.montoInicial;
    }

    // --- Lógica de Comunicación con el Backend ---

    // 1. Obtener el estado actual de la caja
    async function fetchCajaStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/estado`);
            if (!response.ok) throw new Error('Error al obtener estado de caja');
            const estado = await response.json();
            updateCajaStatusUI(estado);
        } catch (error) {
            console.error('Error al cargar estado de caja:', error);
            // Mostrar un estado por defecto si falla la API
            updateCajaStatusUI({ abierta: false, trabajador: 'Error de Conexión', montoInicial: 0 });
            alert('Error al cargar el estado de la caja desde el servidor.');
        }
    }

    // 2. Obtener el historial de movimientos
    async function fetchCajaHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/historial`);
            if (!response.ok) throw new Error('Error al obtener historial de caja');
            const history = await response.json();
            renderCajaHistory(history);
        } catch (error) {
            console.error('Error al cargar historial:', error);
            alert('Error al cargar el historial de movimientos desde el servidor.');
        }
    }

    // 3. Apertura de caja (Check-in)
    checkInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const montoInicial = parseFloat(initialAmountInput.value);
        if (isNaN(montoInicial) || montoInicial < 0) {
            alert('Por favor, ingrese un monto inicial válido.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/abrir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ montoInicial })
            });

            if (response.status === 409) { // Conflict
                alert('Error: La caja ya estaba abierta.');
            } else if (!response.ok) {
                throw new Error(`Error en la Apertura: ${response.statusText}`);
            }

            // Éxito:
            const estadoActualizado = await response.json();
            updateCajaStatusUI(estadoActualizado);
            await fetchCajaHistory(); // Recargar historial
            alert('Caja abierta exitosamente.');
            checkInModal.style.display = 'none';
            initialAmountInput.value = ''; // Limpiar campo
            finalAmountInput.value = ''; // Limpiar campo del otro modal
        
        } catch (error) {
            console.error('Error al abrir caja:', error);
            alert(`Hubo un error al intentar abrir la caja. Consulte la consola.`);
        }
    });

    // 4. Cierre de caja (Check-out)
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
                body: JSON.stringify(requestBody)
            });

            if (response.status === 409) { // Conflict
                alert('Error: Esta sesión de caja ya estaba cerrada.');
            } else if (!response.ok) {
                throw new Error(`Error en el Cierre: ${response.statusText}`);
            }

            // Éxito:
            await fetchCajaStatus(); // Actualizar a 'Cerrada'
            await fetchCajaHistory(); // Recargar historial
            alert('Caja cerrada exitosamente.');
            checkOutModal.style.display = 'none';
            finalAmountInput.value = ''; // Limpiar campo

        } catch (error) {
            console.error('Error al cerrar caja:', error);
            alert(`Hubo un error al intentar cerrar la caja. Consulte la consola.`);
        }
    });


    // --- Event Listeners para Modales ---

    // Mostrar Modal Apertura
    checkInBtn.addEventListener('click', () => {
        if (!currentAperturaId) {
            checkInModal.style.display = 'block';
            initialAmountInput.focus();
        } else {
            alert('La caja ya está abierta.');
        }
    });

    // Mostrar Modal Cierre
    checkOutBtn.addEventListener('click', () => {
        if (currentAperturaId) {
            // Cargar el monto inicial en el modal de cierre
            checkoutInitialAmountInput.value = formatCurrency(currentMontoInicial);
            checkOutModal.style.display = 'block';
            finalAmountInput.focus();
        } else {
            alert('La caja está cerrada. Debe abrirla primero.');
        }
    });

    // Funciones genéricas para cerrar modales
    function setupModalClose(closeBtnId, cancelBtnId, modalId) {
        document.getElementById(closeBtnId).addEventListener('click', () => document.getElementById(modalId).style.display = 'none');
        document.getElementById(cancelBtnId).addEventListener('click', () => document.getElementById(modalId).style.display = 'none');
    }

    setupModalClose('closeCheckInModal', 'cancelCheckInBtn', 'checkInModal');
    setupModalClose('closeCheckOutModal', 'cancelCheckOutBtn', 'checkOutModal');

    window.addEventListener('click', (event) => {
        if (event.target === checkInModal) checkInModal.style.display = 'none';
        if (event.target === checkOutModal) checkOutModal.style.display = 'none';
    });
    
    // --- Inicializar la Aplicación ---
    fetchCajaStatus();
    fetchCajaHistory();
});