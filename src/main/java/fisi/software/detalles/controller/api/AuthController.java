package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.auth.ForgotPasswordResetRequest;
import fisi.software.detalles.controller.dto.auth.ForgotPasswordUserRequest;
import fisi.software.detalles.controller.dto.auth.ForgotPasswordVerifyRequest;
import fisi.software.detalles.controller.dto.auth.LoginRequest;
import fisi.software.detalles.controller.dto.auth.LoginResponse;
import fisi.software.detalles.controller.dto.auth.SimpleMessageResponse;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.security.UsuarioPrincipal;
import fisi.software.detalles.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.Principal;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // Método existente para login autenticado (con Spring Security)
    @PostMapping("/login-spring")
    public ResponseEntity<LoginResponse> loginSpring(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        Usuario usuarioAutenticado = usuarioService.autenticar(request.usernameOrEmail(), request.password());

        UsuarioPrincipal principal = UsuarioPrincipal.fromUsuario(usuarioAutenticado);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            principal.getAuthorities()
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        httpRequest.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return ResponseEntity.ok(LoginResponse.fromEntity(usuarioAutenticado));
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> obtenerSesionActual(Principal principal) {
        if (!(principal instanceof UsuarioPrincipal usuarioPrincipal)) {
            return ResponseEntity.status(401).build();
        }

        var usuario = usuarioService.obtenerUsuarioConRoles(usuarioPrincipal.getId());
        return ResponseEntity.ok(LoginResponse.fromEntity(usuario));
    }

    @PostMapping("/forgot-password/check-user")
    public ResponseEntity<SimpleMessageResponse> checkUser(@Valid @RequestBody ForgotPasswordUserRequest request) {
        usuarioService.validarUsuarioActivo(request.username());
        return ResponseEntity.ok(SimpleMessageResponse.of("Usuario válido"));
    }

    @PostMapping("/forgot-password/verify")
    public ResponseEntity<SimpleMessageResponse> verifyIdentity(@Valid @RequestBody ForgotPasswordVerifyRequest request) {
        usuarioService.verificarDatosRecuperacion(
            request.username(),
            request.nombres(),
            request.apellidos(),
            request.email(),
            request.numeroDocumento()
        );
        return ResponseEntity.ok(SimpleMessageResponse.of("Identidad verificada"));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<SimpleMessageResponse> resetPassword(@Valid @RequestBody ForgotPasswordResetRequest request) {
        usuarioService.restablecerPassword(
            request.username(),
            request.nombres(),
            request.apellidos(),
            request.email(),
            request.numeroDocumento(),
            request.newPassword()
        );
        return ResponseEntity.ok(SimpleMessageResponse.of("Contraseña actualizada correctamente"));
    }

    // Método simple para login desde frontend web (sin Spring Security)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpSession session) {
        String identifier = body.getOrDefault("identifier", "").trim().toLowerCase(Locale.ROOT);
        String password = body.getOrDefault("password", "");
        if (identifier.isEmpty() || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Faltan credenciales"));
        }

        try {
            Map<String, Object> user = jdbcTemplate.queryForMap(
                "SELECT id_usuario, nombres, apellidos, username, email, `contraseña_hash` FROM usuarios WHERE LOWER(email)=? OR LOWER(username)=? LIMIT 1",
                identifier, identifier
            );
            String hash = (String) user.get("contraseña_hash");
            if (hash != null && encoder.matches(password, hash)) {
                // Login OK: guardar id en sesión
                Integer id = ((Number) user.get("id_usuario")).intValue();
                session.setAttribute("USER_ID", id);
                // Preparar respuesta sin el hash
                Map<String, Object> resp = new HashMap<>();
                resp.put("id_usuario", id);
                resp.put("nombres", user.get("nombres"));
                resp.put("apellidos", user.get("apellidos"));
                resp.put("username", user.get("username"));
                resp.put("email", user.get("email"));
                return ResponseEntity.ok(resp);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales inválidas"));
            }
        } catch (org.springframework.dao.EmptyResultDataAccessException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuario no encontrado"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error interno"));
        }
    }

    // Método simple para registro desde frontend web
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body, HttpSession session) {
        String nombres = body.getOrDefault("nombres", "").trim();
        String apellidos = body.getOrDefault("apellidos", "").trim();
        String username = body.getOrDefault("username", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase(Locale.ROOT);
        String password = body.getOrDefault("password", "");

        if (nombres.isEmpty() || email.isEmpty() || password.isEmpty() || username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Faltan campos requeridos"));
        }

        // comprobar existencia
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM usuarios WHERE LOWER(email)=? OR LOWER(username)=?",
            Integer.class, email, username.toLowerCase(Locale.ROOT)
        );
        if (count != null && count > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email o username ya registrado"));
        }

        String hash = encoder.encode(password);
        // Insertar nuevo usuario
        jdbcTemplate.update(
            "INSERT INTO usuarios (nombres, apellidos, username, email, `contraseña_hash`, fecha_creacion) VALUES (?, ?, ?, ?, ?, NOW())",
            nombres, apellidos, username, email, hash
        );
        // obtener id generado
        Integer newId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);

        // iniciar sesión automáticamente
        session.setAttribute("USER_ID", newId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id_usuario", newId,
            "nombres", nombres,
            "apellidos", apellidos,
            "username", username,
            "email", email
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
