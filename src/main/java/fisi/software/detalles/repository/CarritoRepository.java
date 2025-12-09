package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Carrito;
import fisi.software.detalles.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    Optional<Carrito> findByUsuario(Usuario usuario);

    @EntityGraph(attributePaths = { "detalles", "detalles.producto" })
    @Query("SELECT c FROM Carrito c WHERE c.usuario = :usuario")
    Optional<Carrito> findCarritoWithDetalles(@Param("usuario") Usuario usuario);
}
