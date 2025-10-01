package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador para la gestión de autenticación y login
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
public class LoginController {
    
    /**
     * Ruta raíz - Redirige a la página de login
     * 
     * @return Redirección al login
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/login";
    }
    
    /**
     * Muestra la página de login
     * 
     * @return Vista de login
     */
    @GetMapping("/login")
    public String showLoginPage() {
        return "software/login";
    }
    
    /**
     * Carga el componente sidebar (navegación lateral)
     * Este componente es compartido por todas las páginas del sistema
     * 
     * @return Vista del sidebar
     */
    @GetMapping("/components/sidebar")
    public String sidebar() {
        return "components/sidebar";
    }
    
    // TODO: Implementar endpoints para:
    // - POST /api/login/authenticate - Autenticar usuario
    // - POST /api/login/logout - Cerrar sesión
    // - GET /api/login/forgot-password - Recuperar contraseña
    // - POST /api/login/refresh-token - Refrescar token JWT
}
