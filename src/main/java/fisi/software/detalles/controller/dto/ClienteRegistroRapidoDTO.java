// ClienteRegistroRapidoDTO.java (NUEVO ARCHIVO)
package fisi.software.detalles.controller.dto;

/**
 * DTO para el registro rápido de clientes.
 * Ahora incluye campos opcionales adicionales (email, telefono, direccion)
 * para soportar el formulario completo desde el frontend.
 */
public class ClienteRegistroRapidoDTO {
    private Integer idTipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;
    // Campos opcionales añadidos
    private String email;
    private String telefono;
    private String direccion;

    // Getters y Setters
    public Integer getIdTipoDocumento() { return idTipoDocumento; }
    public void setIdTipoDocumento(Integer idTipoDocumento) { this.idTipoDocumento = idTipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
}