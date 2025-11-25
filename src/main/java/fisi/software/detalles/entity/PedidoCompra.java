package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "pedidoscompra")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class PedidoCompra implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido_compra")
    private Long idPedidoCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_pedido", nullable = false)
    private LocalDateTime fechaPedido;

    @Column(name = "fecha_entrega_esperada")
    private LocalDate fechaEntregaEsperada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipopago")
    private TipoPago tipoPago;

    @Column(name = "referencia", length = 100)
    private String referencia;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "estado_pedido", nullable = false, length = 50)
    private String estadoPedido;

    @Column(name = "total_pedido", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPedido;

    @OneToMany(mappedBy = "pedidoCompra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedidoCompra> detalles = new ArrayList<>();

    // Constructores
    public PedidoCompra() {
        this.fechaPedido = LocalDateTime.now();
        this.estadoPedido = "Pendiente";
        this.totalPedido = BigDecimal.ZERO;
    }

    public PedidoCompra(Proveedor proveedor, Usuario usuario, LocalDate fechaEntregaEsperada) {
        this();
        this.proveedor = proveedor;
        this.usuario = usuario;
        this.fechaEntregaEsperada = fechaEntregaEsperada;
    }

    // Métodos de utilidad
    public void agregarDetalle(DetallePedidoCompra detalle) {
        detalles.add(detalle);
        detalle.setPedidoCompra(this);
        recalcularTotal();
    }

    public void eliminarDetalle(DetallePedidoCompra detalle) {
        detalles.remove(detalle);
        detalle.setPedidoCompra(null);
        recalcularTotal();
    }

    public void recalcularTotal() {
        this.totalPedido = detalles.stream()
                .map(DetallePedidoCompra::getSubtotalLinea)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters y Setters
    public Long getIdPedidoCompra() {
        return idPedidoCompra;
    }

    public void setIdPedidoCompra(Long idPedidoCompra) {
        this.idPedidoCompra = idPedidoCompra;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public LocalDateTime getFechaPedido() {
        return fechaPedido;
    }

    public void setFechaPedido(LocalDateTime fechaPedido) {
        this.fechaPedido = fechaPedido;
    }

    public LocalDate getFechaEntregaEsperada() {
        return fechaEntregaEsperada;
    }

    public void setFechaEntregaEsperada(LocalDate fechaEntregaEsperada) {
        this.fechaEntregaEsperada = fechaEntregaEsperada;
    }

    public String getEstadoPedido() {
        return estadoPedido;
    }

    public void setEstadoPedido(String estadoPedido) {
        this.estadoPedido = estadoPedido;
    }

    public BigDecimal getTotalPedido() {
        return totalPedido;
    }

    public void setTotalPedido(BigDecimal totalPedido) {
        this.totalPedido = totalPedido;
    }

    public List<DetallePedidoCompra> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetallePedidoCompra> detalles) {
        this.detalles = detalles;
    }

    public TipoPago getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(TipoPago tipoPago) {
        this.tipoPago = tipoPago;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    @Override
    public String toString() {
        return "PedidoCompra{" +
                "idPedidoCompra=" + idPedidoCompra +
                ", fechaPedido=" + fechaPedido +
                ", fechaEntregaEsperada=" + fechaEntregaEsperada +
                ", estadoPedido='" + estadoPedido + '\'' +
                ", totalPedido=" + totalPedido +
                '}';
    }
}
