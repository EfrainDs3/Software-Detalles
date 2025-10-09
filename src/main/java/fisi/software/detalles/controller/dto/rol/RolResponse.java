package fisi.software.detalles.controller.dto.rol;

import fisi.software.detalles.controller.dto.permiso.PermisoResumenResponse;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;

import java.util.Comparator;
import java.util.List;

public record RolResponse(
    Integer id,
    String nombre,
    Boolean estado,
    String descripcion,
    Long totalUsuarios,
    List<RolUsuarioAsignadoResponse> usuarios,
    List<PermisoResumenResponse> permisos
) {

    public static RolResponse fromEntity(Rol rol, Long totalUsuarios, List<RolUsuarioAsignadoResponse> usuarios) {
        List<PermisoResumenResponse> permisos = rol.getPermisos().stream()
            .sorted(Comparator.comparing(Permiso::getNombrePermiso, String.CASE_INSENSITIVE_ORDER))
            .map(PermisoResumenResponse::fromEntity)
            .toList();
        return new RolResponse(rol.getId(), rol.getNombre(), rol.getEstado(), rol.getDescripcion(), totalUsuarios, usuarios, permisos);
    }
}
