package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de productos (calzados, accesorios y catálogos)
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/productos")
public class ProductosController {
    
    /**
     * Muestra la página de gestión de calzados
     * 
     * @return Vista de calzados
     */
    @GetMapping("/calzados")
    public String showCalzados() {
        return "software/productos/calzados";
    }
    
    /**
     * Muestra la página de gestión de accesorios
     * 
     * @return Vista de accesorios
     */
    @GetMapping("/accesorios")
    public String showAccesorios() {
        return "software/productos/accesorios";
    }
    
    /**
     * Muestra la página de catálogos de productos
     * 
     * @return Vista de catálogos
     */
    @GetMapping("/catalogos")
    public String showCatalogos() {
        return "software/productos/catalogos";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /productos/api/calzados - Listar calzados
    // - POST /productos/api/calzados - Crear calzado
    // - PUT /productos/api/calzados/{id} - Actualizar calzado
    // - DELETE /productos/api/calzados/{id} - Eliminar calzado
    // - GET /productos/api/accesorios - Listar accesorios
    // - POST /productos/api/accesorios - Crear accesorio
    // - GET /productos/api/catalogos - Listar catálogos
    // - POST /productos/api/catalogos - Crear catálogo
}
