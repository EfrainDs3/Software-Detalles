package fisi.software.detalles.controller.api;

import fisi.software.detalles.service.ReniecService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reniec")
@RequiredArgsConstructor
public class ReniecApiController {

    private final ReniecService reniecService;
    private final Logger log = LoggerFactory.getLogger(ReniecApiController.class);

    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_CLIENTES, T(fisi.software.detalles.security.Permisos).MODULO_CLIENTES, T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS, T(fisi.software.detalles.security.Permisos).MODULO_USUARIOS, T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS, T(fisi.software.detalles.security.Permisos).MODULO_VENTAS)")
    public ResponseEntity<?> lookup(@RequestParam String tipo, @RequestParam String numero) {
        try {
            Map<String, Object> data = reniecService.lookup(tipo, numero);
            if (data == null) {
                log.warn("RENIEC provider returned null for tipo={} numero={}", tipo, numero);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", "Error consultando proveedor externo", "provider", "reniec"));
            }
            return ResponseEntity.ok(data);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", iae.getMessage(),
                "tipo", tipo,
                "numero", numero
            ));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", ise.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", "Error al consultar RENIEC", "detail", ex.getMessage()));
        }
    }

    /**
     * Endpoint de prueba que devuelve la respuesta cruda del proveedor para facilitar pruebas manuales
     * Accesible vía: GET /api/reniec/test?tipo=DNI&numero=12345678
     */
    @GetMapping("/test")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_CLIENTES, T(fisi.software.detalles.security.Permisos).MODULO_CLIENTES, T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS, T(fisi.software.detalles.security.Permisos).MODULO_USUARIOS, T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS, T(fisi.software.detalles.security.Permisos).MODULO_VENTAS)")
    public ResponseEntity<?> testLookup(@RequestParam String tipo, @RequestParam String numero) {
        try {
            Map<String, Object> data = reniecService.lookup(tipo, numero);
            if (data == null) {
                log.warn("RENIEC provider returned null for test lookup tipo={} numero={}", tipo, numero);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", "Error consultando proveedor externo (test)", "provider", "reniec"));
            }
            return ResponseEntity.ok(data);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", iae.getMessage(),
                "tipo", tipo,
                "numero", numero
            ));
        } catch (IllegalStateException ise) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("message", ise.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("message", "Error al consultar RENIEC (test)", "detail", ex.getMessage()));
        }
    }
}
