package fisi.software.detalles.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import fisi.software.detalles.controller.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PDFGeneratorService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);

    public byte[] generarPDFVentas(ReporteVentasDTO reporte, FiltrosReporteDTO filtros) throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarTitulo(document, "Reporte de Ventas");
            agregarFiltros(document, filtros);

            Paragraph resumen = new Paragraph("Resumen General", HEADER_FONT);
            resumen.setSpacingBefore(10);
            document.add(resumen);

            document.add(new Paragraph("Total Ventas: S/ " + reporte.getTotalVentas(), NORMAL_FONT));
            document.add(new Paragraph("Cantidad Ventas: " + reporte.getCantidadVentas(), NORMAL_FONT));
            document.add(new Paragraph("Ticket Promedio: S/ " + reporte.getTicketPromedio(), NORMAL_FONT));

            if (!reporte.getVentasPorProducto().isEmpty()) {
                agregarTablaVentasPorProducto(document, reporte);
            }

            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarPDFInventario(ReporteInventarioDTO reporte, FiltrosReporteDTO filtros)
            throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarTitulo(document, "Reporte de Inventario");
            agregarFiltros(document, filtros);

            document.add(new Paragraph("Total Productos: " + reporte.getTotalProductos(), NORMAL_FONT));
            document.add(new Paragraph("Total Unidades: " + reporte.getTotalUnidades(), NORMAL_FONT));
            document.add(new Paragraph("Valor Total: S/ " + reporte.getValorTotalInventario(), NORMAL_FONT));

            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarPDFFinanciero(ReporteFinancieroDTO reporte, FiltrosReporteDTO filtros)
            throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarTitulo(document, "Reporte Financiero");
            agregarFiltros(document, filtros);

            document.add(new Paragraph("Total Ingresos: S/ " + reporte.getTotalIngresos(), NORMAL_FONT));
            document.add(new Paragraph("Total Egresos: S/ " + reporte.getTotalEgresos(), NORMAL_FONT));
            document.add(new Paragraph("Utilidad Bruta: S/ " + reporte.getUtilidadBruta(), NORMAL_FONT));
            document.add(new Paragraph("Margen: " + reporte.getMargenUtilidad() + "%", NORMAL_FONT));

            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarPDFClientes(ReporteClientesDTO reporte, FiltrosReporteDTO filtros) throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarTitulo(document, "Reporte de Clientes");
            agregarFiltros(document, filtros);

            document.add(new Paragraph("Total Clientes: " + reporte.getTotalClientes(), NORMAL_FONT));
            document.add(new Paragraph("Clientes Activos: " + reporte.getClientesActivos(), NORMAL_FONT));
            document.add(new Paragraph("Ticket Promedio: S/ " + reporte.getTicketPromedio(), NORMAL_FONT));

            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    public byte[] generarPDFCompras(ReporteComprasDTO reporte, FiltrosReporteDTO filtros) throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarTitulo(document, "Reporte de Compras");
            agregarFiltros(document, filtros);

            document.add(new Paragraph("Total Compras: S/ " + reporte.getTotalCompras(), NORMAL_FONT));
            document.add(new Paragraph("Cantidad Compras: " + reporte.getCantidadCompras(), NORMAL_FONT));
            document.add(new Paragraph("Costo Promedio: S/ " + reporte.getCostoPromedio(), NORMAL_FONT));

            agregarPiePagina(document);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void agregarTitulo(Document document, String titulo) throws DocumentException {
        Paragraph title = new Paragraph(titulo, TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);
    }

    private void agregarFiltros(Document document, FiltrosReporteDTO filtros) throws DocumentException {
        if (filtros != null && (filtros.getFechaInicio() != null || filtros.getFechaFin() != null)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String periodo = "Período: ";
            if (filtros.getFechaInicio() != null) {
                periodo += filtros.getFechaInicio().format(formatter);
            }
            periodo += " - ";
            if (filtros.getFechaFin() != null) {
                periodo += filtros.getFechaFin().format(formatter);
            }

            Paragraph filtrosParagraph = new Paragraph(periodo, NORMAL_FONT);
            filtrosParagraph.setSpacingAfter(15);
            document.add(filtrosParagraph);
        }
    }

    private void agregarTablaVentasPorProducto(Document document, ReporteVentasDTO reporte) throws DocumentException {
        Paragraph titulo = new Paragraph("Top 10 Productos Más Vendidos", HEADER_FONT);
        titulo.setSpacingBefore(15);
        titulo.setSpacingAfter(10);
        document.add(titulo);

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);

        PdfPCell cell = new PdfPCell(new Phrase("Producto", HEADER_FONT));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("Cantidad", HEADER_FONT));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        cell = new PdfPCell(new Phrase("Total", HEADER_FONT));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);

        for (ReporteVentasDTO.VentaPorProducto venta : reporte.getVentasPorProducto()) {
            table.addCell(new Phrase(venta.getNombreProducto(), NORMAL_FONT));
            table.addCell(new Phrase(String.valueOf(venta.getCantidadVendida()), NORMAL_FONT));
            table.addCell(new Phrase("S/ " + venta.getTotalVentas(), NORMAL_FONT));
        }

        document.add(table);
    }

    private void agregarPiePagina(Document document) throws DocumentException {
        Paragraph footer = new Paragraph(
                "Generado el: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC));
        footer.setAlignment(Element.ALIGN_RIGHT);
        footer.setSpacingBefore(20);
        document.add(footer);
    }
}
