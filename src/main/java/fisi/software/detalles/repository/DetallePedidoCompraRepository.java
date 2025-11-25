package fisi.software.detalles.repository;

import fisi.software.detalles.entity.DetallePedidoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoCompraRepository extends JpaRepository<DetallePedidoCompra, Long> {

    /**
     * Buscar detalles por pedido de compra
     */
    @Query("SELECT d FROM DetallePedidoCompra d WHERE d.pedidoCompra.idPedidoCompra = :idPedidoCompra")
    List<DetallePedidoCompra> findByIdPedidoCompra(@Param("idPedidoCompra") Long idPedidoCompra);
}
