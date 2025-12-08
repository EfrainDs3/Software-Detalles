package fisi.software.detalles.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

// 💡 IMPORTS NECESARIOS PARA LA VALIDACIÓN Y MANEJO DE ERRORES
import javax.validation.Valid;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

import com.itextpdf.text.DocumentException;
import java.io.IOException;

import fisi.software.detalles.controller.dto.VentaRequestDTO;
import fisi.software.detalles.service.VentaService;
import java.math.BigDecimal;

@Controller
@RequestMapping("/ventas")
public class VentasController {

    @Autowired
    private VentaService ventaService;

    // ======================================================================
    // MÉTODOS DE VISTA HTML (Devuelven el nombre de la plantilla)
    // ======================================================================

    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS, T(fisi.software.detalles.security.Permisos).VER_VENTAS, T(fisi.software.detalles.security.Permisos).MODULO_VENTAS)")
    public String showVentas() {
        return "software/ventas/ventas";
    }

    @GetMapping("/caja")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS, T(fisi.software.detalles.security.Permisos).VER_ESTADO_DE_CAJA, T(fisi.software.detalles.security.Permisos).MODULO_CAJA, T(fisi.software.detalles.security.Permisos).MODULO_VENTAS)")
    public String showCaja() {
        return "software/ventas/caja";
    }

    /**
     * PUT /ventas/api
     * Edita una venta existente
     */
    @PutMapping("/api")
    @ResponseBody
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS)")
    public ResponseEntity<Map<String, Object>> updateVenta(@Valid @RequestBody VentaRequestDTO ventaDTO) {
        try {
            Map<String, Object> response = ventaService.updateVenta(ventaDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error al actualizar la venta: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================================================================
    // MÉTODOS DE API REST (Devuelven JSON o Archivos)
    // ======================================================================

    @GetMapping("/api/lista")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS, T(fisi.software.detalles.security.Permisos).VER_VENTAS, T(fisi.software.detalles.security.Permisos).MODULO_VENTAS)")
    public ResponseEntity<List<?>> listarVentasAPI() {
        try {
            List<fisi.software.detalles.controller.dto.VentaListDTO> ventas = ventaService.listarTodasLasVentas();
            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            System.err.println("Error al obtener la lista de ventas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/api/total-apertura/{id}")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).VER_VENTAS, T(fisi.software.detalles.security.Permisos).MODULO_CAJA)")
    public ResponseEntity<Map<String, BigDecimal>> getTotalVentasPorApertura(@PathVariable Long id) {
        try {
            BigDecimal total = ventaService.calcularTotalVentasPorApertura(id);
            return ResponseEntity.ok(Map.of("total", total));
        } catch (Exception e) {
            System.err.println("Error calculating total for aperture " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /ventas/api
     * 💡 CORRECCIÓN: Se añade @Valid para que se ejecute la validación de los DTOs
     * anidados.
     */
    @PostMapping("/api")
    @ResponseBody
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS)")
    public ResponseEntity<Map<String, Object>> createVenta(@Valid @RequestBody VentaRequestDTO ventaDTO) {
        try {
            Map<String, Object> response = ventaService.registrarNuevaVenta(ventaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Error al registrar la venta: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 💡 NUEVO MÉTODO: Maneja errores de validación (@Valid) y devuelve un JSON
     * claro (400 Bad Request).
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        // Recorre todos los errores de campo y los agrega al mapa de errores
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        return Map.of(
                "message", "Error de Validación en la Solicitud",
                "errors", errors.toString());
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).REGISTRAR_VENTAS, T(fisi.software.detalles.security.Permisos).VER_VENTAS, T(fisi.software.detalles.security.Permisos).MODULO_VENTAS)")
    public ResponseEntity<ByteArrayResource> exportarPDF(@PathVariable Long id) {
        try {
            byte[] pdfBytes = ventaService.generarComprobantePDF(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "comprobante_venta_" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);

        } catch (DocumentException | IOException e) {
            System.err.println("Error al generar PDF para la venta " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}