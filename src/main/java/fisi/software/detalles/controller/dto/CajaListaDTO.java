package fisi.software.detalles.controller.dto;

public class CajaListaDTO {
    private Integer idCaja;
    private String nombreCaja;

    // Constructor vacío
    public CajaListaDTO() {}

    // Constructor con parámetros
    public CajaListaDTO(Integer idCaja, String nombreCaja) {
        this.idCaja = idCaja;
        this.nombreCaja = nombreCaja;
    }

    // Getters y Setters
    public Integer getIdCaja() {
        return idCaja;
    }

    public void setIdCaja(Integer idCaja) {
        this.idCaja = idCaja;
    }

    public String getNombreCaja() {
        return nombreCaja;
    }

    public void setNombreCaja(String nombreCaja) {
        this.nombreCaja = nombreCaja;
    }
}