package fisi.software.detalles.controller.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Respuesta que se expone al front para alimentar al asistente de IA con
 * productos reales del catálogo.
 */
public record AiRecommendationResponse(
        Long productId,
        String nombre,
        String descripcion,
        String categoria,
        String color,
        String estiloSugerido,
        String publicoObjetivo,
        BigDecimal precioReferencia,
        Integer stockTotal,
        boolean stockDisponible,
        List<TallaDisponibilidad> tallas,
        String imagen,
        List<String> coincidencias,
        List<String> etiquetas,
        double puntuacion,
        boolean tallaSolicitadaDisponible
) {
    /**
     * Información simplificada de una talla: precio y stock disponible.
     */
    public record TallaDisponibilidad(
            String talla,
            BigDecimal precio,
            Integer stockDisponible
    ) {
    }
}
