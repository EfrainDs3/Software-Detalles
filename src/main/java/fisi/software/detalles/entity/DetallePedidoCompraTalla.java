package fisi.software.detalles.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Entidad para manejar tallas específicas en los detalles de pedidos de compra
 */
@Entity
@Table(name = "detallespedidocompra_talla")
@Getter
@Setter
@NoArgsConstructor
public class DetallePedidoCompraTalla implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_talla")
    private Long idDetalleTalla;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle_pedido", nullable = false)
    private DetallePedidoCompra detallePedido;

    @Column(name = "talla", nullable = false, length = 64)
    private String talla;

    @Column(name = "cantidad_pedida", nullable = false)
    private Integer cantidadPedida;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida = 0;

    /**
     * Constructor con parámetros
     */
    public DetallePedidoCompraTalla(DetallePedidoCompra detallePedido, String talla, Integer cantidadPedida) {
        this.detallePedido = detallePedido;
        this.talla = talla;
        this.cantidadPedida = cantidadPedida;
        this.cantidadRecibida = 0;
    }

    /**
     * Calcula el subtotal de esta talla
     */
    public BigDecimal calcularSubtotal() {
        if (detallePedido == null || cantidadPedida == null) {
            return BigDecimal.ZERO;
        }
        return detallePedido.getCostoUnitario().multiply(new BigDecimal(cantidadPedida));
    }
}
