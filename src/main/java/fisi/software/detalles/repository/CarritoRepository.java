package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Carrito;
import fisi.software.detalles.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    Optional<Carrito> findByUsuario(Usuario usuario);
}
