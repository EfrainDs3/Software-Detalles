package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa el inventario de productos por almacén
 */
@Entity
@Table(name = "inventario")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_almacen", nullable = false)
    private Almacen almacen;

    @Column(name = "cantidad_stock", nullable = false)
    private Integer cantidadStock = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Column(name = "fecha_ultima_actualizacion", nullable = false)
    private LocalDateTime fechaUltimaActualizacion;

    public Inventario() {
    }

    public Inventario(Producto producto, Almacen almacen, Integer cantidadStock, Integer stockMinimo) {
        this.producto = producto;
        this.almacen = almacen;
        this.cantidadStock = cantidadStock != null ? cantidadStock : 0;
        this.stockMinimo = stockMinimo != null ? stockMinimo : 5;
        this.fechaUltimaActualizacion = LocalDateTime.now();
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

    public Integer getCantidadStock() {
        return cantidadStock;
    }

    public void setCantidadStock(Integer cantidadStock) {
        this.cantidadStock = cantidadStock;
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public LocalDateTime getFechaUltimaActualizacion() {
        return fechaUltimaActualizacion;
    }

    public void setFechaUltimaActualizacion(LocalDateTime fechaUltimaActualizacion) {
        this.fechaUltimaActualizacion = fechaUltimaActualizacion;
    }

    /**
     * Verifica si el stock está por debajo del mínimo
     */
    public boolean isStockBajo() {
        return cantidadStock <= stockMinimo;
    }

    /**
     * Verifica si el producto está agotado
     */
    public boolean isAgotado() {
        return cantidadStock <= 0;
    }

    /**
     * Ajusta el stock sumando/restando la cantidad especificada
     */
    public void ajustarStock(int cantidad) {
        this.cantidadStock += cantidad;
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }
}