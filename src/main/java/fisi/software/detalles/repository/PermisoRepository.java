package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Permiso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByCodigoIgnoreCase(String codigo);

    @EntityGraph(attributePaths = {"roles", "usuarios"})
    List<Permiso> findAllByOrderByNombrePermisoAsc();

    @EntityGraph(attributePaths = {"roles", "usuarios"})
    List<Permiso> findAllByEstadoIgnoreCaseOrderByNombrePermisoAsc(String estado);
}
