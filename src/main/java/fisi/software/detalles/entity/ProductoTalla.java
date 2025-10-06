package fisi.software.detalles.entity;

import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "Tallas")
public class ProductoTalla implements Serializable {

    @EmbeddedId
    private ProductoTallaId id;

    @MapsId("productoId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @Column(name = "precio_venta", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioVenta;

    @Column(name = "costo_compra", precision = 10, scale = 2)
    private BigDecimal costoCompra;

    public ProductoTalla() {
    }

    public ProductoTalla(Producto producto, String talla, BigDecimal precioVenta, BigDecimal costoCompra) {
        this.id = new ProductoTallaId(null, talla);
        this.producto = producto;
        this.precioVenta = precioVenta;
        this.costoCompra = costoCompra;
    }

    public ProductoTallaId getId() {
        return id;
    }

    public void setId(ProductoTallaId id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
        if (this.id == null) {
            this.id = new ProductoTallaId();
        }
        this.id.setProductoId(producto != null ? producto.getId() : null);
    }

    public String getTalla() {
        return id != null ? id.getTalla() : null;
    }

    public void setTalla(String talla) {
        if (this.id == null) {
            this.id = new ProductoTallaId();
        }
        this.id.setTalla(talla);
    }

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public BigDecimal getCostoCompra() {
        return costoCompra;
    }

    public void setCostoCompra(BigDecimal costoCompra) {
        this.costoCompra = costoCompra;
    }
}
