package fisi.software.detalles.service;

import fisi.software.detalles.entity.*;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para procesar el checkout y crear comprobantes de pago
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final CarritoRepository carritoRepository;
    private final CarritoDetalleRepository carritoDetalleRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final VentaRepository ventaRepository; // Alias de ComprobantePagoRepository
    private final ProductoRepository productoRepository;
    private final TipoComprobantePagoRepository tipoComprobantePagoRepository;
    private final AperturaCajaRepository aperturaCajaRepository;
    private final CajaRepository cajaRepository; // AGREGADO para crear cajas por defecto
    private final TipoDocumentoRepository tipoDocumentoRepository;

    /**
     * Procesa una compra desde el carrito del usuario
     * 
     * @param userId            ID del usuario que realiza la compra
     * @param direccionEnvio    Dirección de envío
     * @param telefonoContacto  Teléfono de contacto
     * @param idTipoComprobante Tipo de comprobante (1=Boleta, 2=Factura, etc.)
     * @return ComprobantePago generado
     */
    @Transactional
    public ComprobantePago procesarCompra(
            Integer userId,
            String direccionEnvio,
            String telefonoContacto,
            Integer idTipoComprobante) {
        log.info("Iniciando proceso de compra para usuario ID: {}", userId);

        // 1. Obtener usuario
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Obtener carrito del usuario
        Carrito carrito = carritoRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        // 3. Obtener items del carrito - Usando filtrado manual
        List<CarritoDetalle> items = carritoDetalleRepository.findAll().stream()
                .filter(cd -> cd.getCarrito().getIdCarrito().equals(carrito.getIdCarrito()))
                .collect(Collectors.toList());

        if (items == null || items.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // 4. Crear o actualizar cliente
        Cliente cliente = obtenerOCrearCliente(usuario, direccionEnvio, telefonoContacto);

        // 5. Calcular totales
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CarritoDetalle item : items) {
            BigDecimal precioUnitario = item.getProducto().getPrecioVenta();
            BigDecimal itemSubtotal = precioUnitario.multiply(new BigDecimal(item.getCantidad()));
            subtotal = subtotal.add(itemSubtotal);
        }

        BigDecimal igv = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(igv);

        // 6. Obtener tipo de comprobante
        TipoComprobantePago tipoComprobante = tipoComprobantePagoRepository.findById(idTipoComprobante)
                .orElseThrow(() -> new RuntimeException("Tipo de comprobante no válido"));

        // 7. Obtener apertura de caja activa (última apertura sin cierre)
        AperturaCaja apertura = obtenerAperturaActiva();

        // 8. Generar número de comprobante
        String numeroComprobante = generarNumeroComprobante(tipoComprobante);

        // 9. Crear comprobante de pago
        ComprobantePago comprobante = new ComprobantePago();
        comprobante.setCliente(cliente);
        comprobante.setUsuario(usuario);
        comprobante.setTipoComprobante(tipoComprobante);
        comprobante.setNumeroComprobante(numeroComprobante);
        comprobante.setFechaEmision(LocalDateTime.now());
        comprobante.setSubtotal(subtotal);
        comprobante.setIgv(igv);
        comprobante.setTotal(total);
        comprobante.setEstado("Emitido");
        comprobante.setApertura(apertura);

        // 10. Crear detalles del comprobante
        List<DetalleComprobantePago> detalles = new ArrayList<>();
        for (CarritoDetalle item : items) {
            DetalleComprobantePago detalle = new DetalleComprobantePago();
            detalle.setComprobante(comprobante);
            detalle.setProducto(item.getProducto());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(item.getProducto().getPrecioVenta());
            detalle.setDescuentoAplicado(BigDecimal.ZERO);

            BigDecimal subtotalLinea = item.getProducto().getPrecioVenta()
                    .multiply(new BigDecimal(item.getCantidad()));
            detalle.setSubtotalLinea(subtotalLinea);

            detalles.add(detalle);
        }
        comprobante.setDetalles(detalles);

        // 11. Guardar comprobante (cascade guarda los detalles también)
        ComprobantePago comprobanteGuardado = ventaRepository.save(comprobante);

        // 12. Limpiar carrito
        carritoDetalleRepository.deleteAll(items);

        log.info("Compra procesada exitosamente. Comprobante: {}", numeroComprobante);
        return comprobanteGuardado;
    }

    /**
     * Obtiene o crea un cliente a partir del usuario
     */
    private Cliente obtenerOCrearCliente(Usuario usuario, String direccion, String telefono) {
        // Buscar cliente existente por número de documento
        List<Cliente> clientesExistentes = clienteRepository.findAll();
        Cliente clienteExistente = clientesExistentes.stream()
                .filter(c -> c.getNumeroDocumento() != null &&
                        c.getNumeroDocumento().equals(usuario.getNumeroDocumento()))
                .findFirst()
                .orElse(null);

        if (clienteExistente != null) {
            // Actualizar dirección y teléfono si se proporcionaron nuevos
            if (direccion != null && !direccion.trim().isEmpty()) {
                clienteExistente.setDireccion(direccion);
            }
            if (telefono != null && !telefono.trim().isEmpty()) {
                clienteExistente.setTelefono(telefono);
            }
            return clienteRepository.save(clienteExistente);
        }

        // Crear nuevo cliente
        Cliente nuevoCliente = new Cliente();
        nuevoCliente.setNombre(usuario.getNombres());
        nuevoCliente.setApellido(usuario.getApellidos());
        nuevoCliente.setTipoDocumento(usuario.getTipoDocumento());
        nuevoCliente.setNumeroDocumento(usuario.getNumeroDocumento());
        nuevoCliente.setDireccion(direccion);
        nuevoCliente.setTelefono(telefono);
        nuevoCliente.setEmail(usuario.getEmail());
        nuevoCliente.setFechaRegistro(LocalDateTime.now());
        nuevoCliente.setEstado(true);

        return clienteRepository.save(nuevoCliente);
    }

    /**
     * Obtiene la apertura de caja activa
     */
    private AperturaCaja obtenerAperturaActiva() {
        // Buscar última apertura sin cierre
        List<AperturaCaja> aperturas = aperturaCajaRepository.findAll();
        return aperturas.stream()
                .filter(a -> a.getCierre() == null) // Sin cierre
                .findFirst()
                .orElseGet(() -> {
                    // Si no hay apertura activa, crear una por defecto
                    log.warn("No hay apertura de caja activa. Creando apertura por defecto.");
                    AperturaCaja nuevaApertura = new AperturaCaja();

                    // IMPORTANTE: Establecer todos los campos obligatorios (non-null)
                    // 1. Obtener una caja existente o crear una por defecto
                    Caja caja = obtenerCajaPorDefecto();
                    nuevaApertura.setCaja(caja);

                    // 2. Establecer fecha y hora actuales
                    nuevaApertura.setFechaApertura(java.time.LocalDate.now());
                    nuevaApertura.setHoraApertura(java.time.LocalTime.now());

                    // 3. Monto inicial por defecto
                    nuevaApertura.setMontoInicial(new BigDecimal("0.00"));

                    // 4. Usuario por defecto (primer usuario disponible)
                    Usuario usuarioDefecto = usuarioRepository.findAll().stream()
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("No hay usuarios disponibles"));
                    nuevaApertura.setUsuario(usuarioDefecto);

                    return aperturaCajaRepository.save(nuevaApertura);
                });
    }

    /**
     * Obtiene una caja por defecto para aperturas automáticas
     */
    private Caja obtenerCajaPorDefecto() {
        // Buscar caja existente del repositorio
        List<Caja> cajas = cajaRepository.findAll();
        if (!cajas.isEmpty()) {
            return cajas.get(0); // Retornar la primera caja disponible
        }

        // Si no hay cajas, crear una por defecto
        log.warn("No hay cajas registradas. Creando caja por defecto.");
        Caja nuevaCaja = new Caja();
        nuevaCaja.setNombreCaja("Caja Principal");
        nuevaCaja.setEstado("Activo");
        return cajaRepository.save(nuevaCaja);
    }

    /**
     * Genera número de comprobante secuencial
     */
    private String generarNumeroComprobante(TipoComprobantePago tipo) {
        // Obtener último comprobante del tipo
        List<ComprobantePago> comprobantes = ventaRepository.findAll();

        long ultimoNumero = comprobantes.stream()
                .filter(c -> c.getTipoComprobante().getIdTipoComprobante().equals(tipo.getIdTipoComprobante()))
                .count();

        String serie = tipo.getNombreTipo().substring(0, 1); // B o F
        String numero = String.format("%03d-%08d", 1, ultimoNumero + 1);

        return serie + numero;
    }
}
