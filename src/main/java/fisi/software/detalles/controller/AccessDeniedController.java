package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;

import fisi.software.detalles.security.CustomAccessDeniedHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * Controlador para mostrar mensajes amigables cuando el usuario carece de permisos.
 */
@Controller
public class AccessDeniedController {

    private static final String DEFAULT_MESSAGE = "No cuentas con permisos suficientes para acceder a este módulo.";

    @GetMapping("/acceso-denegado")
    public String mostrarAccesoDenegado(HttpServletRequest request, Model model) {
        HttpSession session = request.getSession(false);
        String message = DEFAULT_MESSAGE;

        if (session != null) {
            Object attribute = session.getAttribute(CustomAccessDeniedHandler.ACCESS_DENIED_MESSAGE_KEY);
            if (attribute instanceof String texto && StringUtils.hasText(texto)) {
                message = texto;
            }
            session.removeAttribute(CustomAccessDeniedHandler.ACCESS_DENIED_MESSAGE_KEY);
        }

        model.addAttribute("mensaje", message);
        return "error/acceso-denegado";
    }
}
