package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de ventas y caja
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/ventas")
public class VentasController {
    
    /**
     * Muestra la página de gestión de ventas
     * 
     * @return Vista de ventas
     */
    @GetMapping
    public String showVentas() {
        return "software/ventas/ventas";
    }
    
    /**
     * Muestra la página de punto de venta (caja)
     * 
     * @return Vista de caja
     */
    @GetMapping("/caja")
    public String showCaja() {
        return "software/ventas/caja";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /ventas/api - Listar ventas
    // - GET /ventas/api/{id} - Obtener venta por ID
    // - POST /ventas/api - Registrar nueva venta
    // - PUT /ventas/api/{id} - Actualizar venta
    // - DELETE /ventas/api/{id} - Anular venta
    // - GET /ventas/api/caja/estado - Estado de caja
    // - POST /ventas/api/caja/abrir - Abrir caja
    // - POST /ventas/api/caja/cerrar - Cerrar caja
    // - GET /ventas/api/caja/movimientos - Movimientos de caja
}
