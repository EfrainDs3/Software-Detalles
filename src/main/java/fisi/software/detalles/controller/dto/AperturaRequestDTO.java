package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public class AperturaRequestDTO {
    private Integer idCaja; // ID de la caja a abrir
    private BigDecimal montoInicial;
    private Integer idUsuario;

    // Constructor vacío
    public AperturaRequestDTO() {}

    // Constructor con parámetros
    public AperturaRequestDTO(Integer idCaja, BigDecimal montoInicial) {
        this.idCaja = idCaja;
        this.montoInicial = montoInicial;
    }

    // Getters y Setters
    public Integer getIdCaja() {
        return idCaja;
    }

    public void setIdCaja(Integer idCaja) {
        this.idCaja = idCaja;
    }

    public BigDecimal getMontoInicial() {
        return montoInicial;
    }

    public void setMontoInicial(BigDecimal montoInicial) {
        this.montoInicial = montoInicial;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}