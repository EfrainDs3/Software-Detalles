package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para registrar la recepción de una talla específica dentro de un detalle de compra.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionDetalleTallaDTO {

    private Long idDetalleTalla;
    private Integer cantidad;
}
