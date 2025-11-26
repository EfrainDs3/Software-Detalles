package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public record ProductoSimpleDTO(Long id,
    String nombre,
    BigDecimal precioVenta,
    Integer stockDisponible
) {

}
