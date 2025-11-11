package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa los movimientos de inventario
 */
@Entity
@Table(name = "movimientosinventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento_inv")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen")
    private Almacen almacen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_movimiento", nullable = false)
    private TipoMovimientoInventario tipoMovimiento;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "fecha_movimiento", nullable = false)
    private LocalDateTime fechaMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    @Column(name = "referencia_doc", length = 50)
    private String referenciaDoc;

    @Column(name = "talla", length = 64)
    private String talla;

    public MovimientoInventario() {
    }

    public MovimientoInventario(Producto producto, Almacen almacen, TipoMovimientoInventario tipoMovimiento,
                               Integer cantidad, Usuario usuario, String observaciones, String referenciaDoc) {
        this.producto = producto;
        this.almacen = almacen;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.fechaMovimiento = LocalDateTime.now();
        this.usuario = usuario;
        this.observaciones = observaciones;
        this.referenciaDoc = referenciaDoc;
    }

    public MovimientoInventario(Producto producto, Almacen almacen, TipoMovimientoInventario tipoMovimiento,
                               Integer cantidad, Usuario usuario, String observaciones, String referenciaDoc, String talla) {
        this.producto = producto;
        this.almacen = almacen;
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.fechaMovimiento = LocalDateTime.now();
        this.usuario = usuario;
        this.observaciones = observaciones;
        this.referenciaDoc = referenciaDoc;
        this.talla = talla;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Almacen getAlmacen() {
        return almacen;
    }

    public void setAlmacen(Almacen almacen) {
        this.almacen = almacen;
    }

    public TipoMovimientoInventario getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(TipoMovimientoInventario tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public LocalDateTime getFechaMovimiento() {
        return fechaMovimiento;
    }

    public void setFechaMovimiento(LocalDateTime fechaMovimiento) {
        this.fechaMovimiento = fechaMovimiento;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getReferenciaDoc() {
        return referenciaDoc;
    }

    public void setReferenciaDoc(String referenciaDoc) {
        this.referenciaDoc = referenciaDoc;
    }

    public String getTalla() {
        return talla;
    }

    public void setTalla(String talla) {
        this.talla = talla;
    }

    /**
     * Verifica si es un movimiento de entrada
     */
    public boolean isEntrada() {
        return tipoMovimiento != null && tipoMovimiento.isEsEntrada();
    }

    /**
     * Obtiene la cantidad con signo según el tipo de movimiento
     */
    public int getCantidadConSigno() {
        return isEntrada() ? cantidad : -cantidad;
    }
}