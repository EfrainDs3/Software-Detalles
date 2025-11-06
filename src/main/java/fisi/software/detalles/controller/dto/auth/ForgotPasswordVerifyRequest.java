package fisi.software.detalles.controller.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordVerifyRequest(
    @NotBlank(message = "El usuario es obligatorio")
    String username,
    @NotBlank(message = "Los nombres son obligatorios")
    String nombres,
    @NotBlank(message = "Los apellidos son obligatorios")
    String apellidos,
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato del correo no es válido")
    String email,
    @NotBlank(message = "El número de documento es obligatorio")
    String numeroDocumento
) {
}
