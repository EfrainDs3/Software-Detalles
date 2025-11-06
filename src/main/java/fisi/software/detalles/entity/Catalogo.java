package fisi.software.detalles.entity;

import jakarta.persistence.*;

/**
 * Entidades relacionadas a los catálogos de productos (marcas, modelos, materiales,
 * unidades de medida y tipos de producto) agrupadas en un único archivo tal como lo
 * solicitó el usuario.
 */
public class Catalogo {

    private Catalogo() {
        // Evitar instanciación
    }

    @Entity(name = "CatalogoMarca")
    @Table(name = "marcasproducto")
    public static class Marca {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_marca")
        private Long id;

        @Column(name = "nombre_marca", nullable = false, unique = true, length = 50)
        private String nombre;

        public Marca() {
        }

        public Marca(String nombre) {
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

    @Entity(name = "CatalogoModelo")
    @Table(name = "modelos")
    public static class Modelo {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_modelo")
        private Long id;

        @Column(name = "nombre_modelo", nullable = false, length = 100)
        private String nombre;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_marca", nullable = false)
        private Marca marca;

        @Column(name = "imagen_principal", length = 2555)
        private String imagen;

        public Modelo() {
        }

        public Modelo(String nombre, Marca marca, String imagen) {
            this.nombre = nombre;
            this.marca = marca;
            this.imagen = imagen;
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

        public Marca getMarca() {
            return marca;
        }

        public void setMarca(Marca marca) {
            this.marca = marca;
        }

        public String getImagen() {
            return imagen;
        }

        public void setImagen(String imagen) {
            this.imagen = imagen;
        }
    }

    @Entity(name = "CatalogoMaterial")
    @Table(name = "materialesproducto")
    public static class Material {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_material")
        private Long id;

        @Column(name = "nombre_material", nullable = false, unique = true, length = 100)
        private String nombre;

        public Material() {
        }

        public Material(String nombre) {
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

    @Entity(name = "CatalogoUnidad")
    @Table(name = "unidadesmedida")
    public static class Unidad {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_unidad_medida")
        private Long id;

        @Column(name = "nombre_unidad", nullable = false, unique = true, length = 50)
        private String nombre;

        @Column(name = "abreviatura", length = 10)
        private String abreviatura;

        public Unidad() {
        }

        public Unidad(String nombre, String abreviatura) {
            this.nombre = nombre;
            this.abreviatura = abreviatura;
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

        public String getAbreviatura() {
            return abreviatura;
        }

        public void setAbreviatura(String abreviatura) {
            this.abreviatura = abreviatura;
        }
    }

    @Entity(name = "CatalogoTipo")
    @Table(name = "tiposproducto")
    public static class Tipo {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "id_tipo")
        private Long id;

        @Column(name = "nombre_tipo", nullable = false, unique = true, length = 50)
        private String nombre;

        public Tipo() {
        }

        public Tipo(String nombre) {
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
}
