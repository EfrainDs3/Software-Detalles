package fisi.software.detalles.controller.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UsuarioUpdateRequest(
    @NotBlank(message = "Los nombres son obligatorios")
    String nombres,

    @NotBlank(message = "Los apellidos son obligatorios")
    String apellidos,

    Integer tipoDocumentoId,

    String numeroDocumento,

    String celular,

    String direccion,

    @NotBlank(message = "El nombre de usuario es obligatorio")
    String username,

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico no es válido")
    String email,

    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String password,

    Boolean estado,

    List<Integer> rolIds
) {}
