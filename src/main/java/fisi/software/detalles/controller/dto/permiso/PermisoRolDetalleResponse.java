package fisi.software.detalles.controller.dto.permiso;

import java.util.List;

public record PermisoRolDetalleResponse(
    Integer rolId,
    String rolNombre,
    List<PermisoResumenResponse> permisos
) {}
