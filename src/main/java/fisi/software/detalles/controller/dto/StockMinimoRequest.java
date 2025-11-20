package fisi.software.detalles.controller.dto;

/**
 * DTO simple para actualizar el stock mínimo de un inventario o de una talla.
 */
public class StockMinimoRequest {
    private Integer stockMinimo;

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }
}