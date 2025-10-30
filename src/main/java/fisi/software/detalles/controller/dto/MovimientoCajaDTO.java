package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class MovimientoCajaDTO {
    private Long id;
    private String trabajador;
    private LocalDate fecha;
    private LocalTime horaApertura;
    private BigDecimal montoInicial;
    private LocalTime horaCierre;
    private BigDecimal montoFinal;
    private String estado;
    private String observaciones;
    
    public Long getId() {
        return id;
    }
    public String getObservaciones() {
        return observaciones;
    }
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTrabajador() {
        return trabajador;
    }
    public void setTrabajador(String trabajador) {
        this.trabajador = trabajador;
    }
    public LocalDate getFecha() {
        return fecha;
    }
    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
    public LocalTime getHoraApertura() {
        return horaApertura;
    }
    public void setHoraApertura(LocalTime horaApertura) {
        this.horaApertura = horaApertura;
    }
    public BigDecimal getMontoInicial() {
        return montoInicial;
    }
    public void setMontoInicial(BigDecimal montoInicial) {
        this.montoInicial = montoInicial;
    }
    public LocalTime getHoraCierre() {
        return horaCierre;
    }
    public void setHoraCierre(LocalTime horaCierre) {
        this.horaCierre = horaCierre;
    }
    public BigDecimal getMontoFinal() {
        return montoFinal;
    }
    public void setMontoFinal(BigDecimal montoFinal) {
        this.montoFinal = montoFinal;
    }
    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public MovimientoCajaDTO(Long id, String trabajador, LocalDate fecha, LocalTime horaApertura,
            BigDecimal montoInicial, LocalTime horaCierre, BigDecimal montoFinal, String estado, String observaciones) {
        this.id = id;
        this.trabajador = trabajador;
        this.fecha = fecha;
        this.horaApertura = horaApertura;
        this.montoInicial = montoInicial;
        this.horaCierre = horaCierre;
        this.montoFinal = montoFinal;
        this.estado = estado;
        this.observaciones = observaciones;
    }
    @Override
    public String toString() {
        return "MovimientoCajaDTO [id=" + id + ", trabajador=" + trabajador + ", fecha=" + fecha + ", horaApertura="
                + horaApertura + ", montoInicial=" + montoInicial + ", horaCierre=" + horaCierre + ", montoFinal="
                + montoFinal + ", estado=" + estado + ", observaciones=" + observaciones + "]";
    }

    
}
