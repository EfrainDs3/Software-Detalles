package fisi.software.detalles.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la gestión del dashboard principal
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController {
    
    /**
     * Muestra el dashboard principal del sistema
     * 
     * @return Vista del dashboard
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).ACCEDER_AL_DASHBOARD, T(fisi.software.detalles.security.Permisos).MODULO_DASHBOARD)")
    public String showDashboard() {
        return "dashboard";
    }
    
    // TODO: Implementar endpoints para:
    // - GET /dashboard/stats - Obtener estadísticas del dashboard
    // - GET /dashboard/recent-activities - Actividades recientes
    // - GET /dashboard/notifications - Notificaciones del sistema
}
