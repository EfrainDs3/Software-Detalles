package fisi.software.detalles.entity;

import jakarta.persistence.*;
import jakarta.persistence.ConstraintMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Registra eventos relevantes relacionados a un permiso (creación, actualización, eliminación y asignaciones).
 */
@Entity
@Table(name = "permisos_auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_permiso", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private Permiso permiso;

    @Column(name = "id_permiso", insertable = false, updatable = false)
    private Long permisoId;

    @Column(name = "accion", nullable = false, length = 40)
    private String accion;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "permiso_nombre", length = 150)
    private String permisoNombre;

    @Column(name = "usuario", length = 100)
    private String usuario;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    protected void prePersist() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
    }
}
