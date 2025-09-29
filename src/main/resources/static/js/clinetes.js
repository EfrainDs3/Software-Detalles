// clientes.js - Gestión de Clientes (Solo Frontend)
class ClienteManager {
    constructor() {
        this.currentPage = 0;
        this.pageSize = 10;
        this.totalPages = 0;
        this.totalItems = 0;
        this.searchTerm = '';
        this.isEditMode = false;
        this.currentClienteId = null;
        
        // Datos de ejemplo para el frontend
        this.clientes = [
            {
                id: 1,
                nombre: "Juan Carlos Pérez",
                dni: "12345678",
                email: "juan.perez@email.com",
                telefono: "987654321",
                direccion: "Av. Los Pinos 123, San Isidro, Lima",
                activo: true,
                fechaCreacion: "2024-01-15T10:30:00"
            },
            {
                id: 2,
                nombre: "María Elena Rodríguez",
                dni: "87654321",
                email: "maria.rodriguez@email.com",
                telefono: "912345678",
                direccion: "Jr. Las Flores 456, Miraflores, Lima",
                activo: true,
                fechaCreacion: "2024-01-20T14:15:00"
            },
            {
                id: 3,
                nombre: "Carlos Alberto Silva",
                dni: "11223344",
                email: "carlos.silva@email.com",
                telefono: "955666777",
                direccion: "Av. Industrial 789, Los Olivos, Lima",
                activo: false,
                fechaCreacion: "2024-02-01T09:45:00"
            },
            {
                id: 4,
                nombre: "Ana Patricia López",
                dni: "55667788",
                email: "ana.lopez@email.com",
                telefono: "944333222",
                direccion: "Calle Real 321, Surco, Lima",
                activo: true,
                fechaCreacion: "2024-02-10T16:20:00"
            },
            {
                id: 5,
                nombre: "Roberto Miguel Torres",
                dni: "99887766",
                email: "roberto.torres@email.com",
                telefono: "933444555",
                direccion: "Av. Universitaria 654, San Miguel, Lima",
                activo: true,
                fechaCreacion: "2024-02-15T11:30:00"
            }
        ];
        
        this.filteredClientes = [...this.clientes];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadClientes();
    }
    
    bindEvents() {
        // Botón nuevo cliente
        document.getElementById('addClientBtn').addEventListener('click', () => {
            this.openModal();
        });
        
        // Botón cerrar modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Botón guardar cliente
        document.getElementById('saveBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveCliente();
        });
        
        // Botón cancelar
        document.getElementById('cancelBtn').addEventListener('click', () => {
            const clientModal = document.getElementById('clientModal');
            clientModal.style.display = "none"; // Cierra el modal
        });
        
        // Botón filtros
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.openFilters();
        });
        
        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.currentPage = 0;
            this.applySearch();
            this.loadClientes();
        });
        
        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        // Cerrar modal al hacer click fuera
        document.getElementById('clientModal').addEventListener('click', (e) => {
            if (e.target.id === 'clientModal') {
                this.closeModal();
            }
        });
        
        // Event listeners para actualizar vista previa en tiempo real
        this.setupPreviewListeners();
    }
    
    applySearch() {
        if (!this.searchTerm.trim()) {
            this.filteredClientes = [...this.clientes];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredClientes = this.clientes.filter(cliente => 
                cliente.nombre.toLowerCase().includes(term) ||
                cliente.dni.includes(term) ||
                cliente.email.toLowerCase().includes(term) ||
                (cliente.telefono && cliente.telefono.includes(term)) ||
                (cliente.direccion && cliente.direccion.toLowerCase().includes(term))
            );
        }
        
        this.totalItems = this.filteredClientes.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    }
    
    loadClientes() {
        this.applySearch();
        
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const clientesPaginados = this.filteredClientes.slice(startIndex, endIndex);
        
        this.renderTable(clientesPaginados);
        this.renderPagination();
        this.updatePaginationInfo();
    }
    
    renderTable(clientes) {
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = '';
        
        if (clientes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No se encontraron clientes
                    </td>
                </tr>
            `;
            return;
        }
        
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            
            // Separar nombre y apellido
            const nombreCompleto = cliente.nombre.split(' ');
            const nombre = nombreCompleto[0] || '';
            const apellido = nombreCompleto.slice(1).join(' ') || '';
            
            // Determinar tipo de documento basado en longitud
            const isDNI = cliente.dni.length === 8;
            const docType = isDNI ? 'DNI' : 'RUC';
            const docClass = isDNI ? 'dni' : 'ruc';
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="client-checkbox" data-id="${cliente.id}">
                </td>
                <td>
                    <span class="badge-id">${String(cliente.id).padStart(3, '0')}</span>
                </td>
                <td><strong>${nombre}</strong></td>
                <td>${apellido}</td>
                <td><span class="doc-badge ${docClass}">${docType}</span></td>
                <td><code>${cliente.dni}</code></td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono || '-'}</td>
                <td class="address-cell" title="${cliente.direccion || ''}">${cliente.direccion || '-'}</td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-edit" onclick="clienteManager.editCliente(${cliente.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="clienteManager.deleteCliente(${cliente.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon btn-view" onclick="clienteManager.viewCliente(${cliente.id})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderPagination() {
        const pagination = document.querySelector('.pagination');
        pagination.innerHTML = '';
        
        // Botón anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn-pagination';
        prevBtn.disabled = this.currentPage === 0;
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadClientes();
            }
        });
        pagination.appendChild(prevBtn);
        
        // Números de página
        const startPage = Math.max(0, this.currentPage - 2);
        const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-pagination ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i + 1;
            pageBtn.addEventListener('click', () => {
                this.currentPage = i;
                this.loadClientes();
            });
            pagination.appendChild(pageBtn);
        }
        
        // Botón siguiente
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-pagination';
        nextBtn.disabled = this.currentPage >= this.totalPages - 1;
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.currentPage++;
                this.loadClientes();
            }
        });
        pagination.appendChild(nextBtn);
    }
    
    updatePaginationInfo() {
        const startItem = this.currentPage * this.pageSize + 1;
        const endItem = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
        
        document.querySelector('.pagination-info').textContent = 
            `Mostrando ${startItem}-${endItem} de ${this.totalItems} clientes`;
    }
    
    openModal(cliente = null) {
        const modal = document.getElementById('clientModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('clientForm');
        
        if (cliente) {
            this.isEditMode = true;
            this.currentClienteId = cliente.id;
            title.textContent = 'Editar Cliente';
            this.fillForm(cliente);
        } else {
            this.isEditMode = false;
            this.currentClienteId = null;
            title.textContent = 'Nuevo Cliente';
            form.reset();
        }
        
        // Actualizar vista previa inicial
        this.updatePreview();
        
        modal.classList.add('open');
    }
    
    closeModal() {
        const modal = document.getElementById('clientModal');
        modal.classList.remove('open');
        this.isEditMode = false;
        this.currentClienteId = null;
        document.getElementById('clientForm').reset();
        
        // Habilitar todos los campos
        const inputs = document.querySelectorAll('#clientForm input, #clientForm select, #clientForm textarea');
        inputs.forEach(input => {
            input.disabled = false;
            input.classList.remove('error');
        });
        document.getElementById('saveBtn').style.display = 'inline-flex';
        
        // Limpiar mensajes de ayuda
        this.clearAllHelpMessages();
        
        // Resetear vista previa
        this.resetPreview();
    }
    
    clearAllHelpMessages() {
        const helpMessages = document.querySelectorAll('.help-text');
        helpMessages.forEach(help => help.remove());
    }
    
    resetPreview() {
        document.getElementById('previewClientName').textContent = 'Nombre del Cliente';
        document.getElementById('previewClientDetails').textContent = 'Tipo Doc. - Nro Documento';
        document.getElementById('previewEmail').textContent = 'Email: --';
        document.getElementById('previewPhone').textContent = 'Teléfono: --';
        document.getElementById('previewAddress').textContent = 'Dirección: --';
    }
    
    fillForm(cliente) {
        document.getElementById('clientId').value = cliente.id;
        
        // Separar nombre y apellido
        const nombreCompleto = cliente.nombre.split(' ');
        const nombre = nombreCompleto[0] || '';
        const apellido = nombreCompleto.slice(1).join(' ') || '';
        
        document.getElementById('clientName').value = nombre;
        document.getElementById('clientLastName').value = apellido;
        
        // Determinar tipo de documento
        const isDNI = cliente.dni.length === 8;
        document.getElementById('clientDocType').value = isDNI ? 'DNI' : 'RUC';
        document.getElementById('clientDocNumber').value = cliente.dni;
        
        document.getElementById('clientEmail').value = cliente.email;
        document.getElementById('clientPhone').value = cliente.telefono || '';
        document.getElementById('clientAddress').value = cliente.direccion || '';
    }
    
    saveCliente() {
        const nombre = document.getElementById('clientName').value.trim();
        const apellido = document.getElementById('clientLastName').value.trim();
        const formData = {
            nombre: `${nombre} ${apellido}`.trim(),
            dni: document.getElementById('clientDocNumber').value.trim(),
            email: document.getElementById('clientEmail').value.trim(),
            telefono: document.getElementById('clientPhone').value.trim(),
            direccion: document.getElementById('clientAddress').value.trim()
        };
        
        // Validaciones básicas
        if (!formData.nombre) {
            this.showError('El nombre es obligatorio');
            return;
        }
        if (!formData.dni) {
            this.showError('El DNI es obligatorio');
            return;
        }
        if (!formData.email) {
            this.showError('El email es obligatorio');
            return;
        }
        
        // Validar formato de DNI
        if (!/^\d{8}$/.test(formData.dni)) {
            this.showError('El DNI debe tener 8 dígitos');
            return;
        }
        
        // Validar formato de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            this.showError('El formato del email no es válido');
            return;
        }
        
        // Validar DNI único
        const dniExists = this.clientes.some(c => 
            c.dni === formData.dni && c.id !== this.currentClienteId
        );
        if (dniExists) {
            this.showError('Ya existe un cliente con este DNI');
            return;
        }
        
        // Validar email único
        const emailExists = this.clientes.some(c => 
            c.email === formData.email && c.id !== this.currentClienteId
        );
        if (emailExists) {
            this.showError('Ya existe un cliente con este email');
            return;
        }
        
        if (this.isEditMode) {
            // Editar cliente existente
            const index = this.clientes.findIndex(c => c.id === this.currentClienteId);
            if (index !== -1) {
                this.clientes[index] = {
                    ...this.clientes[index],
                    ...formData,
                    fechaActualizacion: new Date().toISOString()
                };
                this.showSuccess('Cliente actualizado exitosamente');
            }
        } else {
            // Crear nuevo cliente
            const newId = Math.max(...this.clientes.map(c => c.id), 0) + 1;
            const newCliente = {
                id: newId,
                ...formData,
                activo: true,
                fechaCreacion: new Date().toISOString()
            };
            this.clientes.push(newCliente);
            this.showSuccess('Cliente creado exitosamente');
        }
        
        this.closeModal();
        this.loadClientes();
    }
    
    viewCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.openModal(cliente);
            // Deshabilitar campos para solo lectura
            const inputs = document.querySelectorAll('#clientForm input, #clientForm select, #clientForm textarea');
            inputs.forEach(input => input.disabled = true);
            document.getElementById('saveBtn').style.display = 'none';
        }
    }
    
    editCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.openModal(cliente);
            // Habilitar campos para edición
            const inputs = document.querySelectorAll('#clientForm input, #clientForm select, #clientForm textarea');
            inputs.forEach(input => input.disabled = false);
            document.getElementById('saveBtn').style.display = 'inline-flex';
        }
    }
    
    deleteCliente(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            return;
        }
        
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.clientes.splice(index, 1);
            this.showSuccess('Cliente eliminado exitosamente');
            this.loadClientes();
        }
    }
    
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.client-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });

        // Función para abrir un modal
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = "flex";
                }
            }
            
            // Función para cerrar un modal
            function closeModal(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = "none";
                }
            }
            
            // Event Listeners para los botones de abrir y cerrar modales
            document.addEventListener("DOMContentLoaded", () => {
                // Botón para abrir el modal de "Nuevo Cliente"
                const addClientBtn = document.getElementById("addClientBtn");
                if (addClientBtn) {
                    addClientBtn.addEventListener("click", () => openModal("clientModal"));
                }
            
                // Botón para abrir el modal de "Editar Cliente"
                const editButtons = document.querySelectorAll(".btn-edit");
                editButtons.forEach((btn) => {
                    btn.addEventListener("click", () => openModal("editClientModal"));
                });
            
                // Botón para abrir el modal de "Eliminar Cliente"
                const deleteButtons = document.querySelectorAll(".btn-delete");
                deleteButtons.forEach((btn) => {
                    btn.addEventListener("click", () => openModal("deleteClientModal"));
                });
            
                // Botón para abrir el modal de "Ver Cliente"
                const viewButtons = document.querySelectorAll(".btn-view");
                viewButtons.forEach((btn) => {
                    btn.addEventListener("click", () => openModal("viewClientModal"));
                });
            
                // Botones para cerrar los modales
                const closeButtons = document.querySelectorAll(".modal-close, .btn-secondary");
                closeButtons.forEach((btn) => {
                    btn.addEventListener("click", (event) => {
                        const modal = event.target.closest(".modal");
                        if (modal) {
                            modal.style.display = "none";
                        }
                    });
                });
            
                // Cerrar el modal al hacer clic fuera del contenido
                const modals = document.querySelectorAll(".modal");
                modals.forEach((modal) => {
                    modal.addEventListener("click", (event) => {
                        if (event.target === modal) {
                            modal.style.display = "none";
                        }
                    });
                });
            });            checkbox.checked = checked;
        });
    }
    
    openFilters() {
        // Crear modal de filtros
        const filterModal = document.createElement('div');
        filterModal.id = 'filterModal';
        filterModal.className = 'modal';
        filterModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Filtros de Clientes</h3>
                    <button class="modal-close" id="closeFilterModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="filterStatus">Estado:</label>
                        <select id="filterStatus">
                            <option value="">Todos</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterDocType">Tipo de Documento:</label>
                        <select id="filterDocType">
                            <option value="">Todos</option>
                            <option value="DNI">DNI</option>
                            <option value="RUC">RUC</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterDateFrom">Fecha desde:</label>
                        <input type="date" id="filterDateFrom">
                    </div>
                    <div class="form-group">
                        <label for="filterDateTo">Fecha hasta:</label>
                        <input type="date" id="filterDateTo">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="clearFilters">
                        <i class="fas fa-eraser"></i>
                        Limpiar Filtros
                    </button>
                    <button type="button" class="btn btn-primary" id="applyFilters">
                        <i class="fas fa-filter"></i>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(filterModal);
        filterModal.classList.add('open');
        
        // Event listeners para el modal de filtros
        document.getElementById('closeFilterModal').addEventListener('click', () => {
            filterModal.remove();
        });
        
        document.getElementById('clearFilters').addEventListener('click', () => {
            document.getElementById('filterStatus').value = '';
            document.getElementById('filterDocType').value = '';
            document.getElementById('filterDateFrom').value = '';
            document.getElementById('filterDateTo').value = '';
        });
        
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyAdvancedFilters();
            filterModal.remove();
        });
        
        // Cerrar modal al hacer click fuera
        filterModal.addEventListener('click', (e) => {
            if (e.target.id === 'filterModal') {
                filterModal.remove();
            }
        });
    }
    
    applyAdvancedFilters() {
        const status = document.getElementById('filterStatus').value;
        const docType = document.getElementById('filterDocType').value;
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;
        
        this.filteredClientes = this.clientes.filter(cliente => {
            let matches = true;
            
            if (status && cliente.activo !== (status === 'activo')) {
                matches = false;
            }
            
            if (docType) {
                // Simular tipo de documento basado en longitud del DNI
                const isDNI = cliente.dni.length === 8;
                const isRUC = cliente.dni.length > 8;
                if (docType === 'DNI' && !isDNI) matches = false;
                if (docType === 'RUC' && !isRUC) matches = false;
            }
            
            if (dateFrom && cliente.fechaCreacion) {
                const clienteDate = new Date(cliente.fechaCreacion).toISOString().split('T')[0];
                if (clienteDate < dateFrom) matches = false;
            }
            
            if (dateTo && cliente.fechaCreacion) {
                const clienteDate = new Date(cliente.fechaCreacion).toISOString().split('T')[0];
                if (clienteDate > dateTo) matches = false;
            }
            
            return matches;
        });
        
        this.currentPage = 0;
        this.loadClientes();
    }
    
    setupPreviewListeners() {
        // Event listeners para actualizar vista previa en tiempo real
        const formFields = [
            'clientName',
            'clientLastName', 
            'clientDocType',
            'clientDocNumber',
            'clientEmail',
            'clientPhone',
            'clientAddress'
        ];
        
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updatePreview();
                    this.validateField(fieldId);
                });
                field.addEventListener('change', () => {
                    this.updatePreview();
                    this.validateField(fieldId);
                });
            }
        });
        
        // Validación especial para DNI/RUC
        const docNumberField = document.getElementById('clientDocNumber');
        if (docNumberField) {
            docNumberField.addEventListener('input', () => {
                this.validateDocumentNumber();
            });
        }
    }
    
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        // Remover clases de error previas
        field.classList.remove('error');
        
        // Validaciones específicas por campo
        switch(fieldId) {
            case 'clientName':
            case 'clientLastName':
                if (!value) {
                    field.classList.add('error');
                }
                break;
            case 'clientEmail':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    field.classList.add('error');
                }
                break;
            case 'clientDocNumber':
                if (value && !/^\d+$/.test(value)) {
                    field.classList.add('error');
                }
                break;
        }
        
        // Mostrar/ocultar mensajes de ayuda
        this.updateFieldHelp(fieldId, value);
    }
    
    updateFieldHelp(fieldId, value) {
        // Remover mensajes de ayuda previos
        const existingHelp = document.querySelector(`#${fieldId}-help`);
        if (existingHelp) {
            existingHelp.remove();
        }
        
        let helpText = '';
        let helpClass = 'help-text';
        
        switch(fieldId) {
            case 'clientName':
            case 'clientLastName':
                if (!value) {
                    helpText = 'Este campo es obligatorio';
                    helpClass = 'help-text error';
                }
                break;
            case 'clientEmail':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    helpText = 'Formato de email inválido';
                    helpClass = 'help-text error';
                } else if (value) {
                    helpText = 'Formato válido';
                    helpClass = 'help-text success';
                }
                break;
            case 'clientDocNumber':
                const docType = document.getElementById('clientDocType').value;
                if (value && !/^\d+$/.test(value)) {
                    helpText = 'Solo se permiten números';
                    helpClass = 'help-text error';
                } else if (value && docType === 'DNI' && value.length !== 8) {
                    helpText = 'El DNI debe tener 8 dígitos';
                    helpClass = 'help-text error';
                } else if (value && docType === 'RUC' && value.length < 9) {
                    helpText = 'El RUC debe tener al menos 9 dígitos';
                    helpClass = 'help-text error';
                } else if (value && docType) {
                    helpText = 'Formato válido';
                    helpClass = 'help-text success';
                }
                break;
        }
        
        if (helpText) {
            const helpElement = document.createElement('div');
            helpElement.id = `${fieldId}-help`;
            helpElement.className = helpClass;
            helpElement.textContent = helpText;
            
            const field = document.getElementById(fieldId);
            field.parentNode.appendChild(helpElement);
        }
    }
    
    validateDocumentNumber() {
        const docType = document.getElementById('clientDocType').value;
        const docNumber = document.getElementById('clientDocNumber').value.trim();
        const docNumberField = document.getElementById('clientDocNumber');
        
        docNumberField.classList.remove('error');
        
        if (docNumber) {
            if (docType === 'DNI' && docNumber.length !== 8) {
                docNumberField.classList.add('error');
            } else if (docType === 'RUC' && docNumber.length < 9) {
                docNumberField.classList.add('error');
            }
        }
    }
    
    updatePreview() {
        const nombre = document.getElementById('clientName').value.trim();
        const apellido = document.getElementById('clientLastName').value.trim();
        const docType = document.getElementById('clientDocType').value;
        const docNumber = document.getElementById('clientDocNumber').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const address = document.getElementById('clientAddress').value.trim();
        
        // Actualizar nombre completo
        const fullName = `${nombre} ${apellido}`.trim() || 'Nombre del Cliente';
        document.getElementById('previewClientName').textContent = fullName;
        
        // Actualizar detalles del documento
        const docDetails = docType && docNumber ? `${docType} - ${docNumber}` : 'Tipo Doc. - Nro Documento';
        document.getElementById('previewClientDetails').textContent = docDetails;
        
        // Actualizar email
        const emailText = email ? `Email: ${email}` : 'Email: --';
        document.getElementById('previewEmail').textContent = emailText;
        
        // Actualizar teléfono
        const phoneText = phone ? `Teléfono: ${phone}` : 'Teléfono: --';
        document.getElementById('previewPhone').textContent = phoneText;
        
        // Actualizar dirección
        const addressText = address ? `Dirección: ${address}` : 'Dirección: --';
        document.getElementById('previewAddress').textContent = addressText;
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else {
            notification.style.backgroundColor = '#dc3545';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const addClientBtn = document.getElementById("addClientBtn");
    const clientModal = document.getElementById("clientModal");
    const closeModal = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");
    const clientForm = document.getElementById("clientForm");

    // Abrir el modal al hacer clic en "Nuevo Cliente"
    addClientBtn.addEventListener("click", () => {
        clientModal.style.display = "block";
        clientForm.reset(); // Reinicia el formulario
        document.getElementById("modalTitle").textContent = "Nuevo Cliente";
    });

    // Cerrar el modal al hacer clic en el botón de cerrar
    closeModal.addEventListener("click", () => {
        clientModal.style.display = "none";
    });

    // Cerrar el modal al hacer clic en el botón "Cancelar"
    cancelBtn.addEventListener("click", () => {
        clientModal.style.display = "none"; // Cierra el modal
    });

    // Cerrar el modal al hacer clic fuera del contenido del modal
    window.addEventListener("click", (event) => {
        if (event.target === clientModal) {
            clientModal.style.display = "none";
        }
    });
});

// Agregar estilos CSS para las notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
