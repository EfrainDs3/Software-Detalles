document.addEventListener('DOMContentLoaded', () => {

    // --- Variables y Referencias del DOM ---
    const tiposTableBody = document.getElementById('tiposTableBody');
    const addTipoBtn = document.getElementById('addTipoBtn');
    const tipoModal = document.getElementById('tipoModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const tipoForm = document.getElementById('tipoForm');
    const modalTitle = document.getElementById('modalTitle');
    const tipoIdInput = document.getElementById('tipoId');
    const tipoNombreInput = document.getElementById('tipoNombre');
    const tipoCategoriaSelect = document.getElementById('tipoCategoria');

    let modoEdicion = false;

    // --- Funciones de API ---

    async function cargarTipos() {
        try {
            const response = await fetch('/inventario/tipos-movimiento/api');
            if (!response.ok) throw new Error('Error al cargar tipos de movimiento');

            const tipos = await response.json();
            renderTipos(tipos);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los tipos de movimiento');
        }
    }

    async function guardarTipo(tipoData) {
        try {
            const url = modoEdicion
                ? `/inventario/tipos-movimiento/api/${tipoIdInput.value}`
                : '/inventario/tipos-movimiento/api';

            const method = modoEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tipoData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al guardar tipo de movimiento');
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function obtenerTipoPorId(id) {
        try {
            const response = await fetch(`/inventario/tipos-movimiento/api/${id}`);
            if (!response.ok) throw new Error('Error al obtener tipo de movimiento');

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    // --- Funciones de Renderizado ---

    function renderTipos(tipos) {
        tiposTableBody.innerHTML = '';

        if (tipos.length === 0) {
            tiposTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No hay tipos de movimiento registrados</p>
                    </td>
                </tr>
            `;
            return;
        }

        const entradas = tipos
            .filter(tipo => tipo.esEntrada)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));
        const salidas = tipos
            .filter(tipo => !tipo.esEntrada)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        const tiposOrdenados = [...entradas, ...salidas];

        tiposOrdenados.forEach(tipo => {
            const row = document.createElement('tr');

            const badgeClass = tipo.esEntrada ? 'badge-entrada' : 'badge-salida';
            const badgeText = tipo.esEntrada ? 'Entrada' : 'Salida';
            const badgeIcon = tipo.esEntrada ? 'fa-arrow-down' : 'fa-arrow-up';

            row.innerHTML = `
                <td>${tipo.nombre}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        <i class="fas ${badgeIcon}"></i> ${badgeText}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="window.tiposMovimientoModule.editar(${tipo.id})" title="Editar">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </td>
            `;

            tiposTableBody.appendChild(row);
        });
    }

    // --- Funciones de Modal ---

    function abrirModalNuevo() {
        modoEdicion = false;
        modalTitle.textContent = 'Nuevo Tipo de Movimiento';
        tipoForm.reset();
        tipoIdInput.value = '';
        tipoModal.style.display = 'block';
    }

    async function abrirModalEditar(id) {
        try {
            modoEdicion = true;
            modalTitle.textContent = 'Editar Tipo de Movimiento';

            const tipo = await obtenerTipoPorId(id);

            tipoIdInput.value = tipo.id;
            tipoNombreInput.value = tipo.nombre;
            tipoCategoriaSelect.value = tipo.esEntrada.toString();

            tipoModal.style.display = 'block';
        } catch (error) {
            alert('Error al cargar los datos del tipo de movimiento');
        }
    }

    function cerrarModal() {
        tipoModal.style.display = 'none';
        tipoForm.reset();
        modoEdicion = false;
    }

    // --- Event Listeners ---

    addTipoBtn.addEventListener('click', abrirModalNuevo);

    closeModalBtn.addEventListener('click', cerrarModal);

    cancelBtn.addEventListener('click', cerrarModal);

    // Cerrar modal al hacer click fuera de él
    window.addEventListener('click', (e) => {
        if (e.target === tipoModal) {
            cerrarModal();
        }
    });

    tipoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tipoData = {
            nombre: tipoNombreInput.value.trim(),
            esEntrada: tipoCategoriaSelect.value === 'true'
        };

        // Validaciones
        if (!tipoData.nombre) {
            alert('El nombre del tipo de movimiento es obligatorio');
            return;
        }

        if (tipoCategoriaSelect.value === '') {
            alert('Debe seleccionar una categoría (Entrada o Salida)');
            return;
        }

        try {
            await guardarTipo(tipoData);
            const mensaje = modoEdicion
                ? 'Tipo de movimiento actualizado exitosamente'
                : 'Tipo de movimiento creado exitosamente';
            alert(mensaje);
            cerrarModal();
            cargarTipos();
        } catch (error) {
            alert(error.message || 'Error al guardar el tipo de movimiento');
        }
    });

    // --- Funciones Públicas (expuestas globalmente) ---

    window.tiposMovimientoModule = {
        editar: abrirModalEditar
    };

    // --- Inicialización ---
    cargarTipos();
});
