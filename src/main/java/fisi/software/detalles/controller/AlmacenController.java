package fisi.software.detalles.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión de almacenes
 *
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/almacenes")
public class AlmacenController {

    /**
     * Muestra la página de gestión de almacenes
     *
     * @return Vista de almacenes
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).VER_ALMACENES, T(fisi.software.detalles.security.Permisos).MODULO_ALMACENES, T(fisi.software.detalles.security.Permisos).MODULO_INVENTARIO)")
    public String showAlmacenes() {
        return "software/almacenes/almacenes";
    }
}