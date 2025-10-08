package fisi.software.detalles.controller.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "El usuario o correo es obligatorio")
    String usernameOrEmail,
    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {
}
