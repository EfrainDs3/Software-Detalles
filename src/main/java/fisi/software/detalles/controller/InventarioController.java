package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de inventario
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/inventario")
public class InventarioController {
    
    /**
     * Muestra la página de gestión de inventario
     * 
     * @return Vista de inventario
     */
    @GetMapping
    public String showInventario() {
        return "software/inventario/inventario";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /inventario/api - Listar inventario completo
    // - GET /inventario/api/{id} - Obtener detalles de producto en inventario
    // - PUT /inventario/api/{id}/ajuste - Ajustar stock
    // - GET /inventario/api/bajo-stock - Productos con bajo stock
    // - GET /inventario/api/movimientos - Movimientos de inventario
    // - POST /inventario/api/transferencia - Transferir entre almacenes
    // - GET /inventario/api/kardex/{id} - Kardex de producto
}
