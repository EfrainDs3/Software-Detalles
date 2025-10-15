package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

public class DetalleVentaListDTO {
    private String nombre_producto;
    private Integer cantidad;
    private BigDecimal precio_unitario;

    public DetalleVentaListDTO(String nombre_producto, Integer cantidad, BigDecimal precio_unitario) {
        this.nombre_producto = nombre_producto;
        this.cantidad = cantidad;
        this.precio_unitario = precio_unitario;
    }

    public String getNombre_producto() { return nombre_producto; }
    public Integer getCantidad() { return cantidad; }
    public BigDecimal getPrecio_unitario() { return precio_unitario; }
}
