package fisi.software.detalles.controller.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CompraRequestDTO {

    private Integer idProveedor;
    private LocalDate fechaEntregaEsperada;
    private Integer idTipoPago;
    private String referencia;
    private String observaciones;
    private List<DetalleCompraDTO> detalles;

    // Constructores
    public CompraRequestDTO() {
        this.detalles = new ArrayList<>();
    }

    public CompraRequestDTO(Integer idProveedor, LocalDate fechaEntregaEsperada, List<DetalleCompraDTO> detalles) {
        this.idProveedor = idProveedor;
        this.fechaEntregaEsperada = fechaEntregaEsperada;
        this.detalles = detalles != null ? detalles : new ArrayList<>();
    }

    // Getters y Setters
    public Integer getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(Integer idProveedor) {
        this.idProveedor = idProveedor;
    }

    public LocalDate getFechaEntregaEsperada() {
        return fechaEntregaEsperada;
    }

    public void setFechaEntregaEsperada(LocalDate fechaEntregaEsperada) {
        this.fechaEntregaEsperada = fechaEntregaEsperada;
    }

    public List<DetalleCompraDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleCompraDTO> detalles) {
        this.detalles = detalles;
    }

    public Integer getIdTipoPago() {
        return idTipoPago;
    }

    public void setIdTipoPago(Integer idTipoPago) {
        this.idTipoPago = idTipoPago;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
