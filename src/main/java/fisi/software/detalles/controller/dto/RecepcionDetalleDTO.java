package fisi.software.detalles.controller.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para registrar la recepción de un detalle de compra y sus tallas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionDetalleDTO {

    private Long idDetallePedido;
    private Integer cantidad;
    private List<RecepcionDetalleTallaDTO> tallas = new ArrayList<>();
}
