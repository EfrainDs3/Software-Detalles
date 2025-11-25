// Reportes Module JavaScript

(function() {
    const API_BASE = '/api/reportes';
    
    let currentReportType = 'ventas';
    let currentChart = null;
    let currentReportData = null;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupEventListeners();
        setDefaultDates();
        loadFilterOptions();
    }

    function setupEventListeners() {
        // Selector de tipo de reporte
        document.querySelectorAll('.report-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                selectReportType(e.currentTarget.dataset.type);
            });
        });

        // Toggle de filtros
        document.getElementById('toggleFilters')?.addEventListener('click', toggleFilters);

        // Botones de acción
        document.getElementById('generarReporte')?.addEventListener('click', generateReport);
        document.getElementById('limpiarFiltros')?.addEventListener('click', clearFilters);
        document.getElementById('exportarPDF')?.addEventListener('click', exportToPDF);
    }

    function selectReportType(type) {
        currentReportType = type;
        
        // Actualizar botones
        document.querySelectorAll('.report-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // Mostrar/ocultar filtros según el tipo
        updateFilterVisibility(type);
        
        // Limpiar visualización
        hideReportVisualization();
    }

    function updateFilterVisibility(type) {
        // Ocultar todos los filtros opcionales
        document.getElementById('almacenFilter').style.display = 'none';
        document.getElementById('productoFilter').style.display = 'none';
        document.getElementById('clienteFilter').style.display = 'none';
        document.getElementById('proveedorFilter').style.display = 'none';

        // Mostrar filtros según el tipo
        switch(type) {
            case 'inventario':
                document.getElementById('almacenFilter').style.display = 'block';
                document.getElementById('productoFilter').style.display = 'block';
                break;
            case 'clientes':
                document.getElementById('clienteFilter').style.display = 'block';
                break;
            case 'compras':
                document.getElementById('proveedorFilter').style.display = 'block';
                break;
        }
    }

    function toggleFilters() {
        const content = document.getElementById('filtersContent');
        const icon = document.querySelector('#toggleFilters i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            content.style.display = 'none';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }

    function setDefaultDates() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('fechaInicio').value = formatDate(firstDay);
        document.getElementById('fechaFin').value = formatDate(today);
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async function loadFilterOptions() {
        // Cargar opciones para los filtros (almacenes, productos, clientes, proveedores)
        // Esto se puede expandir según sea necesario
        try {
            // Placeholder - en producción cargarías datos reales
            console.log('Cargando opciones de filtros...');
        } catch (error) {
            console.error('Error cargando opciones:', error);
        }
    }

    function getFilters() {
        return {
            fechaInicio: document.getElementById('fechaInicio').value || null,
            fechaFin: document.getElementById('fechaFin').value || null,
            almacenId: document.getElementById('almacenId').value || null,
            productoId: document.getElementById('productoId').value || null,
            clienteId: document.getElementById('clienteId').value || null,
            proveedorId: document.getElementById('proveedorId').value || null
        };
    }

    function clearFilters() {
        setDefaultDates();
        document.getElementById('almacenId').value = '';
        document.getElementById('productoId').value = '';
        document.getElementById('clienteId').value = '';
        document.getElementById('proveedorId').value = '';
        hideReportVisualization();
    }

    async function generateReport() {
        const filters = getFilters();
        showLoading();

        try {
            const response = await fetch(`${API_BASE}/${currentReportType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            });

            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }

            const data = await response.json();
            currentReportData = data;
            
            renderReport(data);
            showReportVisualization();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar el reporte. Por favor, intenta nuevamente.');
        } finally {
            hideLoading();
        }
    }

    function renderReport(data) {
        switch(currentReportType) {
            case 'ventas':
                renderVentasReport(data);
                break;
            case 'inventario':
                renderInventarioReport(data);
                break;
            case 'financiero':
                renderFinancieroReport(data);
                break;
            case 'clientes':
                renderClientesReport(data);
                break;
            case 'compras':
                renderComprasReport(data);
                break;
        }
    }

    function renderVentasReport(data) {
        // Resumen
        const summaryHTML = `
            <div class="summary-card">
                <i class="fas fa-dollar-sign"></i>
                <div class="summary-content">
                    <span class="summary-label">Total Ventas</span>
                    <span class="summary-value">S/ ${formatNumber(data.totalVentas)}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-shopping-cart"></i>
                <div class="summary-content">
                    <span class="summary-label">Cantidad Ventas</span>
                    <span class="summary-value">${data.cantidadVentas}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-receipt"></i>
                <div class="summary-content">
                    <span class="summary-label">Ticket Promedio</span>
                    <span class="summary-value">S/ ${formatNumber(data.ticketPromedio)}</span>
                </div>
            </div>
        `;
        document.getElementById('reportSummary').innerHTML = summaryHTML;

        // Gráfico
        document.getElementById('chartTitle').textContent = 'Distribución de Ventas por Categoría';
        renderPieChart(data.distribucionPorCategoria);

        // Tabla
        document.getElementById('tableTitle').textContent = 'Ventas por Producto (Top 10)';
        renderVentasTable(data.ventasPorProducto);
    }

    function renderInventarioReport(data) {
        const summaryHTML = `
            <div class="summary-card">
                <i class="fas fa-boxes"></i>
                <div class="summary-content">
                    <span class="summary-label">Total Productos</span>
                    <span class="summary-value">${data.totalProductos}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-cubes"></i>
                <div class="summary-content">
                    <span class="summary-label">Total Unidades</span>
                    <span class="summary-value">${data.totalUnidades}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-dollar-sign"></i>
                <div class="summary-content">
                    <span class="summary-label">Valor Total</span>
                    <span class="summary-value">S/ ${formatNumber(data.valorTotalInventario)}</span>
                </div>
            </div>
        `;
        document.getElementById('reportSummary').innerHTML = summaryHTML;

        document.getElementById('chartTitle').textContent = 'Distribución de Stock por Categoría';
        renderPieChart(data.distribucionPorCategoria);

        document.getElementById('tableTitle').textContent = 'Productos con Stock Bajo';
        renderInventarioTable(data.productosStockBajo);
    }

    function renderFinancieroReport(data) {
        const summaryHTML = `
            <div class="summary-card">
                <i class="fas fa-arrow-up"></i>
                <div class="summary-content">
                    <span class="summary-label">Ingresos</span>
                    <span class="summary-value text-success">S/ ${formatNumber(data.totalIngresos)}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-arrow-down"></i>
                <div class="summary-content">
                    <span class="summary-label">Egresos</span>
                    <span class="summary-value text-danger">S/ ${formatNumber(data.totalEgresos)}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-chart-line"></i>
                <div class="summary-content">
                    <span class="summary-label">Utilidad Bruta</span>
                    <span class="summary-value">S/ ${formatNumber(data.utilidadBruta)}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-percentage"></i>
                <div class="summary-content">
                    <span class="summary-label">Margen</span>
                    <span class="summary-value">${formatNumber(data.margenUtilidad)}%</span>
                </div>
            </div>
        `;
        document.getElementById('reportSummary').innerHTML = summaryHTML;

        document.getElementById('chartTitle').textContent = 'Ingresos vs Egresos';
        renderPieChart(data.distribucionIngresosEgresos);

        // Ocultar tabla para reporte financiero
        document.querySelector('.data-table-container').style.display = 'none';
    }

    function renderClientesReport(data) {
        const summaryHTML = `
            <div class="summary-card">
                <i class="fas fa-users"></i>
                <div class="summary-content">
                    <span class="summary-label">Total Clientes</span>
                    <span class="summary-value">${data.totalClientes}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-user-check"></i>
                <div class="summary-content">
                    <span class="summary-label">Clientes Activos</span>
                    <span class="summary-value">${data.clientesActivos}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-receipt"></i>
                <div class="summary-content">
                    <span class="summary-label">Ticket Promedio</span>
                    <span class="summary-value">S/ ${formatNumber(data.ticketPromedio)}</span>
                </div>
            </div>
        `;
        document.getElementById('reportSummary').innerHTML = summaryHTML;

        document.getElementById('chartTitle').textContent = 'Top 5 Clientes';
        renderPieChart(data.distribucionPorCliente);

        document.getElementById('tableTitle').textContent = 'Clientes con Más Compras';
        renderClientesTable(data.clientesTop);
    }

    function renderComprasReport(data) {
        const summaryHTML = `
            <div class="summary-card">
                <i class="fas fa-truck"></i>
                <div class="summary-content">
                    <span class="summary-label">Total Compras</span>
                    <span class="summary-value">S/ ${formatNumber(data.totalCompras)}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-shopping-bag"></i>
                <div class="summary-content">
                    <span class="summary-label">Cantidad</span>
                    <span class="summary-value">${data.cantidadCompras}</span>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-calculator"></i>
                <div class="summary-content">
                    <span class="summary-label">Costo Promedio</span>
                    <span class="summary-value">S/ ${formatNumber(data.costoPromedio)}</span>
                </div>
            </div>
        `;
        document.getElementById('reportSummary').innerHTML = summaryHTML;

        document.getElementById('chartTitle').textContent = 'Distribución por Proveedor';
        renderPieChart(data.distribucionPorProveedor);

        document.getElementById('tableTitle').textContent = 'Compras por Proveedor';
        renderComprasTable(data.comprasPorProveedor);
    }

    function renderPieChart(data) {
        const ctx = document.getElementById('reportChart');
        
        // Destruir gráfico anterior si existe
        if (currentChart) {
            currentChart.destroy();
        }

        const labels = Object.keys(data);
        const values = Object.values(data);

        currentChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107',
                        '#FF5722',
                        '#9C27B0',
                        '#00BCD4',
                        '#FF9800'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${formatNumber(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderVentasTable(data) {
        document.querySelector('.data-table-container').style.display = 'block';
        
        const thead = `
            <tr>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
                <th>Total Ventas</th>
            </tr>
        `;
        
        const tbody = data.map(item => `
            <tr>
                <td>${item.nombreProducto}</td>
                <td>${item.cantidadVendida}</td>
                <td>S/ ${formatNumber(item.totalVentas)}</td>
            </tr>
        `).join('');

        document.getElementById('reportTableHead').innerHTML = thead;
        document.getElementById('reportTableBody').innerHTML = tbody;
    }

    function renderInventarioTable(data) {
        document.querySelector('.data-table-container').style.display = 'block';
        
        const thead = `
            <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
            </tr>
        `;
        
        const tbody = data.map(item => `
            <tr>
                <td>${item.nombreProducto}</td>
                <td>${item.stockActual}</td>
                <td>${item.stockMinimo}</td>
                <td><span class="badge badge-${item.estado === 'Crítico' ? 'danger' : 'warning'}">${item.estado}</span></td>
            </tr>
        `).join('');

        document.getElementById('reportTableHead').innerHTML = thead;
        document.getElementById('reportTableBody').innerHTML = tbody;
    }

    function renderClientesTable(data) {
        document.querySelector('.data-table-container').style.display = 'block';
        
        const thead = `
            <tr>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Compras</th>
                <th>Total</th>
            </tr>
        `;
        
        const tbody = data.map(item => `
            <tr>
                <td>${item.nombreCliente}</td>
                <td>${item.documento}</td>
                <td>${item.cantidadCompras}</td>
                <td>S/ ${formatNumber(item.totalCompras)}</td>
            </tr>
        `).join('');

        document.getElementById('reportTableHead').innerHTML = thead;
        document.getElementById('reportTableBody').innerHTML = tbody;
    }

    function renderComprasTable(data) {
        document.querySelector('.data-table-container').style.display = 'block';
        
        const thead = `
            <tr>
                <th>Proveedor</th>
                <th>RUC</th>
                <th>Cantidad Compras</th>
                <th>Total</th>
            </tr>
        `;
        
        const tbody = data.map(item => `
            <tr>
                <td>${item.nombreProveedor}</td>
                <td>${item.ruc}</td>
                <td>${item.cantidadCompras}</td>
                <td>S/ ${formatNumber(item.totalCompras)}</td>
            </tr>
        `).join('');

        document.getElementById('reportTableHead').innerHTML = thead;
        document.getElementById('reportTableBody').innerHTML = tbody;
    }

    async function exportToPDF() {
        const filters = getFilters();
        showLoading();

        try {
            const response = await fetch(`${API_BASE}/${currentReportType}/pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            });

            if (!response.ok) {
                throw new Error('Error al exportar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reporte_${currentReportType}_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al exportar el reporte. Por favor, intenta nuevamente.');
        } finally {
            hideLoading();
        }
    }

    function showReportVisualization() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('reportVisualization').style.display = 'block';
    }

    function hideReportVisualization() {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('reportVisualization').style.display = 'none';
    }

    function showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    function hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    function formatNumber(num) {
        if (num === null || num === undefined) return '0.00';
        return parseFloat(num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

})();
