package fisi.software.detalles.controller;

import com.itextpdf.text.DocumentException;
import fisi.software.detalles.controller.dto.*;
import fisi.software.detalles.service.PDFGeneratorService;
import fisi.software.detalles.service.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Controlador para el módulo de reportes
 */
@Controller
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;
    private final PDFGeneratorService pdfGeneratorService;

    /**
     * Vista principal de reportes
     */
    @GetMapping("/reportes")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).VER_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public String showReportesView() {
        return "software/reportes/reportes";
    }

    /**
     * Generar datos de reporte de ventas
     */
    @PostMapping("/api/reportes/ventas")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).VER_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<ReporteVentasDTO> generarReporteVentas(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteVentasDTO reporte = reportesService.generarReporteVentas(filtros);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exportar reporte de ventas a PDF
     */
    @PostMapping("/api/reportes/ventas/pdf")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<byte[]> exportarReporteVentasPDF(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteVentasDTO reporte = reportesService.generarReporteVentas(filtros);
            byte[] pdfBytes = pdfGeneratorService.generarPDFVentas(reporte, filtros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", generarNombreArchivo("ventas", filtros));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar datos de reporte de inventario
     */
    @PostMapping("/api/reportes/inventario")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).VER_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<ReporteInventarioDTO> generarReporteInventario(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteInventarioDTO reporte = reportesService.generarReporteInventario(filtros);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exportar reporte de inventario a PDF
     */
    @PostMapping("/api/reportes/inventario/pdf")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<byte[]> exportarReporteInventarioPDF(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteInventarioDTO reporte = reportesService.generarReporteInventario(filtros);
            byte[] pdfBytes = pdfGeneratorService.generarPDFInventario(reporte, filtros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", generarNombreArchivo("inventario", filtros));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar datos de reporte financiero
     */
    @PostMapping("/api/reportes/financiero")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).VER_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<ReporteFinancieroDTO> generarReporteFinanciero(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteFinancieroDTO reporte = reportesService.generarReporteFinanciero(filtros);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exportar reporte financiero a PDF
     */
    @PostMapping("/api/reportes/financiero/pdf")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<byte[]> exportarReporteFinancieroPDF(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteFinancieroDTO reporte = reportesService.generarReporteFinanciero(filtros);
            byte[] pdfBytes = pdfGeneratorService.generarPDFFinanciero(reporte, filtros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", generarNombreArchivo("financiero", filtros));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar datos de reporte de clientes
     */
    @PostMapping("/api/reportes/clientes")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).VER_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<ReporteClientesDTO> generarReporteClientes(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteClientesDTO reporte = reportesService.generarReporteClientes(filtros);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exportar reporte de clientes a PDF
     */
    @PostMapping("/api/reportes/clientes/pdf")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<byte[]> exportarReporteClientesPDF(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteClientesDTO reporte = reportesService.generarReporteClientes(filtros);
            byte[] pdfBytes = pdfGeneratorService.generarPDFClientes(reporte, filtros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", generarNombreArchivo("clientes", filtros));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generar datos de reporte de compras
     */
    @PostMapping("/api/reportes/compras")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).VER_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<ReporteComprasDTO> generarReporteCompras(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteComprasDTO reporte = reportesService.generarReporteCompras(filtros);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exportar reporte de compras a PDF
     */
    @PostMapping("/api/reportes/compras/pdf")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).MODULO_REPORTES, T(fisi.software.detalles.security.Permisos).GENERAR_REPORTES)")
    public ResponseEntity<byte[]> exportarReporteComprasPDF(@RequestBody FiltrosReporteDTO filtros) {
        try {
            ReporteComprasDTO reporte = reportesService.generarReporteCompras(filtros);
            byte[] pdfBytes = pdfGeneratorService.generarPDFCompras(reporte, filtros);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", generarNombreArchivo("compras", filtros));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException | RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Genera nombre de archivo para el PDF
     */
    private String generarNombreArchivo(String tipoReporte, FiltrosReporteDTO filtros) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String fecha = LocalDate.now().format(formatter);
        return String.format("reporte_%s_%s.pdf", tipoReporte, fecha);
    }
}
