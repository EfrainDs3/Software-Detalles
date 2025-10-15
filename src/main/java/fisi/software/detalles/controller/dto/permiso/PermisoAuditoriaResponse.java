package fisi.software.detalles.controller.dto.permiso;

import fisi.software.detalles.entity.PermisoAuditoria;

import java.time.LocalDateTime;

public record PermisoAuditoriaResponse(
    Long id,
    Long permisoId,
    String permisoCodigo,
    String permisoNombre,
    String accion,
    String detalle,
    String usuario,
    LocalDateTime fecha
) {
    public static PermisoAuditoriaResponse fromEntity(PermisoAuditoria auditoria) {
        Long permisoId = auditoria.getPermisoId();
        String codigo = auditoria.getPermisoCodigo();
        String nombre = auditoria.getPermisoNombre();

        if (auditoria.getPermiso() != null) {
            permisoId = auditoria.getPermiso().getIdPermiso();
            codigo = auditoria.getPermiso().getCodigo();
            nombre = auditoria.getPermiso().getNombrePermiso();
        }

        return new PermisoAuditoriaResponse(
            auditoria.getId(),
            permisoId,
            codigo,
            nombre,
            auditoria.getAccion(),
            auditoria.getDetalle(),
            auditoria.getUsuario(),
            auditoria.getFecha()
        );
    }
}
