package fisi.software.detalles.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import fisi.software.detalles.controller.dto.VentaRequestDTO;
import fisi.software.detalles.controller.dto.DetalleVentaDTO;
import fisi.software.detalles.controller.dto.VentaListDTO;
import fisi.software.detalles.controller.dto.DetalleVentaListDTO;

import fisi.software.detalles.entity.ComprobantePago;
import fisi.software.detalles.entity.DetalleComprobantePago;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.TipoComprobantePago;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.AperturaCaja;

import fisi.software.detalles.repository.VentaRepository;
import fisi.software.detalles.repository.ClienteRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import fisi.software.detalles.repository.TipoComprobantePagoRepository;
import fisi.software.detalles.repository.ProductoRepository;
import fisi.software.detalles.repository.CajaRepository;
import fisi.software.detalles.repository.AperturaCajaRepository;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private TipoComprobantePagoRepository tipoComprobantePagoRepository;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private CajaRepository cajaRepository;
    @Autowired
    private AperturaCajaRepository aperturaCajaRepository;

    // Fonts
    private static final Font FONT_TITULO = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.RED);
    private static final Font FONT_NORMAL_BOLD = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
    private static final Font FONT_HEADER_TABLE = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

    // ======================================================================
    // MÉTODO: ACTUALIZAR VENTA (CREANDO UNA NUEVA VERSIÓN)
    // ======================================================================
    @Transactional
    public Map<String, Object> updateVenta(VentaRequestDTO ventaDTO) {
        if (ventaDTO.getId_comprobante() == null) {
            throw new IllegalArgumentException("El ID de la venta a actualizar no puede ser nulo.");
        }

        // 1. Recuperar la venta ORIGINAL
        ComprobantePago ventaOriginal = ventaRepository.findById(ventaDTO.getId_comprobante())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró la venta con ID: " + ventaDTO.getId_comprobante()));

        // 2. Marcar la venta original como "Modificado"
        ventaOriginal.setEstado("Modificado");
        ventaRepository.save(ventaOriginal);

        // 3. Crear una NUEVA Entidad con los datos del DTO
        ComprobantePago nuevaVenta = convertDtoToEntity(ventaDTO);

        // 4. Vincular con la venta original
        nuevaVenta.setVentaOriginal(ventaOriginal);

        // 5. Asignar nuevo número de comprobante
        nuevaVenta.setNumeroComprobante("B001-" + String.format("%08d", ventaRepository.count() + 1));

        // 6. Guardar la NUEVA venta
        nuevaVenta = ventaRepository.save(nuevaVenta);

        Map<String, Object> response = new HashMap<>();
        response.put("id_venta", nuevaVenta.getIdComprobante());
        response.put("mensaje", "Venta editada exitosamente. Se ha generado una nueva versión con ID: "
                + nuevaVenta.getIdComprobante());

        return response;
    }

    public BigDecimal calcularTotalVentasPorApertura(Long idApertura) {
        return ventaRepository.sumTotalByAperturaId(idApertura);
    }

    private boolean isCajaAbierta() {
        return !cajaRepository.findByEstado("Abierta").isEmpty();
    }

    @Transactional
    public Map<String, Object> registrarNuevaVenta(VentaRequestDTO ventaDTO) {
        if (!isCajaAbierta()) {
            throw new IllegalStateException("No se pueden realizar ventas porque la caja está cerrada.");
        }

        ComprobantePago nuevaVenta = convertDtoToEntity(ventaDTO);
        nuevaVenta = ventaRepository.save(nuevaVenta);

        Map<String, Object> response = new HashMap<>();
        response.put("id_venta", nuevaVenta.getIdComprobante());
        response.put("mensaje", "Venta registrada exitosamente. ID: " + nuevaVenta.getIdComprobante());

        return response;
    }

    @Transactional(readOnly = true)
    public List<VentaListDTO> listarTodasLasVentas() {
        return listarVentasGenerico(ventaRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<VentaListDTO> listarVentasPorApertura(Long idApertura) {
        return listarVentasGenerico(ventaRepository.findByApertura_IdAperturaOrderByFechaEmisionDesc(idApertura));
    }

    private List<VentaListDTO> listarVentasGenerico(List<ComprobantePago> ventas) {
        List<VentaListDTO> lista = new ArrayList<>();

        for (ComprobantePago v : ventas) {
            String nombreCliente = obtenerNombreCliente(v);
            String metodoPago = "";

            List<DetalleVentaListDTO> detalles = new ArrayList<>();
            if (v.getDetalles() != null) {
                for (DetalleComprobantePago d : v.getDetalles()) {
                    String nombreProd = d.getProducto() != null ? d.getProducto().getNombre() : "Producto sin nombre";
                    detalles.add(new DetalleVentaListDTO(
                            nombreProd,
                            d.getCantidad(),
                            d.getPrecioUnitario()));
                }
            }

            lista.add(new VentaListDTO(
                    v.getIdComprobante(),
                    nombreCliente,
                    v.getFechaEmision(),
                    metodoPago,
                    v.getEstado(),
                    v.getTotal(),
                    v.getVentaOriginal() != null ? v.getVentaOriginal().getIdComprobante() : null, // ID Original
                    detalles));
        }
        return lista;
    }

    private String obtenerNombreCliente(ComprobantePago venta) {
        if (venta.getCliente() != null) {
            Cliente cliente = venta.getCliente();
            String nombres = cliente.getNombre() != null ? cliente.getNombre() : "";
            String apellidos = cliente.getApellido() != null ? cliente.getApellido() : "";
            String nombreCompleto = (nombres + " " + apellidos).trim();
            if (!nombreCompleto.isEmpty())
                return nombreCompleto;
            if (cliente.getNumeroDocumento() != null)
                return "Doc: " + cliente.getNumeroDocumento();
        }
        return "Público General";
    }

    private ComprobantePago convertDtoToEntity(VentaRequestDTO ventaDTO) {
        ComprobantePago venta = new ComprobantePago();

        if (ventaDTO.getMonto_total() == null)
            throw new IllegalArgumentException("El monto total no puede ser nulo.");
        BigDecimal total = ventaDTO.getMonto_total().setScale(2, RoundingMode.HALF_UP);
        venta.setTotal(total);
        venta.setSubtotal(total);
        venta.setIgv(BigDecimal.ZERO);

        if (ventaDTO.getFecha_emision() != null) {
            // Si la fecha enviada es "hoy", usamos la hora actual para no perder el tiempo
            if (ventaDTO.getFecha_emision().isEqual(LocalDate.now())) {
                venta.setFechaEmision(LocalDateTime.now());
            } else {
                // Si es fecha pasada/futura, usamos inicio del día (o fin, según prefieras,
                // pero inicio es estándar)
                venta.setFechaEmision(ventaDTO.getFecha_emision().atStartOfDay());
            }
        } else {
            venta.setFechaEmision(LocalDateTime.now());
        }

        // Logica de numeración diaria: B001-XXXX (donde XXXX es correlativo diario)
        LocalDateTime inicioDia = venta.getFechaEmision().toLocalDate().atStartOfDay();
        LocalDateTime finDia = venta.getFechaEmision().toLocalDate().atTime(23, 59, 59);
        long correlativoDiario = ventaRepository.countByFechaEmisionBetween(inicioDia, finDia) + 1;
        venta.setNumeroComprobante(String.format("B001-%04d", correlativoDiario));

        venta.setEstado(ventaDTO.getEstado_comprobante() != null ? ventaDTO.getEstado_comprobante() : "Emitido");

        Integer idUsuarioFijo = 6;
        Usuario usuario = usuarioRepository.findById(idUsuarioFijo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado ID: " + idUsuarioFijo));
        venta.setUsuario(usuario);

        Integer idTipoComprobante = ventaDTO.getId_tipo_comprobante() != null ? ventaDTO.getId_tipo_comprobante() : 1;
        TipoComprobantePago tipo = tipoComprobantePagoRepository.findById(idTipoComprobante)
                .orElseThrow(() -> new RuntimeException("Tipo Comprobante no encontrado ID: " + idTipoComprobante));
        venta.setTipoComprobante(tipo);

        if (ventaDTO.getId_cliente() != null) {
            Optional<Cliente> clienteOpt = clienteRepository.findById(ventaDTO.getId_cliente());
            clienteOpt.ifPresent(venta::setCliente);
        } else {
            clienteRepository.findById(1).ifPresent(venta::setCliente);
        }

        if (ventaDTO.getId_apertura() == null)
            throw new IllegalArgumentException("Apertura de caja obligatoria.");
        AperturaCaja apertura = aperturaCajaRepository.findById(ventaDTO.getId_apertura())
                .orElseThrow(() -> new RuntimeException("Apertura no encontrada ID: " + ventaDTO.getId_apertura()));
        venta.setApertura(apertura);

        if (ventaDTO.getDetalles() == null || ventaDTO.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("Debe haber al menos un detalle.");
        }

        List<DetalleComprobantePago> detalles = new ArrayList<>();
        for (DetalleVentaDTO dDTO : ventaDTO.getDetalles()) {
            detalles.add(convertDetalleDtoToEntity(dDTO, venta));
        }
        venta.setDetalles(detalles);
        return venta;
    }

    private DetalleComprobantePago convertDetalleDtoToEntity(DetalleVentaDTO detalleDTO, ComprobantePago comprobante) {
        DetalleComprobantePago detalle = new DetalleComprobantePago();
        detalle.setComprobante(comprobante);

        String nombre = detalleDTO.getNombre_producto_temp();
        if (nombre == null || nombre.trim().isEmpty())
            throw new IllegalArgumentException("Nombre producto vacío.");

        Producto producto = productoRepository.findByNombreIgnoreCase(nombre)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + nombre));
        detalle.setProducto(producto);

        detalle.setCantidad(detalleDTO.getCantidad());
        detalle.setPrecioUnitario(detalleDTO.getPrecio_unitario());

        BigDecimal subtotalLinea = detalleDTO.getPrecio_unitario()
                .multiply(new BigDecimal(detalleDTO.getCantidad()))
                .subtract(detalleDTO.getDescuento_aplicado() != null ? detalleDTO.getDescuento_aplicado()
                        : BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        detalle.setDescuentoAplicado(
                detalleDTO.getDescuento_aplicado() != null ? detalleDTO.getDescuento_aplicado() : BigDecimal.ZERO);
        detalle.setSubtotalLinea(subtotalLinea);
        return detalle;
    }

    public byte[] generarComprobantePDF(Long idComprobante) throws DocumentException, IOException {
        ComprobantePago venta = ventaRepository.findById(idComprobante)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada ID: " + idComprobante));

        Map<String, Object> ventaMap = new HashMap<>();
        ventaMap.put("tipoComprobante",
                venta.getTipoComprobante() != null ? venta.getTipoComprobante().getNombreTipo() : "");
        ventaMap.put("cliente", obtenerNombreCliente(venta));

        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                .ofPattern("dd/MM/yyyy hh:mm a");
        ventaMap.put("fechaEmision", venta.getFechaEmision() != null ? venta.getFechaEmision().format(formatter) : "");
        ventaMap.put("numeroComprobante", venta.getNumeroComprobante() != null ? venta.getNumeroComprobante() : "");
        ventaMap.put("total", venta.getTotal());

        // Obtener DNI y Nombre por separado si es posible (Parsing simple del string
        // "cliente" actual o mejorando la logica)
        // Por ahora usaremos el string "cliente" formateado.
        String clienteFull = obtenerNombreCliente(venta);
        String tipoDoc = "DNI"; // Default
        String numDoc = "-";
        String nombreCliente = clienteFull;

        if (clienteFull.startsWith("Doc: ")) {
            String[] parts = clienteFull.split(" ", 2); // "Doc:", "12345678"
            if (parts.length > 1)
                numDoc = parts[1];
            nombreCliente = ""; // Si solo tenemos doc, el nombre está vacío o tendríamos que buscarlo
        }
        // Mejor aproximación: Usar los datos de la entidad Cliente si existe
        if (venta.getCliente() != null) {
            numDoc = venta.getCliente().getNumeroDocumento();
            nombreCliente = (venta.getCliente().getNombre() + " " + venta.getCliente().getApellido()).trim();
            // Asumir RUC si tiene 11 digitos
            if (numDoc != null && numDoc.length() == 11)
                tipoDoc = "RUC";
        }

        ventaMap.put("clienteTipoDoc", tipoDoc);
        ventaMap.put("clienteNumDoc", numDoc != null ? numDoc : "-");
        ventaMap.put("clienteNombre", nombreCliente);

        List<Map<String, Object>> detalles = new ArrayList<>();
        if (venta.getDetalles() != null) {
            for (DetalleComprobantePago d : venta.getDetalles()) {
                Map<String, Object> det = new HashMap<>();
                det.put("codigo", d.getProducto() != null ? d.getProducto().getCodigoBarra() : "");
                det.put("descripcion", d.getProducto() != null ? d.getProducto().getNombre() : "");
                det.put("cantidad", d.getCantidad());
                det.put("precioUnitario", d.getPrecioUnitario());
                det.put("subtotalLinea", d.getSubtotalLinea());
                detalles.add(det);
            }
        }
        ventaMap.put("detalles", detalles);

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. HEADER (Logo + RUC + Título)
            PdfPTable headerTable = new PdfPTable(3);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 2.5f, 4.5f, 3f }); // Logo, Titulo, Empty/RUC

            // Logo
            try {
                String logoPath = "src/main/resources/static/img/detalles-logo.png";
                // Fix path for production/different envs if needed, assuming run from root
                Image logo = Image.getInstance(logoPath);
                logo.scaleToFit(100, 50);
                PdfPCell logoCell = new PdfPCell(logo);
                logoCell.setBorder(Rectangle.NO_BORDER);
                logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                headerTable.addCell(logoCell);
            } catch (Exception e) {
                PdfPCell empty = new PdfPCell(new Phrase("DETALLES", FONT_NORMAL_BOLD));
                empty.setBorder(Rectangle.NO_BORDER);
                headerTable.addCell(empty);
            }

            // Título
            Paragraph titleP = new Paragraph("COMPROBANTE DE PAGO", FONT_TITULO);
            titleP.setAlignment(Element.ALIGN_CENTER);
            PdfPCell titleCell = new PdfPCell(titleP);
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerTable.addCell(titleCell);

            // RUC (Right side usually, but user asked specifically "en ruc: solo pones
            // 0000000000")
            // Reference image has RUC under logo. Let's put a simplified RUC cell.
            PdfPCell rucCell = new PdfPCell(new Phrase("RUC: 20531588119", FONT_NORMAL));
            rucCell.setBorder(Rectangle.NO_BORDER);
            rucCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            rucCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            headerTable.addCell(rucCell);

            document.add(headerTable);
            document.add(new Paragraph(" ")); // Spacer

            // 2. TICKET INFO (Nro Ticket | Fecha Operacion)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.addCell(createNoBorderCell("NRO. TICKET: " + ventaMap.get("numeroComprobante"),
                    Element.ALIGN_LEFT, FONT_NORMAL_BOLD));
            infoTable.addCell(createNoBorderCell("FECHA DE OPERACIÓN: " + ventaMap.get("fechaEmision"),
                    Element.ALIGN_RIGHT, FONT_NORMAL_BOLD));
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // 3. BOX: DATOS DE LA OPERACIÓN
            addBoxSection(document, "Datos de la Empresa:", new String[][] {
                    { "ENTIDAD:", "DETALLES ZAPATERÍA S.A.C." },
                    { "Razón Social:", "Detalles Shoes & Accessories" },
                    { "Dirección:", "Jr. Lima 303, Tarapoto - Perú" }

            });
            document.add(new Paragraph(" "));

            // 4. BOX: DATOS DEL CLIENTE
            addBoxSection(document, "Datos del Cliente :", new String[][] {
                    { "TIPO DE DOCUMENTO:", (String) ventaMap.get("clienteTipoDoc") },
                    { "NRO. DE DOCUMENTO:", (String) ventaMap.get("clienteNumDoc") },
                    { "NOMBRE:", (String) ventaMap.get("clienteNombre") }
            });
            document.add(new Paragraph(" "));

            // 5. BOX: DATOS DE LA VENTA (Tabla de productos)
            addDetallesBox(document, "Datos de la venta :", ventaMap);
            document.add(new Paragraph(" "));

            // 6. FOOTER: TOTAL A PAGAR
            addTotalFooter(document, (BigDecimal) ventaMap.get("total"));

            document.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new DocumentException("Error PDF: " + e.getMessage());
        }
    }

    // Helper para celdas sin borde
    private PdfPCell createNoBorderCell(String text, int align, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(align);
        return cell;
    }

    // Helper para secciones en "caja" (Box)
    private void addBoxSection(Document document, String title, String[][] content) throws DocumentException {
        // Título de la sección
        document.add(new Paragraph(title, FONT_NORMAL_BOLD));

        // Tabla con borde exterior
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 3f, 7f });

        for (String[] row : content) {
            PdfPCell key = new PdfPCell(new Phrase(row[0], FONT_NORMAL_BOLD));
            key.setBorder(Rectangle.BOX);
            key.setPadding(5);
            table.addCell(key);

            PdfPCell val = new PdfPCell(new Phrase(row[1], FONT_NORMAL));
            val.setBorder(Rectangle.BOX);
            val.setPadding(5);
            table.addCell(val);
        }
        document.add(table);
    }

    private void addDetallesBox(Document document, String title, Map<String, Object> venta) throws DocumentException {
        document.add(new Paragraph(title, FONT_NORMAL_BOLD));

        PdfPTable table = new PdfPTable(4); // Removed Subtotal, combined or simplified as per "Cuadro" request?
        // User said: "pones tal cual el cuadro, agregando el subtotal". The Banco
        // receipt has less columns.
        // But user likely wants their product list: Cantidad, Descripcion, P.Unit,
        // Subtotal. (4 cols is standard)
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 1.5f, 4.5f, 2f, 2f }); // Qty, Desc, Unit, Sub

        String[] headers = { "CANT.", "DESCRIPCIÓN", "P. UNITARIO", "SUBTOTAL" };
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FONT_NORMAL_BOLD));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        List<Map<String, Object>> detalles = (List<Map<String, Object>>) venta.get("detalles");
        for (Map<String, Object> d : detalles) {
            // Cantidad
            PdfPCell cellQ = new PdfPCell(new Phrase(d.get("cantidad").toString(), FONT_NORMAL));
            cellQ.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cellQ);

            // Descripción
            table.addCell(new Paragraph(d.get("descripcion").toString(), FONT_NORMAL));

            // P. Unit
            PdfPCell cellP = new PdfPCell(new Phrase("S/ " + d.get("precioUnitario").toString(), FONT_NORMAL));
            cellP.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(cellP);

            // Subtotal
            PdfPCell cellS = new PdfPCell(new Phrase("S/ " + d.get("subtotalLinea").toString(), FONT_NORMAL));
            cellS.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(cellS);
        }
        document.add(table);
    }

    private void addTotalFooter(Document document, BigDecimal total) throws DocumentException {
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(100);
        totalTable.setWidths(new float[] { 7f, 3f });

        // Empty left cell with label "IMPORTE TOTAL:" (or "TOTAL A PAGAR:" based on
        // user)
        // User said: "donde dice importe total, ahí lo reemplazas con total a pagar,
        // esa parte roja"

        PdfPCell labelCell = new PdfPCell(new Phrase("TOTAL A PAGAR:", FONT_TITULO)); // Using Red Title Font
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setBorder(Rectangle.BOX);
        labelCell.setPadding(5);
        totalTable.addCell(labelCell);

        PdfPCell totalCell = new PdfPCell(new Phrase("S/ " + total.toString(), FONT_TITULO));
        totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalCell.setBorder(Rectangle.BOX);
        totalCell.setPadding(5);
        totalTable.addCell(totalCell);

        document.add(totalTable);
    }

    // Helper obsoleto para esta version, pero mantenido si es necesario por otros
    // metodos no tocados
    private PdfPCell createAlignedCell(String text, int alignment, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(5);
        return cell;
    }

    public byte[] generarReporteVentasPorAperturaPDF(Long idApertura) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4, 30, 30, 30, 30);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        // 1. Header
        Paragraph title = new Paragraph("REPORTE DE VENTAS - APERTURA #" + idApertura, FONT_TITULO);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(
                "Fecha de Reporte: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")),
                FONT_NORMAL));
        document.add(new Paragraph(" "));

        // 2. Fetch Data
        List<ComprobantePago> ventas = ventaRepository.findByApertura_IdAperturaOrderByFechaEmisionDesc(idApertura);

        if (ventas.isEmpty()) {
            document.add(new Paragraph("No se encontraron ventas para esta apertura.", FONT_NORMAL_BOLD));
        } else {
            // 3. Table
            PdfPTable table = new PdfPTable(5); // ID, Fecha, Cliente, Estado, Total
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 2f, 3f, 5f, 2f, 2f });

            // Headers
            String[] headers = { "ID", "FECHA/HORA", "CLIENTE", "ESTADO", "TOTAL" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, FONT_NORMAL_BOLD));
                cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            BigDecimal granTotal = BigDecimal.ZERO;
            int countEmitidos = 0;

            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("dd/MM HH:mm");

            for (ComprobantePago v : ventas) {
                // ID Column
                table.addCell(createAlignedCell(v.getNumeroComprobante() != null ? v.getNumeroComprobante()
                        : String.valueOf(v.getIdComprobante()), Element.ALIGN_CENTER, FONT_NORMAL));

                // Date Column
                String fechaStr = v.getFechaEmision() != null ? v.getFechaEmision().format(timeFormatter) : "-";
                table.addCell(createAlignedCell(fechaStr, Element.ALIGN_CENTER, FONT_NORMAL));

                // Client Column
                String cliente = obtenerNombreCliente(v);
                table.addCell(createAlignedCell(cliente, Element.ALIGN_LEFT, FONT_NORMAL));

                // Status Column
                table.addCell(createAlignedCell(v.getEstado(), Element.ALIGN_CENTER, FONT_NORMAL));

                // Total Column
                table.addCell(createAlignedCell("S/ " + v.getTotal().toString(), Element.ALIGN_RIGHT, FONT_NORMAL));

                if ("Emitido".equalsIgnoreCase(v.getEstado())) {
                    granTotal = granTotal.add(v.getTotal());
                    countEmitidos++;
                }
            }
            document.add(table);

            document.add(new Paragraph(" "));

            // 4. Summary
            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(40);
            summary.setHorizontalAlignment(Element.ALIGN_RIGHT);
            summary.setWidths(new float[] { 5f, 5f });

            PdfPCell c1 = createAlignedCell("Ventas Emitidas:", Element.ALIGN_RIGHT, FONT_NORMAL_BOLD);
            c1.setBorder(Rectangle.NO_BORDER);
            summary.addCell(c1);

            PdfPCell c2 = createAlignedCell(String.valueOf(countEmitidos), Element.ALIGN_RIGHT, FONT_NORMAL);
            c2.setBorder(Rectangle.NO_BORDER);
            summary.addCell(c2);

            PdfPCell c3 = createAlignedCell("TOTAL RECAUDADO:", Element.ALIGN_RIGHT, FONT_TITULO);
            c3.setBorder(Rectangle.NO_BORDER);
            summary.addCell(c3);

            PdfPCell c4 = createAlignedCell("S/ " + granTotal.toString(), Element.ALIGN_RIGHT, FONT_TITULO);
            c4.setBorder(Rectangle.NO_BORDER);
            summary.addCell(c4);

            document.add(summary);
        }

        document.close();
        return out.toByteArray();
    }
}