package fisi.software.detalles.repository;

import fisi.software.detalles.entity.TipoMovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para operaciones de tipos de movimiento de inventario
 */
@Repository
public interface TipoMovimientoInventarioRepository extends JpaRepository<TipoMovimientoInventario, Long> {

    /**
     * Busca tipo de movimiento por nombre
     */
    Optional<TipoMovimientoInventario> findByNombre(String nombre);

    /**
     * Busca tipos de movimiento de entrada
     */
    List<TipoMovimientoInventario> findByEsEntradaTrue();

    /**
     * Busca tipos de movimiento de salida
     */
    List<TipoMovimientoInventario> findByEsEntradaFalse();

    /**
     * Verifica si existe un tipo de movimiento con el nombre especificado
     */
    boolean existsByNombre(String nombre);
}