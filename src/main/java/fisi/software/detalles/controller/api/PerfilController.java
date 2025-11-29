package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.service.UsuarioService;
import fisi.software.detalles.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final UsuarioService usuarioService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * GET /api/perfil/mis-datos
     * Obtiene los datos del usuario autenticado
     */
    @GetMapping("/mis-datos")
    public ResponseEntity<?> obtenerMisDatos(Authentication auth, jakarta.servlet.http.HttpSession session) {
        Integer userId = null;

        // Intentar obtener el ID del usuario desde Spring Security
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
            userId = principal.getId();
        }
        // Si no hay autenticación Spring, intentar desde la sesión HTTP
        else if (session.getAttribute("USER_ID") != null) {
            userId = (Integer) session.getAttribute("USER_ID");
        }

        // Si no se encontró ID de usuario, retornar error
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        Usuario usuario = usuarioService.obtenerUsuarioConRoles(userId);

        if (usuario == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
        }

        return ResponseEntity.ok(Map.of(
                "id", usuario.getId(),
                "nombres", usuario.getNombres() != null ? usuario.getNombres() : "",
                "apellidos", usuario.getApellidos() != null ? usuario.getApellidos() : "",
                "username", usuario.getUsername(),
                "email", usuario.getEmail(),
                "numeroDocumento", usuario.getNumeroDocumento() != null ? usuario.getNumeroDocumento() : "",
                "celular", usuario.getCelular() != null ? usuario.getCelular() : "",
                "direccion", usuario.getDireccion() != null ? usuario.getDireccion() : ""));
    }

    /**
     * PUT /api/perfil/actualizar
     * Actualiza la información del usuario
     */
    @PutMapping("/actualizar")
    public ResponseEntity<?> actualizarPerfil(
            @RequestBody Map<String, String> datos,
            Authentication auth,
            jakarta.servlet.http.HttpSession session) {

        Integer userId = null;

        // Intentar obtener el ID del usuario desde Spring Security
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
            userId = principal.getId();
        }
        // Si no hay autenticación Spring, intentar desde la sesión HTTP
        else if (session.getAttribute("USER_ID") != null) {
            userId = (Integer) session.getAttribute("USER_ID");
        }

        // Si no se encontró ID de usuario, retornar error
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            Usuario usuario = usuarioService.obtenerUsuarioConRoles(userId);

            if (usuario == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
            }

            // Actualizar campos si están presentes
            if (datos.containsKey("nombres")) {
                usuario.setNombres(datos.get("nombres"));
            }
            if (datos.containsKey("apellidos")) {
                usuario.setApellidos(datos.get("apellidos"));
            }
            if (datos.containsKey("email")) {
                usuario.setEmail(datos.get("email"));
            }
            if (datos.containsKey("numeroDocumento")) {
                usuario.setNumeroDocumento(datos.get("numeroDocumento"));
            }
            if (datos.containsKey("celular")) {
                usuario.setCelular(datos.get("celular"));
            }
            if (datos.containsKey("direccion")) {
                usuario.setDireccion(datos.get("direccion"));
            }

            usuarioService.actualizarUsuario(usuario);

            return ResponseEntity.ok(Map.of("mensaje", "Perfil actualizado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al actualizar el perfil: " + e.getMessage()));
        }
    }

    /**
     * POST /api/perfil/cambiar-password
     * Cambia la contraseña del usuario
     */
    @PostMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(
            @RequestBody Map<String, String> datos,
            Authentication auth,
            jakarta.servlet.http.HttpSession session) {

        Integer userId = null;

        // Intentar obtener el ID del usuario desde Spring Security
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
            userId = principal.getId();
        }
        // Si no hay autenticación Spring, intentar desde la sesión HTTP
        else if (session.getAttribute("USER_ID") != null) {
            userId = (Integer) session.getAttribute("USER_ID");
        }

        // Si no se encontró ID de usuario, retornar error
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String passwordActual = datos.get("passwordActual");
        String passwordNueva = datos.get("passwordNueva");

        if (passwordActual == null || passwordActual.isEmpty() ||
                passwordNueva == null || passwordNueva.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Faltan campos requeridos"));
        }

        try {
            Usuario usuario = usuarioService.obtenerUsuarioConRoles(userId);

            if (usuario == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
            }

            // Verificar que la contraseña actual sea correcta
            if (!passwordEncoder.matches(passwordActual, usuario.getPasswordHash())) {
                return ResponseEntity.status(400).body(Map.of("error", "La contraseña actual es incorrecta"));
            }

            // Actualizar la contraseña
            String nuevaPasswordHash = passwordEncoder.encode(passwordNueva);
            usuario.setPasswordHash(nuevaPasswordHash);
            usuarioService.actualizarUsuario(usuario);

            return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error al cambiar la contraseña: " + e.getMessage()));
        }
    }

    /**
     * GET /api/perfil/compras
     * Obtiene el historial de compras del usuario
     */
    @GetMapping("/compras")
    public ResponseEntity<?> obtenerCompras(Authentication auth, jakarta.servlet.http.HttpSession session) {
        Integer userId = null;

        // Intentar obtener el ID del usuario desde Spring Security
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
            userId = principal.getId();
        }
        // Si no hay autenticación Spring, intentar desde la sesión HTTP
        else if (session.getAttribute("USER_ID") != null) {
            userId = (Integer) session.getAttribute("USER_ID");
        }

        // Si no se encontró ID de usuario, retornar error
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            // Por ahora retornamos lista vacía
            // TODO: Implementar cuando tengamos el modelo de pedidos/compras
            return ResponseEntity.ok(Map.of(
                    "compras", java.util.Collections.emptyList(),
                    "mensaje", "Funcionalidad en desarrollo"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener compras: " + e.getMessage()));
        }
    }
}
