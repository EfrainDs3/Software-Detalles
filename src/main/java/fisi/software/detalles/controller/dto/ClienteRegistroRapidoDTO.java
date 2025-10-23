// ClienteRegistroRapidoDTO.java (NUEVO ARCHIVO)
package fisi.software.detalles.controller.dto;

public class ClienteRegistroRapidoDTO {
    private Integer idTipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;

    // Getters y Setters
    public Integer getIdTipoDocumento() { return idTipoDocumento; }
    public void setIdTipoDocumento(Integer idTipoDocumento) { this.idTipoDocumento = idTipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
}