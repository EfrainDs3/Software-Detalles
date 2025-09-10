// Módulo de usuarios

// variables
let users = [
    {
        id: '001',
        name: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        role: 'admin',
        status: 'active',
        phone: '+51 999 888 777',
        lastAccess: '2024-01-15 14:30'
    },
    {
        id: '002',
        name: 'María García',
        email: 'maria.garcia@empresa.com',
        role: 'user',
        status: 'active',
        phone: '+51 999 777 666',
        lastAccess: '2024-01-15 12:15'
    },
    {
        id: '003',
        name: 'Carlos López',
        email: 'carlos.lopez@empresa.com',
        role: 'manager',
        status: 'inactive',
        phone: '+51 999 666 555',
        lastAccess: '2024-01-10 09:45'
    }
];

let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    // usuarios
    initUsuariosModule();
    // carga para usuarios
    loadUsers();
});

function initUsuariosModule() {
    // Get DOM
    const searchInput = document.getElementById('searchInput');
    const addUserBtn = document.getElementById('addUserBtn');
    const filterBtn = document.getElementById('filterBtn');
    const userModal = document.getElementById('userModal');
    const modalCloseBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const userForm = document.getElementById('userForm');
    const selectAllCheckbox = document.getElementById('selectAll');
    const logoutBtn = document.querySelector('.logout-btn');

    // eventos
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilter);
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (userForm) {
        userForm.addEventListener('submit', handleFormSubmit);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // salir click
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === userModal) {
                closeModal();
            }
        });
    }

    // agregar botón de acción
    addActionButtonListeners();
}

// Load users into table
function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });

    // Update pagination info
    updatePaginationInfo();
}

// Create user row
function createUserRow(user) {
    const row = document.createElement('tr');
    
    const roleText = {
        'admin': 'Administrador',
        'manager': 'Gerente',
        'user': 'Usuario'
    };
    
    const statusText = {
        'active': 'Activo',
        'inactive': 'Inactivo'
    };
    
    const roleClass = {
        'admin': 'badge-admin',
        'manager': 'badge-manager',
        'user': 'badge-user'
    };
    
    const statusClass = {
        'active': 'badge-active',
        'inactive': 'badge-inactive'
    };

    row.innerHTML = `
        <td><input type="checkbox" class="user-checkbox" data-user-id="${user.id}"></td>
        <td>${user.id}</td>
        <td>
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <span class="user-name">${user.name}</span>
                </div>
            </div>
        </td>
        <td>${user.email}</td>
        <td><span class="badge ${roleClass[user.role]}">${roleText[user.role]}</span></td>
        <td><span class="badge ${statusClass[user.status]}">${statusText[user.status]}</span></td>
        <td>${user.lastAccess}</td>
        <td>
            <div class="action-buttons-cell">
                <button class="btn-icon btn-edit" title="Editar" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" title="Eliminar" data-user-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon btn-view" title="Ver detalles" data-user-id="${user.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#usersTableBody tr');

    tableRows.forEach(row => {
        const userName = row.querySelector('.user-name')?.textContent.toLowerCase() || '';
        const userEmail = row.cells[3]?.textContent.toLowerCase() || '';
        const userRole = row.cells[4]?.textContent.toLowerCase() || '';

        if (userName.includes(searchTerm) || 
            userEmail.includes(searchTerm) || 
            userRole.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter functionality
function handleFilter() {
    const filterModal = createFilterModal();
    document.body.appendChild(filterModal);
}

function createFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Filtros de Usuarios</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filterRole">Rol</label>
                        <select id="filterRole">
                            <option value="">Todos los roles</option>
                            <option value="admin">Administrador</option>
                            <option value="manager">Gerente</option>
                            <option value="user">Usuario</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filterStatus">Estado</label>
                        <select id="filterStatus">
                            <option value="">Todos los estados</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="applyFilters()">Aplicar Filtros</button>
            </div>
        </div>
    `;
    
    return modal;
}

function applyFilters() {
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filteredUsers = users;
    
    if (roleFilter) {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter) {
        filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
    }
    
    // Update table with filtered data
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
    
    // Close modal
    document.querySelector('.modal').remove();
    
    // Re-add event listeners
    addActionButtonListeners();
    
    showNotification(`Filtros aplicados: ${filteredUsers.length} usuarios encontrados`);
}

// Modal functions
function openAddUserModal() {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    if (modalTitle) {
        modalTitle.textContent = 'Nuevo Usuario';
    }

    if (form) {
        form.reset();
        // Remove any existing user ID
        const existingId = form.querySelector('input[name="id"]');
        if (existingId) {
            existingId.remove();
        }
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function openEditUserModal(userId) {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    if (modalTitle) {
        modalTitle.textContent = 'Editar Usuario';
    }

    if (form) {
        form.reset();
        
        // Add hidden input for user ID
        const existingId = form.querySelector('input[name="id"]');
        if (existingId) {
            existingId.remove();
        }
        
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = userId;
        form.appendChild(idInput);

        // Populate form with user data (mock data for now)
        populateUserForm(userId);
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateForm(userData)) {
        return;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
    }

    // Simulate API call
    setTimeout(() => {
        if (userData.id) {
            updateUser(userData);
        } else {
            createUser(userData);
        }
        
        // Reset button
        if (saveBtn) {
            saveBtn.innerHTML = 'Guardar';
            saveBtn.disabled = false;
        }
        
        closeModal();
    }, 1500);
}

function validateForm(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Ingrese un email válido');
    }

    if (!data.role) {
        errors.push('Seleccione un rol');
    }

    if (!data.password || data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (data.password !== data.confirmPassword) {
        errors.push('Las contraseñas no coinciden');
    }

    if (errors.length > 0) {
        alert('Errores en el formulario:\n' + errors.join('\n'));
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// User CRUD operations
function createUser(userData) {
    // Generate new ID
    const newId = String(users.length + 1).padStart(3, '0');
    
    // Create new user object
    const newUser = {
        id: newId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        phone: userData.phone || '',
        lastAccess: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Add to users array
    users.push(newUser);
    
    // Refresh table
    loadUsers();
    
    showNotification('Usuario creado exitosamente', 'success');
}

function updateUser(userData) {
    // Find user index
    const userIndex = users.findIndex(user => user.id === userData.id);
    
    if (userIndex !== -1) {
        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            phone: userData.phone || ''
        };
        
        // Refresh table
        loadUsers();
        
        showNotification('Usuario actualizado exitosamente', 'success');
    }
}

function deleteUser(userId) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        // Find user index
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            // Remove user from array
            users.splice(userIndex, 1);
            
            // Refresh table
            loadUsers();
            
            showNotification('Usuario eliminado exitosamente', 'success');
        }
    }
}

function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    
    if (user) {
        const viewModal = createViewUserModal(user);
        document.body.appendChild(viewModal);
    }
}

function createViewUserModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const roleText = {
        'admin': 'Administrador',
        'manager': 'Gerente',
        'user': 'Usuario'
    };
    
    const statusText = {
        'active': 'Activo',
        'inactive': 'Inactivo'
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detalles del Usuario</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="user-details-view">
                    <div class="user-avatar-large">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info-details">
                        <h4>${user.name}</h4>
                        <p><strong>ID:</strong> ${user.id}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Rol:</strong> ${roleText[user.role]}</p>
                        <p><strong>Estado:</strong> ${statusText[user.status]}</p>
                        <p><strong>Teléfono:</strong> ${user.phone || 'No especificado'}</p>
                        <p><strong>Último Acceso:</strong> ${user.lastAccess}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="openEditUserModal('${user.id}'); this.closest('.modal').remove();">Editar Usuario</button>
            </div>
        </div>
    `;
    
    return modal;
}

// Table management
function refreshUsersTable() {
    loadUsers();
}

function populateUserForm(userId) {
    // Mock data - in real app, fetch from API
    const mockUserData = {
        '001': {
            name: 'Juan Pérez',
            email: 'juan.perez@empresa.com',
            role: 'admin',
            status: 'active',
            phone: '+51 999 888 777'
        },
        '002': {
            name: 'María García',
            email: 'maria.garcia@empresa.com',
            role: 'user',
            status: 'active',
            phone: '+51 999 777 666'
        },
        '003': {
            name: 'Carlos López',
            email: 'carlos.lopez@empresa.com',
            role: 'manager',
            status: 'inactive',
            phone: '+51 999 666 555'
        }
    };

    const userData = mockUserData[userId];
    if (userData) {
        document.getElementById('userName').value = userData.name;
        document.getElementById('userEmail').value = userData.email;
        document.getElementById('userRole').value = userData.role;
        document.getElementById('userStatus').value = userData.status;
        document.getElementById('userPhone').value = userData.phone;
        
        // Clear password fields for edit
        document.getElementById('userPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('userPassword').required = false;
        document.getElementById('confirmPassword').required = false;
    }
}

// Checkbox management
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

function handleIndividualCheckbox() {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    
    if (checkedCount === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedCount === checkboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
    }
}

// Action button listeners
function addActionButtonListeners() {
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const viewButtons = document.querySelectorAll('.btn-view');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');

    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            openEditUserModal(userId);
        });
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            deleteUser(userId);
        });
    });

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            viewUser(userId);
        });
    });

    // Add event listeners to individual checkboxes
    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });
}

// Logout functionality
function handleLogout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        showNotification('Sesión cerrada exitosamente', 'success');
        // Redirect to login page or dashboard
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    }
}

// Update pagination info
function updatePaginationInfo() {
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        const totalUsers = users.length;
        paginationInfo.textContent = `Mostrando 1-${totalUsers} de ${totalUsers} usuarios`;
    }
}

// Utility functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
