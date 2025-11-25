package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public class CierreRequestDTO {
    private Long idApertura; // ✅ Long, no Integer
    private BigDecimal montoFinal; // ✅ BigDecimal, no Double
    private Integer idUsuario;

    // Getters y Setters
    public Long getIdApertura() { return idApertura; }
    public void setIdApertura(Long idApertura) { this.idApertura = idApertura; }
    public BigDecimal getMontoFinal() { return montoFinal; }
    public void setMontoFinal(BigDecimal montoFinal) { this.montoFinal = montoFinal; }
    public Integer getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}