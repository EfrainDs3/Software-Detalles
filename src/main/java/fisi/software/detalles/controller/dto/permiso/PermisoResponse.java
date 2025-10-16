package fisi.software.detalles.controller.dto.permiso;

import fisi.software.detalles.entity.Permiso;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public record PermisoResponse(
    Long id,
    String codigo,
    String nombre,
    String descripcion,
    String estado,
    Long totalRoles,
    List<String> rolesAsignados,
    Long totalUsuarios,
    String creadoPor,
    LocalDateTime fechaCreacion,
    String actualizadoPor,
    LocalDateTime fechaActualizacion
) {

    public static PermisoResponse fromEntity(Permiso permiso) {
        return fromEntity(permiso, 0L);
    }

    public static PermisoResponse fromEntity(Permiso permiso, long totalUsuarios) {
        long roles = permiso.getRoles() != null ? permiso.getRoles().size() : 0L;
        List<String> rolesAsignados = permiso.getRoles() == null
            ? List.of()
            : permiso.getRoles().stream()
                .map(rol -> rol != null ? rol.getNombre() : null)
                .filter(Objects::nonNull)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();

        return new PermisoResponse(
            permiso.getIdPermiso(),
            permiso.getCodigo(),
            permiso.getNombrePermiso(),
            permiso.getDescripcion(),
            permiso.getEstado(),
            roles,
            rolesAsignados,
            totalUsuarios,
            permiso.getCreadoPor(),
            permiso.getFechaCreacion(),
            permiso.getActualizadoPor(),
            permiso.getFechaActualizacion()
        );
    }

    /**
     * Builds a masked response that only preserves id and codigo.
     * All other fields are left empty/null so the UI can display only the code.
     */
    public static PermisoResponse fromEntityMasked(Permiso permiso, long totalUsuarios) {
        return new PermisoResponse(
            permiso != null ? permiso.getIdPermiso() : null,
            permiso != null ? permiso.getCodigo() : null,
            null,
            null,
            null,
            0L,
            List.of(),
            totalUsuarios,
            null,
            null,
            null,
            null
        );
    }
}
