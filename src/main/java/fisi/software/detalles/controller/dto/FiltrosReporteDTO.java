package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para filtros comunes de reportes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiltrosReporteDTO {

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long almacenId;
    private Long productoId;
    private Long clienteId;
    private Integer proveedorId;
    private Long vendedorId;
    private String categoria;
}
