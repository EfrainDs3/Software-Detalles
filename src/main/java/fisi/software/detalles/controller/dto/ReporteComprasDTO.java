package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO para reporte de compras
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteComprasDTO {

    // Totales generales
    private BigDecimal totalCompras;
    private Integer cantidadCompras;
    private BigDecimal costoPromedio;

    // Compras por proveedor
    private List<CompraPorProveedor> comprasPorProveedor;

    // Productos más comprados
    private List<ProductoMasComprado> productosMasComprados;

    // Datos para gráfico circular (distribución por proveedor)
    private Map<String, BigDecimal> distribucionPorProveedor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompraPorProveedor {
        private String nombreProveedor;
        private String ruc;
        private Integer cantidadCompras;
        private BigDecimal totalCompras;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoMasComprado {
        private String nombreProducto;
        private Integer cantidadComprada;
        private BigDecimal totalCompras;
        private BigDecimal costoPromedio;
    }
}
