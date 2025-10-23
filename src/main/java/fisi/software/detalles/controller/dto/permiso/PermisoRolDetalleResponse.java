package fisi.software.detalles.controller.dto.permiso;

import java.util.List;
import java.util.Map;

public record PermisoRolDetalleResponse(
    Integer rolId,
    String rolNombre,
    List<PermisoResumenResponse> permisos,
    Map<String, List<PermisoResumenResponse>> permisosPorModulo
) {}
