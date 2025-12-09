package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;
import java.util.List;

public class DetalleCompraDTO {

    private Long idDetallePedido;
    private Long idProducto;
    private String nombreProducto;
    private Integer cantidad;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
    private Integer cantidadRecibida;
    private Integer cantidadPendiente;

    // Soporte para tallas
    private Boolean tieneTallas;
    private List<DetalleTallaDTO> tallas;

    // Constructores
    public DetalleCompraDTO() {
        this.cantidadRecibida = 0;
        this.cantidadPendiente = 0;
    }

    public DetalleCompraDTO(Long idProducto, Integer cantidad, BigDecimal costoUnitario) {
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.costoUnitario = costoUnitario;
        this.cantidadRecibida = 0;
        this.cantidadPendiente = cantidad != null ? cantidad : 0;
        calcularSubtotal();
    }

    // Métodos de utilidad
    private void calcularSubtotal() {
        if (cantidad != null && costoUnitario != null) {
            this.subtotal = costoUnitario.multiply(new BigDecimal(cantidad));
        } else {
            this.subtotal = BigDecimal.ZERO;
        }
    }

    // Getters y Setters
    public Long getIdDetallePedido() {
        return idDetallePedido;
    }

    public void setIdDetallePedido(Long idDetallePedido) {
        this.idDetallePedido = idDetallePedido;
    }

    public Long getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Long idProducto) {
        this.idProducto = idProducto;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
        calcularSubtotal();
    }

    public BigDecimal getCostoUnitario() {
        return costoUnitario;
    }

    public void setCostoUnitario(BigDecimal costoUnitario) {
        this.costoUnitario = costoUnitario;
        calcularSubtotal();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public Integer getCantidadRecibida() {
        return cantidadRecibida;
    }

    public void setCantidadRecibida(Integer cantidadRecibida) {
        this.cantidadRecibida = cantidadRecibida;
    }

    public Integer getCantidadPendiente() {
        return cantidadPendiente;
    }

    public void setCantidadPendiente(Integer cantidadPendiente) {
        this.cantidadPendiente = cantidadPendiente;
    }

    public Boolean getTieneTallas() {
        return tieneTallas;
    }

    public void setTieneTallas(Boolean tieneTallas) {
        this.tieneTallas = tieneTallas;
    }

    public List<DetalleTallaDTO> getTallas() {
        return tallas;
    }

    public void setTallas(List<DetalleTallaDTO> tallas) {
        this.tallas = tallas;
    }
}
