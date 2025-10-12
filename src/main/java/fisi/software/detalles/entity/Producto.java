package fisi.software.detalles.entity;

import fisi.software.detalles.entity.Catalogo.Material;
import fisi.software.detalles.entity.Catalogo.Modelo;
import fisi.software.detalles.entity.Catalogo.Tipo;
import fisi.software.detalles.entity.Catalogo.Unidad;
import jakarta.persistence.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Entity
@Table(name = "Productos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "categoria", "proveedor", "modelo", "material", "unidad", "tiposProducto", "tallas"})
public class Producto implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    @Column(name = "nombre_producto", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 600)
    private String descripcion;

    @Column(name = "precio_venta", precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "costo_compra", precision = 10, scale = 2)
    private BigDecimal costoCompra;

    @Column(name = "codigo_barra", length = 50)
    private String codigoBarra;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "tipo", length = 20)
    private String tipo;

    @Column(name = "dimensiones", length = 50)
    private String dimensiones;

    @Column(name = "peso_gramos")
    private Integer pesoGramos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private CategoriaProducto categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor")
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modelo")
    private Modelo modelo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_material")
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad_medida")
    private Unidad unidad;

    @Column(name = "estado", nullable = false)
    private Boolean estado = Boolean.TRUE;

    @ManyToMany
    @JoinTable(name = "Producto_Tipos",
            joinColumns = @JoinColumn(name = "id_producto"),
            inverseJoinColumns = @JoinColumn(name = "id_tipo"))
    private Set<Tipo> tiposProducto = new LinkedHashSet<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductoTalla> tallas = new LinkedHashSet<>();

    public Producto() {
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimal getPrecioVenta() {
        return precioVenta;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public BigDecimal getCostoCompra() {
        return costoCompra;
    }

    public void setCostoCompra(BigDecimal costoCompra) {
        this.costoCompra = costoCompra;
    }

    public String getCodigoBarra() {
        return codigoBarra;
    }

    public void setCodigoBarra(String codigoBarra) {
        this.codigoBarra = codigoBarra;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDimensiones() {
        return dimensiones;
    }

    public void setDimensiones(String dimensiones) {
        this.dimensiones = dimensiones;
    }

    public Integer getPesoGramos() {
        return pesoGramos;
    }

    public void setPesoGramos(Integer pesoGramos) {
        this.pesoGramos = pesoGramos;
    }

    public CategoriaProducto getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaProducto categoria) {
        this.categoria = categoria;
    }

    public Proveedor getProveedor() {
        return proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public Modelo getModelo() {
        return modelo;
    }

    public void setModelo(Modelo modelo) {
        this.modelo = modelo;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public Unidad getUnidad() {
        return unidad;
    }

    public void setUnidad(Unidad unidad) {
        this.unidad = unidad;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public Set<Tipo> getTiposProducto() {
        return tiposProducto;
    }

    public void setTiposProducto(Set<Tipo> tiposProducto) {
        this.tiposProducto = tiposProducto;
    }

    public Set<ProductoTalla> getTallas() {
        return tallas;
    }

    public void setTallas(Set<ProductoTalla> tallas) {
        this.tallas = tallas;
    }

    public void reemplazarTallas(Set<ProductoTalla> nuevasTallas) {
        this.tallas.clear();
        if (nuevasTallas != null) {
            nuevasTallas.forEach(this::agregarTalla);
        }
    }

    public void agregarTalla(ProductoTalla talla) {
        Objects.requireNonNull(talla, "La talla no puede ser nula");
        talla.setProducto(this);
        this.tallas.add(talla);
    }

    public void limpiarTiposProducto() {
        this.tiposProducto.clear();
    }
}
