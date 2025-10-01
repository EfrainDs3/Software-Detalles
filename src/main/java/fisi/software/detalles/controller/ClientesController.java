package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de clientes
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/clientes")
public class ClientesController {
    
    /**
     * Muestra la página de gestión de clientes
     * 
     * @return Vista de clientes
     */
    @GetMapping
    public String showClientes() {
        return "software/clientes/clientes";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /clientes/api - Listar clientes
    // - GET /clientes/api/{id} - Obtener cliente por ID
    // - POST /clientes/api - Crear cliente
    // - PUT /clientes/api/{id} - Actualizar cliente
    // - DELETE /clientes/api/{id} - Eliminar cliente
    // - GET /clientes/api/search - Buscar clientes
    // - GET /clientes/api/{id}/historial - Historial de compras
}
