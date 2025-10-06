// EJEMPLOS DE USO - MÓDULO DE CLIENTES
// =====================================

// 1. BÚSQUEDA EN TIEMPO REAL
// ---------------------------
// La búsqueda filtra automáticamente por:
// - ID del cliente
// - Nombre
// - Apellido
// - Email
// - Número de documento
// - Estado

// Ejemplo de uso:
// Escribir en el input de búsqueda: "juan" -> mostrará todos los clientes con "juan" en cualquier campo

// 2. AGREGAR UN NUEVO CLIENTE
// ----------------------------
// Función: openAddClientModal()
// Uso desde consola:
openAddClientModal();

// Llenar el formulario y hacer submit automáticamente guardará el cliente

// 3. EDITAR UN CLIENTE EXISTENTE
// -------------------------------
// Función: openEditClientModal(clientId)
// Ejemplo:
openEditClientModal('001'); // Edita el cliente con ID 001

// El modal se abrirá con los datos pre-cargados

// 4. VER DETALLES DE UN CLIENTE
// ------------------------------
// Función: viewCliente(clientId)
// Ejemplo:
viewCliente('002'); // Muestra los detalles del cliente 002

// Modal con vista detallada y opción de editar

// 5. ELIMINAR UN CLIENTE
// ----------------------
// Función: deleteCliente(clientId)
// Ejemplo:
deleteCliente('003'); // Muestra modal de confirmación para eliminar cliente 003

// 6. APLICAR FILTROS
// ------------------
// Función: handleFilter()
// Uso desde consola:
handleFilter();

// O hacer clic en el botón "Filtros" en la interfaz

// Ejemplo de filtrado programático:
function filtrarPorDNI() {
    const filteredClientes = clientes.filter(c => c.tipoDocumento === 'DNI');
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    filteredClientes.forEach(cliente => {
        const row = createClienteRow(cliente);
        tbody.appendChild(row);
    });
    addActionButtonListeners();
}

// 7. CREAR CLIENTE PROGRAMÁTICAMENTE
// -----------------------------------
const nuevoCliente = {
    nombre: 'Pedro',
    apellido: 'Sánchez',
    tipoDocumento: 'DNI',
    numeroDocumento: '98765432',
    email: 'pedro@email.com',
    telefono: '999888777',
    direccion: 'Calle Nueva 456'
};

// Simular submit del formulario:
function agregarClienteProgramatico(data) {
    const clienteData = {
        id: '',
        nombre: data.nombre,
        apellido: data.apellido,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion
    };
    createCliente(clienteData);
}

// agregarClienteProgramatico(nuevoCliente);

// 8. ACTUALIZAR CLIENTE PROGRAMÁTICAMENTE
// ----------------------------------------
function actualizarClienteProgramatico(clientId, updates) {
    const cliente = clientes.find(c => c.id === clientId);
    if (cliente) {
        Object.assign(cliente, updates);
        loadClientes();
        showNotification('Cliente actualizado', 'success');
    }
}

// Ejemplo:
// actualizarClienteProgramatico('001', { telefono: '999999999', email: 'nuevo@email.com' });

// 9. BUSCAR CLIENTES POR CRITERIO
// --------------------------------
function buscarClientesPor(campo, valor) {
    return clientes.filter(c => 
        c[campo].toLowerCase().includes(valor.toLowerCase())
    );
}

// Ejemplos:
// buscarClientesPor('nombre', 'Juan'); // Busca por nombre
// buscarClientesPor('email', 'gmail'); // Busca por email
// buscarClientesPor('estado', 'activo'); // Busca activos

// 10. OBTENER ESTADÍSTICAS
// -------------------------
function obtenerEstadisticas() {
    return {
        total: clientes.length,
        activos: clientes.filter(c => c.estado === 'activo').length,
        inactivos: clientes.filter(c => c.estado === 'inactivo').length,
        conDNI: clientes.filter(c => c.tipoDocumento === 'DNI').length,
        conRUC: clientes.filter(c => c.tipoDocumento === 'RUC').length,
        conPasaporte: clientes.filter(c => c.tipoDocumento === 'Pasaporte').length
    };
}

// console.log(obtenerEstadisticas());

// 11. EXPORTAR DATOS (PREPARACIÓN PARA CSV)
// ------------------------------------------
function exportarClientesCSV() {
    const headers = ['ID', 'Nombre', 'Apellido', 'Tipo Doc', 'Nro Doc', 'Email', 'Teléfono', 'Dirección', 'Estado'];
    const rows = clientes.map(c => [
        c.id,
        c.nombre,
        c.apellido,
        c.tipoDocumento,
        c.numeroDocumento,
        c.email,
        c.telefono,
        c.direccion,
        c.estado
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    console.log(csvContent);
    return csvContent;
}

// Para descargar:
function descargarCSV() {
    const csvContent = exportarClientesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'clientes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 12. VALIDACIÓN PERSONALIZADA
// -----------------------------
function validarNumeroDocumento(tipo, numero) {
    if (tipo === 'DNI') {
        return numero.length === 8 && /^\d+$/.test(numero);
    } else if (tipo === 'RUC') {
        return numero.length === 11 && /^\d+$/.test(numero);
    } else if (tipo === 'Pasaporte') {
        return numero.length >= 6 && numero.length <= 12;
    }
    return false;
}

// Ejemplo:
// validarNumeroDocumento('DNI', '12345678'); // true
// validarNumeroDocumento('DNI', '123'); // false

// 13. ORDENAR CLIENTES
// ---------------------
function ordenarClientesPor(campo, orden = 'asc') {
    const sorted = [...clientes].sort((a, b) => {
        if (orden === 'asc') {
            return a[campo] > b[campo] ? 1 : -1;
        } else {
            return a[campo] < b[campo] ? 1 : -1;
        }
    });
    
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    sorted.forEach(cliente => {
        const row = createClienteRow(cliente);
        tbody.appendChild(row);
    });
    addActionButtonListeners();
}

// Ejemplos:
// ordenarClientesPor('nombre', 'asc'); // Ordenar por nombre A-Z
// ordenarClientesPor('nombre', 'desc'); // Ordenar por nombre Z-A
// ordenarClientesPor('id', 'asc'); // Ordenar por ID

// 14. CLONAR CLIENTE
// ------------------
function clonarCliente(clientId) {
    const cliente = clientes.find(c => c.id === clientId);
    if (cliente) {
        const clon = {
            ...cliente,
            id: '', // Se generará uno nuevo
            nombre: cliente.nombre + ' (Copia)',
            numeroDocumento: '' // Debe ser único
        };
        openAddClientModal();
        // Pre-llenar formulario con datos del clon
        setTimeout(() => {
            document.getElementById('clientName').value = clon.nombre;
            document.getElementById('clientLastName').value = clon.apellido;
            document.getElementById('clientDocType').value = clon.tipoDocumento;
            document.getElementById('clientEmail').value = clon.email;
            document.getElementById('clientPhone').value = clon.telefono;
            document.getElementById('clientAddress').value = clon.direccion;
        }, 100);
    }
}

// 15. CAMBIAR ESTADO MASIVO
// --------------------------
function cambiarEstadoMasivo(nuevoEstado) {
    const checkboxes = document.querySelectorAll('.client-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.getAttribute('data-client-id'));
    
    ids.forEach(id => {
        const cliente = clientes.find(c => c.id === id);
        if (cliente) {
            cliente.estado = nuevoEstado;
        }
    });
    
    loadClientes();
    showNotification(`${ids.length} clientes actualizados a ${nuevoEstado}`, 'success');
}

// Ejemplo:
// 1. Seleccionar varios checkboxes
// 2. cambiarEstadoMasivo('inactivo');

// 16. INTEGRACIÓN CON API (TEMPLATE)
// -----------------------------------
async function guardarClienteEnAPI(clienteData) {
    try {
        const response = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clienteData)
        });
        
        if (response.ok) {
            const data = await response.json();
            showNotification('Cliente guardado en el servidor', 'success');
            return data;
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        showNotification('Error al conectar con el servidor', 'error');
        console.error(error);
    }
}

// 17. MODO DEBUG
// --------------
function activarModoDebug() {
    console.log('=== MODO DEBUG ACTIVADO ===');
    console.log('Total de clientes:', clientes.length);
    console.log('Clientes:', clientes);
    console.log('Estadísticas:', obtenerEstadisticas());
    
    // Agregar clase visual
    document.body.style.border = '5px solid red';
    console.log('Borde rojo activado para modo debug');
}

function desactivarModoDebug() {
    document.body.style.border = 'none';
    console.log('=== MODO DEBUG DESACTIVADO ===');
}

// 18. SHORTCUTS DE TECLADO (OPCIONAL)
// ------------------------------------
document.addEventListener('keydown', function(e) {
    // Ctrl + N = Nuevo cliente
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openAddClientModal();
    }
    
    // Ctrl + F = Enfocar búsqueda
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape = Cerrar modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

// 19. HELPER: FORMATEAR TELÉFONO
// -------------------------------
function formatearTelefono(telefono) {
    // Formato: (01) 234-5678 o (987) 654-321
    const cleaned = telefono.replace(/\D/g, '');
    if (cleaned.length === 9) {
        return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6)}`;
    }
    return telefono;
}

// 20. HELPER: VALIDAR EMAIL
// --------------------------
function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// CONSEJOS DE USO
// ===============

/*
1. PERFORMANCE:
   - Para más de 1000 clientes, considerar paginación del lado del servidor
   - Usar debounce en la búsqueda para evitar renders excesivos

2. SEGURIDAD:
   - Validar todos los datos en el backend
   - Sanitizar inputs antes de guardar
   - Implementar CSRF protection

3. ACCESIBILIDAD:
   - Los modales tienen navegación por teclado
   - Usar Tab para navegar entre campos
   - Enter para submit
   - Escape para cerrar

4. MOBILE:
   - Todo es responsive
   - Touch-friendly button sizes
   - Scrollable tables

5. BROWSER SUPPORT:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+
*/

// TESTING
// =======

function testModuloClientes() {
    console.log('🧪 Iniciando tests...');
    
    // Test 1: Crear cliente
    console.log('Test 1: Crear cliente');
    const clienteTest = {
        nombre: 'Test',
        apellido: 'Usuario',
        tipoDocumento: 'DNI',
        numeroDocumento: '11111111',
        email: 'test@test.com',
        telefono: '111111111',
        direccion: 'Calle Test 123'
    };
    createCliente(clienteTest);
    console.log('✅ Cliente creado');
    
    // Test 2: Buscar cliente
    console.log('Test 2: Buscar cliente');
    const encontrado = clientes.find(c => c.nombre === 'Test');
    console.log(encontrado ? '✅ Cliente encontrado' : '❌ Cliente no encontrado');
    
    // Test 3: Editar cliente
    console.log('Test 3: Editar cliente');
    if (encontrado) {
        updateCliente({
            id: encontrado.id,
            nombre: 'Test Editado',
            apellido: encontrado.apellido,
            tipoDocumento: encontrado.tipoDocumento,
            numeroDocumento: encontrado.numeroDocumento,
            email: encontrado.email,
            telefono: encontrado.telefono,
            direccion: encontrado.direccion
        });
        console.log('✅ Cliente editado');
    }
    
    // Test 4: Estadísticas
    console.log('Test 4: Estadísticas');
    const stats = obtenerEstadisticas();
    console.log('✅ Estadísticas:', stats);
    
    console.log('🎉 Tests completados');
}

// Ejecutar tests: testModuloClientes();
