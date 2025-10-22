package fisi.software.detalles.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired; 

// Importaciones del DTO
import fisi.software.detalles.controller.dto.VentaRequestDTO;
import fisi.software.detalles.controller.dto.DetalleVentaDTO;

// Importaciones de Entidades
import fisi.software.detalles.entity.ComprobantePago; 
import fisi.software.detalles.entity.DetalleComprobantePago;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.TipoComprobantePago;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.TipoDocumento; // Necesario para buscar Cliente por documento

// Importaciones de Repositorios
import fisi.software.detalles.repository.VentaRepository; 
import fisi.software.detalles.repository.ClienteRepository; 
import fisi.software.detalles.repository.UsuarioRepository; 
import fisi.software.detalles.repository.TipoComprobantePagoRepository;
import fisi.software.detalles.repository.ProductoRepository;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList; 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional; 
import java.util.stream.Collectors;

@Service
public class VentaService {
    // ======================================================================
    // MÉTODO: ACTUALIZAR VENTA EXISTENTE
    // ======================================================================
    public Map<String, Object> updateVenta(VentaRequestDTO ventaDTO) {
        if (ventaDTO.getId_comprobante() == null) {
            throw new IllegalArgumentException("El ID de la venta a actualizar no puede ser nulo.");
        }
        Optional<ComprobantePago> ventaOpt = ventaRepository.findById(ventaDTO.getId_comprobante());
        if (ventaOpt.isEmpty()) {
            throw new IllegalArgumentException("No se encontró la venta con ID: " + ventaDTO.getId_comprobante());
        }
        ComprobantePago venta = convertDtoToEntity(ventaDTO);
        venta.setIdComprobante(ventaDTO.getId_comprobante());
        venta = ventaRepository.save(venta);
        Map<String, Object> response = new HashMap<>();
        response.put("id_venta", venta.getIdComprobante());
        response.put("mensaje", "Venta actualizada exitosamente. ID: " + venta.getIdComprobante());
        return response;
    }
    
    // ⭐️ INYECCIÓN DE TODOS LOS REPOSITORIOS (Ahora incluyendo TipoComprobantePago)
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
        
    // Asumo que tienes un repositorio para TipoDocumento si es necesario buscar clientes por RUC

    // --- Definición de Fuentes para PDF ---
    private static final Font FONT_TITULO = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.RED);
    private static final Font FONT_NORMAL_BOLD = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
    private static final Font FONT_HEADER_TABLE = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
        
    // Constante para IGV (18% - Ajustar si es necesario)
    private static final BigDecimal IGV_RATE = new BigDecimal("0.18");
    private static final BigDecimal IGV_FACTOR = new BigDecimal("1.18");


    // ======================================================================
    // MÉTODO 1: REGISTRAR NUEVA VENTA
    // ======================================================================

    public Map<String, Object> registrarNuevaVenta(VentaRequestDTO ventaDTO) {
        
        ComprobantePago nuevaVenta = convertDtoToEntity(ventaDTO);
        
        // 💾 GUARDAR EN BASE DE DATOS
        nuevaVenta = ventaRepository.save(nuevaVenta); 
        
        // Obtener el ID generado por la base de datos
        Long nuevoIdComprobante = nuevaVenta.getIdComprobante(); 
        
        System.out.println("LOG: Venta registrada | Total: " + nuevaVenta.getTotal());

        Map<String, Object> response = new HashMap<>();
        response.put("id_venta", nuevoIdComprobante);
        response.put("mensaje", "Venta registrada exitosamente. ID: " + nuevoIdComprobante);
        
        return response;
    }

    // ======================================================================
    // MÉTODO 3: LISTAR TODAS LAS VENTAS
    // ======================================================================
    public List<fisi.software.detalles.controller.dto.VentaListDTO> listarTodasLasVentas() {
        System.out.println("LOG: Solicitud de listado de ventas (BD REAL).");
        List<ComprobantePago> ventas = ventaRepository.findAll();
        List<fisi.software.detalles.controller.dto.VentaListDTO> lista = new ArrayList<>();
        for (ComprobantePago v : ventas) {
            String cliente = "";
            if (v.getCliente() != null) {
                cliente = v.getCliente().getNombreCompleto();
            } else if (v.getCliente() == null && v.getUsuario() != null) {
                cliente = v.getUsuario().getNombres() + " " + v.getUsuario().getApellidos();
            }
            String metodoPago = "";
            // ejemplo: metodoPago = v.getMetodoPago() != null ? v.getMetodoPago().getNombre() : "";
            List<fisi.software.detalles.controller.dto.DetalleVentaListDTO> detalles = new ArrayList<>();
            for (DetalleComprobantePago d : v.getDetalles()) {
                String nombreProd = d.getProducto() != null ? d.getProducto().getNombre() : "";
                detalles.add(new fisi.software.detalles.controller.dto.DetalleVentaListDTO(
                    nombreProd,
                    d.getCantidad(),
                    d.getPrecioUnitario()
                ));
            }
            lista.add(new fisi.software.detalles.controller.dto.VentaListDTO(
                v.getIdComprobante(),
                cliente,
                v.getFechaEmision(),
                metodoPago,
                v.getEstado(),
                v.getTotal(),
                detalles
            ));
        }
        return lista;
    }

    // ======================================================================
    // MÉTODOS AUXILIARES (PRIVADOS) - Lógica de Conversión
    // ======================================================================

    /**
     * Convierte el DTO de Venta a la Entidad ComprobantePago,
     * buscando las FKs y calculando subtotales.
     */
    private ComprobantePago convertDtoToEntity(VentaRequestDTO ventaDTO) {
        ComprobantePago venta = new ComprobantePago();
        
        // --- 1. Mapeo de Totales y Fechas ---
        
        // Monto Total (OBLIGATORIO)
        // Se valida que no sea nulo antes de operar
        if (ventaDTO.getMonto_total() == null) {
             throw new IllegalArgumentException("El monto total de la venta no puede ser nulo.");
        }
        BigDecimal total = ventaDTO.getMonto_total().setScale(2, RoundingMode.HALF_UP);
        venta.setTotal(total); 

        // Calculamos IGV y Subtotal asumiendo que el DTO solo trae el total
        BigDecimal subtotal = total.divide(IGV_FACTOR, 2, RoundingMode.HALF_UP);
        BigDecimal igv = total.subtract(subtotal); 
        
        // Estos campos son NOT NULL, ahora se llenan con los valores calculados.
        venta.setSubtotal(subtotal);
        venta.setIgv(igv);

        // Fecha de Emisión (LocalDate a LocalDateTime)
        venta.setFechaEmision(ventaDTO.getFecha_emision() != null 
             ? ventaDTO.getFecha_emision().atStartOfDay() 
             : LocalDateTime.now());
        
        // Número de Comprobante (Placeholder)
        venta.setNumeroComprobante("B001-" + String.format("%08d", ventaRepository.count() + 1)); 

        // El estado ('Emitido') se inicializa en la Entidad, o se toma del DTO
        venta.setEstado(ventaDTO.getEstado_comprobante() != null ? ventaDTO.getEstado_comprobante() : "Emitido");

        // --- 2. Asignación de Entidades Relacionadas (Claves Foráneas) ---

        // ⚠️ id_usuario (OBLIGATORIO - Se mantiene tu ID de prueba: 6)
        // Asegúrate de que el ID 6 exista en tu tabla 'usuarios'.
        Integer idUsuarioFijo = 6; 
        Usuario usuario = usuarioRepository.findById(idUsuarioFijo)
            .orElseThrow(() -> new RuntimeException("Error FK: Usuario que realiza la venta no encontrado con ID: " + idUsuarioFijo + ". Verifique tabla 'usuarios'."));
        venta.setUsuario(usuario);

        // ⚠️ id_tipo_comprobante (OBLIGATORIO - Se busca primero en el DTO, si es nulo se fuerza 1)
        Integer idTipoComprobante = ventaDTO.getId_tipo_comprobante() != null ? ventaDTO.getId_tipo_comprobante() : 1;

        // Se busca el tipo de comprobante usando el ID seguro
        TipoComprobantePago tipoComprobante = tipoComprobantePagoRepository.findById(idTipoComprobante)
            .orElseThrow(() -> new RuntimeException("Error FK: Tipo de Comprobante no encontrado con ID: " + idTipoComprobante + ". Verifique tabla 'tiposcomprobantepago'."));
        venta.setTipoComprobante(tipoComprobante);
        
        // id_cliente (OPCIONAL)
        // Usaremos el ID 1 como cliente genérico si el DTO no lo especifica, asumiendo que existe.
        if (ventaDTO.getId_cliente() != null) {
            Optional<Cliente> clienteOpt = clienteRepository.findById(ventaDTO.getId_cliente());
            clienteOpt.ifPresent(venta::setCliente);
        } else {
             // ⭐️ Opción de cliente genérico forzado si la columna es NOT NULL
             // Si la columna es NULLABLE, simplemente omitir el setCliente
             // Si la columna es NOT NULL y no lo especificas, usa el ID 1 (Cliente Genérico)
             Integer idClienteGenerico = 1;
             Optional<Cliente> clienteGenericoOpt = clienteRepository.findById(idClienteGenerico);
             clienteGenericoOpt.ifPresent(venta::setCliente);
        }
        
        // --- 3. Mapear Detalles y establecer la relación ---
        if (ventaDTO.getDetalles() == null || ventaDTO.getDetalles().isEmpty()) {
             throw new IllegalArgumentException("La venta debe contener al menos un detalle de producto.");
        }
        
        List<DetalleComprobantePago> detalles = new ArrayList<>();
        List<DetalleVentaDTO> detallesDTO = ventaDTO.getDetalles();
        for (int i = 0; i < detallesDTO.size(); i++) {
            try {
                detalles.add(convertDetalleDtoToEntity(detallesDTO.get(i), venta));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Error en el detalle #" + (i + 1) + ": " + e.getMessage());
            }
        }

        venta.setDetalles(detalles);
        
        return venta;
    } 
    
    /**
     * Convierte el DetalleVentaDTO a la Entidad DetalleComprobantePago.
     */
    private DetalleComprobantePago convertDetalleDtoToEntity(DetalleVentaDTO detalleDTO, ComprobantePago comprobante) {
        DetalleComprobantePago detalle = new DetalleComprobantePago();

        // Asignar el comprobante padre
        detalle.setComprobante(comprobante); 
        
        String nombreProducto = detalleDTO.getNombre_producto_temp();

        // ⭐️ CORRECCIÓN CLAVE: Verificación de NULO o VACÍO (Resuelve tu error)
        if (nombreProducto == null || nombreProducto.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre_producto_temp en el detalle de la venta no puede ser nulo o vacío.");
        }
        
        // Buscar y asignar el producto por nombre.
        // Se asume el nombre de convención JPA: findByNombreProducto
        Optional<Producto> productoOpt = productoRepository.findByNombre(nombreProducto);
        
        Producto producto = productoOpt
            .orElseThrow(() -> new RuntimeException("Producto no encontrado por nombre: " + nombreProducto));
        detalle.setProducto(producto); 
        
        // Asignar valores
        detalle.setCantidad(detalleDTO.getCantidad());
        detalle.setPrecioUnitario(detalleDTO.getPrecio_unitario());

        // Subtotal de la línea = (Precio Unitario * Cantidad) - Descuento
        BigDecimal subtotalLinea = detalleDTO.getPrecio_unitario()
            .multiply(new BigDecimal(detalleDTO.getCantidad()))
            .subtract(detalleDTO.getDescuento_aplicado() != null ? detalleDTO.getDescuento_aplicado() : BigDecimal.ZERO)
            .setScale(2, RoundingMode.HALF_UP); 
            
        detalle.setDescuentoAplicado(detalleDTO.getDescuento_aplicado() != null ? detalleDTO.getDescuento_aplicado() : BigDecimal.ZERO);
        detalle.setSubtotalLinea(subtotalLinea); 
        
        return detalle;
    }

    // ======================================================================
    // MÉTODOS DE PDF (SIN CAMBIOS)
    // ======================================================================

    public byte[] generarComprobantePDF(Long idComprobante) throws DocumentException, IOException {
        Optional<ComprobantePago> ventaOptional = ventaRepository.findById(idComprobante);
        if (ventaOptional.isEmpty()) {
            throw new RuntimeException("Comprobante de venta no encontrado con ID: " + idComprobante);
        }
        ComprobantePago venta = ventaOptional.get();
        Map<String, Object> ventaMap = new HashMap<>();
        ventaMap.put("tipoComprobante", venta.getTipoComprobante() != null ? venta.getTipoComprobante().getNombreTipo() : "");
        ventaMap.put("cliente", venta.getCliente() != null ? venta.getCliente().getNombreCompleto() : "");
        ventaMap.put("fechaEmision", venta.getFechaEmision() != null ? venta.getFechaEmision().toString() : "");
        ventaMap.put("subtotal", venta.getSubtotal());
        ventaMap.put("igv", venta.getIgv());
        ventaMap.put("total", venta.getTotal());
        List<Map<String, Object>> detalles = new ArrayList<>();
        for (DetalleComprobantePago d : venta.getDetalles()) {
            Map<String, Object> det = new HashMap<>();
            det.put("codigo", d.getProducto() != null ? d.getProducto().getCodigoBarra() : "");
            det.put("descripcion", d.getProducto() != null ? d.getProducto().getNombre() : "");
            det.put("cantidad", d.getCantidad());
            det.put("precioUnitario", d.getPrecioUnitario());
            det.put("subtotalLinea", d.getSubtotalLinea());
            detalles.add(det);
        }
        ventaMap.put("detalles", detalles);

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();
            Paragraph titulo = new Paragraph("COMPROBANTE DE PAGO", FONT_TITULO);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(15f);
            document.add(titulo);
            addVentaHeader(document, ventaMap);
            document.add(new Paragraph(" "));
            addDetallesTable(document, ventaMap);
            document.add(new Paragraph(" "));
            addTotalesSection(document, ventaMap);
            document.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new DocumentException("Error al construir el documento PDF: " + e.getMessage());
        }
    } 

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