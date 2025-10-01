package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de reportes del sistema
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/reportes")
public class ReportesController {
    
    /**
     * Muestra la página de reportes
     * 
     * @return Vista de reportes
     */
    @GetMapping
    public String showReportes() {
        return "software/reportes/reportes";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /reportes/api/ventas - Reporte de ventas
    // - GET /reportes/api/compras - Reporte de compras
    // - GET /reportes/api/inventario - Reporte de inventario
    // - GET /reportes/api/clientes - Reporte de clientes
    // - GET /reportes/api/productos-mas-vendidos - Productos más vendidos
    // - GET /reportes/api/ingresos - Reporte de ingresos
    // - POST /reportes/api/generar - Generar reporte personalizado
    // - GET /reportes/api/exportar/{tipo} - Exportar reporte (PDF, Excel, etc.)
}
