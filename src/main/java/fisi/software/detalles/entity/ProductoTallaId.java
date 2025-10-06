package fisi.software.detalles.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProductoTallaId implements Serializable {

    @Column(name = "id_producto")
    private Long productoId;

    @Column(name = "talla", length = 10)
    private String talla;

    public ProductoTallaId() {
    }

    public ProductoTallaId(Long productoId, String talla) {
        this.productoId = productoId;
        this.talla = talla;
    }

    public Long getProductoId() {
        return productoId;
    }

    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }

    public String getTalla() {
        return talla;
    }

    public void setTalla(String talla) {
        this.talla = talla;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductoTallaId that = (ProductoTallaId) o;
        return Objects.equals(productoId, that.productoId) &&
                Objects.equals(talla, that.talla);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productoId, talla);
    }
}
