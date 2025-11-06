package fisi.software.detalles.controller;

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
    public String showAlmacenes() {
        return "software/almacenes/almacenes";
    }
}