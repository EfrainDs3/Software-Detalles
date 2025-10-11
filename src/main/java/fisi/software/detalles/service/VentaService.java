package fisi.software.detalles.service;

import org.springframework.stereotype.Service;
import fisi.software.detalles.controller.dto.VentaRequestDTO;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList; 
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VentaService {
    
    // --- Definición de Fuentes para PDF ---
    private static final Font FONT_TITULO = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.RED);
    private static final Font FONT_NORMAL_BOLD = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
    private static final Font FONT_HEADER_TABLE = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

    // ======================================================================
    // MÉTODO 1: REGISTRAR NUEVA VENTA (MOCK)
    // ======================================================================

    public Map<String, Object> registrarNuevaVenta(VentaRequestDTO ventaDTO) {
        
        Long nuevoIdComprobante = System.currentTimeMillis() % 1000 + 1000; 
        
        System.out.println("LOG: Venta registrada (MOCK) | Total: " + ventaDTO.getMonto_total());
                            
        Map<String, Object> response = new HashMap<>();
        response.put("id_venta", nuevoIdComprobante);
        response.put("mensaje", "Venta registrada exitosamente (MOCK). ID: " + nuevoIdComprobante);
        
        return response;
    }

    // ======================================================================
    // MÉTODO 2: GENERACIÓN DEL PDF
    // ======================================================================

    public byte[] generarComprobantePDF(Long idComprobante) throws DocumentException, IOException {
        
        Map<String, Object> venta = mockGetVentaCompleta(idComprobante); 
        
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Paragraph titulo = new Paragraph("COMPROBANTE DE PAGO", FONT_TITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(15f);
            document.add(titulo);

            addVentaHeader(document, venta);
            document.add(new Paragraph(" "));
            addDetallesTable(document, venta);

            document.add(new Paragraph(" "));
            addTotalesSection(document, venta);
            
            document.close();
            
            return baos.toByteArray();
            
        } catch (DocumentException e) {
            throw new DocumentException("Error al construir el documento PDF: " + e.getMessage());
        }
    }


    // ======================================================================
    // MÉTODOS AUXILIARES (PRIVADOS)
    // ======================================================================

    private void addVentaHeader(Document document, Map<String, Object> venta) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2); 
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{3f, 7f});
        headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        headerTable.addCell(new Paragraph("Tipo:", FONT_NORMAL_BOLD));
        headerTable.addCell(new Paragraph((String) venta.get("tipoComprobante"), FONT_NORMAL));

        if ("Factura".equals(venta.get("tipoComprobante"))) {
            headerTable.addCell(new Paragraph("RUC:", FONT_NORMAL_BOLD));
            headerTable.addCell(new Paragraph((String) venta.get("ruc"), FONT_NORMAL));
            headerTable.addCell(new Paragraph("Razón Social:", FONT_NORMAL_BOLD));
            headerTable.addCell(new Paragraph((String) venta.get("razonSocial"), FONT_NORMAL));
        }
        
        headerTable.addCell(new Paragraph("Cliente:", FONT_NORMAL_BOLD));
        headerTable.addCell(new Paragraph((String) venta.get("cliente"), FONT_NORMAL));
        
        headerTable.addCell(new Paragraph("Fecha:", FONT_NORMAL_BOLD));
        headerTable.addCell(new Paragraph((String) venta.get("fechaEmision"), FONT_NORMAL));

        document.add(headerTable);
    }
    
    private void addDetallesTable(Document document, Map<String, Object> venta) throws DocumentException {
        PdfPTable table = new PdfPTable(5); 
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setWidths(new float[]{1.5f, 4f, 1.5f, 2f, 2f});

        String[] headers = {"CÓDIGO", "DESCRIPCIÓN", "CANT.", "P. UNITARIO", "SUBTOTAL"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, FONT_HEADER_TABLE));
            cell.setBackgroundColor(BaseColor.DARK_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }

        List<Map<String, Object>> detalles = (List<Map<String, Object>>) venta.get("detalles");
        for (Map<String, Object> detalle : detalles) {
            table.addCell(new Paragraph((String) detalle.get("codigo"), FONT_NORMAL));
            table.addCell(new Paragraph((String) detalle.get("descripcion"), FONT_NORMAL));
            table.addCell(createAlignedCell(detalle.get("cantidad").toString(), Element.ALIGN_RIGHT, FONT_NORMAL));
            table.addCell(createAlignedCell("S/ " + detalle.get("precioUnitario").toString(), Element.ALIGN_RIGHT, FONT_NORMAL));
            table.addCell(createAlignedCell("S/ " + detalle.get("subtotalLinea").toString(), Element.ALIGN_RIGHT, FONT_NORMAL));
        }

        document.add(table);
    }
    
    private void addTotalesSection(Document document, Map<String, Object> venta) throws DocumentException {
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(40); 
        totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.setWidths(new float[]{6f, 4f});
        totalTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        totalTable.addCell(createAlignedCell("SUBTOTAL:", Element.ALIGN_RIGHT, FONT_NORMAL_BOLD));
        totalTable.addCell(createAlignedCell("S/ " + venta.get("subtotal").toString(), Element.ALIGN_RIGHT, FONT_NORMAL));

        totalTable.addCell(createAlignedCell("IGV (18%):", Element.ALIGN_RIGHT, FONT_NORMAL_BOLD));
        totalTable.addCell(createAlignedCell("S/ " + venta.get("igv").toString(), Element.ALIGN_RIGHT, FONT_NORMAL));

        totalTable.addCell(createAlignedCell("TOTAL A PAGAR:", Element.ALIGN_RIGHT, FONT_TITULO));
        totalTable.addCell(createAlignedCell("S/ " + venta.get("total").toString(), Element.ALIGN_RIGHT, FONT_TITULO));

        document.add(totalTable);
    }
    
    private PdfPCell createAlignedCell(String text, int alignment, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        return cell;
    }
    
    private Map<String, Object> mockGetVentaCompleta(Long id) {
        Map<String, Object> venta = new HashMap<>();
        
        venta.put("idComprobante", id);
        String tipoComprobante = id % 2 == 0 ? "Factura" : "Boleta"; 
        venta.put("tipoComprobante", tipoComprobante);
        venta.put("ruc", tipoComprobante.equals("Factura") ? "20545678901" : null);
        venta.put("razonSocial", tipoComprobante.equals("Factura") ? "DISTRIBUIDORA DETALLES SAC" : null);
        venta.put("cliente", "Juan Pérez");
        venta.put("fechaEmision", LocalDateTime.now().toString());
        
        BigDecimal subtotal = new BigDecimal("420.00");
        BigDecimal igv = new BigDecimal("75.60"); 
        BigDecimal total = subtotal.add(igv);
        venta.put("subtotal", subtotal);
        venta.put("igv", igv);
        venta.put("total", total);

        List<Map<String, Object>> detalles = new ArrayList<>();
        detalles.add(Map.of("codigo", "P001", "descripcion", "Zapatillas", "cantidad", 1, "precioUnitario", new BigDecimal("250.00"), "subtotalLinea", new BigDecimal("250.00")));
        detalles.add(Map.of("codigo", "P005", "descripcion", "Medias Compresión", "cantidad", 2, "precioUnitario", new BigDecimal("85.00"), "subtotalLinea", new BigDecimal("170.00")));
        venta.put("detalles", detalles);
        
        return venta;
    }
}