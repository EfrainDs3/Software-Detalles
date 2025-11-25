package fisi.software.detalles.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "tipoDocumento", "roles"})
public class Usuario {

    public Integer getId() {
        return this.id;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer id;

    @NotBlank
    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;

    @NotBlank
    @Column(name = "apellidos", nullable = false, length = 100)
    private String apellidos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipodocumento")
    private TipoDocumento tipoDocumento;

    @Column(name = "numero_documento", length = 20)
    private String numeroDocumento;

    @Column(name = "celular", length = 20)
    private String celular;

    @Column(name = "direccion", length = 255)
    private String direccion;

    @NotBlank
    @Column(name = "username", nullable = false, length = 50, unique = true)
    private String username;

    @NotBlank
    @Email
    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "contraseña_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "estado", nullable = false)
    private Boolean estado = Boolean.TRUE;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_ultima_sesion")
    private LocalDateTime fechaUltimaSesion;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "usuario_roles",
        joinColumns = @JoinColumn(name = "id_usuario"),
        inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private Set<Rol> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = Boolean.TRUE;
        }
    }
}

