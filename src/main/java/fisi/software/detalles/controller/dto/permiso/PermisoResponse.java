package fisi.software.detalles.controller.dto.permiso;

import fisi.software.detalles.entity.Permiso;

public record PermisoResponse(
    Long id,
    String codigo,
    String nombre,
    String descripcion,
    String estado,
    Long totalRoles,
    Long totalUsuarios
) {

    public static PermisoResponse fromEntity(Permiso permiso) {
        long roles = permiso.getRoles() != null ? permiso.getRoles().size() : 0L;
        long usuarios = permiso.getUsuarios() != null ? permiso.getUsuarios().size() : 0L;
        return new PermisoResponse(
            permiso.getIdPermiso(),
            permiso.getCodigo(),
            permiso.getNombrePermiso(),
            permiso.getDescripcion(),
            permiso.getEstado(),
            roles,
            usuarios
        );
    }
}
