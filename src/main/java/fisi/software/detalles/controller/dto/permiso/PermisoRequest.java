package fisi.software.detalles.controller.dto.permiso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PermisoRequest(
    @NotBlank(message = "El módulo es obligatorio")
    @Size(max = 100, message = "El módulo no puede superar 100 caracteres")
    String modulo,
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    String nombre,
    @Size(max = 255, message = "La descripción no puede superar 255 caracteres")
    String descripcion,
    @Size(max = 20, message = "El estado no puede superar 20 caracteres")
    String estado
) {}
