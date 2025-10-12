package fisi.software.detalles.entity;

import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entidad que mapea la tabla `detallescomprobantepago`.
 */
@Entity
@Table(name = "detallescomprobantepago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "producto"})
public class DetalleComprobantePago {

    // Clave Primaria: id_detalle_comprobante (BIGINT, AUTO_INCREMENT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_comprobante")
    private Long idDetalleComprobante;

    // -----------------------------------------------------------
    // RELACIONES
    // -----------------------------------------------------------

    // id_comprobante (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comprobante", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ComprobantePago comprobante; 

    // id_producto (FK)
    // Asume que ya tienes la entidad Producto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto; 

    // -----------------------------------------------------------
    // ATRIBUTOS DE LA TABLA
    // -----------------------------------------------------------

    // cantidad (INT)
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    // precio_unitario (DECIMAL(10,2))
    @Column(name = "precio_unitario", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioUnitario;

    // descuento_aplicado (DECIMAL(10,2), default 0.00)
    @Column(name = "descuento_aplicado", precision = 10, scale = 2, nullable = false)
    private BigDecimal descuentoAplicado;

    // subtotal_linea (DECIMAL(10,2))
    @Column(name = "subtotal_linea", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotalLinea;
}