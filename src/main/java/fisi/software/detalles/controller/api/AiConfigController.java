package fisi.software.detalles.controller.api;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Expone configuraciones del asistente de IA que necesitan los clientes web.
 * La API Key solo se devuelve cuando se habilita explícitamente en propiedades.
 */
@RestController
@RequestMapping("/api/config")
public class AiConfigController {

    private final String groqApiKey;
    private final boolean exposeGroqKey;

    public AiConfigController(
            @Value("${detalles.ai.groq.api-key:}") String groqApiKey,
            @Value("${detalles.ai.groq.expose:false}") boolean exposeGroqKey) {
        this.groqApiKey = groqApiKey;
        this.exposeGroqKey = exposeGroqKey;
    }

    @GetMapping("/groq-key")
    public ResponseEntity<Map<String, String>> obtenerGroqApiKey() {
        if (!exposeGroqKey || groqApiKey == null || groqApiKey.isBlank()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(Map.of("apiKey", groqApiKey));
    }
}
