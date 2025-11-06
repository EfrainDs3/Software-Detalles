package fisi.software.detalles.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entidad que representa un cliente
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;
    
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;
    
    @Column(name = "apellido", nullable = true, length = 100)
    private String apellido;
    
    @ManyToOne
    @JoinColumn(name = "id_tipodocumento")
    private TipoDocumento tipoDocumento;
    
    @Column(name = "numero_documento", length = 20)
    private String numeroDocumento;
    
    @Column(name = "direccion", length = 255)
    private String direccion;
    
    @Column(name = "telefono", length = 20)
    private String telefono;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;
    
    @Column(name = "estado", nullable = false)
    private Boolean estado;
    
    /**
     * Hook que se ejecuta antes de persistir la entidad
     */
    @PrePersist
    protected void onCreate() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
        if (estado == null) {
            estado = true;
        }
    }
    
    /**
     * Obtiene el nombre completo del cliente
     * 
     * @return Nombre completo
     */
    public String getNombreCompleto() {
        String safeNombre = nombre != null ? nombre.trim() : "";
        String safeApellido = apellido != null ? apellido.trim() : "";
        return (safeNombre + " " + safeApellido).trim();
    }
}
