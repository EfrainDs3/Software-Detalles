package fisi.software.detalles.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad que representa un permiso del sistema.
 */
@Entity
@Table(name = "permisos")
@Getter
@Setter
@NoArgsConstructor
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Long idPermiso;

    @Column(name = "nombre_permiso", nullable = false, length = 150)
    private String nombrePermiso;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "modulo", nullable = false, length = 100)
    private String modulo = "GENERAL";

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "ACTIVO";

    @ManyToMany(mappedBy = "permisos", fetch = FetchType.LAZY)
    private Set<Rol> roles = new HashSet<>();

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        LocalDateTime ahora = LocalDateTime.now();
        this.fechaCreacion = ahora;
        this.fechaActualizacion = ahora;
        if (this.descripcion == null) {
            this.descripcion = "";
        }
        if (this.estado == null) {
            this.estado = "ACTIVO";
        }
        if (this.modulo == null || this.modulo.isBlank()) {
            this.modulo = "GENERAL";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
        if (this.descripcion == null) {
            this.descripcion = "";
        }
        if (this.estado == null) {
            this.estado = "ACTIVO";
        }
        if (this.modulo == null || this.modulo.isBlank()) {
            this.modulo = "GENERAL";
        }
    }
}
