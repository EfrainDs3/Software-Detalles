package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Usuario> findByUsernameIgnoreCase(String username);

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByTipoDocumento_IdTipoDocumentoAndNumeroDocumento(Integer tipoDocumentoId, String numeroDocumento);

    boolean existsByRoles_Id(Integer rolId);

    long countByRoles_Id(Integer rolId);

    List<Usuario> findByRoles_IdOrderByNombresAscApellidosAsc(Integer rolId);

    @EntityGraph(attributePaths = {"roles", "roles.permisos", "tipoDocumento"})
    List<Usuario> findAllByOrderByNombresAscApellidosAsc();

    @EntityGraph(attributePaths = {"roles", "roles.permisos", "tipoDocumento"})
    Optional<Usuario> findWithRolesAndPermisosById(Integer id);

}
