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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.AuthenticationException;

import java.security.Principal;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // Método existente para login autenticado (con Spring Security)
    @PostMapping("/login-spring")
    public ResponseEntity<LoginResponse> loginSpring(@Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        Usuario usuarioAutenticado = usuarioService.autenticar(request.usernameOrEmail(), request.password());

        UsuarioPrincipal principal = UsuarioPrincipal.fromUsuario(usuarioAutenticado);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                principal.getAuthorities());

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        httpRequest.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context);
        // Asignar USER_ID a la sesión para acceso al perfil
        httpRequest.getSession(true).setAttribute("USER_ID", usuarioAutenticado.getId());

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
    public ResponseEntity<SimpleMessageResponse> verifyIdentity(
            @Valid @RequestBody ForgotPasswordVerifyRequest request) {
        usuarioService.verificarDatosRecuperacion(
                request.username(),
                request.nombres(),
                request.apellidos(),
                request.email(),
                request.numeroDocumento());
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
                request.newPassword());
        return ResponseEntity.ok(SimpleMessageResponse.of("Contraseña actualizada correctamente"));
    }

    // Método simple para login desde frontend web (sin Spring Security)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String identifier = body.getOrDefault("usernameOrEmail", "").trim();
        if (identifier.isEmpty()) {
            identifier = body.getOrDefault("identifier", "").trim();
        }
        String password = body.getOrDefault("password", "");

        if (identifier.isEmpty() || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Faltan credenciales"));
        }

        try {
            LoginRequest loginRequest = new LoginRequest(identifier, password);
            Usuario usuarioAutenticado = usuarioService.autenticar(
                    loginRequest.usernameOrEmail(),
                    loginRequest.password());

            // Build response object and log modules for debugging
            var loginResp = LoginResponse.fromEntity(usuarioAutenticado);
            try {
                log.info("User '{}' logged in. modulos={}", usuarioAutenticado.getUsername(), loginResp.modulos());
            } catch (Exception e) {
                log.info("User '{}' logged in. (could not log modulos)", usuarioAutenticado.getUsername());
            }

            UsuarioPrincipal principal = UsuarioPrincipal.fromUsuario(usuarioAutenticado);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities());

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            request.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    context);
            // Asignar USER_ID a la sesión para acceso al perfil
            request.getSession(true).setAttribute("USER_ID", usuarioAutenticado.getId());

            return ResponseEntity.ok(loginResp);
        } catch (IllegalArgumentException ex) {
            final String message = ex.getMessage();
            final String responseMessage = (message != null && !message.isBlank())
                    ? message
                    : "Usuario o contraseña incorrectos";
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", responseMessage));
        } catch (AuthenticationException ex) {
            final String message = ex.getMessage();
            final String responseMessage = (message != null && !message.isBlank())
                    ? message
                    : "Usuario o contraseña incorrectos";
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", responseMessage));
        } catch (Exception ex) {
            log.error("Unexpected error during login", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ocurrió un problema al iniciar sesión"));
        }
    }

    @GetMapping("/status")
    public Map<String, Object> authStatus(Authentication auth) {

        // No autenticado
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return Map.of("authenticated", false);
        }

        // Sí autenticado
        UsuarioPrincipal usuario = (UsuarioPrincipal) auth.getPrincipal();

        return Map.of(
                "authenticated", true,
                "userId", usuario.getId(),
                "username", usuario.getUsername());
    }

    // Método simple para registro desde frontend web
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body, HttpSession session) {
        String nombres = body.getOrDefault("nombres", "").trim();
        String apellidos = body.getOrDefault("apellidos", "").trim();
        String username = body.getOrDefault("username", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase(Locale.ROOT);
        String numeroDocumento = body.getOrDefault("numeroDocumento", "").trim();
        String celular = body.getOrDefault("celular", "").trim();
        String password = body.getOrDefault("password", "");

        if (nombres.isEmpty() || email.isEmpty() || password.isEmpty() || username.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Faltan campos requeridos"));
        }

        // Validar DNI (8 dígitos)
        if (numeroDocumento.isEmpty() || !numeroDocumento.matches("\\d{8}")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "El DNI debe tener 8 dígitos"));
        }

        // Validar Celular (9 dígitos)
        if (celular.isEmpty() || !celular.matches("\\d{9}")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "El celular debe tener 9 dígitos"));
        }

        // comprobar existencia
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM usuarios WHERE LOWER(email)=? OR LOWER(username)=?",
                Integer.class, email, username.toLowerCase(Locale.ROOT));
        if (count != null && count > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email o username ya registrado"));
        }

        String hash = encoder.encode(password);
        // Insertar nuevo usuario con DNI, celular y tipo_documento=1 (DNI) para
        // registros web
        jdbcTemplate.update(
                "INSERT INTO usuarios (nombres, apellidos, username, email, `contraseña_hash`, id_tipodocumento, numero_documento, celular, fecha_creacion) VALUES (?, ?, ?, ?, ?, 1, ?, ?, NOW())",
                nombres, apellidos, username, email, hash, numeroDocumento, celular);
        // obtener id generado
        Integer newId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);

        // iniciar sesión automáticamente
        session.setAttribute("USER_ID", newId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id_usuario", newId,
                "nombres", nombres,
                "apellidos", apellidos,
                "username", username,
                "email", email));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
