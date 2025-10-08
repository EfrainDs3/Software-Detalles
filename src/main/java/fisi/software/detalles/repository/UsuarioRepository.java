package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Usuario> findByUsernameIgnoreCase(String username);

    Optional<Usuario> findByEmailIgnoreCase(String email);

    Optional<Usuario> findByTipoDocumento_IdTipoDocumentoAndNumeroDocumento(Integer tipoDocumentoId, String numeroDocumento);
}
