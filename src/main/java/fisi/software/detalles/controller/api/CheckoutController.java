package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.ComprobantePago;
import fisi.software.detalles.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

/**
 * Controller para procesar el checkout y compras
 */
@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {

    private final CheckoutService checkoutService;

    /**
     * Procesa la compra del carrito del usuario
     * 
     * POST /api/checkout/procesar
     * Body: {
     * "direccionEnvio": "Jr. Ejemplo 123, Lima",
     * "telefonoContacto": "987654321",
     * "idTipoComprobante": 1
     * }
     */
    @PostMapping("/procesar")
    public ResponseEntity<?> procesarCompra(
            @RequestBody Map<String, Object> request,
            HttpSession session) {
        try {
            // Obtener userId de la sesión
            Integer userId = (Integer) session.getAttribute("USER_ID");

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Usuario no autenticado"));
            }

            // Validar campos requeridos
            String direccionEnvio = (String) request.get("direccionEnvio");
            String telefonoContacto = (String) request.get("telefonoContacto");
            Integer idTipoComprobante = request.get("idTipoComprobante") != null
                    ? Integer.parseInt(request.get("idTipoComprobante").toString())
                    : 1; // Por defecto Boleta

            if (direccionEnvio == null || direccionEnvio.trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "La dirección de envío es requerida"));
            }

            if (telefonoContacto == null || telefonoContacto.trim().isEmpty()) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "El teléfono de contacto es requerido"));
            }

            // Validar teléfono (9 dígitos)
            if (!telefonoContacto.matches("\\d{9}")) {
                return ResponseEntity.status(400)
                        .body(Map.of("error", "El teléfono debe tener 9 dígitos"));
            }

            // Procesar la compra
            ComprobantePago comprobante = checkoutService.procesarCompra(
                    userId,
                    direccionEnvio,
                    telefonoContacto,
                    idTipoComprobante);

            log.info("Compra procesada exitosamente para usuario {}", userId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "mensaje", "Compra realizada exitosamente",
                    "comprobante", Map.of(
                            "idComprobante", comprobante.getIdComprobante(),
                            "numeroComprobante", comprobante.getNumeroComprobante(),
                            "total", comprobante.getTotal(),
                            "fecha", comprobante.getFechaEmision())));

        } catch (RuntimeException e) {
            log.error("Error al procesar compra", e);
            return ResponseEntity.status(400)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al procesar compra", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error al procesar la compra"));
        }
    }

    /**
     * Obtiene resumen del carrito para mostrar antes de confirmar
     * 
     * GET /api/checkout/resumen
     */
    @GetMapping("/resumen")
    public ResponseEntity<?> obtenerResumenCarrito(HttpSession session) {
        try {
            Integer userId = (Integer) session.getAttribute("USER_ID");

            if (userId == null) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Usuario no autenticado"));
            }

            // TODO: Implementar lógica para obtener resumen del carrito
            // Por ahora retornamos placeholder
            return ResponseEntity.ok(Map.of(
                    "message", "Resumen del carrito",
                    "userId", userId));

        } catch (Exception e) {
            log.error("Error al obtener resumen del carrito", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error al obtener resumen"));
        }
    }
}
