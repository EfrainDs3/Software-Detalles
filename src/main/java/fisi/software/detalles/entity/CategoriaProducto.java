package fisi.software.detalles.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "categoriasproducto")
public class CategoriaProducto implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long id;

    @Column(name = "nombre_categoria", nullable = false, unique = true, length = 50)
    private String nombre;

    public CategoriaProducto() {
    }

    public CategoriaProducto(String nombre) {
        this.nombre = nombre;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
