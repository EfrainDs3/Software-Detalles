package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.CompraRequestDTO;
import fisi.software.detalles.controller.dto.CompraResponseDTO;
import fisi.software.detalles.controller.dto.DetalleCompraDTO;
import fisi.software.detalles.controller.dto.DetalleTallaDTO;
import fisi.software.detalles.controller.dto.RecepcionCompraRequest;
import fisi.software.detalles.controller.dto.RecepcionDetalleDTO;
import fisi.software.detalles.controller.dto.RecepcionDetalleTallaDTO;
import fisi.software.detalles.entity.*;
import fisi.software.detalles.exception.RecepcionInvalidaException;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de compras
 */
@Service
@Transactional
@RequiredArgsConstructor
public class CompraService {

    private final PedidoCompraRepository pedidoCompraRepository;
    private final DetallePedidoCompraRepository detallePedidoCompraRepository;
    private final DetallePedidoCompraTallaRepository detallePedidoCompraTallaRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioService inventarioService;
    private final InventarioRepository inventarioRepository;
    private final InventarioTallaRepository inventarioTallaRepository;
    private final AlmacenRepository almacenRepository;
    private final TipoMovimientoInventarioRepository tipoMovimientoRepository;
    private final TipoPagoRepository tipoPagoRepository;

    private static final String TIPO_ENTRADA_COMPRA = "Entrada - Compra";

    /**
     * Listar todas las compras
     */
    public List<CompraResponseDTO> listarCompras() {
        return pedidoCompraRepository.findAllByOrderByFechaPedidoDesc().stream()
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener compra por ID
     */
    public CompraResponseDTO obtenerCompraPorId(Long id) {
        PedidoCompra pedido = pedidoCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada con ID: " + id));
        return convertirAResponseDTO(pedido);
    }

    /**
     * Crear nueva compra
     */
    public CompraResponseDTO crearCompra(CompraRequestDTO request, Integer idUsuario) {
        // Validar proveedor
        Proveedor proveedor = proveedorRepository.findById(request.getIdProveedor())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        if (proveedor.getEstado() != 1) {
            throw new RuntimeException("El proveedor no está activo");
        }

        // Validar usuario
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que hay detalles
        if (request.getDetalles() == null || request.getDetalles().isEmpty()) {
            throw new RuntimeException("Debe agregar al menos un producto a la compra");
        }

        // Crear pedido
        PedidoCompra pedido = new PedidoCompra(proveedor, usuario, request.getFechaEntregaEsperada());
        pedido.setAplicaIgv(request.getAplicaIgv() != null ? request.getAplicaIgv() : Boolean.TRUE);

        // Asignar campos opcionales
        if (request.getIdTipoPago() != null) {
            TipoPago tipoPago = tipoPagoRepository.findById(request.getIdTipoPago())
                    .orElse(null);
            pedido.setTipoPago(tipoPago);
        }
        pedido.setReferencia(request.getReferencia());
        pedido.setObservaciones(request.getObservaciones());

        // Agregar detalles y validar que todos los productos pertenezcan al proveedor
        for (DetalleCompraDTO detalleDTO : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(
                            () -> new RuntimeException("Producto no encontrado con ID: " + detalleDTO.getIdProducto()));

            // Validar que el producto pertenece al proveedor
            if (producto.getProveedor() == null ||
                    !producto.getProveedor().getIdProveedor().equals(proveedor.getIdProveedor())) {
                throw new RuntimeException("El producto '" + producto.getNombre() +
                        "' no pertenece al proveedor seleccionado");
            }

            // Validar cantidad y costo
            if (detalleDTO.getCantidad() == null || detalleDTO.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero");
            }

            if (detalleDTO.getCostoUnitario() == null ||
                    detalleDTO.getCostoUnitario().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("El costo unitario debe ser mayor a cero");
            }

            DetallePedidoCompra detalle = new DetallePedidoCompra(
                    producto,
                    detalleDTO.getCantidad(),
                    detalleDTO.getCostoUnitario());

            // Si el producto tiene tallas, agregar detalles de tallas
            if (detalleDTO.getTieneTallas() != null && detalleDTO.getTieneTallas() &&
                    detalleDTO.getTallas() != null && !detalleDTO.getTallas().isEmpty()) {

                for (DetalleTallaDTO tallaDTO : detalleDTO.getTallas()) {
                    DetallePedidoCompraTalla detalleTalla = new DetallePedidoCompraTalla(
                            detalle,
                            tallaDTO.getTalla(),
                            tallaDTO.getCantidad());
                    detalle.agregarTalla(detalleTalla);
                }

                // Recalcular cantidad y subtotal desde las tallas
                detalle.recalcularDesdeTallas();
            }

            pedido.agregarDetalle(detalle);
        }

        // Guardar pedido
        pedido = pedidoCompraRepository.save(pedido);

        return convertirAResponseDTO(pedido);
    }

    /**
     * Actualizar estado de compra
     * Si el estado cambia a "Completado", actualiza el inventario automáticamente
     */
    public CompraResponseDTO actualizarEstadoCompra(Long id, String nuevoEstado) {
        PedidoCompra pedido = pedidoCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada con ID: " + id));

        String estadoAnterior = pedido.getEstadoPedido();

        // Validar estados válidos
        if (!nuevoEstado.equals("Pendiente") && !nuevoEstado.equals("Completado") && !nuevoEstado.equals("Cancelado")) {
            throw new RuntimeException("Estado no válido. Use: Pendiente, Completado o Cancelado");
        }

        // Si cambia a Completado, actualizar inventario
        if (nuevoEstado.equals("Completado") && !estadoAnterior.equals("Completado")) {
            actualizarInventarioDesdeCompra(pedido);
        }

        pedido.setEstadoPedido(nuevoEstado);
        pedido = pedidoCompraRepository.save(pedido);

        return convertirAResponseDTO(pedido);
    }

    /**
     * Registra una recepción parcial o total para un pedido de compra existente.
     */
    public CompraResponseDTO registrarRecepcion(Long idPedidoCompra, RecepcionCompraRequest request) {
        if (request == null || request.getDetalles() == null || request.getDetalles().isEmpty()) {
            throw new RecepcionInvalidaException("Debe registrar al menos un detalle para la recepción");
        }

        PedidoCompra pedido = pedidoCompraRepository.findById(idPedidoCompra)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada con ID: " + idPedidoCompra));

        if ("Cancelado".equalsIgnoreCase(pedido.getEstadoPedido())) {
            throw new RecepcionInvalidaException("No se puede registrar recepción para una compra cancelada");
        }

        if ("Completado".equalsIgnoreCase(pedido.getEstadoPedido())) {
            throw new RecepcionInvalidaException("La compra ya fue completada previamente");
        }

        Integer usuarioId = pedido.getUsuario() != null ? pedido.getUsuario().getId().intValue() : null;
        if (usuarioId == null) {
            throw new RecepcionInvalidaException("La compra no tiene un usuario asociado para registrar el movimiento");
        }

        Map<Long, DetallePedidoCompra> detallesPorId = pedido.getDetalles().stream()
                .collect(Collectors.toMap(DetallePedidoCompra::getIdDetallePedido, detalle -> detalle));

        Almacen almacenDestino = obtenerAlmacenDestinoCompra();
        TipoMovimientoInventario tipoMovimiento = obtenerTipoMovimientoCompra();

        for (RecepcionDetalleDTO detalleDTO : request.getDetalles()) {
            if (detalleDTO.getIdDetallePedido() == null) {
                throw new RecepcionInvalidaException("Falta el identificador del detalle de compra a recepcionar");
            }

            DetallePedidoCompra detalle = detallesPorId.get(detalleDTO.getIdDetallePedido());
            if (detalle == null) {
                throw new RecepcionInvalidaException(
                        "El detalle " + detalleDTO.getIdDetallePedido() + " no pertenece a la compra");
            }

            if (detalle.tieneTallas()) {
                procesarRecepcionPorTallas(detalle, detalleDTO, pedido, almacenDestino, tipoMovimiento, usuarioId,
                        request.isCompletarCompra());
            } else {
                procesarRecepcionSimple(detalle, detalleDTO, pedido, almacenDestino, tipoMovimiento, usuarioId,
                        request.isCompletarCompra());
            }
        }

        boolean todosCompletados = pedido.getDetalles().stream()
                .allMatch(detalle -> toSafeQuantity(detalle.getCantidadRecibida()) >= toSafeQuantity(detalle.getCantidadPedida()));

        if (request.isCompletarCompra() && !todosCompletados) {
            throw new RecepcionInvalidaException(
                    "No se puede completar la compra: aún existen cantidades pendientes por recibir");
        }

        if (todosCompletados) {
            pedido.setEstadoPedido("Completado");
        } else {
            boolean existeRecepcion = pedido.getDetalles().stream()
                    .anyMatch(detalle -> toSafeQuantity(detalle.getCantidadRecibida()) > 0);
            pedido.setEstadoPedido(existeRecepcion ? "Parcial" : "Pendiente");
        }

        pedidoCompraRepository.save(pedido);
        return convertirAResponseDTO(pedido);
    }

    /**
     * Actualiza el inventario cuando una compra se completa
     */
    private void actualizarInventarioDesdeCompra(PedidoCompra pedido) {
        Almacen almacen = obtenerAlmacenDestinoCompra();
        TipoMovimientoInventario tipoMovimiento = obtenerTipoMovimientoCompra();

        // Actualizar inventario para cada detalle
        for (DetallePedidoCompra detalle : pedido.getDetalles()) {
            Producto producto = detalle.getProducto();

            // Verificar si el producto tiene tallas
            if (detalle.tieneTallas()) {
                // Actualizar inventario por talla
                actualizarInventarioPorTallas(detalle, almacen, tipoMovimiento, pedido);
            } else {
                // Actualizar inventario normal (sin tallas)
                actualizarInventarioNormal(detalle, almacen, tipoMovimiento, pedido);
            }
        }
    }

    /**
     * Actualiza inventario normal (productos sin tallas)
     */
    private void actualizarInventarioNormal(DetallePedidoCompra detalle, Almacen almacen,
            TipoMovimientoInventario tipoMovimiento, PedidoCompra pedido) {
        Producto producto = detalle.getProducto();
        Integer cantidad = detalle.getCantidadPedida();

        // Buscar si el producto ya existe en el inventario del almacén
        Inventario inventario = inventarioRepository.findByProductoAndAlmacen(producto, almacen)
                .orElseGet(() -> {
                    // Si no existe, crear nuevo registro de inventario
                    Inventario nuevoInventario = new Inventario(producto, almacen, 0, 5);
                    return inventarioRepository.save(nuevoInventario);
                });

        // Ajustar stock usando el servicio de inventario
        inventarioService.ajustarStock(
                inventario.getId(),
                tipoMovimiento.getId(),
                cantidad,
                "COMPRA-" + pedido.getIdPedidoCompra(),
                "Entrada por compra a proveedor: " + pedido.getProveedor().getNombreComercial(),
                pedido.getUsuario().getId().intValue());

        // Actualizar cantidad recibida en el detalle
        detalle.setCantidadRecibida(cantidad);
    }

    /**
     * Actualiza inventario por tallas
     */
    private void actualizarInventarioPorTallas(DetallePedidoCompra detalle, Almacen almacen,
            TipoMovimientoInventario tipoMovimiento, PedidoCompra pedido) {
        Producto producto = detalle.getProducto();

        // Buscar o crear inventario base para el producto
        Inventario inventario = inventarioRepository.findByProductoAndAlmacen(producto, almacen)
                .orElseGet(() -> {
                    Inventario nuevoInventario = new Inventario(producto, almacen, 0, 5);
                    return inventarioRepository.save(nuevoInventario);
                });

        // Actualizar inventario para cada talla
        for (DetallePedidoCompraTalla detalleTalla : detalle.getTallas()) {
            String talla = detalleTalla.getTalla();
            Integer cantidad = detalleTalla.getCantidadPedida();

            // Buscar o crear inventario de talla
            InventarioTalla inventarioTalla = inventarioTallaRepository
                    .findByInventarioAndTalla(inventario, talla)
                    .orElseGet(() -> {
                        InventarioTalla nuevoInventarioTalla = new InventarioTalla();
                        nuevoInventarioTalla.setInventario(inventario);
                        nuevoInventarioTalla.setTalla(talla);
                        nuevoInventarioTalla.setCantidadStock(0);
                        nuevoInventarioTalla.setStockMinimo(5);
                        return inventarioTallaRepository.save(nuevoInventarioTalla);
                    });

            // Ajustar stock por talla
            inventarioService.ajustarStockTalla(
                    inventario.getId(),
                    talla,
                    tipoMovimiento.getId(),
                    cantidad,
                    5, // stock mínimo
                    "COMPRA-" + pedido.getIdPedidoCompra() + "-TALLA-" + talla,
                    "Entrada por compra - Talla " + talla + " - Proveedor: "
                            + pedido.getProveedor().getNombreComercial(),
                    pedido.getUsuario().getId().intValue());

            // Actualizar cantidad recibida en el detalle de talla
            detalleTalla.setCantidadRecibida(cantidad);
        }

        // Recalcular cantidad recibida total del detalle
        detalle.recalcularDesdeTallas();
    }

    /**
     * Anular compra
     */
    public void anularCompra(Long id) {
        PedidoCompra pedido = pedidoCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada con ID: " + id));

        if (pedido.getEstadoPedido().equals("Completado")) {
            throw new RuntimeException("No se puede anular una compra completada. " +
                    "Debe realizar un ajuste de inventario manual si es necesario.");
        }

        pedido.setEstadoPedido("Cancelado");
        pedidoCompraRepository.save(pedido);
    }

    /**
     * Filtrar compras por proveedor
     */
    public List<CompraResponseDTO> filtrarPorProveedor(Integer idProveedor) {
        return pedidoCompraRepository.findByIdProveedor(idProveedor).stream()
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Filtrar compras por estado
     */
    public List<CompraResponseDTO> filtrarPorEstado(String estado) {
        return pedidoCompraRepository.findByEstadoPedidoOrderByFechaPedidoDesc(estado).stream()
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convertir entidad a DTO de respuesta
     */
    private CompraResponseDTO convertirAResponseDTO(PedidoCompra pedido) {
        CompraResponseDTO dto = new CompraResponseDTO();
        dto.setIdPedidoCompra(pedido.getIdPedidoCompra());
        dto.setIdProveedor(pedido.getProveedor().getIdProveedor());
        dto.setNombreProveedor(
                pedido.getProveedor().getNombreComercial() != null ? pedido.getProveedor().getNombreComercial()
                        : pedido.getProveedor().getRazonSocial());
        dto.setRucProveedor(pedido.getProveedor().getRuc());
        dto.setIdUsuario(pedido.getUsuario().getId().intValue());
        dto.setNombreUsuario(pedido.getUsuario().getUsername());
        dto.setFechaPedido(pedido.getFechaPedido());
        dto.setFechaEntregaEsperada(pedido.getFechaEntregaEsperada());
        dto.setTipoPago(pedido.getTipoPago() != null ? pedido.getTipoPago().getTipoPago() : null);
        dto.setReferencia(pedido.getReferencia());
        dto.setObservaciones(pedido.getObservaciones());
        dto.setEstadoPedido(pedido.getEstadoPedido());
        dto.setTotalPedido(pedido.getTotalPedido());
        dto.setAplicaIgv(pedido.getAplicaIgv() != null ? pedido.getAplicaIgv() : Boolean.TRUE);

        // Convertir detalles
        List<DetalleCompraDTO> detallesDTO = pedido.getDetalles().stream()
                .map(detalle -> {
                    DetalleCompraDTO detalleDTO = new DetalleCompraDTO();
                    detalleDTO.setIdDetallePedido(detalle.getIdDetallePedido());
                    detalleDTO.setIdProducto(detalle.getProducto().getId());
                    detalleDTO.setNombreProducto(detalle.getProducto().getNombre());
                    detalleDTO.setCantidad(detalle.getCantidadPedida());
                    detalleDTO.setCostoUnitario(detalle.getCostoUnitario());
                    detalleDTO.setSubtotal(detalle.getSubtotalLinea());
                    int cantidadPedida = toSafeQuantity(detalle.getCantidadPedida());
                    int cantidadRecibida = toSafeQuantity(detalle.getCantidadRecibida());
                    detalleDTO.setCantidadRecibida(cantidadRecibida);
                    detalleDTO.setCantidadPendiente(Math.max(0, cantidadPedida - cantidadRecibida));

                    // Agregar información de tallas si existen
                    if (detalle.tieneTallas()) {
                        detalleDTO.setTieneTallas(true);
                        List<DetalleTallaDTO> tallasDTO = detalle.getTallas().stream()
                                .map(talla -> {
                                    DetalleTallaDTO tallaDTO = new DetalleTallaDTO();
                                    tallaDTO.setIdDetalleTalla(talla.getIdDetalleTalla());
                                    tallaDTO.setTalla(talla.getTalla());
                                    int tallaPedida = toSafeQuantity(talla.getCantidadPedida());
                                    int tallaRecibida = toSafeQuantity(talla.getCantidadRecibida());
                                    tallaDTO.setCantidad(tallaPedida);
                                    tallaDTO.setCantidadRecibida(tallaRecibida);
                                    tallaDTO.setCantidadPendiente(Math.max(0, tallaPedida - tallaRecibida));
                                    tallaDTO.setCostoUnitario(detalle.getCostoUnitario());
                                    tallaDTO.calcularSubtotal();
                                    return tallaDTO;
                                })
                                .collect(Collectors.toList());
                        detalleDTO.setTallas(tallasDTO);
                    } else {
                        detalleDTO.setTieneTallas(false);
                        detalleDTO.setTallas(null);
                    }

                    return detalleDTO;
                })
                .collect(Collectors.toList());

        dto.setDetalles(detallesDTO);
        return dto;
    }

    private int toSafeQuantity(Integer value) {
        return value != null ? value : 0;
    }

    private void procesarRecepcionSimple(DetallePedidoCompra detalle, RecepcionDetalleDTO detalleDTO,
            PedidoCompra pedido, Almacen almacen, TipoMovimientoInventario tipoMovimiento, Integer usuarioId,
            boolean completarCompraSolicitado) {
        int cantidadSolicitada = detalleDTO.getCantidad() != null ? detalleDTO.getCantidad() : 0;

        if (cantidadSolicitada < 0) {
            throw new RecepcionInvalidaException("La cantidad a recepcionar no puede ser negativa");
        }

        if (cantidadSolicitada == 0) {
            return;
        }

        int pendiente = Math.max(0, toSafeQuantity(detalle.getCantidadPedida()) - toSafeQuantity(detalle.getCantidadRecibida()));
        if (cantidadSolicitada > pendiente) {
            throw new RecepcionInvalidaException("La cantidad supera el pendiente por recibir del producto "
                    + detalle.getProducto().getNombre());
        }

        int pendienteRestante = Math.max(0, pendiente - cantidadSolicitada);
        boolean detalleCompletado = pendienteRestante == 0;
        StringBuilder observacion = new StringBuilder("Recepción ")
                .append(detalleCompletado ? "final" : "parcial")
                .append(" de compra - Producto: ")
                .append(detalle.getProducto().getNombre());

        if (!detalleCompletado) {
            observacion.append(" - Pendiente restante: ").append(pendienteRestante);
        } else if (completarCompraSolicitado) {
            observacion.append(" (Compra completada)");
        }

        Inventario inventario = obtenerInventario(detalle.getProducto(), almacen);
        inventarioService.ajustarStock(
                inventario.getId(),
                tipoMovimiento.getId(),
                cantidadSolicitada,
                "COMPRA-" + pedido.getIdPedidoCompra(),
                observacion.toString(),
                usuarioId);

        detalle.setCantidadRecibida(toSafeQuantity(detalle.getCantidadRecibida()) + cantidadSolicitada);
    }

    private void procesarRecepcionPorTallas(DetallePedidoCompra detalle, RecepcionDetalleDTO detalleDTO,
            PedidoCompra pedido, Almacen almacen, TipoMovimientoInventario tipoMovimiento, Integer usuarioId,
            boolean completarCompraSolicitado) {
        List<RecepcionDetalleTallaDTO> tallasDTO = detalleDTO.getTallas();
        if (tallasDTO == null || tallasDTO.isEmpty()) {
            throw new RecepcionInvalidaException("Debe especificar las cantidades por talla para este producto");
        }

        Map<Long, DetallePedidoCompraTalla> tallasPorId = detalle.getTallas().stream()
                .collect(Collectors.toMap(DetallePedidoCompraTalla::getIdDetalleTalla, talla -> talla));

        Inventario inventario = obtenerInventario(detalle.getProducto(), almacen);

        for (RecepcionDetalleTallaDTO tallaDTO : tallasDTO) {
            if (tallaDTO.getIdDetalleTalla() == null) {
                throw new RecepcionInvalidaException("Falta el identificador de la talla a recepcionar");
            }

            DetallePedidoCompraTalla detalleTalla = tallasPorId.get(tallaDTO.getIdDetalleTalla());
            if (detalleTalla == null) {
                throw new RecepcionInvalidaException(
                        "La talla " + tallaDTO.getIdDetalleTalla() + " no pertenece al detalle solicitado");
            }

            int cantidadSolicitada = tallaDTO.getCantidad() != null ? tallaDTO.getCantidad() : 0;
            if (cantidadSolicitada < 0) {
                throw new RecepcionInvalidaException("Las cantidades por talla no pueden ser negativas");
            }

            if (cantidadSolicitada == 0) {
                continue;
            }

            int pendienteTalla = Math.max(0, toSafeQuantity(detalleTalla.getCantidadPedida())
                    - toSafeQuantity(detalleTalla.getCantidadRecibida()));
            if (cantidadSolicitada > pendienteTalla) {
                throw new RecepcionInvalidaException("La cantidad para la talla " + detalleTalla.getTalla()
                        + " supera el pendiente por recibir");
            }

                int pendienteTallaRestante = Math.max(0, pendienteTalla - cantidadSolicitada);
                boolean tallaCompletada = pendienteTallaRestante == 0;
                StringBuilder observacion = new StringBuilder("Recepción ")
                    .append(tallaCompletada ? "final" : "parcial")
                    .append(" de compra - Talla ")
                    .append(detalleTalla.getTalla())
                    .append(" - Producto: ")
                    .append(detalle.getProducto().getNombre());

                if (!tallaCompletada) {
                observacion.append(" - Pendiente restante talla: ").append(pendienteTallaRestante);
                } else if (completarCompraSolicitado) {
                observacion.append(" (Compra completada)");
                }

            inventarioService.ajustarStockTalla(
                    inventario.getId(),
                    detalleTalla.getTalla(),
                    tipoMovimiento.getId(),
                    cantidadSolicitada,
                    inventario.getStockMinimo(),
                    "COMPRA-" + pedido.getIdPedidoCompra() + "-TALLA-" + detalleTalla.getTalla(),
                    observacion.toString(),
                    usuarioId);

            detalleTalla.setCantidadRecibida(toSafeQuantity(detalleTalla.getCantidadRecibida()) + cantidadSolicitada);
        }

        detalle.recalcularDesdeTallas();
    }

    private Almacen obtenerAlmacenDestinoCompra() {
        return almacenRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No hay almacenes registrados en el sistema"));
    }

    private TipoMovimientoInventario obtenerTipoMovimientoCompra() {
        return tipoMovimientoRepository.findByNombre(TIPO_ENTRADA_COMPRA)
                .orElseGet(() -> tipoMovimientoRepository.save(new TipoMovimientoInventario(TIPO_ENTRADA_COMPRA, true)));
    }

    private Inventario obtenerInventario(Producto producto, Almacen almacen) {
        return inventarioRepository.findByProductoAndAlmacen(producto, almacen)
                .orElseGet(() -> inventarioRepository.save(new Inventario(producto, almacen, 0, 5)));
    }
}
