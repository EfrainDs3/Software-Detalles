package fisi.software.detalles.service;

import fisi.software.detalles.entity.*;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
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
    private final MovimientoInventarioRepository movimientoRepository;
    private final AlmacenRepository almacenRepository;
    private final TipoMovimientoInventarioRepository tipoMovimientoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Registra un producto en el inventario de un almacén
     */
    public Inventario registrarProductoEnInventario(Long productoId, Long almacenId, Integer stockMinimo, Integer cantidadInicial, String referencia, String observaciones, Integer usuarioId) {
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
                producto, almacen, tipoMovimiento, cantidadInicial, usuario, observaciones, referencia
            );
            movimientoRepository.save(movimiento);
        }

        return inventario;
    }

    /**
     * Ajusta el stock de un producto en un almacén
     */
    public void ajustarStock(Long inventarioId, Long tipoMovimientoId, Integer cantidad, String referencia, String observaciones, Integer usuarioId) {
        Inventario inventario = inventarioRepository.findById(inventarioId)
            .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));

        TipoMovimientoInventario tipoMovimiento = tipoMovimientoRepository.findById(tipoMovimientoId)
            .orElseThrow(() -> new RuntimeException("Tipo de movimiento no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Calcular nueva cantidad
        int cantidadAjuste = tipoMovimiento.isEsEntrada() ? cantidad : -cantidad;
        int nuevaCantidad = Math.max(0, inventario.getCantidadStock() + cantidadAjuste);

        // Actualizar inventario
        inventario.setCantidadStock(nuevaCantidad);
        inventarioRepository.save(inventario);

        // Registrar movimiento
        MovimientoInventario movimiento = new MovimientoInventario(
            inventario.getProducto(), inventario.getAlmacen(), tipoMovimiento, cantidad, usuario, observaciones, referencia
        );
        movimientoRepository.save(movimiento);
    }

    /**
     * Transfiere stock entre almacenes
     */
    public void transferirStock(Long inventarioOrigenId, Long almacenDestinoId, Integer cantidad, String referencia, String observaciones, Integer usuarioId) {
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
                inventarioOrigen.getStockMinimo()
            );
            inventarioDestino = inventarioRepository.save(inventarioDestino);
        }

        // Actualizar stocks
        inventarioOrigen.setCantidadStock(inventarioOrigen.getCantidadStock() - cantidad);
        inventarioDestino.setCantidadStock(inventarioDestino.getCantidadStock() + cantidad);

        inventarioRepository.save(inventarioOrigen);
        inventarioRepository.save(inventarioDestino);

        // Registrar movimientos
        MovimientoInventario movimientoSalida = new MovimientoInventario(
            inventarioOrigen.getProducto(), inventarioOrigen.getAlmacen(), tipoSalida, cantidad, usuario, observaciones, referencia
        );
        movimientoRepository.save(movimientoSalida);

        MovimientoInventario movimientoEntrada = new MovimientoInventario(
            inventarioDestino.getProducto(), inventarioDestino.getAlmacen(), tipoEntrada, cantidad, usuario, observaciones, referencia
        );
        movimientoRepository.save(movimientoEntrada);
    }

    /**
     * Obtiene un tipo de movimiento por nombre o lo crea si no existe.
     * De esta forma garantizamos que los flujos críticos siempre tengan los tipos necesarios.
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
            producto.getPrecioVenta()
        );
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
        // Usar usuario por defecto
        Usuario usuario = usuarioRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("No hay usuarios registrados en el sistema"));

        ajustarStock(idInventario, idTipoMovimiento, cantidad, referencia, observaciones, usuario.getId().intValue());

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
        MovimientoInventario movimiento = aplicarAjusteStock(idInventario, idTipoMovimiento, cantidad,
            referencia, observaciones);
        return mapearMovimientoDetallado(movimiento);
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
            new TipoMovimientoDto(entrada.getId(), entrada.getNombre(), entrada.isEsEntrada())
        );
    }

    private InventarioDetalleDto mapearInventarioDetallado(Inventario inventario) {
        Producto producto = inventario.getProducto();
        ProductoDisponibleDto productoDto = producto != null ? mapearProductoDisponible(producto) : null;
        Almacen almacen = inventario.getAlmacen();

        String categoria = productoDto != null ? productoDto.categoria() : obtenerCategoriaProducto(producto);
        String marca = productoDto != null ? productoDto.marca() : obtenerMarcaProducto(producto);
        String talla = productoDto != null ? productoDto.talla() : obtenerTallaProducto(producto);
        String color = productoDto != null ? productoDto.color() : obtenerColorProducto(producto);

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
            Optional.ofNullable(inventario.getFechaUltimaActualizacion()).orElse(LocalDateTime.now())
        );
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
            movimiento.getObservaciones()
        );
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

        public Long getTotalProductos() { return totalProductos; }
        public Long getTotalStock() { return totalStock; }
        public Long getProductosStockBajo() { return productosStockBajo; }
        public Long getTotalAlmacenes() { return totalAlmacenes; }
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
        @JsonProperty("precio_venta") BigDecimal precioVenta
    ) {}

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
        @JsonProperty("fecha_ultima_actualizacion") LocalDateTime fechaUltimaActualizacion
    ) {}

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
        String observaciones
    ) {}

    public record AlmacenDto(Long id, String nombre, String ubicacion) {}

    public record TipoMovimientoDto(Long id, String nombre, @JsonProperty("esEntrada") boolean esEntrada) {}
}