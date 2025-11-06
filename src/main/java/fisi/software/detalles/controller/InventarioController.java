package fisi.software.detalles.controller;

import fisi.software.detalles.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    /**
     * Muestra la página de gestión de inventario
     *
     * @return Vista de inventario
     */
    @GetMapping
    public String showInventario(Model model) {
        // Agregar estadísticas iniciales al modelo
        model.addAttribute("stats", inventarioService.obtenerEstadisticasInventario());
        return "software/inventario/inventario";
    }
}
