package fisi.software.detalles.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cierrescaja")

public class CierreCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cierre")
    private Long idCierre;

    // Relación OneToOne con AperturaCaja (clave foránea de la apertura)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_apertura", nullable = false)
    private AperturaCaja apertura;
    
    // Nota: Aunque los IDs se repiten en la tabla, el diseño de la entidad se simplifica.
    @Column(name = "id_caja", nullable = false)
    private Integer idCaja; 
    
    @Column(name = "id_usuario", nullable = false)
    private Integer idUsuario; 

    @Column(name = "fecha_cierre", nullable = false)
    private LocalDate fechaCierre;

    @Column(name = "hora_cierre", nullable = false)
    private LocalTime horaCierre;

    @Column(name = "monto_final", nullable = false)
    private BigDecimal montoFinal;

    @Column(name = "monto_esperado", nullable = false)
    private BigDecimal montoEsperado;

    @Column(name = "diferencia", nullable = false)
    private BigDecimal diferencia;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    public Long getIdCierre() {
        return idCierre;
    }

    public void setIdCierre(Long idCierre) {
        this.idCierre = idCierre;
    }

    public AperturaCaja getApertura() {
        return apertura;
    }

    public void setApertura(AperturaCaja apertura) {
        this.apertura = apertura;
    }

    public Integer getIdCaja() {
        return idCaja;
    }

    public void setIdCaja(Integer idCaja) {
        this.idCaja = idCaja;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public LocalDate getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDate fechaCierre) {
        this.fechaCierre = fechaCierre;
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

    public BigDecimal getMontoEsperado() {
        return montoEsperado;
    }

    public void setMontoEsperado(BigDecimal montoEsperado) {
        this.montoEsperado = montoEsperado;
    }

    public BigDecimal getDiferencia() {
        return diferencia;
    }

    public void setDiferencia(BigDecimal diferencia) {
        this.diferencia = diferencia;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    
}
