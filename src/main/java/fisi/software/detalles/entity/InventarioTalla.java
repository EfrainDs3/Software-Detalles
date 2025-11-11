package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa el inventario de productos por talla en un almacén
 */
@Entity
@Table(name = "inventario_talla")
public class InventarioTalla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario_talla")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inventario", nullable = false)
    private Inventario inventario;

    @Column(name = "talla", length = 64)
    private String talla;

    @Column(name = "cantidad_stock", nullable = false)
    private Integer cantidadStock = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 0;

    @Column(name = "fecha_ultima_actualizacion", nullable = false)
    private LocalDateTime fechaUltimaActualizacion;

    public InventarioTalla() {
    }

    public InventarioTalla(Inventario inventario, String talla, Integer cantidadStock, Integer stockMinimo) {
        this.inventario = inventario;
        this.talla = talla;
        this.cantidadStock = cantidadStock != null ? cantidadStock : 0;
        this.stockMinimo = stockMinimo != null ? stockMinimo : 0;
        this.fechaUltimaActualizacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Inventario getInventario() {
        return inventario;
    }

    public void setInventario(Inventario inventario) {
        this.inventario = inventario;
    }

    public String getTalla() {
        return talla;
    }

    public void setTalla(String talla) {
        this.talla = talla;
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
     * Verifica si la talla está agotada
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