package fisi.software.detalles.repository;

import fisi.software.detalles.entity.PermisoAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PermisoAuditoriaRepository extends JpaRepository<PermisoAuditoria, Long> {

    List<PermisoAuditoria> findTop50ByOrderByFechaDesc();

    List<PermisoAuditoria> findTop50ByPermiso_IdPermisoOrderByFechaDesc(Long permisoId);
}
