package fisi.software.detalles.repository;

import fisi.software.detalles.entity.EtiquetaProductoIa;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EtiquetaProductoIaRepository extends JpaRepository<EtiquetaProductoIa, Long> {

    List<EtiquetaProductoIa> findByProductoId(Long productoId);

    List<EtiquetaProductoIa> findByProductoIdIn(Collection<Long> productoIds);
}
