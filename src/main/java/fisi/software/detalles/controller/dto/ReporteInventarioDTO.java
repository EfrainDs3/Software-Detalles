package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO para reporte de inventario
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteInventarioDTO {

    // Totales generales
    private Integer totalProductos;
    private Integer totalUnidades;
    private BigDecimal valorTotalInventario;

    // Stock actual por producto
    private List<StockProducto> stockPorProducto;

    // Productos con stock bajo
    private List<ProductoStockBajo> productosStockBajo;

    // Productos más vendidos
    private List<ProductoMasVendido> productosMasVendidos;

    // Datos para gráfico circular (distribución por categoría)
    private Map<String, Integer> distribucionPorCategoria;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockProducto {
        private String nombreProducto;
        private String categoria;
        private Integer stockActual;
        private Integer stockMinimo;
        private BigDecimal valorStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoStockBajo {
        private String nombreProducto;
        private Integer stockActual;
        private Integer stockMinimo;
        private String estado; // "Crítico", "Bajo"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoMasVendido {
        private String nombreProducto;
        private Integer cantidadVendida;
        private BigDecimal totalVentas;
    }
}
