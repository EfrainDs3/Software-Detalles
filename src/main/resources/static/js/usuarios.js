// Usuarios Module JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize usuarios module
    initUsuariosModule();
});

function initUsuariosModule() {
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const addUserBtn = document.getElementById('addUserBtn');
    const filterBtn = document.getElementById('filterBtn');
    const userModal = document.getElementById('userModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const userForm = document.getElementById('userForm');
    const selectAllCheckbox = document.getElementById('selectAll');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }

    if (filterBtn) {
        filterBtn.addEventListener('click', handleFilter);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeModal);
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

    // Add event listeners to individual checkboxes
    userCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleIndividualCheckbox);
    });

    // Add event listeners to action buttons
    addActionButtonListeners();

    // Close modal when clicking outside
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === userModal) {
                closeModal();
            }
        });
    }
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
    // Create filter modal or dropdown
    const filterOptions = {
        role: ['Todos', 'Administrador', 'Gerente', 'Usuario'],
        status: ['Todos', 'Activo', 'Inactivo'],
        dateRange: ['Todos', 'Última semana', 'Último mes', 'Último año']
    };

    // For now, show a simple alert
    alert('Funcionalidad de filtros en desarrollo');
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
    console.log('Creating user:', userData);
    // Here you would make an API call to create the user
    alert('Usuario creado exitosamente');
    // Refresh the table
    refreshUsersTable();
}

function updateUser(userData) {
    console.log('Updating user:', userData);
    // Here you would make an API call to update the user
    alert('Usuario actualizado exitosamente');
    // Refresh the table
    refreshUsersTable();
}

function deleteUser(userId) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        console.log('Deleting user:', userId);
        // Here you would make an API call to delete the user
        alert('Usuario eliminado exitosamente');
        // Refresh the table
        refreshUsersTable();
    }
}

function viewUser(userId) {
    console.log('Viewing user:', userId);
    // Here you would navigate to user details page or show user info
    alert('Funcionalidad de ver detalles en desarrollo');
}

// Table management
function refreshUsersTable() {
    // Here you would fetch users from API and update the table
    console.log('Refreshing users table');
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

    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.cells[1].textContent;
            openEditUserModal(userId);
        });
    });

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.cells[1].textContent;
            deleteUser(userId);
        });
    });

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const userId = row.cells[1].textContent;
            viewUser(userId);
        });
    });
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
