package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public class CierreRequestDTO {
    private Long idApertura; // ID de la sesión abierta
    private BigDecimal montoFinal;

    // Getters y Setters
    public Long getIdApertura() { return idApertura; }
    public void setIdApertura(Long idApertura) { this.idApertura = idApertura; }
    public BigDecimal getMontoFinal() { return montoFinal; }
    public void setMontoFinal(BigDecimal montoFinal) { this.montoFinal = montoFinal; }
}
