package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO para reporte financiero
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteFinancieroDTO {

    // Ingresos
    private BigDecimal totalIngresos;
    private BigDecimal ingresosVentas;
    private BigDecimal otrosIngresos;

    // Egresos
    private BigDecimal totalEgresos;
    private BigDecimal egresosCompras;
    private BigDecimal otrosEgresos;

    // Utilidades
    private BigDecimal utilidadBruta;
    private BigDecimal margenUtilidad;

    // Flujo de caja
    private BigDecimal saldoInicial;
    private BigDecimal saldoFinal;
    private BigDecimal flujoCaja;

    // Datos para gráfico circular (Ingresos vs Egresos)
    private Map<String, BigDecimal> distribucionIngresosEgresos;
}
