package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Permiso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByNombrePermisoIgnoreCase(String nombre);

    Optional<Permiso> findByModuloIgnoreCaseAndNombrePermisoIgnoreCase(String modulo, String nombre);

    @EntityGraph(attributePaths = {"roles"})
    List<Permiso> findAllByOrderByNombrePermisoAsc();

    @EntityGraph(attributePaths = {"roles"})
    List<Permiso> findAllByEstadoIgnoreCaseOrderByNombrePermisoAsc(String estado);

    @Query("""
        select distinct p
        from Permiso p
        left join fetch p.roles r
        where (:estado is null or upper(p.estado) = upper(:estado))
          and (
              :termino is null
              or lower(p.nombrePermiso) like lower(concat('%', :termino, '%'))
              or lower(p.descripcion) like lower(concat('%', :termino, '%'))
                            or lower(p.modulo) like lower(concat('%', :termino, '%'))
          )
        order by p.nombrePermiso asc
        """)
    List<Permiso> buscarPorFiltros(@Param("estado") String estado, @Param("termino") String termino);
}
