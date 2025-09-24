document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const cajaTableBody = document.getElementById('cajaTableBody');
    const cashierStatusText = document.getElementById('cashierStatusText');
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const checkInModal = document.getElementById('checkInModal');
    const checkOutModal = document.getElementById('checkOutModal');
    const closeCheckInModalBtn = document.getElementById('closeCheckInModal');
    const closeCheckOutModalBtn = document.getElementById('closeCheckOutModal');
    const cancelCheckInBtn = document.getElementById('cancelCheckInBtn');
    const cancelCheckOutBtn = document.getElementById('cancelCheckOutBtn');
    const checkInForm = document.getElementById('checkInForm');
    const checkOutForm = document.getElementById('checkOutForm');
    const initialAmountInput = document.getElementById('initialAmount');
    const checkoutInitialAmountInput = document.getElementById('checkoutInitialAmount');
    const finalAmountInput = document.getElementById('finalAmount');

    // --- Datos de Ejemplo (Simulación) ---
    let cajaHistory = [
        {
            id: '001',
            trabajador: 'Ana López',
            fecha: '2025-09-12',
            horaApertura: '09:00 AM',
            montoInicial: 200.00,
            horaCierre: '05:30 PM',
            montoFinal: 850.50,
            estado: 'Cerrada'
        },
        {
            id: '002',
            trabajador: 'Pedro Gómez',
            fecha: '2025-09-13',
            horaApertura: '09:00 AM',
            montoInicial: 150.00,
            horaCierre: '06:00 PM',
            montoFinal: 780.25,
            estado: 'Cerrada'
        },
        {
            id: '003',
            trabajador: 'Juan Pérez',
            fecha: '2025-09-14',
            horaApertura: '09:00 AM',
            montoInicial: 180.00,
            horaCierre: '05:00 PM',
            montoFinal: 920.75,
            estado: 'Cerrada'
        }
    ];

    let currentCashier = null;
    let isCajaAbierta = false;

    // --- Funciones de Lógica ---

    // Función para renderizar la tabla del historial de caja
    function renderCajaHistory() {
        cajaTableBody.innerHTML = '';
        cajaHistory.forEach(movimiento => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movimiento.id}</td>
                <td>${movimiento.trabajador}</td>
                <td>${movimiento.fecha}</td>
                <td>${movimiento.horaApertura}</td>
                <td>S/ ${movimiento.montoInicial.toFixed(2)}</td>
                <td>${movimiento.horaCierre || '-'}</td>
                <td>S/ ${movimiento.montoFinal ? movimiento.montoFinal.toFixed(2) : '-'}</td>
                <td><span class="status-badge ${movimiento.estado.toLowerCase()}">${movimiento.estado}</span></td>
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
    function updateCajaStatus() {
        if (isCajaAbierta) {
            cashierStatusText.textContent = 'Abierta';
            cashierStatusText.classList.remove('cerrada');
            cashierStatusText.classList.add('abierta');
            checkInBtn.style.display = 'none';
            checkOutBtn.style.display = 'block';
        } else {
            cashierStatusText.textContent = 'Cerrada';
            cashierStatusText.classList.remove('abierta');
            cashierStatusText.classList.add('cerrada');
            checkInBtn.style.display = 'block';
            checkOutBtn.style.display = 'none';
        }
    }

    // --- Event Listeners ---

    // Botón de Apertura de Caja (Check-in)
    checkInBtn.addEventListener('click', () => {
        if (!isCajaAbierta) {
            checkInModal.style.display = 'block';
        } else {
            alert('La caja ya está abierta.');
        }
    });

    // Envío del formulario de Check-in
    checkInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const initialAmount = parseFloat(initialAmountInput.value);
        if (isNaN(initialAmount) || initialAmount <= 0) {
            alert('Por favor, ingrese un monto inicial válido.');
            return;
        }

        const newId = (cajaHistory.length + 1).toString().padStart(3, '0');
        const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        const currentDate = new Date().toISOString().split('T')[0];

        currentCashier = {
            id: newId,
            trabajador: 'Usuario Actual', // Simulación del nombre del usuario logueado
            fecha: currentDate,
            horaApertura: currentTime,
            montoInicial: initialAmount,
            horaCierre: null,
            montoFinal: null,
            estado: 'Abierta'
        };

        cajaHistory.push(currentCashier);
        isCajaAbierta = true;
        updateCajaStatus();
        renderCajaHistory();
        alert('Caja abierta exitosamente.');
        checkInModal.style.display = 'none';
    });

    // Botón de Cierre de Caja (Check-out)
    checkOutBtn.addEventListener('click', () => {
        if (isCajaAbierta) {
            checkoutInitialAmountInput.value = `S/ ${currentCashier.montoInicial.toFixed(2)}`;
            checkOutModal.style.display = 'block';
        } else {
            alert('La caja ya está cerrada. No se puede realizar un cierre.');
        }
    });

    // Envío del formulario de Check-out
    checkOutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const finalAmount = parseFloat(finalAmountInput.value);
        if (isNaN(finalAmount) || finalAmount < 0) {
            alert('Por favor, ingrese un monto final válido.');
            return;
        }

        if (currentCashier) {
            currentCashier.horaCierre = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            currentCashier.montoFinal = finalAmount;
            currentCashier.estado = 'Cerrada';
            
            isCajaAbierta = false;
            currentCashier = null;

            updateCajaStatus();
            renderCajaHistory();
            alert('Caja cerrada exitosamente.');
            checkOutModal.style.display = 'none';
        }
    });

    // Cerrar modales
    closeCheckInModalBtn.addEventListener('click', () => checkInModal.style.display = 'none');
    cancelCheckInBtn.addEventListener('click', () => checkInModal.style.display = 'none');
    closeCheckOutModalBtn.addEventListener('click', () => checkOutModal.style.display = 'none');
    cancelCheckOutBtn.addEventListener('click', () => checkOutModal.style.display = 'none');

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === checkInModal) {
            checkInModal.style.display = 'none';
        }
        if (event.target === checkOutModal) {
            checkOutModal.style.display = 'none';
        }
    });

    // Iniciar la aplicación
    updateCajaStatus();
    renderCajaHistory();
});