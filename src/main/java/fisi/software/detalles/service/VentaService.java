package fisi.software.detalles.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired; 

// Importaciones del DTO
import fisi.software.detalles.controller.dto.VentaRequestDTO;
import fisi.software.detalles.controller.dto.DetalleVentaDTO;
import fisi.software.detalles.controller.dto.VentaListDTO; // AsegÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºrate de que este DTO exista
import fisi.software.detalles.controller.dto.DetalleVentaListDTO; // AsegÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºrate de que este DTO exista

// Importaciones de Entidades
import fisi.software.detalles.entity.ComprobantePago; 
import fisi.software.detalles.entity.DetalleComprobantePago;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.TipoComprobantePago;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.TipoDocumento; 
import fisi.software.detalles.entity.AperturaCaja; // Nueva importaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n

// Importaciones de Repositorios
import fisi.software.detalles.repository.VentaRepository; 
import fisi.software.detalles.repository.ClienteRepository; 
import fisi.software.detalles.repository.UsuarioRepository; 
import fisi.software.detalles.repository.TipoComprobantePagoRepository;
import fisi.software.detalles.repository.ProductoRepository;
import fisi.software.detalles.repository.CajaRepository; // Nueva importaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n
import fisi.software.detalles.repository.AperturaCajaRepository; // Nueva importaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n

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
    // ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â INYECCIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œN DE TODOS LOS REPOSITORIOS
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
    private CajaRepository cajaRepository; // Nueva inyecciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n

    @Autowired
    private AperturaCajaRepository aperturaCajaRepository; // Nueva inyecciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n

    // --- DefiniciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Fuentes para PDF ---
    private static final Font FONT_TITULO = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.RED);
    private static final Font FONT_NORMAL_BOLD = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
    private static final Font FONT_NORMAL = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
    private static final Font FONT_HEADER_TABLE = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);

    // IGV eliminado - ya no se calcula impuesto


    // ======================================================================
    // MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODO: ACTUALIZAR VENTA EXISTENTE
    // ======================================================================
    public Map<String, Object> updateVenta(VentaRequestDTO ventaDTO) {
        if (ventaDTO.getId_comprobante() == null) {
            throw new IllegalArgumentException("El ID de la venta a actualizar no puede ser nulo.");
        }
        Optional<ComprobantePago> ventaOpt = ventaRepository.findById(ventaDTO.getId_comprobante());
        if (ventaOpt.isEmpty()) {
            throw new IllegalArgumentException("No se encontrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³ la venta con ID: " + ventaDTO.getId_comprobante());
        }
        ComprobantePago venta = convertDtoToEntity(ventaDTO);
        venta.setIdComprobante(ventaDTO.getId_comprobante());
        venta = ventaRepository.save(venta);
        Map<String, Object> response = new HashMap<>();
        response.put("id_venta", venta.getIdComprobante());
        response.put("mensaje", "Venta actualizada exitosamente. ID: " + venta.getIdComprobante());
        return response;
    }

    // ======================================================================
    // MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODO 1: REGISTRAR NUEVA VENTA
    // ======================================================================

    // MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©todo para verificar si la caja estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ abierta
    private boolean isCajaAbierta() {
        return !cajaRepository.findByEstado("Abierta").isEmpty();
    }

    @Transactional
    public Map<String, Object> registrarNuevaVenta(VentaRequestDTO ventaDTO) {
        // Verificar si la caja estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ abierta
        if (!isCajaAbierta()) {
            throw new IllegalStateException("No se pueden realizar ventas porque la caja estÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ cerrada.");
        }

        ComprobantePago nuevaVenta = convertDtoToEntity(ventaDTO);
        
        // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢Ãƒâ€šÃ‚Â¾ GUARDAR EN BASE DE DATOS
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
    // MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODO 3: LISTAR TODAS LAS VENTAS
    // ======================================================================
    @Transactional(readOnly = true)
    public List<VentaListDTO> listarTodasLasVentas() {
        System.out.println("LOG: Solicitud de listado de ventas (BD REAL).");
        List<ComprobantePago> ventas = ventaRepository.findAll();
        List<VentaListDTO> lista = new ArrayList<>();
        
        for (ComprobantePago v : ventas) {
            String nombreCliente = obtenerNombreCliente(v); // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODO AUXILIAR
            
            String metodoPago = ""; // Ajusta si tienes relaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n con TipoPago
            
            List<DetalleVentaListDTO> detalles = new ArrayList<>();
            for (DetalleComprobantePago d : v.getDetalles()) {
                String nombreProd = d.getProducto() != null ? d.getProducto().getNombre() : "Producto sin nombre";
                detalles.add(new DetalleVentaListDTO(
                    nombreProd,
                    d.getCantidad(),
                    d.getPrecioUnitario()
                ));
            }
            
            lista.add(new VentaListDTO(
                v.getIdComprobante(),
                nombreCliente, // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ NOMBRE CORREGIDO
                v.getFechaEmision(),
                metodoPago,
                v.getEstado(),
                v.getTotal(),
                detalles
            ));
        }
        return lista;
    }

    // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ NUEVO MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODO AUXILIAR PARA OBTENER NOMBRE DE CLIENTE
    private String obtenerNombreCliente(ComprobantePago venta) {
        if (venta.getCliente() != null) {
            Cliente cliente = venta.getCliente();
            String nombres = cliente.getNombre() != null ? cliente.getNombre() : "";
            String apellidos = cliente.getApellido() != null ? cliente.getApellido() : "";
            
            String nombreCompleto = (nombres + " " + apellidos).trim();
            
            if (!nombreCompleto.isEmpty()) {
                return nombreCompleto;
            } else if (cliente.getNumeroDocumento() != null && !cliente.getNumeroDocumento().isEmpty()) {
                return "Doc: " + cliente.getNumeroDocumento();
            }
        }
        
        return "PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblico General";
    }

    // ======================================================================
    // MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODOS AUXILIARES (PRIVADOS) - LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de ConversiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n
    // ======================================================================

    /**
    ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â * Convierte el DTO de Venta a la Entidad ComprobantePago,
    ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â * buscando las FKs y calculando subtotales.
    ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â */
    private ComprobantePago convertDtoToEntity(VentaRequestDTO ventaDTO) {
        ComprobantePago venta = new ComprobantePago();
        
        // --- 1. Mapeo de Totales y Fechas ---
        
        // Monto Total (OBLIGATORIO)
        if (ventaDTO.getMonto_total() == null) {
            throw new IllegalArgumentException("El monto total de la venta no puede ser nulo.");
        }
        BigDecimal total = ventaDTO.getMonto_total().setScale(2, RoundingMode.HALF_UP);
        venta.setTotal(total); 
    
        // IGV eliminado - Subtotal es igual al total, IGV es cero
        BigDecimal subtotal = total;
        BigDecimal igv = BigDecimal.ZERO;
        
        // Estos campos son NOT NULL, ahora se llenan sin IGV.
        venta.setSubtotal(subtotal);
        venta.setIgv(igv);
    
        // Fecha de EmisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n (LocalDate a LocalDateTime)
        venta.setFechaEmision(ventaDTO.getFecha_emision() != null 
            ? ventaDTO.getFecha_emision().atStartOfDay() 
            : LocalDateTime.now());
        // NÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºmero de Comprobante (Placeholder)
    venta.setNumeroComprobante("B001-" + String.format("%08d", ventaRepository.count() + 1)); 
        
    // El estado ('Emitido') se inicializa en la Entidad, o se toma del DTO
    venta.setEstado(ventaDTO.getEstado_comprobante() != null ? ventaDTO.getEstado_comprobante() : "Emitido");
        
    // --- 2. AsignaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de Entidades Relacionadas (Claves ForÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡neas) ---
        
    // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â id_usuario (OBLIGATORIO - Se mantiene tu ID de prueba: 6)
    Integer idUsuarioFijo = 6; 
    Usuario usuario = usuarioRepository.findById(idUsuarioFijo)
        .orElseThrow(() -> new RuntimeException("Error FK: Usuario que realiza la venta no encontrado con ID: " + idUsuarioFijo + ". Verifique tabla 'usuarios'."));
    venta.setUsuario(usuario);
        
    // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â id_tipo_comprobante (OBLIGATORIO - Se busca primero en el DTO, si es nulo se fuerza 1)
    Integer idTipoComprobante = ventaDTO.getId_tipo_comprobante() != null ? ventaDTO.getId_tipo_comprobante() : 1;
        
    // Se busca el tipo de comprobante usando el ID seguro
    TipoComprobantePago tipoComprobante = tipoComprobantePagoRepository.findById(idTipoComprobante)
        .orElseThrow(() -> new RuntimeException("Error FK: Tipo de Comprobante no encontrado con ID: " + idTipoComprobante + ". Verifique tabla 'tiposcomprobantepago'."));
    venta.setTipoComprobante(tipoComprobante);
            
    // id_cliente (OPCIONAL)
    if (ventaDTO.getId_cliente() != null) {
        Optional<Cliente> clienteOpt = clienteRepository.findById(ventaDTO.getId_cliente());
        clienteOpt.ifPresent(venta::setCliente);
    } else {
        // Si la columna es NOT NULL y no lo especificas, usa el ID 1 (Cliente GenÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rico)
        Integer idClienteGenerico = 1;
        Optional<Cliente> clienteGenericoOpt = clienteRepository.findById(idClienteGenerico);
        clienteGenericoOpt.ifPresent(venta::setCliente);
    }

    // id_apertura (OBLIGATORIO)
    if (ventaDTO.getId_apertura() == null) {
        throw new IllegalArgumentException("La apertura de caja es obligatoria para registrar una venta.");
    }
    AperturaCaja aperturaCaja = aperturaCajaRepository.findById(ventaDTO.getId_apertura())
        .orElseThrow(() -> new RuntimeException("Error FK: Apertura de caja no encontrada con ID: " + ventaDTO.getId_apertura() + ". Verifique tabla 'aperturascaja'."));
    venta.setApertura(aperturaCaja);

    // --- 3. Mapear Detalles y establecer la relaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n ---
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
    ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â * Convierte el DetalleVentaDTO a la Entidad DetalleComprobantePago.
    ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â */
    private DetalleComprobantePago convertDetalleDtoToEntity(DetalleVentaDTO detalleDTO, ComprobantePago comprobante) {
        DetalleComprobantePago detalle = new DetalleComprobantePago();

        // Asignar el comprobante padre
        detalle.setComprobante(comprobante); 
        
        String nombreProducto = detalleDTO.getNombre_producto_temp();

        // VerificaciÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n de NULO o VACÃƒÆ’Ã†â€™Ãƒâ€šÃ‚ÂO
        if (nombreProducto == null || nombreProducto.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre_producto_temp en el detalle de la venta no puede ser nulo o vacÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­o.");
        }
        
        // Buscar y asignar el producto por nombre.
        Optional<Producto> productoOpt = productoRepository.findByNombreIgnoreCase(nombreProducto);
        
        Producto producto = productoOpt
            .orElseThrow(() -> new RuntimeException("ERROR: Producto no encontrado por nombre exacto: " + nombreProducto + ". Verifique que el nombre coincida exactamente en la base de datos (o use ID en el DTO)."));
            detalle.setProducto(producto);
        
        // Asignar valores
        detalle.setCantidad(detalleDTO.getCantidad());
        detalle.setPrecioUnitario(detalleDTO.getPrecio_unitario());

        // Subtotal de la lÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­nea = (Precio Unitario * Cantidad) - Descuento
        BigDecimal subtotalLinea = detalleDTO.getPrecio_unitario()
            .multiply(new BigDecimal(detalleDTO.getCantidad()))
            .subtract(detalleDTO.getDescuento_aplicado() != null ? detalleDTO.getDescuento_aplicado() : BigDecimal.ZERO)
            .setScale(2, RoundingMode.HALF_UP); 
            
        detalle.setDescuentoAplicado(detalleDTO.getDescuento_aplicado() != null ? detalleDTO.getDescuento_aplicado() : BigDecimal.ZERO);
        detalle.setSubtotalLinea(subtotalLinea); 
        
        return detalle;
    }

    // ======================================================================
    // MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODOS DE PDF
    // ======================================================================

    public byte[] generarComprobantePDF(Long idComprobante) throws DocumentException, IOException {
        Optional<ComprobantePago> ventaOptional = ventaRepository.findById(idComprobante);
        if (ventaOptional.isEmpty()) {
            throw new RuntimeException("Comprobante de venta no encontrado con ID: " + idComprobante);
        }
        
        ComprobantePago venta = ventaOptional.get();
        Map<String, Object> ventaMap = new HashMap<>();
        
        // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ USAR EL MÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°TODO AUXILIAR
        String clienteNombre = obtenerNombreCliente(venta);
        
        ventaMap.put("tipoComprobante", venta.getTipoComprobante() != null ? venta.getTipoComprobante().getNombreTipo() : "");
        ventaMap.put("cliente", clienteNombre); // ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ NOMBRE CORREGIDO
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
            headerTable.addCell(new Paragraph("RazÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n Social:", FONT_NORMAL_BOLD));
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
        String[] headers = {"CÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œDIGO", "DESCRIPCIÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œN", "CANT.", "P. UNITARIO", "SUBTOTAL"};
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
        venta.put("cliente", "Juan PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©rez");
        venta.put("fechaEmision", LocalDateTime.now().toString());
        BigDecimal subtotal = new BigDecimal("420.00");
        BigDecimal igv = new BigDecimal("75.60"); 
        BigDecimal total = subtotal.add(igv);
        venta.put("subtotal", subtotal);
        venta.put("igv", igv);
        venta.put("total", total);
        List<Map<String, Object>> detalles = new ArrayList<>();
        detalles.add(Map.of("codigo", "P001", "descripcion", "Zapatillas", "cantidad", 1, "precioUnitario", new BigDecimal("250.00"), "subtotalLinea", new BigDecimal("250.00")));
        detalles.add(Map.of("codigo", "P005", "descripcion", "Medias CompresiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³n", "cantidad", 2, "precioUnitario", new BigDecimal("85.00"), "subtotalLinea", new BigDecimal("170.00")));
        venta.put("detalles", detalles);
        return venta;
    }
}