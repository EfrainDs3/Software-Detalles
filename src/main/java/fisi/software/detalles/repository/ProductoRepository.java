package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // MÉTODOS EXISTENTES (NO CAMBIAR)
    Optional<Producto> findByNombreIgnoreCase(String nombre);
    
    @Query("SELECT DISTINCT p FROM Producto p " +
            "LEFT JOIN FETCH p.categoria " +
            "LEFT JOIN FETCH p.proveedor " +
            "LEFT JOIN FETCH p.modelo mo " +
            "LEFT JOIN FETCH mo.marca " +
            "LEFT JOIN FETCH p.material " +
            "LEFT JOIN FETCH p.unidad " +
            "LEFT JOIN FETCH p.tiposProducto " +
            "LEFT JOIN FETCH p.tallas " +
            "WHERE p.categoria.id = :categoriaId AND (p.estado IS NULL OR p.estado = true) ORDER BY p.nombre")
    List<Producto> findByCategoriaIdWithDetalles(@Param("categoriaId") Long categoriaId);

    @Query("SELECT DISTINCT p FROM Producto p " +
            "LEFT JOIN FETCH p.categoria " +
            "LEFT JOIN FETCH p.proveedor " +
            "LEFT JOIN FETCH p.modelo mo " +
            "LEFT JOIN FETCH mo.marca " +
            "LEFT JOIN FETCH p.material " +
            "LEFT JOIN FETCH p.unidad " +
            "LEFT JOIN FETCH p.tiposProducto " +
            "LEFT JOIN FETCH p.tallas " +
            "WHERE p.id = :id")
    Optional<Producto> findByIdWithDetalles(@Param("id") Long id);
    
    // --- NUEVOS MÉTODOS PARA BÚSQUEDA Y FILTROS ---
    
    // Búsqueda básica por nombre
    List<Producto> findByNombreContainingIgnoreCaseAndEstadoTrue(String nombre);
    
    // Búsqueda por categoría (versión simple)
    @Query("SELECT p FROM Producto p WHERE p.categoria.id = :idCategoria AND p.estado = true")
    List<Producto> findByCategoriaId(@Param("idCategoria") Long idCategoria);
    
    // Búsqueda por tipo
    List<Producto> findByTipoAndEstadoTrue(String tipo);
    
    // Búsqueda por color
    List<Producto> findByColorAndEstadoTrue(String color);
    
    // Búsqueda por rango de precios
    List<Producto> findByPrecioVentaBetweenAndEstadoTrue(BigDecimal minPrecio, BigDecimal maxPrecio);
    
    // Búsqueda por material
    @Query("SELECT p FROM Producto p WHERE p.material.id = :idMaterial AND p.estado = true")
    List<Producto> findByMaterialId(@Param("idMaterial") Long idMaterial);
    
    // Búsqueda por modelo
    @Query("SELECT p FROM Producto p WHERE p.modelo.id = :idModelo AND p.estado = true")
    List<Producto> findByModeloId(@Param("idModelo") Long idModelo);
    
    // BÚSQUEDA AVANZADA CON MÚLTIPLES FILTROS
    @Query("SELECT p FROM Producto p WHERE " +
           "(:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:idCategoria IS NULL OR p.categoria.id = :idCategoria) AND " +
           "(:tipo IS NULL OR p.tipo = :tipo) AND " +
           "(:color IS NULL OR p.color = :color) AND " +
           "(:idMaterial IS NULL OR p.material.id = :idMaterial) AND " +
           "(:idModelo IS NULL OR p.modelo.id = :idModelo) AND " +
           "(:minPrecio IS NULL OR p.precioVenta >= :minPrecio) AND " +
           "(:maxPrecio IS NULL OR p.precioVenta <= :maxPrecio) AND " +
           "(:estado IS NULL OR p.estado = :estado)")
    List<Producto> searchProductos(
        @Param("nombre") String nombre,
        @Param("idCategoria") Long idCategoria,
        @Param("tipo") String tipo,
        @Param("color") String color,
        @Param("idMaterial") Long idMaterial,
        @Param("idModelo") Long idModelo,
        @Param("minPrecio") BigDecimal minPrecio,
        @Param("maxPrecio") BigDecimal maxPrecio,
        @Param("estado") Boolean estado
    );
    
    // Obtener categorías únicas para filtros
    @Query("SELECT DISTINCT p.categoria.id FROM Producto p WHERE p.categoria.id IS NOT NULL AND p.estado = true")
    List<Long> findDistinctCategoriaIds();
    
    // Obtener tipos únicos para filtros
    @Query("SELECT DISTINCT p.tipo FROM Producto p WHERE p.tipo IS NOT NULL AND p.estado = true")
    List<String> findDistinctTipos();
    
    // Obtener colores únicos para filtros
    @Query("SELECT DISTINCT p.color FROM Producto p WHERE p.color IS NOT NULL AND p.estado = true")
    List<String> findDistinctColores();
    
    // Obtener materiales únicos para filtros
    @Query("SELECT DISTINCT p.material.id FROM Producto p WHERE p.material.id IS NOT NULL AND p.estado = true")
    List<Long> findDistinctMaterialIds();
    
    // Obtener modelos únicos para filtros
    @Query("SELECT DISTINCT p.modelo.id FROM Producto p WHERE p.modelo.id IS NOT NULL AND p.estado = true")
    List<Long> findDistinctModeloIds();
}