package fisi.software.detalles.service;

import fisi.software.detalles.entity.*;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de inventario
 */
@Service
@Transactional
@RequiredArgsConstructor
public class InventarioService {

    private static final String TIPO_REGISTRO_INICIAL = "Entrada - Registro Inicial";
    private static final String TIPO_SALIDA_TRANSFERENCIA = "Salida - Transferencia";
    private static final String TIPO_ENTRADA_TRANSFERENCIA = "Entrada - Transferencia";

    private final InventarioRepository inventarioRepository;
    private final InventarioTallaRepository inventarioTallaRepository;
    private final ProductoTallaRepository productoTallaRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final AlmacenRepository almacenRepository;
    private final TipoMovimientoInventarioRepository tipoMovimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Registra un producto en el inventario de un almacén
     */
    public Inventario registrarProductoEnInventario(Long productoId, Long almacenId, Integer stockMinimo,
            Integer cantidadInicial, String referencia, String observaciones, Integer usuarioId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Almacen almacen = almacenRepository.findById(almacenId)
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que no exista ya en este almacén
        Optional<Inventario> existente = inventarioRepository.findByProductoAndAlmacen(producto, almacen);
        if (existente.isPresent()) {
            throw new RuntimeException("El producto ya está registrado en este almacén");
        }

        // Crear registro de inventario
        Inventario inventario = new Inventario(producto, almacen, cantidadInicial, stockMinimo);
        inventario = inventarioRepository.save(inventario);

        // Registrar movimiento inicial si hay stock
        if (cantidadInicial > 0) {
            TipoMovimientoInventario tipoMovimiento = ensureTipoMovimiento(TIPO_REGISTRO_INICIAL, true);

            MovimientoInventario movimiento = new MovimientoInventario(
                    producto, almacen, tipoMovimiento, cantidadInicial, usuario, observaciones, referencia);
            movimientoRepository.save(movimiento);
        }

        return inventario;
    }

    /**
     * Ajusta el stock de un producto en un almacén
     */
    public void ajustarStock(Long inventarioId, Long tipoMovimientoId, Integer cantidad, String referencia,
            String observaciones, Integer usuarioId) {
        ajustarStock(inventarioId, tipoMovimientoId, cantidad, null, referencia, observaciones, usuarioId);
    }

    public void ajustarStock(Long inventarioId, Long tipoMovimientoId, Integer cantidad, Integer stockMinimo,
            String referencia, String observaciones, Integer usuarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        if (inventarioTallaRepository.existsByInventario(inventario)) {
            throw new RuntimeException(
                    "Este producto gestiona su stock por tallas. Realiza el ajuste desde la gestión de tallas.");
        }

        TipoMovimientoInventario tipoMovimiento = tipoMovimientoRepository.findById(tipoMovimientoId)
                .orElseThrow(() -> new RuntimeException("Tipo de movimiento no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Calcular nueva cantidad
        int cantidadAjuste = tipoMovimiento.isEsEntrada() ? cantidad : -cantidad;
        int nuevaCantidad = Math.max(0, inventario.getCantidadStock() + cantidadAjuste);

        // Actualizar inventario
        inventario.setCantidadStock(nuevaCantidad);
        if (stockMinimo != null) {
            inventario.setStockMinimo(Math.max(0, stockMinimo));
        }
        inventarioRepository.save(inventario);

        // Registrar movimiento
        MovimientoInventario movimiento = new MovimientoInventario(
                inventario.getProducto(), inventario.getAlmacen(), tipoMovimiento, cantidad, usuario, observaciones,
                referencia);
        movimientoRepository.save(movimiento);
    }

    public void actualizarStockMinimo(Long inventarioId, Integer stockMinimo, Integer usuarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        if (inventarioTallaRepository.existsByInventario(inventario)) {
            throw new RuntimeException(
                    "Este producto gestiona su stock por tallas. Actualiza el stock mínimo desde la gestión de tallas.");
        }

        if (usuarioId != null) {
            usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        }

        int stockMinimoNormalizado = stockMinimo != null ? Math.max(0, stockMinimo) : 0;
        inventario.setStockMinimo(stockMinimoNormalizado);
        inventarioRepository.save(inventario);
    }

    /**
     * Transfiere stock entre almacenes
     */
    public void transferirStock(Long inventarioOrigenId, Long almacenDestinoId, Integer cantidad, String referencia,
            String observaciones, Integer usuarioId) {
        Inventario inventarioOrigen = inventarioRepository.findById(inventarioOrigenId)
                .orElseThrow(() -> new RuntimeException("Inventario origen no encontrado"));

        Almacen almacenDestino = almacenRepository.findById(almacenDestinoId)
                .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar stock suficiente
        if (inventarioOrigen.getCantidadStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente en el almacén origen");
        }

        // Obtener tipos de movimiento
        TipoMovimientoInventario tipoSalida = ensureTipoMovimiento(TIPO_SALIDA_TRANSFERENCIA, false);

        TipoMovimientoInventario tipoEntrada = ensureTipoMovimiento(TIPO_ENTRADA_TRANSFERENCIA, true);

        // Buscar o crear inventario en destino
        Optional<Inventario> inventarioDestinoOpt = inventarioRepository.findByProductoAndAlmacen(
                inventarioOrigen.getProducto(), almacenDestino);

        Inventario inventarioDestino;
        if (inventarioDestinoOpt.isPresent()) {
            inventarioDestino = inventarioDestinoOpt.get();
        } else {
            // Crear registro en destino con stock mínimo del origen
            inventarioDestino = new Inventario(
                    inventarioOrigen.getProducto(),
                    almacenDestino,
                    0,
                    inventarioOrigen.getStockMinimo());
            inventarioDestino = inventarioRepository.save(inventarioDestino);
        }

        // Actualizar stocks
        inventarioOrigen.setCantidadStock(inventarioOrigen.getCantidadStock() - cantidad);
        inventarioDestino.setCantidadStock(inventarioDestino.getCantidadStock() + cantidad);

        inventarioRepository.save(inventarioOrigen);
        inventarioRepository.save(inventarioDestino);

        // Registrar movimientos
        MovimientoInventario movimientoSalida = new MovimientoInventario(
                inventarioOrigen.getProducto(), inventarioOrigen.getAlmacen(), tipoSalida, cantidad, usuario,
                observaciones, referencia);
        movimientoRepository.save(movimientoSalida);

        MovimientoInventario movimientoEntrada = new MovimientoInventario(
                inventarioDestino.getProducto(), inventarioDestino.getAlmacen(), tipoEntrada, cantidad, usuario,
                observaciones, referencia);
        movimientoRepository.save(movimientoEntrada);
    }

    /**
     * Obtiene un tipo de movimiento por nombre o lo crea si no existe.
     * De esta forma garantizamos que los flujos críticos siempre tengan los tipos
     * necesarios.
     */
    private TipoMovimientoInventario ensureTipoMovimiento(String nombre, boolean esEntrada) {
        return tipoMovimientoRepository.findByNombre(nombre)
                .map(existing -> {
                    if (existing.isEsEntrada() != esEntrada) {
                        existing.setEsEntrada(esEntrada);
                        return tipoMovimientoRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> tipoMovimientoRepository.save(new TipoMovimientoInventario(nombre, esEntrada)));
    }

    public void transferirStock(Long inventarioOrigenId, Long almacenDestinoId, Integer cantidad,
            String referencia, String observaciones) {
        Integer usuarioId = usuarioRepository.findAll().stream()
                .findFirst()
                .map(usuario -> usuario.getId().intValue())
                .orElseThrow(() -> new RuntimeException("No hay usuarios registrados en el sistema"));

        transferirStock(inventarioOrigenId, almacenDestinoId, cantidad, referencia, observaciones, usuarioId);
    }

    /**
     * Obtiene todos los registros de inventario
     */
    public List<Inventario> obtenerTodoInventario() {
        return inventarioRepository.findAll();
    }

    /**
     * Obtiene productos con stock bajo
     */
    public List<Inventario> obtenerProductosStockBajo() {
        return inventarioRepository.findProductosStockBajo();
    }

    /**
     * Obtiene movimientos de inventario
     */
    public List<MovimientoInventario> obtenerMovimientosInventario() {
        return movimientoRepository.findAll();
    }

    /**
     * Obtiene kardex de un producto
     */
    public List<MovimientoInventario> obtenerKardexProducto(Long productoId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return movimientoRepository.findKardexByProducto(producto);
    }

    /**
     * Obtiene estadísticas del inventario
     */
    public Map<String, Object> obtenerEstadisticasInventario() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProductos", inventarioRepository.countProductosUnicos());
        stats.put("totalStock", inventarioRepository.getTotalStockGlobal());
        stats.put("productosStockBajo", inventarioRepository.findProductosStockBajo().size());
        stats.put("productosAgotados", inventarioRepository.findProductosAgotados().size());
        stats.put("totalAlmacenes", almacenRepository.count());
        return stats;
    }

    /**
     * Obtiene inventario por ID
     */
    public Optional<Inventario> obtenerInventarioPorId(Long id) {
        return inventarioRepository.findById(id);
    }

    /**
     * Obtiene productos disponibles para registrar en inventario
     * Solo productos que no están registrados en ningún inventario
     */
    public List<ProductoDisponibleDto> obtenerProductosDisponibles() {
        List<Producto> todosProductos = productoRepository.findAll();
        List<Inventario> inventariosExistentes = inventarioRepository.findAll();

        // Obtener IDs de productos ya registrados en inventario
        Set<Long> productosEnInventario = inventariosExistentes.stream()
                .map(inventario -> inventario.getProducto().getId())
                .collect(Collectors.toSet());

        // Filtrar productos que no están en inventario y mapearlos a DTOs
        return todosProductos.stream()
                .filter(producto -> !productosEnInventario.contains(producto.getId()))
                .map(this::mapearProductoDisponible)
                .collect(Collectors.toList());
    }

    private ProductoDisponibleDto mapearProductoDisponible(Producto producto) {
        String categoria = Optional.ofNullable(producto.getCategoria())
                .map(CategoriaProducto::getNombre)
                .orElse("Sin categoría");

        String marca = Optional.ofNullable(producto.getProveedor())
                .map(proveedor -> {
                    if (proveedor.getNombreComercial() != null && !proveedor.getNombreComercial().isBlank()) {
                        return proveedor.getNombreComercial();
                    }
                    if (proveedor.getRazonSocial() != null && !proveedor.getRazonSocial().isBlank()) {
                        return proveedor.getRazonSocial();
                    }
                    return null;
                })
                .orElse("-");

        String talla = producto.getTallas().stream()
                .map(ProductoTalla::getTalla)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("-");

        String color = Optional.ofNullable(producto.getColor())
                .filter(valor -> !valor.isBlank())
                .orElse("-");

        String descripcion = Optional.ofNullable(producto.getDescripcion())
                .filter(valor -> !valor.isBlank())
                .orElse("-");

        return new ProductoDisponibleDto(
                producto.getId(),
                producto.getNombre(),
                producto.getCodigoBarra(),
                categoria,
                marca,
                talla,
                color,
                descripcion,
                producto.getPrecioVenta());
    }

    /**
     * Obtiene todos los almacenes
     */
    public List<Almacen> obtenerAlmacenes() {
        return almacenRepository.findAll();
    }

    /**
     * Obtiene todos los tipos de movimiento
     */
    public List<TipoMovimientoInventario> obtenerTiposMovimiento() {
        return tipoMovimientoRepository.findAll();
    }

    /**
     * Registra producto en almacén (versión simplificada para API)
     */
    public Inventario registrarProductoEnAlmacen(Long idProducto, Long idAlmacen, Integer stockMinimo,
            Integer cantidadInicial, String referencia, String observaciones) {
        // Usar usuario por defecto o el primer usuario encontrado
        Usuario usuario = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay usuarios registrados en el sistema"));

        return registrarProductoEnInventario(idProducto, idAlmacen, stockMinimo, cantidadInicial,
                referencia, observaciones, usuario.getId().intValue());
    }

    /**
     * Aplica ajuste de stock (versión simplificada para API)
     */
    public MovimientoInventario aplicarAjusteStock(Long idInventario, Long idTipoMovimiento, Integer cantidad,
            String referencia, String observaciones) {
        Usuario usuario = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay usuarios registrados en el sistema"));

        return aplicarAjusteStock(idInventario, idTipoMovimiento, cantidad, null, referencia, observaciones,
                usuario.getId().intValue());
    }

    /**
     * Sobrecarga del método aplicarAjusteStock que acepta un usuarioId específico
     */
    public MovimientoInventario aplicarAjusteStock(Long idInventario, Long idTipoMovimiento, Integer cantidad,
            String referencia, String observaciones, Integer usuarioId) {
        return aplicarAjusteStock(idInventario, idTipoMovimiento, cantidad, null, referencia, observaciones, usuarioId);
    }

    public MovimientoInventario aplicarAjusteStock(Long idInventario, Long idTipoMovimiento, Integer cantidad,
            Integer stockMinimo, String referencia, String observaciones) {
        Usuario usuario = usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No hay usuarios registrados en el sistema"));

        return aplicarAjusteStock(idInventario, idTipoMovimiento, cantidad, stockMinimo, referencia, observaciones,
                usuario.getId().intValue());
    }

    public MovimientoInventario aplicarAjusteStock(Long idInventario, Long idTipoMovimiento, Integer cantidad,
            Integer stockMinimo, String referencia, String observaciones, Integer usuarioId) {
        ajustarStock(idInventario, idTipoMovimiento, cantidad, stockMinimo, referencia, observaciones, usuarioId);

        // Retornar el último movimiento registrado
        return movimientoRepository.findAll().stream()
                .filter(m -> m.getProducto().getId().equals(
                        inventarioRepository.findById(idInventario).get().getProducto().getId()))
                .reduce((first, second) -> second)
                .orElseThrow(() -> new RuntimeException("No se pudo obtener el movimiento registrado"));
    }

    /**
     * Obtiene productos con stock bajo
     */
    public List<Inventario> obtenerProductosBajoStock() {
        return obtenerProductosStockBajo();
    }

    public List<InventarioDetalleDto> obtenerInventarioDetallado() {
        return inventarioRepository.findAll().stream()
                .map(this::mapearInventarioDetallado)
                .collect(Collectors.toList());
    }

    public List<InventarioDetalleDto> obtenerProductosStockBajoDetallado() {
        return obtenerProductosStockBajo().stream()
                .map(this::mapearInventarioDetallado)
                .collect(Collectors.toList());
    }

    public List<MovimientoInventarioDto> obtenerMovimientosInventarioDetallado() {
        return obtenerMovimientosInventario().stream()
                .filter(movimiento -> !esMovimientoRegistroInicial(movimiento))
                .map(this::mapearMovimientoDetallado)
                .collect(Collectors.toList());
    }

    public List<MovimientoInventarioDto> obtenerKardexProductoDetallado(Long productoId) {
        return obtenerKardexProducto(productoId).stream()
                .filter(movimiento -> !esMovimientoRegistroInicial(movimiento))
                .map(this::mapearMovimientoDetallado)
                .collect(Collectors.toList());
    }

    public InventarioDetalleDto registrarProductoEnAlmacenDetallado(Long idProducto, Long idAlmacen,
            Integer stockMinimo, Integer cantidadInicial,
            String referencia, String observaciones) {
        Inventario inventario = registrarProductoEnAlmacen(idProducto, idAlmacen, stockMinimo,
                cantidadInicial, referencia, observaciones);
        return mapearInventarioDetallado(inventario);
    }

    public MovimientoInventarioDto aplicarAjusteStockDetallado(Long idInventario, Long idTipoMovimiento,
            Integer cantidad, String referencia,
            String observaciones) {
        return aplicarAjusteStockDetallado(idInventario, idTipoMovimiento, cantidad, null, referencia, observaciones);
    }

    /**
     * Sobrecarga del método aplicarAjusteStockDetallado que acepta un usuarioId
     * específico
     */
    public MovimientoInventarioDto aplicarAjusteStockDetallado(Long idInventario, Long idTipoMovimiento,
            Integer cantidad, String referencia,
            String observaciones, Integer usuarioId) {
        return aplicarAjusteStockDetallado(idInventario, idTipoMovimiento, cantidad, null, referencia, observaciones,
                usuarioId);
    }

    public MovimientoInventarioDto aplicarAjusteStockDetallado(Long idInventario, Long idTipoMovimiento,
            Integer cantidad, Integer stockMinimo,
            String referencia, String observaciones) {
        MovimientoInventario movimiento = aplicarAjusteStock(idInventario, idTipoMovimiento, cantidad,
                stockMinimo, referencia, observaciones);
        return mapearMovimientoDetallado(movimiento);
    }

    public MovimientoInventarioDto aplicarAjusteStockDetallado(Long idInventario, Long idTipoMovimiento,
            Integer cantidad, Integer stockMinimo,
            String referencia, String observaciones, Integer usuarioId) {
        MovimientoInventario movimiento = aplicarAjusteStock(idInventario, idTipoMovimiento, cantidad,
                stockMinimo, referencia, observaciones, usuarioId);
        return mapearMovimientoDetallado(movimiento);
    }

    public AjusteMasivoResultado aplicarAjustesMasivos(List<AjusteMasivoItem> ajustes, Integer usuarioId) {
        if (ajustes == null || ajustes.isEmpty()) {
            throw new IllegalArgumentException("No se proporcionaron ajustes para procesar");
        }

        Integer usuarioProcesamiento = usuarioId;
        if (usuarioProcesamiento == null) {
            Usuario usuario = usuarioRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay usuarios registrados en el sistema"));
            usuarioProcesamiento = usuario.getId();
        } else if (usuarioRepository.findById(usuarioProcesamiento).isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        int movimientosRegistrados = 0;
        int stockMinimosActualizados = 0;
        int ajustesProcesados = 0;
        List<MovimientoInventarioDto> movimientos = new ArrayList<>();

        for (AjusteMasivoItem ajuste : ajustes) {
            if (ajuste == null) {
                continue;
            }

            Long inventarioId = ajuste.getIdInventario();
            if (inventarioId == null) {
                throw new IllegalArgumentException("Cada ajuste debe incluir un idInventario válido");
            }

            int cantidadSolicitada = Optional.ofNullable(ajuste.getCantidad()).orElse(0);
            int cantidadNormalizada = Math.abs(cantidadSolicitada);
            Integer stockMinimoSolicitado = ajuste.getStockMinimo();
            String referencia = ajuste.getReferencia();
            String observaciones = ajuste.getObservaciones();

            String talla = ajuste.getTalla();
            String tallaNormalizada = talla != null ? talla.trim() : null;
            boolean tieneTalla = tallaNormalizada != null && !tallaNormalizada.isEmpty();

            boolean realizoAccion = false;
            boolean actualizoStockMinimo = false;

            if (cantidadNormalizada > 0) {
                Long tipoMovimientoId = ajuste.getTipoMovimientoId();
                if (tipoMovimientoId == null) {
                    throw new IllegalArgumentException(
                            "Debes seleccionar un tipo de movimiento para los ajustes con cantidad");
                }

                if (tieneTalla) {
                    ajustarStockTalla(inventarioId, tallaNormalizada, tipoMovimientoId, cantidadNormalizada,
                            stockMinimoSolicitado, referencia, observaciones, usuarioProcesamiento);
                    realizoAccion = true;
                    movimientosRegistrados++;
                    if (stockMinimoSolicitado != null) {
                        actualizoStockMinimo = true;
                    }
                } else {
                    MovimientoInventarioDto movimiento = aplicarAjusteStockDetallado(
                            inventarioId,
                            tipoMovimientoId,
                            cantidadNormalizada,
                            stockMinimoSolicitado,
                            referencia,
                            observaciones,
                            usuarioProcesamiento);
                    realizoAccion = true;
                    movimientosRegistrados++;
                    if (movimiento != null) {
                        movimientos.add(movimiento);
                    }
                    if (stockMinimoSolicitado != null) {
                        actualizoStockMinimo = true;
                    }
                }
            } else if (stockMinimoSolicitado != null) {
                if (tieneTalla) {
                    actualizarStockMinimoTalla(inventarioId, tallaNormalizada, stockMinimoSolicitado,
                            usuarioProcesamiento);
                } else {
                    actualizarStockMinimo(inventarioId, stockMinimoSolicitado, usuarioProcesamiento);
                }
                realizoAccion = true;
                actualizoStockMinimo = true;
            }

            if (realizoAccion) {
                ajustesProcesados++;
                if (actualizoStockMinimo) {
                    stockMinimosActualizados++;
                }
            }
        }

        return new AjusteMasivoResultado(movimientosRegistrados, stockMinimosActualizados, ajustesProcesados,
                movimientos);
    }

    public List<AlmacenDto> obtenerAlmacenesDto() {
        return almacenRepository.findAll().stream()
                .map(almacen -> new AlmacenDto(almacen.getId(), almacen.getNombre(), almacen.getUbicacion()))
                .collect(Collectors.toList());
    }

    public List<TipoMovimientoDto> obtenerTiposMovimientoDto() {
        TipoMovimientoInventario salida = ensureTipoMovimiento("Salida", false);
        TipoMovimientoInventario entrada = ensureTipoMovimiento("Entrada", true);

        return List.of(
                new TipoMovimientoDto(salida.getId(), salida.getNombre(), salida.isEsEntrada()),
                new TipoMovimientoDto(entrada.getId(), entrada.getNombre(), entrada.isEsEntrada()));
    }

    private InventarioDetalleDto mapearInventarioDetallado(Inventario inventario) {
        Producto producto = inventario.getProducto();
        ProductoDisponibleDto productoDto = producto != null ? mapearProductoDisponible(producto) : null;
        Almacen almacen = inventario.getAlmacen();

        String categoria = productoDto != null ? productoDto.categoria() : obtenerCategoriaProducto(producto);
        String marca = productoDto != null ? productoDto.marca() : obtenerMarcaProducto(producto);
        String talla = productoDto != null ? productoDto.talla() : obtenerTallaProducto(producto);
        String color = productoDto != null ? productoDto.color() : obtenerColorProducto(producto);
        boolean tieneTallasInventario = inventario.getId() != null
                && inventarioTallaRepository.existsByInventario(inventario);
        boolean productoConTallas = productoTieneTallas(producto);
        boolean manejaTallas = tieneTallasInventario || productoConTallas;

        List<InventarioTalla> tallasInventario = manejaTallas
                ? inventarioTallaRepository.findByInventario(inventario)
                : List.of();

        int tallasTotales = manejaTallas ? tallasInventario.size() : 0;
        int tallasAgotadas = manejaTallas
                ? (int) tallasInventario.stream().filter(this::tallaAgotada).count()
                : 0;
        int tallasEnAlerta = manejaTallas
                ? (int) tallasInventario.stream().filter(this::tallaEnAlerta).count()
                : 0;

        String estadoStock = determinarEstadoStock(inventario, manejaTallas, tallasInventario);

        return new InventarioDetalleDto(
                inventario.getId(),
                producto != null ? producto.getId() : null,
                productoDto != null ? productoDto.codigoBarra() : obtenerCodigoBarraProducto(producto),
                productoDto != null ? productoDto.nombreProducto() : obtenerNombreProducto(producto),
                categoria,
                almacen != null ? almacen.getId() : null,
                almacen != null ? almacen.getNombre() : "Sin almacén",
                Optional.ofNullable(inventario.getCantidadStock()).orElse(0),
                Optional.ofNullable(inventario.getStockMinimo()).orElse(0),
                talla,
                color,
                marca,
                manejaTallas,
                Optional.ofNullable(inventario.getFechaUltimaActualizacion()).orElse(LocalDateTime.now()),
                estadoStock,
                manejaTallas ? tallasEnAlerta : null,
                manejaTallas ? tallasTotales : null,
                manejaTallas ? tallasAgotadas : null);
    }

    private boolean productoTieneTallas(Producto producto) {
        if (producto == null) {
            return false;
        }

        Set<ProductoTalla> tallasProducto = producto.getTallas();
        if (tallasProducto != null && !tallasProducto.isEmpty()) {
            return true;
        }

        Long productoId = producto.getId();
        return productoId != null && productoTallaRepository.existsByProductoId(productoId);
    }

    private boolean tallaAgotada(InventarioTalla inventarioTalla) {
        if (inventarioTalla == null) {
            return false;
        }
        int cantidad = Optional.ofNullable(inventarioTalla.getCantidadStock()).orElse(0);
        return cantidad <= 0;
    }

    private boolean tallaEnAlerta(InventarioTalla inventarioTalla) {
        if (inventarioTalla == null) {
            return false;
        }
        int cantidad = Optional.ofNullable(inventarioTalla.getCantidadStock()).orElse(0);
        if (cantidad <= 0) {
            return true;
        }
        int minimo = Optional.ofNullable(inventarioTalla.getStockMinimo()).orElse(0);
        return minimo > 0 && cantidad < minimo;
    }

    private String determinarEstadoStock(Inventario inventario, boolean manejaTallas,
            List<InventarioTalla> tallasInventario) {
        int stockActual = Optional.ofNullable(inventario.getCantidadStock()).orElse(0);
        int stockMinimo = Optional.ofNullable(inventario.getStockMinimo()).orElse(0);

        if (!manejaTallas) {
            if (stockActual <= 0) {
                return "agotado";
            }
            if (stockMinimo > 0 && stockActual <= stockMinimo) {
                return "bajo";
            }
            return "disponible";
        }

        List<InventarioTalla> tallas = tallasInventario != null ? tallasInventario
                : inventarioTallaRepository.findByInventario(inventario);
        if (tallas.isEmpty()) {
            if (stockActual <= 0) {
                return "agotado";
            }
            if (stockMinimo > 0 && stockActual <= stockMinimo) {
                return "bajo";
            }
            return "disponible";
        }

        if (tallas.stream().allMatch(this::tallaAgotada)) {
            return "agotado";
        }

        if (tallas.stream().anyMatch(this::tallaEnAlerta)) {
            return "bajo";
        }

        return "disponible";
    }

    private MovimientoInventarioDto mapearMovimientoDetallado(MovimientoInventario movimiento) {
        Producto producto = movimiento.getProducto();
        ProductoDisponibleDto productoDto = producto != null ? mapearProductoDisponible(producto) : null;
        Almacen almacen = movimiento.getAlmacen();
        TipoMovimientoInventario tipo = movimiento.getTipoMovimiento();
        Usuario usuario = movimiento.getUsuario();

        String usuarioUsername = Optional.ofNullable(usuario)
                .map(Usuario::getUsername)
                .orElse("sistema");

        String usuarioNombre = Optional.ofNullable(usuario)
                .map(u -> {
                    String nombres = Optional.ofNullable(u.getNombres()).orElse("");
                    String apellidos = Optional.ofNullable(u.getApellidos()).orElse("");
                    String fullName = (nombres + " " + apellidos).trim();
                    return fullName.isEmpty() ? usuarioUsername : fullName;
                })
                .orElse("Usuario");

        String usuarioEtiqueta = usuarioNombre.equals("Usuario") ? usuarioUsername : usuarioNombre;

        return new MovimientoInventarioDto(
                movimiento.getId(),
                producto != null ? producto.getId() : null,
                productoDto != null ? productoDto.codigoBarra() : obtenerCodigoBarraProducto(producto),
                productoDto != null ? productoDto.nombreProducto() : obtenerNombreProducto(producto),
                almacen != null ? almacen.getId() : null,
                almacen != null ? almacen.getNombre() : "Sin almacén",
                tipo != null ? tipo.getNombre() : "Movimiento",
                tipo != null && tipo.isEsEntrada(),
                movimiento.getCantidad(),
                Optional.ofNullable(movimiento.getFechaMovimiento()).orElse(LocalDateTime.now()),
                usuarioEtiqueta,
                usuarioNombre,
                movimiento.getReferenciaDoc(),
                movimiento.getObservaciones());
    }

    private String obtenerNombreProducto(Producto producto) {
        return Optional.ofNullable(producto)
                .map(Producto::getNombre)
                .orElse("Producto");
    }

    private String obtenerCodigoBarraProducto(Producto producto) {
        return Optional.ofNullable(producto)
                .map(Producto::getCodigoBarra)
                .orElse(null);
    }

    private String obtenerCategoriaProducto(Producto producto) {
        return Optional.ofNullable(producto)
                .map(Producto::getCategoria)
                .map(CategoriaProducto::getNombre)
                .orElse("Sin categoría");
    }

    private String obtenerMarcaProducto(Producto producto) {
        return Optional.ofNullable(producto)
                .map(Producto::getProveedor)
                .map(proveedor -> {
                    if (proveedor.getNombreComercial() != null && !proveedor.getNombreComercial().isBlank()) {
                        return proveedor.getNombreComercial();
                    }
                    if (proveedor.getRazonSocial() != null && !proveedor.getRazonSocial().isBlank()) {
                        return proveedor.getRazonSocial();
                    }
                    return null;
                })
                .orElse("-");
    }

    private String obtenerTallaProducto(Producto producto) {
        return Optional.ofNullable(producto)
                .map(Producto::getTallas)
                .stream()
                .flatMap(Set::stream)
                .map(ProductoTalla::getTalla)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("-");
    }

    private String obtenerColorProducto(Producto producto) {
        return Optional.ofNullable(producto)
                .map(Producto::getColor)
                .filter(color -> !color.isBlank())
                .orElse("-");
    }

    private boolean esMovimientoRegistroInicial(MovimientoInventario movimiento) {
        return Optional.ofNullable(movimiento.getTipoMovimiento())
                .map(TipoMovimientoInventario::getNombre)
                .map(nombre -> nombre.equalsIgnoreCase(TIPO_REGISTRO_INICIAL))
                .orElse(false);
    }

    public static class AjusteMasivoItem {
        private final Long idInventario;
        private final Long idProducto;
        private final Long tipoMovimientoId;
        private final Integer cantidad;
        private final Integer stockMinimo;
        private final String talla;
        private final String referencia;
        private final String observaciones;

        public AjusteMasivoItem(Long idInventario, Long idProducto, Long tipoMovimientoId,
                Integer cantidad, Integer stockMinimo, String talla,
                String referencia, String observaciones) {
            this.idInventario = idInventario;
            this.idProducto = idProducto;
            this.tipoMovimientoId = tipoMovimientoId;
            this.cantidad = cantidad;
            this.stockMinimo = stockMinimo;
            this.talla = talla;
            this.referencia = referencia;
            this.observaciones = observaciones;
        }

        public Long getIdInventario() {
            return idInventario;
        }

        public Long getIdProducto() {
            return idProducto;
        }

        public Long getTipoMovimientoId() {
            return tipoMovimientoId;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public Integer getStockMinimo() {
            return stockMinimo;
        }

        public String getTalla() {
            return talla;
        }

        public String getReferencia() {
            return referencia;
        }

        public String getObservaciones() {
            return observaciones;
        }
    }

    public static class AjusteMasivoResultado {
        private final int movimientosRegistrados;
        private final int stockMinimosActualizados;
        private final int ajustesProcesados;
        private final List<MovimientoInventarioDto> movimientos;

        public AjusteMasivoResultado(int movimientosRegistrados, int stockMinimosActualizados,
                int ajustesProcesados, List<MovimientoInventarioDto> movimientos) {
            this.movimientosRegistrados = movimientosRegistrados;
            this.stockMinimosActualizados = stockMinimosActualizados;
            this.ajustesProcesados = ajustesProcesados;
            this.movimientos = movimientos != null ? List.copyOf(movimientos) : List.of();
        }

        public int getMovimientosRegistrados() {
            return movimientosRegistrados;
        }

        public int getStockMinimosActualizados() {
            return stockMinimosActualizados;
        }

        public int getAjustesProcesados() {
            return ajustesProcesados;
        }

        public List<MovimientoInventarioDto> getMovimientos() {
            return movimientos;
        }
    }

    /**
     * Clase interna para estadísticas
     */
    public static class InventarioStats {
        private final Long totalProductos;
        private final Long totalStock;
        private final Long productosStockBajo;
        private final Long totalAlmacenes;

        public InventarioStats(Long totalProductos, Long totalStock, Long productosStockBajo, Long totalAlmacenes) {
            this.totalProductos = totalProductos;
            this.totalStock = totalStock;
            this.productosStockBajo = productosStockBajo;
            this.totalAlmacenes = totalAlmacenes;
        }

        public Long getTotalProductos() {
            return totalProductos;
        }

        public Long getTotalStock() {
            return totalStock;
        }

        public Long getProductosStockBajo() {
            return productosStockBajo;
        }

        public Long getTotalAlmacenes() {
            return totalAlmacenes;
        }
    }

    public record ProductoDisponibleDto(
            Long id,
            @JsonProperty("nombre_producto") String nombreProducto,
            @JsonProperty("codigo_barra") String codigoBarra,
            String categoria,
            String marca,
            String talla,
            String color,
            String descripcion,
            @JsonProperty("precio_venta") BigDecimal precioVenta) {
    }

    public record InventarioDetalleDto(
            @JsonProperty("id_inventario") Long idInventario,
            @JsonProperty("id_producto") Long idProducto,
            @JsonProperty("codigo_barra") String codigoBarra,
            @JsonProperty("nombre_producto") String nombreProducto,
            String categoria,
            @JsonProperty("id_almacen") Long idAlmacen,
            @JsonProperty("nombre_almacen") String nombreAlmacen,
            @JsonProperty("cantidad_stock") Integer cantidadStock,
            @JsonProperty("stock_minimo") Integer stockMinimo,
            String talla,
            String color,
            String marca,
            @JsonProperty("tiene_tallas") boolean tieneTallas,
            @JsonProperty("fecha_ultima_actualizacion") LocalDateTime fechaUltimaActualizacion,
            @JsonProperty("estado_stock") String estadoStock,
            @JsonProperty("tallas_en_alerta") Integer tallasEnAlerta,
            @JsonProperty("tallas_totales") Integer tallasTotales,
            @JsonProperty("tallas_agotadas") Integer tallasAgotadas) {
    }

    public record MovimientoInventarioDto(
            @JsonProperty("id_movimiento") Long idMovimiento,
            @JsonProperty("id_producto") Long idProducto,
            @JsonProperty("codigo_barra") String codigoBarra,
            @JsonProperty("nombre_producto") String nombreProducto,
            @JsonProperty("id_almacen") Long idAlmacen,
            @JsonProperty("nombre_almacen") String nombreAlmacen,
            @JsonProperty("tipo_movimiento") String tipoMovimiento,
            @JsonProperty("esEntrada") boolean esEntrada,
            Integer cantidad,
            @JsonProperty("fecha_movimiento") LocalDateTime fechaMovimiento,
            String usuario,
            @JsonProperty("usuario_nombre") String usuarioNombre,
            @JsonProperty("referencia_doc") String referenciaDoc,
            String observaciones) {
    }

    public record AlmacenDto(Long id, String nombre, String ubicacion) {
    }

    public record TipoMovimientoDto(Long id, String nombre, @JsonProperty("esEntrada") boolean esEntrada) {
    }

    // === MÉTODOS PARA GESTIÓN DE INVENTARIO POR TALLAS ===

    /**
     * Registra un producto en el inventario con tallas específicas
     */
    public Inventario registrarProductoConTallas(Long productoId, Long almacenId, Integer stockMinimo,
            List<TallaStockDto> tallasStock, String referencia, String observaciones, Integer usuarioId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Almacen almacen = almacenRepository.findById(almacenId)
                .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar que no exista ya en este almacén
        Optional<Inventario> existente = inventarioRepository.findByProductoAndAlmacen(producto, almacen);
        if (existente.isPresent()) {
            throw new RuntimeException("El producto ya está registrado en este almacén");
        }

        // Calcular stock total inicial
        int stockTotalInicial = tallasStock.stream()
                .mapToInt(TallaStockDto::cantidadInicial)
                .sum();

        // Crear registro de inventario principal
        Inventario inventario = new Inventario(producto, almacen, stockTotalInicial, stockMinimo);
        inventario = inventarioRepository.save(inventario);

        // Registrar tallas
        for (TallaStockDto tallaStock : tallasStock) {
            InventarioTalla inventarioTalla = new InventarioTalla(
                    inventario,
                    tallaStock.talla(),
                    tallaStock.cantidadInicial(),
                    tallaStock.stockMinimo());
            inventarioTallaRepository.save(inventarioTalla);

            // Registrar movimiento inicial si hay stock
            if (tallaStock.cantidadInicial() > 0) {
                TipoMovimientoInventario tipoMovimiento = ensureTipoMovimiento(TIPO_REGISTRO_INICIAL, true);

                MovimientoInventario movimiento = new MovimientoInventario(
                        producto, almacen, tipoMovimiento, tallaStock.cantidadInicial(),
                        usuario, observaciones, referencia, tallaStock.talla());
                movimientoRepository.save(movimiento);
            }
        }

        return inventario;
    }

    /**
     * Ajusta el stock de una talla específica
     */
    public void ajustarStockTalla(Long inventarioId, String talla, Long tipoMovimientoId, Integer cantidad,
            String referencia, String observaciones, Integer usuarioId) {
        ajustarStockTalla(inventarioId, talla, tipoMovimientoId, cantidad, null, referencia, observaciones, usuarioId);
    }

    public void ajustarStockTalla(Long inventarioId, String talla, Long tipoMovimientoId, Integer cantidad,
            Integer stockMinimo, String referencia, String observaciones, Integer usuarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        TipoMovimientoInventario tipoMovimiento = tipoMovimientoRepository.findById(tipoMovimientoId)
                .orElseThrow(() -> new RuntimeException("Tipo de movimiento no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscar o crear registro de talla
        Optional<InventarioTalla> inventarioTallaOpt = inventarioTallaRepository
                .findByInventarioAndTalla(inventario, talla);

        InventarioTalla inventarioTalla;
        if (inventarioTallaOpt.isPresent()) {
            inventarioTalla = inventarioTallaOpt.get();
        } else {
            // Crear registro de talla si no existe
            int stockMinimoNormalizado = stockMinimo != null ? Math.max(0, stockMinimo) : 0;
            inventarioTalla = new InventarioTalla(inventario, talla, 0, stockMinimoNormalizado);
            inventarioTalla = inventarioTallaRepository.save(inventarioTalla);
        }

        // Calcular nueva cantidad para la talla
        int cantidadAjuste = tipoMovimiento.isEsEntrada() ? cantidad : -cantidad;
        int nuevaCantidadTalla = Math.max(0, inventarioTalla.getCantidadStock() + cantidadAjuste);

        // Actualizar stock de la talla
        inventarioTalla.setCantidadStock(nuevaCantidadTalla);
        if (stockMinimo != null) {
            inventarioTalla.setStockMinimo(Math.max(0, stockMinimo));
        }
        inventarioTallaRepository.save(inventarioTalla);

        // Actualizar stock total del inventario
        actualizarStockTotalInventario(inventario);

        // Registrar movimiento
        MovimientoInventario movimiento = new MovimientoInventario(
                inventario.getProducto(), inventario.getAlmacen(), tipoMovimiento, cantidad,
                usuario, observaciones, referencia, talla);
        movimientoRepository.save(movimiento);
    }

    public void actualizarStockMinimoTalla(Long inventarioId, String talla, Integer stockMinimo, Integer usuarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        if (usuarioId != null) {
            usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        }

        String tallaLimpia = Optional.ofNullable(talla)
                .map(String::trim)
                .filter(valor -> !valor.isEmpty())
                .orElseThrow(() -> new RuntimeException("La talla es requerida"));

        String tallaClave = tallaLimpia;
        Optional<InventarioTalla> inventarioTallaOpt = inventarioTallaRepository.findByInventarioAndTalla(inventario,
                tallaClave);

        if (inventarioTallaOpt.isEmpty()) {
            String tallaNormalizada = normalizarNombreTalla(tallaClave);
            if (tallaNormalizada != null && !tallaNormalizada.equals(tallaClave)) {
                inventarioTallaOpt = inventarioTallaRepository.findByInventarioAndTalla(inventario, tallaNormalizada);
                if (inventarioTallaOpt.isPresent()) {
                    tallaClave = tallaNormalizada;
                }
            }
        }

        final String tallaClaveFinal = tallaClave;
        InventarioTalla inventarioTalla = inventarioTallaOpt.orElseGet(() -> inventarioTallaRepository.save(
                new InventarioTalla(inventario, tallaClaveFinal, 0, 0)));

        int stockMinimoNormalizado = stockMinimo != null ? Math.max(0, stockMinimo) : 0;
        inventarioTalla.setStockMinimo(stockMinimoNormalizado);
        inventarioTallaRepository.save(inventarioTalla);
    }

    /**
     * Obtiene las tallas disponibles para un inventario
     */
    public List<InventarioTalla> obtenerTallasPorInventario(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        return inventarioTallaRepository.findByInventario(inventario);
    }

    /**
     * Obtiene detalles completos del inventario incluyendo tallas
     */
    public InventarioConTallasDto obtenerInventarioConTallas(Long inventarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        Map<String, InventarioTalla> tallasInventario = new LinkedHashMap<>();
        List<InventarioTalla> tallasInventarioSinNombre = new ArrayList<>();
        for (InventarioTalla inventarioTalla : inventarioTallaRepository.findByInventario(inventario)) {
            String clave = normalizarNombreTalla(inventarioTalla.getTalla());
            if (clave == null) {
                tallasInventarioSinNombre.add(inventarioTalla);
                continue;
            }
            tallasInventario.putIfAbsent(clave, inventarioTalla);
        }

        Producto producto = inventario.getProducto();
        Long productoId = producto != null ? producto.getId() : null;
        Map<String, ProductoTalla> tallasCatalogo = new LinkedHashMap<>();
        if (productoId != null) {
            for (ProductoTalla productoTalla : productoTallaRepository.findByProductoIdOrderByNombre(productoId)) {
                String clave = normalizarNombreTalla(productoTalla.getTalla());
                if (clave != null && !tallasCatalogo.containsKey(clave)) {
                    tallasCatalogo.put(clave, productoTalla);
                }
            }
        }

        List<TallaStockDetalleDto> tallasDetalle = new ArrayList<>();

        // Primero, recorrer todas las tallas conocidas del catálogo del producto
        for (Map.Entry<String, ProductoTalla> entry : tallasCatalogo.entrySet()) {
            String clave = entry.getKey();
            ProductoTalla productoTalla = entry.getValue();
            InventarioTalla inventarioTalla = tallasInventario.remove(clave);

            if (inventarioTalla != null) {
                tallasDetalle.add(crearDetalleDesdeInventario(inventarioTalla));
            } else {
                tallasDetalle.add(crearDetalleSinMovimientos(productoTalla.getTalla()));
            }
        }

        // Incluir cualquier talla que exista en el inventario pero no en el catálogo
        for (InventarioTalla restante : tallasInventario.values()) {
            tallasDetalle.add(crearDetalleDesdeInventario(restante));
        }

        // Incluir tallas sin nombre normalizado para no perder información
        for (InventarioTalla restanteSinNombre : tallasInventarioSinNombre) {
            tallasDetalle.add(crearDetalleDesdeInventario(restanteSinNombre));
        }

        tallasDetalle.sort(Comparator.comparing(dto -> Optional.ofNullable(dto.talla()).orElse(""),
                String.CASE_INSENSITIVE_ORDER));

        return new InventarioConTallasDto(
                inventario.getId(),
                inventario.getProducto().getId(),
                inventario.getProducto().getNombre(),
                inventario.getAlmacen().getId(),
                inventario.getAlmacen().getNombre(),
                inventario.getCantidadStock(),
                inventario.getStockMinimo(),
                tallasDetalle);
    }

    private static TallaStockDetalleDto crearDetalleDesdeInventario(InventarioTalla inventarioTalla) {
        return new TallaStockDetalleDto(
                inventarioTalla.getTalla(),
                Optional.ofNullable(inventarioTalla.getCantidadStock()).orElse(0),
                Optional.ofNullable(inventarioTalla.getStockMinimo()).orElse(0),
                inventarioTalla.getFechaUltimaActualizacion(),
                inventarioTalla.isStockBajo(),
                inventarioTalla.isAgotado());
    }

    private static TallaStockDetalleDto crearDetalleSinMovimientos(String talla) {
        return new TallaStockDetalleDto(
                talla,
                0,
                0,
                null,
                true,
                true);
    }

    private static String normalizarNombreTalla(String talla) {
        return Optional.ofNullable(talla)
                .map(String::trim)
                .filter(nombre -> !nombre.isEmpty())
                .map(String::toUpperCase)
                .orElse(null);
    }

    /**
     * Transfiere stock entre almacenes para una talla específica
     */
    public void transferirStockTalla(Long inventarioOrigenId, String talla, Long almacenDestinoId,
            Integer cantidad, String referencia, String observaciones, Integer usuarioId) {
        Inventario inventarioOrigen = inventarioRepository.findById(inventarioOrigenId)
                .orElseThrow(() -> new RuntimeException("Inventario origen no encontrado"));

        Almacen almacenDestino = almacenRepository.findById(almacenDestinoId)
                .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscar talla en origen
        InventarioTalla tallaOrigen = inventarioTallaRepository
                .findByInventarioAndTalla(inventarioOrigen, talla)
                .orElseThrow(() -> new RuntimeException("Talla no encontrada en inventario origen"));

        // Verificar stock suficiente
        if (tallaOrigen.getCantidadStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente para la talla " + talla + " en el almacén origen");
        }

        // Buscar o crear inventario en destino
        Optional<Inventario> inventarioDestinoOpt = inventarioRepository
                .findByProductoAndAlmacen(inventarioOrigen.getProducto(), almacenDestino);

        Inventario inventarioDestino;
        if (inventarioDestinoOpt.isPresent()) {
            inventarioDestino = inventarioDestinoOpt.get();
        } else {
            // Crear registro en destino
            inventarioDestino = new Inventario(
                    inventarioOrigen.getProducto(),
                    almacenDestino,
                    0,
                    inventarioOrigen.getStockMinimo());
            inventarioDestino = inventarioRepository.save(inventarioDestino);
        }

        // Buscar o crear talla en destino
        Optional<InventarioTalla> tallaDestinoOpt = inventarioTallaRepository
                .findByInventarioAndTalla(inventarioDestino, talla);

        InventarioTalla tallaDestino;
        if (tallaDestinoOpt.isPresent()) {
            tallaDestino = tallaDestinoOpt.get();
        } else {
            tallaDestino = new InventarioTalla(inventarioDestino, talla, 0, tallaOrigen.getStockMinimo());
            tallaDestino = inventarioTallaRepository.save(tallaDestino);
        }

        // Obtener tipos de movimiento
        TipoMovimientoInventario tipoSalida = ensureTipoMovimiento(TIPO_SALIDA_TRANSFERENCIA, false);
        TipoMovimientoInventario tipoEntrada = ensureTipoMovimiento(TIPO_ENTRADA_TRANSFERENCIA, true);

        // Actualizar stocks
        tallaOrigen.setCantidadStock(tallaOrigen.getCantidadStock() - cantidad);
        tallaDestino.setCantidadStock(tallaDestino.getCantidadStock() + cantidad);

        inventarioTallaRepository.save(tallaOrigen);
        inventarioTallaRepository.save(tallaDestino);

        // Actualizar stocks totales
        actualizarStockTotalInventario(inventarioOrigen);
        actualizarStockTotalInventario(inventarioDestino);

        // Registrar movimientos
        MovimientoInventario movimientoSalida = new MovimientoInventario(
                inventarioOrigen.getProducto(), inventarioOrigen.getAlmacen(), tipoSalida,
                cantidad, usuario, observaciones, referencia, talla);
        movimientoRepository.save(movimientoSalida);

        MovimientoInventario movimientoEntrada = new MovimientoInventario(
                inventarioDestino.getProducto(), inventarioDestino.getAlmacen(), tipoEntrada,
                cantidad, usuario, observaciones, referencia, talla);
        movimientoRepository.save(movimientoEntrada);
    }

    /**
     * Agrega tallas a un inventario existente
     */
    public void agregarTallasAInventario(Long inventarioId, List<TallaStockDto> tallasStock,
            String referencia, String observaciones, Integer usuarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        for (TallaStockDto tallaStock : tallasStock) {
            // Verificar que la talla no exista ya en este inventario
            Optional<InventarioTalla> existente = inventarioTallaRepository
                    .findByInventarioAndTalla(inventario, tallaStock.talla());

            if (existente.isPresent()) {
                throw new RuntimeException("La talla " + tallaStock.talla() + " ya existe en este inventario");
            }

            // Crear registro de talla
            InventarioTalla inventarioTalla = new InventarioTalla(
                    inventario,
                    tallaStock.talla(),
                    tallaStock.cantidadInicial(),
                    tallaStock.stockMinimo());
            inventarioTallaRepository.save(inventarioTalla);

            // Registrar movimiento inicial si hay stock
            if (tallaStock.cantidadInicial() > 0) {
                TipoMovimientoInventario tipoMovimiento = ensureTipoMovimiento(TIPO_REGISTRO_INICIAL, true);

                MovimientoInventario movimiento = new MovimientoInventario(
                        inventario.getProducto(), inventario.getAlmacen(), tipoMovimiento,
                        tallaStock.cantidadInicial(), usuario, observaciones, referencia, tallaStock.talla());
                movimientoRepository.save(movimiento);
            }
        }

        // Actualizar stock total del inventario
        actualizarStockTotalInventario(inventario);
    }

    /**
     * Actualiza el stock total de un inventario basado en las tallas
     */
    private void actualizarStockTotalInventario(Inventario inventario) {
        List<InventarioTalla> tallas = inventarioTallaRepository.findByInventario(inventario);
        int stockTotal = tallas.stream()
                .mapToInt(InventarioTalla::getCantidadStock)
                .sum();

        inventario.setCantidadStock(stockTotal);
        inventarioRepository.save(inventario);
    }

    // === RECORDS PARA DTOs DE TALLAS ===

    public record TallaStockDto(String talla, Integer cantidadInicial, Integer stockMinimo) {
    }

    public record TallaStockDetalleDto(
            String talla,
            Integer cantidadStock,
            Integer stockMinimo,
            LocalDateTime fechaUltimaActualizacion,
            boolean stockBajo,
            boolean agotado) {
    }

    public record InventarioConTallasDto(
            Long idInventario,
            Long idProducto,
            String nombreProducto,
            Long idAlmacen,
            String nombreAlmacen,
            Integer stockTotal,
            Integer stockMinimoTotal,
            List<TallaStockDetalleDto> tallas) {
    }
}