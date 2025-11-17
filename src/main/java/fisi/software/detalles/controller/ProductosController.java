package fisi.software.detalles.controller;

import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).VER_CALZADOS, T(fisi.software.detalles.security.Permisos).MODULO_PRODUCTOS, T(fisi.software.detalles.security.Permisos).MODULO_INVENTARIO)")
    public String showCalzados() {
        return "software/productos/calzados";
    }
    
    /**
     * Muestra la página de gestión de accesorios
     * 
     * @return Vista de accesorios
     */
    @GetMapping("/accesorios")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).VER_ACCESORIOS, T(fisi.software.detalles.security.Permisos).MODULO_PRODUCTOS, T(fisi.software.detalles.security.Permisos).MODULO_INVENTARIO)")
    public String showAccesorios() {
        return "software/productos/accesorios";
    }
    
    /**
     * Muestra la página de catálogos de productos
     * 
     * @return Vista de catálogos
     */
    @GetMapping("/catalogos")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).VER_CATALOGOS_MAESTROS, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS, T(fisi.software.detalles.security.Permisos).MODULO_PRODUCTOS)")
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
