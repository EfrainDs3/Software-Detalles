package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public class CajaEstadoDTO {
    private boolean abierta;
    private Long idAperturaActiva; // Se usa para el cierre
    private String trabajador;
    private BigDecimal montoInicial;
    public boolean isAbierta() {
        return abierta;
    }
    public void setAbierta(boolean abierta) {
        this.abierta = abierta;
    }
    public Long getIdAperturaActiva() {
        return idAperturaActiva;
    }
    public void setIdAperturaActiva(Long idAperturaActiva) {
        this.idAperturaActiva = idAperturaActiva;
    }
    public String getTrabajador() {
        return trabajador;
    }
    public void setTrabajador(String trabajador) {
        this.trabajador = trabajador;
    }
    public BigDecimal getMontoInicial() {
        return montoInicial;
    }
    public void setMontoInicial(BigDecimal montoInicial) {
        this.montoInicial = montoInicial;
    }
    public CajaEstadoDTO(boolean abierta, Long idAperturaActiva, String trabajador, BigDecimal montoInicial) {
        this.abierta = abierta;
        this.idAperturaActiva = idAperturaActiva;
        this.trabajador = trabajador;
        this.montoInicial = montoInicial;
    }

    
}
