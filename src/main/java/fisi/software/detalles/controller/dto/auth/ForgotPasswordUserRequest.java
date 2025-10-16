package fisi.software.detalles.controller.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordUserRequest(
    @NotBlank(message = "El usuario es obligatorio")
    String username
) {
}
