package fisi.software.detalles.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import fisi.software.detalles.entity.ComprobantePago;
import fisi.software.detalles.entity.DetalleComprobantePago;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Servicio para generar PDFs de boletas/facturas
 */
@Service
@Slf4j
public class BoletaPDFService {

    private static final Font FONT_TITLE = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
    private static final Font FONT_SUBTITLE = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
    private static final Font FONT_SMALL = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL);

    /**
     * Genera PDF de boleta
     */
    public byte[] generarBoletaPDF(ComprobantePago comprobante) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);

            document.open();

            // Encabezado de la empresa
            agregarEncabezadoEmpresa(document);

            // Espacio
            document.add(new Paragraph(" "));

            // Información del comprobante
            document.add(new Paragraph(comprobante.getTipoComprobante().getNombreTipo().toUpperCase(), FONT_TITLE));
            document.add(new Paragraph(comprobante.getNumeroComprobante(), FONT_SUBTITLE));
            document.add(new Paragraph(" "));

            // Datos del cliente
            agregarDatosCliente(document, comprobante);

            // Espacio
            document.add(new Paragraph(" "));

            // Tabla de productos
            agregarTablaProductos(document, comprobante);

            // Espacio
            document.add(new Paragraph(" "));

            // Totales
            agregarTotales(document, comprobante);

            // Footer
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Gracias por su compra", FONT_NORMAL));
            document.add(new Paragraph("Detalles - Tu tienda de calzado de confianza", FONT_SMALL));

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error al generar PDF", e);
            throw new RuntimeException("Error al generar boleta PDF", e);
        }
    }

    /**
     * Agrega encabezado de la empresa
     */
    private void agregarEncabezadoEmpresa(Document document) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBackgroundColor(new BaseColor(102, 126, 234));
        cell.setPadding(15);

        Paragraph empresa = new Paragraph("DETALLES S.A.C.", FONT_TITLE);
        empresa.setAlignment(Element.ALIGN_CENTER);
        empresa.getFont().setColor(BaseColor.WHITE);

        Paragraph ruc = new Paragraph("RUC: 20123456789", FONT_NORMAL);
        ruc.setAlignment(Element.ALIGN_CENTER);
        ruc.getFont().setColor(BaseColor.WHITE);

        Paragraph direccion = new Paragraph("Jr. Los Olivos 123, San Isidro, Lima", FONT_SMALL);
        direccion.setAlignment(Element.ALIGN_CENTER);
        direccion.getFont().setColor(BaseColor.WHITE);

        Paragraph contacto = new Paragraph("Tel: (01) 123-4567 | Email: ventas@detalles.com", FONT_SMALL);
        contacto.setAlignment(Element.ALIGN_CENTER);
        contacto.getFont().setColor(BaseColor.WHITE);

        cell.addElement(empresa);
        cell.addElement(ruc);
        cell.addElement(direccion);
        cell.addElement(contacto);

        headerTable.addCell(cell);
        document.add(headerTable);
    }

    /**
     * Agrega datos del cliente
     */
    private void agregarDatosCliente(Document document, ComprobantePago comprobante) throws DocumentException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new int[] { 1, 3 });

        agregarCeldaLabel(table, "Fecha de Emisión:");
        agregarCeldaValue(table, comprobante.getFechaEmision().format(formatter));

        agregarCeldaLabel(table, "Cliente:");
        agregarCeldaValue(table,
                comprobante.getCliente().getNombre() + " " + comprobante.getCliente().getApellido());

        agregarCeldaLabel(table, "Documento:");
        agregarCeldaValue(table, comprobante.getCliente().getNumeroDocumento());

        if (comprobante.getCliente().getDireccion() != null) {
            agregarCeldaLabel(table, "Dirección:");
            agregarCeldaValue(table, comprobante.getCliente().getDireccion());
        }

        document.add(table);
    }

    /**
     * Agrega tabla de productos
     */
    private void agregarTablaProductos(Document document, ComprobantePago comprobante) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new int[] { 6, 2, 2, 2 });

        // Cabecera
        agregarCeldaHeader(table, "Producto");
        agregarCeldaHeader(table, "Cant.");
        agregarCeldaHeader(table, "P. Unit.");
        agregarCeldaHeader(table, "Subtotal");

        // Detalles
        for (DetalleComprobantePago detalle : comprobante.getDetalles()) {
            agregarCeldaProducto(table, detalle.getProducto().getNombre());
            agregarCeldaProductoCentro(table, String.valueOf(detalle.getCantidad()));
            agregarCeldaProductoDerecha(table, "S/ " + detalle.getPrecioUnitario());
            agregarCeldaProductoDerecha(table, "S/ " + detalle.getSubtotalLinea());
        }

        document.add(table);
    }

    /**
     * Agrega totales
     */
    private void agregarTotales(Document document, ComprobantePago comprobante) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setWidths(new int[] { 3, 2 });

        agregarCeldaTotalLabel(table, "Subtotal:");
        agregarCeldaTotalValue(table, "S/ " + comprobante.getSubtotal());

        agregarCeldaTotalLabel(table, "IGV (18%):");
        agregarCeldaTotalValue(table, "S/ " + comprobante.getIgv());

        // Total final con fondo
        PdfPCell cellLabel = new PdfPCell(new Phrase("TOTAL:", FONT_SUBTITLE));
        cellLabel.setBackgroundColor(new BaseColor(102, 126, 234));
        cellLabel.setPadding(8);
        cellLabel.setBorder(Rectangle.BOX);
        cellLabel.getPhrase().getFont().setColor(BaseColor.WHITE);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase("S/ " + comprobante.getTotal(), FONT_SUBTITLE));
        cellValue.setBackgroundColor(new BaseColor(102, 126, 234));
        cellValue.setPadding(8);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellValue.setBorder(Rectangle.BOX);
        cellValue.getPhrase().getFont().setColor(BaseColor.WHITE);
        table.addCell(cellValue);

        document.add(table);
    }

    // Métodos auxiliares para celdas
    private void agregarCeldaLabel(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_SUBTITLE));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void agregarCeldaValue(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_NORMAL));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void agregarCeldaHeader(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_SUBTITLE));
        cell.setBackgroundColor(new BaseColor(240, 240, 240));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void agregarCeldaProducto(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_NORMAL));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void agregarCeldaProductoCentro(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_NORMAL));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void agregarCeldaProductoDerecha(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_NORMAL));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cell);
    }

    private void agregarCeldaTotalLabel(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_SUBTITLE));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cell);
    }

    private void agregarCeldaTotalValue(PdfPTable table, String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FONT_NORMAL));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cell);
    }
}
