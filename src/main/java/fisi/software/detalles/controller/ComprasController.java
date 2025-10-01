package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de compras y proveedores
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/compras")
public class ComprasController {
    
    /**
     * Muestra la página de gestión de compras
     * 
     * @return Vista de compras
     */
    @GetMapping
    public String showCompras() {
        return "software/compras/compras";
    }
    
    /**
     * Muestra la página de gestión de proveedores
     * 
     * @return Vista de proveedores
     */
    @GetMapping("/proveedores")
    public String showProveedores() {
        return "software/compras/proveedores";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /compras/api - Listar compras
    // - GET /compras/api/{id} - Obtener compra por ID
    // - POST /compras/api - Registrar nueva compra
    // - PUT /compras/api/{id} - Actualizar compra
    // - DELETE /compras/api/{id} - Anular compra
    // - GET /compras/api/proveedores - Listar proveedores
    // - POST /compras/api/proveedores - Crear proveedor
    // - PUT /compras/api/proveedores/{id} - Actualizar proveedor
    // - DELETE /compras/api/proveedores/{id} - Eliminar proveedor
}
