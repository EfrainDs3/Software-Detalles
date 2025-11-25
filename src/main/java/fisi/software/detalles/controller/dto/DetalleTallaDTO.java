package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para representar detalles de tallas en compras
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleTallaDTO {

    private String talla;
    private Integer cantidad;
    private Integer cantidadRecibida;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;

    /**
     * Constructor para crear desde cantidad y costo
     */
    public DetalleTallaDTO(String talla, Integer cantidad, BigDecimal costoUnitario) {
        this.talla = talla;
        this.cantidad = cantidad;
        this.cantidadRecibida = 0;
        this.costoUnitario = costoUnitario;
        this.subtotal = costoUnitario.multiply(new BigDecimal(cantidad));
    }

    /**
     * Calcula el subtotal automáticamente
     */
    public void calcularSubtotal() {
        if (cantidad != null && costoUnitario != null) {
            this.subtotal = costoUnitario.multiply(new BigDecimal(cantidad));
        } else {
            this.subtotal = BigDecimal.ZERO;
        }
    }
}
