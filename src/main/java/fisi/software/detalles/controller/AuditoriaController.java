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
// Auditoria module removed. The controller is kept as a stub to avoid 404s from hard-coded links.
// All UI and sidebar entries for auditoria were removed. If any legacy route reaches here,
// redirect to the dashboard.
@Controller
public class AuditoriaController {
    @GetMapping("/auditoria")
    public String removedAuditoria() {
        return "redirect:/dashboard";
    }
}
