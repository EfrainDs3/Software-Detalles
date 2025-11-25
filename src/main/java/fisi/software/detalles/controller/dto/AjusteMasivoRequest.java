package fisi.software.detalles.controller.dto;

import java.util.List;

/**
 * Solicitud para aplicar ajustes masivos de inventario.
 */
public class AjusteMasivoRequest {

    private List<AjusteDetalle> ajustes;

    public List<AjusteDetalle> getAjustes() {
        return ajustes;
    }

    public void setAjustes(List<AjusteDetalle> ajustes) {
        this.ajustes = ajustes;
    }

    public static class AjusteDetalle {
        private Long idInventario;
        private Long idProducto;
        private Long tipoMovimientoId;
        private Integer cantidad;
        private Integer stockMinimo;
        private String talla;
        private String referencia;
        private String observaciones;

        public AjusteDetalle() {
        }

        public Long getIdInventario() {
            return idInventario;
        }

        public void setIdInventario(Long idInventario) {
            this.idInventario = idInventario;
        }

        public Long getIdProducto() {
            return idProducto;
        }

        public void setIdProducto(Long idProducto) {
            this.idProducto = idProducto;
        }

        public Long getTipoMovimientoId() {
            return tipoMovimientoId;
        }

        public void setTipoMovimientoId(Long tipoMovimientoId) {
            this.tipoMovimientoId = tipoMovimientoId;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }

        public Integer getStockMinimo() {
            return stockMinimo;
        }

        public void setStockMinimo(Integer stockMinimo) {
            this.stockMinimo = stockMinimo;
        }

        public String getTalla() {
            return talla;
        }

        public void setTalla(String talla) {
            this.talla = talla;
        }

        public String getReferencia() {
            return referencia;
        }

        public void setReferencia(String referencia) {
            this.referencia = referencia;
        }

        public String getObservaciones() {
            return observaciones;
        }

        public void setObservaciones(String observaciones) {
            this.observaciones = observaciones;
        }
    }
}
