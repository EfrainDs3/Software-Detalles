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
        document.getElementById('closeClient').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Botón guardar cliente
        document.getElementById('saveClient').addEventListener('click', () => {
            this.saveCliente();
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
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="client-checkbox" data-id="${cliente.id}">
                </td>
                <td>
                    <span class="badge-id">${cliente.id}</span>
                </td>
                <td>${cliente.nombre}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.email}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon btn-view" onclick="clienteManager.viewCliente(${cliente.id})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="clienteManager.editCliente(${cliente.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="clienteManager.deleteCliente(${cliente.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
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
        const title = document.querySelector('.modal-title');
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
        
        modal.classList.add('open');
    }
    
    closeModal() {
        const modal = document.getElementById('clientModal');
        modal.classList.remove('open');
        this.isEditMode = false;
        this.currentClienteId = null;
        document.getElementById('clientForm').reset();
        
        // Habilitar todos los campos
        const inputs = document.querySelectorAll('#clientForm input');
        inputs.forEach(input => input.disabled = false);
        document.getElementById('saveClient').style.display = 'inline-flex';
    }
    
    fillForm(cliente) {
        document.getElementById('clientId').value = cliente.id;
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('dni').value = cliente.dni;
        document.getElementById('email').value = cliente.email;
        document.getElementById('telefono').value = cliente.telefono || '';
        document.getElementById('direccion').value = cliente.direccion || '';
    }
    
    saveCliente() {
        const formData = {
            nombre: document.getElementById('nombre').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim()
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
            const inputs = document.querySelectorAll('#clientForm input');
            inputs.forEach(input => input.disabled = true);
            document.getElementById('saveClient').style.display = 'none';
        }
    }
    
    editCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            this.openModal(cliente);
            // Habilitar campos para edición
            const inputs = document.querySelectorAll('#clientForm input');
            inputs.forEach(input => input.disabled = false);
            document.getElementById('saveClient').style.display = 'inline-flex';
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
    window.clienteManager = new ClienteManager();
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
