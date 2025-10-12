package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.List;

public class VentaListDTO {
    private Long id;
    private String cliente;
    private String nombreClienteTemp;
    private LocalDateTime fecha;
    private String metodoPago;
    private String estado;
    private BigDecimal total;
    private List<DetalleVentaListDTO> detalles;

    public VentaListDTO(Long id, String cliente, String nombreClienteTemp, LocalDateTime fecha, String metodoPago, String estado, BigDecimal total, List<DetalleVentaListDTO> detalles) {
        this.id = id;
        this.cliente = cliente;
        this.nombreClienteTemp = nombreClienteTemp;
        this.fecha = fecha;
        this.metodoPago = metodoPago;
        this.estado = estado;
        this.total = total;
        this.detalles = detalles;
    }

    public Long getId() { return id; }
    public String getCliente() { return cliente; }
    public String getNombreClienteTemp() { return nombreClienteTemp; }
    public String getNombreClienteMostrado() {
        return (cliente != null && !cliente.isEmpty()) ? cliente : nombreClienteTemp;
    }
    public LocalDateTime getFecha() { return fecha; }
    public String getMetodoPago() { return metodoPago; }
    public String getEstado() { return estado; }
    public BigDecimal getTotal() { return total; }
    public List<DetalleVentaListDTO> getDetalles() { return detalles; }
}
