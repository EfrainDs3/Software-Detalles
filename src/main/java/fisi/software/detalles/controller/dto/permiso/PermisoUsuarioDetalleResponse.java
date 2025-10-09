package fisi.software.detalles.controller.dto.permiso;

import java.util.List;

public record PermisoUsuarioDetalleResponse(
    PermisoResumenResponse permiso,
    boolean asignadoDirecto,
    List<String> rolesOrigen
) {}
