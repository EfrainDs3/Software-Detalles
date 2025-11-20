package fisi.software.detalles.controller.dto;

public class CrearCajaRequestDTO {
    private String nombreCaja;
    private String ubicacionCaja;

    // Constructor vacío
    public CrearCajaRequestDTO() {}

    // Constructor con parámetros
    public CrearCajaRequestDTO(String nombreCaja, String ubicacionCaja) {
        this.nombreCaja = nombreCaja;
        this.ubicacionCaja = ubicacionCaja;
    }

    // Getters y Setters
    public String getNombreCaja() {
        return nombreCaja;
    }

    public void setNombreCaja(String nombreCaja) {
        this.nombreCaja = nombreCaja;
    }

    public String getUbicacionCaja() {
        return ubicacionCaja;
    }

    public void setUbicacionCaja(String ubicacionCaja) {
        this.ubicacionCaja = ubicacionCaja;
    }
}