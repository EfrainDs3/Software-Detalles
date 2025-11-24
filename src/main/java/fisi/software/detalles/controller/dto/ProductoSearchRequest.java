package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public class ProductoSearchRequest {
    private String nombre;
    private Long idCategoria;
    private String tipo;
    private String color;
    private Long idMaterial;
    private Long idModelo;
    private BigDecimal minPrecio;
    private BigDecimal maxPrecio;
    private Boolean estado;
    private String sortBy; // "precio_asc", "precio_desc", "nombre"
    
    // Constructores
    public ProductoSearchRequest() {}
    
    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }
    
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public Long getIdMaterial() { return idMaterial; }
    public void setIdMaterial(Long idMaterial) { this.idMaterial = idMaterial; }
    
    public Long getIdModelo() { return idModelo; }
    public void setIdModelo(Long idModelo) { this.idModelo = idModelo; }
    
    public BigDecimal getMinPrecio() { return minPrecio; }
    public void setMinPrecio(BigDecimal minPrecio) { this.minPrecio = minPrecio; }
    
    public BigDecimal getMaxPrecio() { return maxPrecio; }
    public void setMaxPrecio(BigDecimal maxPrecio) { this.maxPrecio = maxPrecio; }
    
    public Boolean getEstado() { return estado; }
    public void setEstado(Boolean estado) { this.estado = estado; }
    
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
}