package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Rol;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByNombreIgnoreCase(String nombre);

    @EntityGraph(attributePaths = {"permisos"})
    Optional<Rol> findWithPermisosById(Integer id);

    @EntityGraph(attributePaths = {"permisos"})
    List<Rol> findAllByOrderByNombreAsc();

    @EntityGraph(attributePaths = {"permisos"})
    List<Rol> findAllByEstadoTrueOrderByNombreAsc();
}
