package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// Este DTO representa toda la solicitud de venta que viene del front-end.
public class VentaRequestDTO {
    
    // --- Campos de Encabezado de Comprobante ---
    private Integer id_tipo_comprobante; // Boleta (1), Factura (2), etc.
    private String ruc;                 // Para Factura
    private String razon_social;        // Para Factura
    private Long id_tipopago;           // FK a tipospago
    
    // --- Campos del Cliente (Temporal o FK) ---
    private String nombre_cliente_temp; // Usado para el registro inicial o la búsqueda.
    
    // --- Campos de la Venta ---
    private LocalDate fecha_emision;
    private String estado_comprobante;
    private BigDecimal monto_total; // Total de la venta (incluido IGV)

    // Lista de detalles usando el DetalleVentaDTO
    private List<DetalleVentaDTO> detalles;

    // Constructor vacío (necesario para la deserialización de JSON por Spring)
    public VentaRequestDTO() {}

    // Getters y Setters
    // (Asegúrate de que estos getters y setters coincidan con el JSON que envía tu front-end)

    public Integer getId_tipo_comprobante() {
        return id_tipo_comprobante;
    }

    public void setId_tipo_comprobante(Integer id_tipo_comprobante) {
        this.id_tipo_comprobante = id_tipo_comprobante;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getRazon_social() {
        return razon_social;
    }

    public void setRazon_social(String razon_social) {
        this.razon_social = razon_social;
    }

    public Long getId_tipopago() {
        return id_tipopago;
    }

    public void setId_tipopago(Long id_tipopago) {
        this.id_tipopago = id_tipopago;
    }

    public String getNombre_cliente_temp() {
        return nombre_cliente_temp;
    }

    public void setNombre_cliente_temp(String nombre_cliente_temp) {
        this.nombre_cliente_temp = nombre_cliente_temp;
    }

    public LocalDate getFecha_emision() {
        return fecha_emision;
    }

    public void setFecha_emision(LocalDate fecha_emision) {
        this.fecha_emision = fecha_emision;
    }

    public String getEstado_comprobante() {
        return estado_comprobante;
    }

    public void setEstado_comprobante(String estado_comprobante) {
        this.estado_comprobante = estado_comprobante;
    }

    public BigDecimal getMonto_total() {
        return monto_total;
    }

    public void setMonto_total(BigDecimal monto_total) {
        this.monto_total = monto_total;
    }

    public List<DetalleVentaDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaDTO> detalles) {
        this.detalles = detalles;
    }
}