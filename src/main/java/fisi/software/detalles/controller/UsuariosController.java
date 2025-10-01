package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controlador para la gestión de usuarios, roles y permisos
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
public class UsuariosController {
    
    /**
     * Muestra la página de gestión de usuarios
     * 
     * @return Vista de usuarios
     */
    @GetMapping("/usuarios")
    public String showUsuarios() {
        return "software/usuarios/usuario";
    }
    
    /**
     * Muestra la página de gestión de roles
     * 
     * @return Vista de roles
     */
    @GetMapping("/roles")
    public String showRoles() {
        return "software/usuarios/roles";
    }
    
    /**
     * Muestra la página de gestión de permisos
     * 
     * @return Vista de permisos
     */
    @GetMapping("/permisos")
    public String showPermisos() {
        return "software/usuarios/permisos";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /api/usuarios - Listar usuarios
    // - GET /api/usuarios/{id} - Obtener usuario por ID
    // - POST /api/usuarios - Crear usuario
    // - PUT /api/usuarios/{id} - Actualizar usuario
    // - DELETE /api/usuarios/{id} - Eliminar usuario
    // - GET /api/roles - Listar roles
    // - POST /api/roles - Crear rol
    // - PUT /api/roles/{id} - Actualizar rol
    // - DELETE /api/roles/{id} - Eliminar rol
    // - GET /api/permisos - Listar permisos
    // - POST /api/permisos - Asignar permiso a rol
    // - DELETE /api/permisos/{id} - Revocar permiso
}
