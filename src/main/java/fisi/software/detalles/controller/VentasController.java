package fisi.software.detalles.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import fisi.software.detalles.service.VentaService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;

/**
 * Controlador para la gestión de ventas y caja
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/ventas")
public class VentasController {
    
    /**
     * Muestra la página de gestión de ventas
     * 
     * @return Vista de ventas
     */
    @GetMapping
    public String showVentas() {
        return "software/ventas/ventas";
    }
    
    /**
     * Muestra la página de punto de venta (caja)
     * 
     * @return Vista de caja
     */
    @GetMapping("/caja")
    public String showCaja() {
        return "software/ventas/caja";
    }
    
    // TODO: Implementar endpoints REST para:
    // - GET /ventas/api - Listar ventas
    // - GET /ventas/api/{id} - Obtener venta por ID
    // - POST /ventas/api - Registrar nueva venta
    // - PUT /ventas/api/{id} - Actualizar venta
    // - DELETE /ventas/api/{id} - Anular venta
    // - GET /ventas/api/caja/estado - Estado de caja
    // - POST /ventas/api/caja/abrir - Abrir caja
    // - POST /ventas/api/caja/cerrar - Cerrar caja
    // - GET /ventas/api/caja/movimientos - Movimientos de caja

    @Autowired
    private VentaService ventaService;

     @GetMapping("/{id}/pdf")
    public ResponseEntity<ByteArrayResource> exportarPDF(@PathVariable Long id) {
        try {
            // Lógica de Servicio: Generar el PDF real
            // byte[] pdfBytes = ventaService.generarComprobantePDF(id); 
            
            // SIMULACIÓN: Generar un PDF de ejemplo (reemplazar con la lógica real)
            byte[] pdfBytes = "Esto es un contenido binario de un PDF simulado.".getBytes(); 
            // VentaService necesita usar iText o similar para generar los bytes reales.

            // Definición de las cabeceras para la descarga/visualización en el navegador
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            // Nombre del archivo que el usuario verá
            headers.setContentDispositionFormData("attachment", "comprobante_venta_" + id + ".pdf");
            headers.setContentLength(pdfBytes.length);

            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);
            
        } catch (Exception e) {
            System.err.println("Error al generar PDF para la venta " + id + ": " + e.getMessage());
            // Devolver un error 500 o 404 si la venta no existe
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
