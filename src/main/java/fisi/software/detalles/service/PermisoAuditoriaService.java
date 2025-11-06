package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.permiso.PermisoAuditoriaResponse;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.PermisoAuditoria;
import fisi.software.detalles.repository.PermisoAuditoriaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoAuditoriaService {

    private final PermisoAuditoriaRepository auditoriaRepository;

    public void registrar(Permiso permiso, String accion, String detalle, String usuario) {
        if (permiso == null || !StringUtils.hasText(accion)) {
            return;
        }
        PermisoAuditoria auditoria = PermisoAuditoria.builder()
            .permiso(permiso)
            .accion(accion)
            .detalle(detalle)
            .usuario(StringUtils.hasText(usuario) ? usuario : resolverUsuarioActual())
            .permisoNombre(permiso.getNombrePermiso())
            .fecha(LocalDateTime.now())
            .build();
        try {
            auditoriaRepository.save(auditoria);
        } catch (DataAccessException ex) {
            log.warn("No se pudo registrar la auditoría de permisos: {}", ex.getMessage());
        }
    }

    public List<PermisoAuditoriaResponse> obtenerHistorial(Long permisoId, int limite) {
        List<PermisoAuditoria> registros;
        if (permisoId != null) {
            registros = auditoriaRepository.findTop50ByPermiso_IdPermisoOrderByFechaDesc(permisoId);
        } else {
            registros = auditoriaRepository.findTop50ByOrderByFechaDesc();
        }

        return registros.stream()
            .limit(limite > 0 ? limite : registros.size())
            .map(PermisoAuditoriaResponse::fromEntity)
            .collect(Collectors.toList());
    }

    public String resolverUsuarioActual() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception ignored) {
            // Ignorar problemas de contexto de seguridad
        }
        return "sistema";
    }
}
