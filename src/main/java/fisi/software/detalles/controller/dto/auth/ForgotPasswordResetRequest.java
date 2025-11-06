package fisi.software.detalles.controller.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordResetRequest(
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
    String numeroDocumento,
    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
    String newPassword
) {
}
