package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.auth.ForgotPasswordResetRequest;
import fisi.software.detalles.controller.dto.auth.ForgotPasswordUserRequest;
import fisi.software.detalles.controller.dto.auth.ForgotPasswordVerifyRequest;
import fisi.software.detalles.controller.dto.auth.LoginRequest;
import fisi.software.detalles.controller.dto.auth.LoginResponse;
import fisi.software.detalles.controller.dto.auth.SimpleMessageResponse;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Usuario usuarioAutenticado = usuarioService.autenticar(request.usernameOrEmail(), request.password());
        return ResponseEntity.ok(LoginResponse.fromEntity(usuarioAutenticado));
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
}
