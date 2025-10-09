package fisi.software.detalles.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    /**
     * Código único usado para identificar el permiso en seeds, asignaciones y verificaciones.
     * Mantenerlo sincronizado con las constantes de inicialización y el frontend.
     */
    @Column(name = "codigo", nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(name = "nombre_permiso", nullable = false, length = 150)
    private String nombrePermiso;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "ACTIVO";

    @ManyToMany(mappedBy = "permisos", fetch = FetchType.LAZY)
    private Set<Rol> roles = new HashSet<>();

    @ManyToMany(mappedBy = "permisosExtra", fetch = FetchType.LAZY)
    private Set<Usuario> usuarios = new HashSet<>();
}
