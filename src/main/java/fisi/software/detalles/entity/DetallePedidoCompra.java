package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "detallespedidocompra")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "pedidoCompra" })
public class DetallePedidoCompra implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_pedido")
    private Long idDetallePedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido_compra", nullable = false)
    private PedidoCompra pedidoCompra;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_pedida", nullable = false)
    private Integer cantidadPedida;

    @Column(name = "costo_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "subtotal_linea", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotalLinea;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida;

    @OneToMany(mappedBy = "detallePedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DetallePedidoCompraTalla> tallas = new ArrayList<>();

    // Constructores
    public DetallePedidoCompra() {
        this.cantidadRecibida = 0;
    }

    public DetallePedidoCompra(Producto producto, Integer cantidadPedida, BigDecimal costoUnitario) {
        this();
        this.producto = producto;
        this.cantidadPedida = cantidadPedida;
        this.costoUnitario = costoUnitario;
        calcularSubtotal();
    }

    // Métodos de utilidad
    public void calcularSubtotal() {
        if (cantidadPedida != null && costoUnitario != null) {
            this.subtotalLinea = costoUnitario.multiply(new BigDecimal(cantidadPedida));
        } else {
            this.subtotalLinea = BigDecimal.ZERO;
        }
    }

    // Getters y Setters
    public Long getIdDetallePedido() {
        return idDetallePedido;
    }

    public void setIdDetallePedido(Long idDetallePedido) {
        this.idDetallePedido = idDetallePedido;
    }

    public PedidoCompra getPedidoCompra() {
        return pedidoCompra;
    }

    public void setPedidoCompra(PedidoCompra pedidoCompra) {
        this.pedidoCompra = pedidoCompra;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getCantidadPedida() {
        return cantidadPedida;
    }

    public void setCantidadPedida(Integer cantidadPedida) {
        this.cantidadPedida = cantidadPedida;
        calcularSubtotal();
    }

    public BigDecimal getCostoUnitario() {
        return costoUnitario;
    }

    public void setCostoUnitario(BigDecimal costoUnitario) {
        this.costoUnitario = costoUnitario;
        calcularSubtotal();
    }

    public BigDecimal getSubtotalLinea() {
        return subtotalLinea;
    }

    public void setSubtotalLinea(BigDecimal subtotalLinea) {
        this.subtotalLinea = subtotalLinea;
    }

    public Integer getCantidadRecibida() {
        return cantidadRecibida;
    }

    public void setCantidadRecibida(Integer cantidadRecibida) {
        this.cantidadRecibida = cantidadRecibida;
    }

    public List<DetallePedidoCompraTalla> getTallas() {
        return tallas;
    }

    public void setTallas(List<DetallePedidoCompraTalla> tallas) {
        this.tallas = tallas;
    }

    /**
     * Agrega una talla al detalle
     */
    public void agregarTalla(DetallePedidoCompraTalla talla) {
        tallas.add(talla);
        talla.setDetallePedido(this);
    }

    /**
     * Verifica si este detalle tiene tallas
     */
    public boolean tieneTallas() {
        return tallas != null && !tallas.isEmpty();
    }

    /**
     * Recalcula cantidad y subtotal basado en las tallas
     */
    public void recalcularDesdeTallas() {
        if (tieneTallas()) {
            this.cantidadPedida = tallas.stream()
                    .mapToInt(DetallePedidoCompraTalla::getCantidadPedida)
                    .sum();
            this.cantidadRecibida = tallas.stream()
                    .mapToInt(DetallePedidoCompraTalla::getCantidadRecibida)
                    .sum();
            calcularSubtotal();
        }
    }

    @Override
    public String toString() {
        return "DetallePedidoCompra{" +
                "idDetallePedido=" + idDetallePedido +
                ", cantidadPedida=" + cantidadPedida +
                ", costoUnitario=" + costoUnitario +
                ", subtotalLinea=" + subtotalLinea +
                ", cantidadRecibida=" + cantidadRecibida +
                '}';
    }
}
