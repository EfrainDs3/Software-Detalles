package fisi.software.detalles.controller.dto.rol;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RolRequest(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
    String nombre,

    @Size(max = 255, message = "La descripción no puede superar 255 caracteres")
    String descripcion,

    Boolean estado
) {
}
