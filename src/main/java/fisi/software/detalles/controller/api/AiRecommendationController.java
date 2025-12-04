package fisi.software.detalles.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fisi.software.detalles.controller.dto.AiRecommendationRequest;
import fisi.software.detalles.controller.dto.AiRecommendationResponse;
import fisi.software.detalles.service.AiRecommendationService;

/**
 * API pública que alimenta al asistente de IA con datos reales del catálogo.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiRecommendationController {

    private final AiRecommendationService recommendationService;

    public AiRecommendationController(AiRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/recommendations")
    public ResponseEntity<List<AiRecommendationResponse>> obtenerRecomendaciones(
            @RequestBody AiRecommendationRequest request) {
        List<AiRecommendationResponse> recomendaciones = recommendationService.obtenerRecomendaciones(request);
        return ResponseEntity.ok(recomendaciones);
    }
}
