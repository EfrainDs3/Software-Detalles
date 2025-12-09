package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class VentaListDTO {
    private Long id;
    private String cliente;
    private LocalDateTime fecha;
    private String metodoPago;
    private String estado;
    private BigDecimal total;
    private Long idVentaOriginal; // ID de la venta original si esta es una edición
    private List<DetalleVentaListDTO> detalles;

    public VentaListDTO(Long id, String cliente, LocalDateTime fecha, String metodoPago, String estado,
            BigDecimal total, Long idVentaOriginal, List<DetalleVentaListDTO> detalles) {
        this.id = id;
        this.cliente = cliente;
        this.fecha = fecha;
        this.metodoPago = metodoPago;
        this.estado = estado;
        this.total = total;
        this.idVentaOriginal = idVentaOriginal;
        this.detalles = detalles;
    }

    public Long getId() {
        return id;
    }

    public String getCliente() {
        return cliente;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public String getEstado() {
        return estado;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public Long getIdVentaOriginal() {
        return idVentaOriginal;
    }

    public List<DetalleVentaListDTO> getDetalles() {
        return detalles;
    }
}
