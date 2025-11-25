package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO para reporte de ventas
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteVentasDTO {

    // Totales generales
    private BigDecimal totalVentas;
    private Integer cantidadVentas;
    private BigDecimal ticketPromedio;

    // Ventas por producto (top 10)
    private List<VentaPorProducto> ventasPorProducto;

    // Ventas por vendedor
    private List<VentaPorVendedor> ventasPorVendedor;

    // Ventas por categoría
    private List<VentaPorCategoria> ventasPorCategoria;

    // Datos para gráfico circular
    private Map<String, BigDecimal> distribucionPorCategoria;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VentaPorProducto {
        private String nombreProducto;
        private Integer cantidadVendida;
        private BigDecimal totalVentas;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VentaPorVendedor {
        private String nombreVendedor;
        private Integer cantidadVentas;
        private BigDecimal totalVentas;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VentaPorCategoria {
        private String categoria;
        private Integer cantidadVentas;
        private BigDecimal totalVentas;
        private BigDecimal porcentaje;
    }
}
