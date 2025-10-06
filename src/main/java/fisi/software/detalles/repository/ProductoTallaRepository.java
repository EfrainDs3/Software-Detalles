package fisi.software.detalles.repository;

import fisi.software.detalles.entity.ProductoTalla;
import fisi.software.detalles.entity.ProductoTallaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductoTallaRepository extends JpaRepository<ProductoTalla, ProductoTallaId> {

    @Query("SELECT t FROM ProductoTalla t WHERE t.producto.id = :productoId")
    List<ProductoTalla> findByProductoId(@Param("productoId") Long productoId);

    @Query("SELECT t FROM ProductoTalla t WHERE t.producto.id IN :productoIds")
    List<ProductoTalla> findByProductoIds(@Param("productoIds") Collection<Long> productoIds);
}
