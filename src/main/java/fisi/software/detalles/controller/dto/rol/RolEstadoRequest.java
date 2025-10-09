package fisi.software.detalles.controller.dto.rol;

import jakarta.validation.constraints.NotNull;

public record RolEstadoRequest(
    @NotNull(message = "El estado es obligatorio")
    Boolean estado
) {
}
