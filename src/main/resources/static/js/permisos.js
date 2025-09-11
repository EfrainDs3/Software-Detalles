// permisos.js - Funcionalidades para la gestión de permisos

document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidad para seleccionar todos los checkboxes
    const selectAllCheckbox = document.getElementById('selectAll');
    const permissionCheckboxes = document.querySelectorAll('.permission-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            permissionCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

    // Actualizar el checkbox "Seleccionar todo" cuando se cambian los checkboxes individuales
    permissionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(permissionCheckboxes).every(cb => cb.checked);
            const noneChecked = Array.from(permissionCheckboxes).every(cb => !cb.checked);
            
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
            }
        });
    });

    // Funcionalidad de búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.permissions-table tbody tr');
            
            tableRows.forEach(row => {
                const id = row.querySelector('.badge-id').textContent.toLowerCase();
                const name = row.cells[2].textContent.toLowerCase();
                const description = row.querySelector('.badge-description').textContent.toLowerCase();
                
                if (id.includes(searchTerm) || name.includes(searchTerm) || description.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});
