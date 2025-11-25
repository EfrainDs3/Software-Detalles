package fisi.software.detalles.repository;

import fisi.software.detalles.entity.PedidoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoCompraRepository extends JpaRepository<PedidoCompra, Long> {

    /**
     * Buscar pedidos por proveedor
     */
    @Query("SELECT p FROM PedidoCompra p WHERE p.proveedor.idProveedor = :idProveedor ORDER BY p.fechaPedido DESC")
    List<PedidoCompra> findByIdProveedor(@Param("idProveedor") Integer idProveedor);

    /**
     * Buscar pedidos por estado
     */
    List<PedidoCompra> findByEstadoPedidoOrderByFechaPedidoDesc(String estadoPedido);

    /**
     * Buscar pedidos por rango de fechas
     */
    List<PedidoCompra> findByFechaPedidoBetweenOrderByFechaPedidoDesc(LocalDateTime inicio, LocalDateTime fin);

    /**
     * Buscar pedidos por usuario
     */
    @Query("SELECT p FROM PedidoCompra p WHERE p.usuario.id = :idUsuario ORDER BY p.fechaPedido DESC")
    List<PedidoCompra> findByIdUsuario(@Param("idUsuario") Integer idUsuario);

    /**
     * Listar todos los pedidos ordenados por fecha descendente
     */
    List<PedidoCompra> findAllByOrderByFechaPedidoDesc();
}
