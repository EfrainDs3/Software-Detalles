package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.auth.LoginRequest;
import fisi.software.detalles.controller.dto.auth.LoginResponse;
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
}
