package fisi.software.detalles.controller.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request para registrar una recepción parcial o total de una compra.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionCompraRequest {

    private boolean completarCompra;
    private List<RecepcionDetalleDTO> detalles = new ArrayList<>();
}
