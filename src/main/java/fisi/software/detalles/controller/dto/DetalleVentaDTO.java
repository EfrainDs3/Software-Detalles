package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;

// Este DTO representa cada línea de producto en la solicitud de venta.
public class DetalleVentaDTO {
    
    // Usamos el nombre temporalmente hasta que se pueda buscar el ID real
    @NotBlank(message = "El nombre del producto no puede ser nulo o vacío.")

    private String nombre_producto_temp; 
    private Integer cantidad;
    private BigDecimal precio_unitario;
    private BigDecimal descuento_aplicado; 

    // Constructor vacío (necesario para la deserialización de JSON por Spring)
    public DetalleVentaDTO() {}

    // Getters y Setters
    public String getNombre_producto_temp() {
        return nombre_producto_temp;
    }

    public void setNombre_producto_temp(String nombre_producto_temp) {
        this.nombre_producto_temp = nombre_producto_temp;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecio_unitario() {
        return precio_unitario;
    }

    public void setPrecio_unitario(BigDecimal precio_unitario) {
        this.precio_unitario = precio_unitario;
    }

    public BigDecimal getDescuento_aplicado() {
        return descuento_aplicado;
    }

    public void setDescuento_aplicado(BigDecimal descuento_aplicado) {
        this.descuento_aplicado = descuento_aplicado;
    }
}