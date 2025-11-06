package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para operaciones de almacenes
 */
@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    /**
     * Busca almacén por nombre
     */
    Optional<Almacen> findByNombre(String nombre);

    /**
     * Verifica si existe un almacén con el nombre especificado
     */
    boolean existsByNombre(String nombre);
}