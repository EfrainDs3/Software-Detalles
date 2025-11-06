package fisi.software.detalles.repository;

import fisi.software.detalles.entity.MovimientoInventario;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.Almacen;
import fisi.software.detalles.entity.TipoMovimientoInventario;
import fisi.software.detalles.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para operaciones de movimientos de inventario
 */
@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    /**
     * Busca movimientos por producto
     */
    List<MovimientoInventario> findByProductoOrderByFechaMovimientoDesc(Producto producto);

    /**
     * Busca movimientos por almacén
     */
    List<MovimientoInventario> findByAlmacenOrderByFechaMovimientoDesc(Almacen almacen);

    /**
     * Busca movimientos por tipo
     */
    List<MovimientoInventario> findByTipoMovimientoOrderByFechaMovimientoDesc(TipoMovimientoInventario tipoMovimiento);

    /**
     * Busca movimientos por usuario
     */
    List<MovimientoInventario> findByUsuarioOrderByFechaMovimientoDesc(Usuario usuario);

    /**
     * Busca movimientos en un rango de fechas
     */
    List<MovimientoInventario> findByFechaMovimientoBetweenOrderByFechaMovimientoDesc(
        LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Busca movimientos de entrada (es_entrada = true)
     */
    @Query("SELECT m FROM MovimientoInventario m WHERE m.tipoMovimiento.esEntrada = true ORDER BY m.fechaMovimiento DESC")
    List<MovimientoInventario> findMovimientosEntrada();

    /**
     * Busca movimientos de salida (es_entrada = false)
     */
    @Query("SELECT m FROM MovimientoInventario m WHERE m.tipoMovimiento.esEntrada = false ORDER BY m.fechaMovimiento DESC")
    List<MovimientoInventario> findMovimientosSalida();

    /**
     * Busca movimientos por producto y almacén
     */
    List<MovimientoInventario> findByProductoAndAlmacenOrderByFechaMovimientoDesc(
        Producto producto, Almacen almacen);

    /**
     * Busca movimientos por referencia de documento
     */
    List<MovimientoInventario> findByReferenciaDocContainingIgnoreCaseOrderByFechaMovimientoDesc(
        String referenciaDoc);

    /**
     * Obtiene el kardex de un producto (todos sus movimientos ordenados por fecha)
     */
    @Query("SELECT m FROM MovimientoInventario m WHERE m.producto = :producto ORDER BY m.fechaMovimiento ASC")
    List<MovimientoInventario> findKardexByProducto(@Param("producto") Producto producto);

    /**
     * Obtiene el kardex de un producto en un almacén específico
     */
    @Query("SELECT m FROM MovimientoInventario m WHERE m.producto = :producto AND m.almacen = :almacen ORDER BY m.fechaMovimiento ASC")
    List<MovimientoInventario> findKardexByProductoAndAlmacen(@Param("producto") Producto producto,
                                                             @Param("almacen") Almacen almacen);

    /**
     * Busca movimientos recientes (últimos N días)
     */
    @Query("SELECT m FROM MovimientoInventario m WHERE m.fechaMovimiento >= :fechaDesde ORDER BY m.fechaMovimiento DESC")
    List<MovimientoInventario> findMovimientosRecientes(@Param("fechaDesde") LocalDateTime fechaDesde);

    /**
     * Cuenta movimientos por tipo en un período
     */
    @Query("SELECT COUNT(m) FROM MovimientoInventario m WHERE m.tipoMovimiento = :tipo AND m.fechaMovimiento BETWEEN :inicio AND :fin")
    Long countByTipoMovimientoAndFechaBetween(@Param("tipo") TipoMovimientoInventario tipo,
                                             @Param("inicio") LocalDateTime inicio,
                                             @Param("fin") LocalDateTime fin);
}