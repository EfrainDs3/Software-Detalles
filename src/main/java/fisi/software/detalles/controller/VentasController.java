package fisi.software.detalles.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Controller; // Importar @Controller

import com.itextpdf.text.DocumentException; 
import java.io.IOException; 
import java.util.Map;

import fisi.software.detalles.controller.dto.VentaRequestDTO;
import fisi.software.detalles.service.VentaService;

@Controller
@RequestMapping("/ventas")
public class VentasController {

    @Autowired
    private VentaService ventaService; 
    
    // ======================================================================
    // MÉTODOS DE VISTA HTML (Devuelven el nombre de la plantilla)
    // ======================================================================
    
    /**
     * GET /ventas
     * Muestra la lista de ventas.
     */
    @GetMapping
    public String showVentas() {
        return "software/ventas/ventas";
    }

    /**
     * GET /ventas/caja
     * Muestra la página de punto de venta (caja).
     */
    @GetMapping("/caja")
    public String showCaja() {
        return "software/ventas/caja";
    }

    // ======================================================================
    // MÉTODOS DE API REST (Devuelven JSON o Archivos)
    // ======================================================================

    /**
     * POST /ventas/api
     * Registra una nueva venta.
     */
    @PostMapping("/api") 
    @ResponseBody // Necesario para que @Controller devuelva JSON/Datos en lugar de buscar una vista
    public ResponseEntity<Map<String, Object>> createVenta(@RequestBody VentaRequestDTO ventaDTO) {
        try {
            Map<String, Object> response = ventaService.registrarNuevaVenta(ventaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("Error al registrar la venta: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * GET /ventas/{id}/pdf
     * Genera y devuelve el PDF del comprobante.
     */
    @GetMapping("/{id}/pdf") 
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