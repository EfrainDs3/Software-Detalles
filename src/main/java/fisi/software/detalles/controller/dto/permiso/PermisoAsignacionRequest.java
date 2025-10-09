package fisi.software.detalles.controller.dto.permiso;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PermisoAsignacionRequest(
    @NotNull(message = "Debe especificar los permisos")
    List<Long> permisoIds
) {}
