package fisi.software.detalles.entity;

import jakarta.persistence.*;

/**
 * Entidad que representa los tipos de movimiento de inventario
 */
@Entity
@Table(name = "tiposmovimientoinventario")
public class TipoMovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_movimiento")
    private Long id;

    @Column(name = "nombre_tipo", nullable = false, length = 50, unique = true)
    private String nombre;

    @Column(name = "es_entrada", nullable = false)
    private Boolean esEntrada;

    public TipoMovimientoInventario() {
    }

    public TipoMovimientoInventario(String nombre, Boolean esEntrada) {
        this.nombre = nombre;
        this.esEntrada = esEntrada;
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

    public Boolean getEsEntrada() {
        return esEntrada;
    }

    public void setEsEntrada(Boolean esEntrada) {
        this.esEntrada = esEntrada;
    }

    public boolean isEsEntrada() {
        return esEntrada != null && esEntrada;
    }
}