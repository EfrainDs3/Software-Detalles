package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controlador para la auditoría del sistema
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/auditoria")
public class AuditoriaController {
    
    /**
     * Muestra la página de auditoría del sistema
     * 
     * @return Vista de auditoría
     */
    @GetMapping
    public String showAuditoria() {
        return "software/auditoria/auditoria";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /auditoria/api/logs - Listar logs de auditoría
    // - GET /auditoria/api/logs/{id} - Detalle de un log
    // - GET /auditoria/api/logs/usuario/{id} - Logs por usuario
    // - GET /auditoria/api/logs/accion/{tipo} - Logs por tipo de acción
    // - GET /auditoria/api/accesos - Registro de accesos al sistema
    // - GET /auditoria/api/cambios - Historial de cambios
    // - POST /auditoria/api/exportar - Exportar logs de auditoría
}
