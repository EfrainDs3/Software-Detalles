package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Inventario;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para operaciones de inventario
 */
@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    /**
     * Busca inventario por producto y almacén
     */
    Optional<Inventario> findByProductoAndAlmacen(Producto producto, Almacen almacen);

    /**
     * Busca todos los inventarios de un producto
     */
    List<Inventario> findByProducto(Producto producto);

    /**
     * Busca todos los inventarios de un almacén
     */
    List<Inventario> findByAlmacen(Almacen almacen);

    /**
     * Busca productos con stock bajo (por debajo del mínimo)
     */
    @Query("SELECT i FROM Inventario i WHERE i.cantidadStock <= i.stockMinimo")
    List<Inventario> findProductosStockBajo();

    /**
     * Busca productos agotados (stock = 0)
     */
    @Query("SELECT i FROM Inventario i WHERE i.cantidadStock <= 0")
    List<Inventario> findProductosAgotados();

    /**
     * Busca productos con stock disponible (mayor que mínimo)
     */
    @Query("SELECT i FROM Inventario i WHERE i.cantidadStock > i.stockMinimo")
    List<Inventario> findProductosStockDisponible();

    /**
     * Obtiene el total de stock de un producto en todos los almacenes
     */
    @Query("SELECT COALESCE(SUM(i.cantidadStock), 0) FROM Inventario i WHERE i.producto = :producto")
    Integer getTotalStockProducto(@Param("producto") Producto producto);

    /**
     * Obtiene el total de productos únicos en inventario
     */
    @Query("SELECT COUNT(DISTINCT i.producto) FROM Inventario i")
    Long countProductosUnicos();

    /**
     * Obtiene el total de stock en todos los almacenes
     */
    @Query("SELECT COALESCE(SUM(i.cantidadStock), 0) FROM Inventario i")
    Long getTotalStockGlobal();

    /**
     * Verifica si existe inventario para un producto en algún almacén
     */
    boolean existsByProducto(Producto producto);

    /**
     * Busca inventarios por código de barras del producto
     */
    @Query("SELECT i FROM Inventario i WHERE i.producto.codigoBarra = :codigoBarra")
    List<Inventario> findByProductoCodigoBarra(@Param("codigoBarra") String codigoBarra);
}