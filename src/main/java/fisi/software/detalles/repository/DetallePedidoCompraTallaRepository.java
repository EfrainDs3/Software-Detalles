package fisi.software.detalles.repository;

import fisi.software.detalles.entity.DetallePedidoCompraTalla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoCompraTallaRepository extends JpaRepository<DetallePedidoCompraTalla, Long> {

    /**
     * Buscar tallas por detalle de pedido
     */
    List<DetallePedidoCompraTalla> findByDetallePedido_IdDetallePedido(Long idDetallePedido);
}
