package fisi.software.detalles.repository;

import fisi.software.detalles.entity.TipoComprobantePago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para la entidad TipoComprobantePago
 */
@Repository
public interface TipoComprobantePagoRepository extends JpaRepository<TipoComprobantePago, Integer> {
    // La clave primaria (ID) de TipoComprobantePago es de tipo Integer, según el DTO.
}