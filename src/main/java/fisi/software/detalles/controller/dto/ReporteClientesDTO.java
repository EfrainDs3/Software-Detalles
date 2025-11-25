package fisi.software.detalles.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO para reporte de clientes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteClientesDTO {

    // Totales generales
    private Integer totalClientes;
    private Integer clientesActivos;
    private BigDecimal ticketPromedio;

    // Clientes con más compras
    private List<ClienteTop> clientesTop;

    // Clientes frecuentes
    private List<ClienteFrecuente> clientesFrecuentes;

    // Datos para gráfico circular (Top 5 clientes)
    private Map<String, BigDecimal> distribucionPorCliente;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteTop {
        private String nombreCliente;
        private String documento;
        private Integer cantidadCompras;
        private BigDecimal totalCompras;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClienteFrecuente {
        private String nombreCliente;
        private Integer frecuenciaCompras;
        private String ultimaCompra; // Fecha como String
    }
}
