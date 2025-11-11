package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Inventario;
import fisi.software.detalles.entity.InventarioTalla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de inventario por tallas
 */
@Repository
public interface InventarioTallaRepository extends JpaRepository<InventarioTalla, Long> {

    /**
     * Busca todas las tallas de un inventario específico
     */
    List<InventarioTalla> findByInventario(Inventario inventario);

    /**
     * Busca una talla específica en un inventario
     */
    Optional<InventarioTalla> findByInventarioAndTalla(Inventario inventario, String talla);

    /**
     * Busca tallas con stock bajo para un inventario específico
     */
    @Query("SELECT it FROM InventarioTalla it WHERE it.inventario = :inventario AND it.cantidadStock <= it.stockMinimo")
    List<InventarioTalla> findTallasStockBajoByInventario(@Param("inventario") Inventario inventario);

    /**
     * Obtiene el stock total por talla para un producto en un almacén
     */
    @Query("SELECT it.talla, SUM(it.cantidadStock) FROM InventarioTalla it " +
           "WHERE it.inventario.producto.id = :productoId AND it.inventario.almacen.id = :almacenId " +
           "GROUP BY it.talla")
    List<Object[]> getStockPorTalla(@Param("productoId") Long productoId, @Param("almacenId") Long almacenId);

    /**
     * Verifica si existe alguna talla con stock disponible para un inventario
     */
    @Query("SELECT COUNT(it) > 0 FROM InventarioTalla it WHERE it.inventario = :inventario AND it.cantidadStock > 0")
    boolean existsStockDisponible(@Param("inventario") Inventario inventario);
}