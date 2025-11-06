package fisi.software.detalles.controller.dto.permiso;

import fisi.software.detalles.entity.Permiso;

public record PermisoResumenResponse(
    Long id,
    String modulo,
    String nombre
) {

    public static PermisoResumenResponse fromEntity(Permiso permiso) {
        return new PermisoResumenResponse(
            permiso.getIdPermiso(),
            permiso.getModulo(),
            permiso.getNombrePermiso()
        );
    }
}
