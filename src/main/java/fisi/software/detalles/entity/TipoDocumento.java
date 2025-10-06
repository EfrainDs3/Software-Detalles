package fisi.software.detalles.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa un tipo de documento
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Entity
@Table(name = "tipodocumento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoDocumento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipodocumento")
    private Integer idTipoDocumento;
    
    @Column(name = "nombre_tipodocumento", nullable = false, unique = true, length = 50)
    private String nombreTipoDocumento;
}
