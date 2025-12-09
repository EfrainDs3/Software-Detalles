package fisi.software.detalles.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import fisi.software.detalles.controller.dto.AiContextResponse;
import fisi.software.detalles.exception.ExternalServiceException;
import fisi.software.detalles.service.AiContextService;

/**
 * Expone el contexto situacional (clima + festividades) que el frontend emplea
 * para enriquecer las conversaciones con la IA.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiContextController {

    private final AiContextService contextService;

    public AiContextController(AiContextService contextService) {
        this.contextService = contextService;
    }

    @GetMapping("/context")
    public ResponseEntity<AiContextResponse> obtenerContexto() {
        try {
            AiContextResponse response = contextService.obtenerContexto();
            return ResponseEntity.ok(response);
        } catch (ExternalServiceException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, ex.getMessage(), ex);
        }
    }
}
