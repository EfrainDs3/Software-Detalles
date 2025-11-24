package fisi.software.detalles.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fisi.software.detalles.entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
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
            "LEFT JOIN FETCH p.tiposProducto tp " +
            "LEFT JOIN FETCH p.tallas " +
            "WHERE p.categoria.id = :categoriaId AND (p.estado IS NULL OR p.estado = true) " +
            "AND (:sexo IS NULL OR LOWER(p.tipo) = LOWER(:sexo) OR LOWER(p.tipo) LIKE CONCAT('%', LOWER(:sexo), '%')) " +
            "AND (:tipoNombre IS NULL OR LOWER(tp.nombre) LIKE CONCAT('%', LOWER(:tipoNombre), '%')) " +
            "ORDER BY p.nombre")
    List<Producto> findByCategoriaIdWithDetallesAndFilters(@Param("categoriaId") Long categoriaId,
                                                           @Param("sexo") String sexo,
                                                           @Param("tipoNombre") String tipoNombre);

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
}
