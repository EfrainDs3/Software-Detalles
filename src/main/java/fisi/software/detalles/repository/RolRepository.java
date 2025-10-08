package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {

    Optional<Rol> findByNombreIgnoreCase(String nombre);
}
