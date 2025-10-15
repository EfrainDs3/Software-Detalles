package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
        Optional<Producto> findByNombre(String nombre);
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
}
