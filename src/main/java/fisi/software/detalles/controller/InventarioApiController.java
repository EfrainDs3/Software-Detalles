package fisi.software.detalles.controller;

import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la API de inventario
 */
@RestController
@RequestMapping("/inventario/api")
public class InventarioApiController {

    @Autowired
    private InventarioService inventarioService;

    /**
     * GET /inventario/api - Listar inventario completo
     */
    @GetMapping
    public ResponseEntity<List<InventarioService.InventarioDetalleDto>> listarInventario(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long almacenId,
            @RequestParam(required = false) String categoria) {
        List<InventarioService.InventarioDetalleDto> inventario = inventarioService.obtenerInventarioDetallado();
        return ResponseEntity.ok(inventario);
    }

    /**
     * GET /inventario/api/{id} - Obtener detalles de producto en inventario
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerInventario(@PathVariable Long id) {
        // TODO: Implementar búsqueda por ID
        return ResponseEntity.notFound().build();
    }

    /**
     * PUT /inventario/api/{id}/ajuste - Ajustar stock
     */
    @PutMapping("/{id}/ajuste")
    public ResponseEntity<?> ajustarStock(
            @PathVariable Long id,
            @RequestParam Long tipoMovimientoId,
            @RequestParam Integer cantidad,
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones,
            Authentication authentication) {

        try {
            // Obtener ID del usuario autenticado
            Integer usuarioId = obtenerIdUsuario(authentication);
            
            InventarioService.MovimientoInventarioDto movimiento = inventarioService.aplicarAjusteStockDetallado(
                id, tipoMovimientoId, cantidad, referencia, observaciones, usuarioId
            );
            return ResponseEntity.ok(movimiento);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /inventario/api/bajo-stock - Productos con bajo stock
     */
    @GetMapping("/bajo-stock")
    public ResponseEntity<List<InventarioService.InventarioDetalleDto>> obtenerProductosBajoStock() {
        List<InventarioService.InventarioDetalleDto> productosBajoStock = inventarioService.obtenerProductosStockBajoDetallado();
        return ResponseEntity.ok(productosBajoStock);
    }

    /**
     * GET /inventario/api/movimientos - Movimientos de inventario
     */
    @GetMapping("/movimientos")
    public ResponseEntity<List<InventarioService.MovimientoInventarioDto>> obtenerMovimientos() {
        List<InventarioService.MovimientoInventarioDto> movimientos = inventarioService.obtenerMovimientosInventarioDetallado();
        return ResponseEntity.ok(movimientos);
    }

    /**
     * POST /inventario/api/transferencia - Transferir entre almacenes
     */
    @PostMapping("/transferencia")
    public ResponseEntity<Map<String, String>> transferirStock(
            @RequestParam Long inventarioOrigenId,
            @RequestParam Long almacenDestinoId,
            @RequestParam Integer cantidad,
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones) {

        try {
            inventarioService.transferirStock(inventarioOrigenId, almacenDestinoId, cantidad, referencia, observaciones);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Transferencia realizada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /inventario/api/kardex/{id} - Kardex de producto
     */
    @GetMapping("/kardex/{productoId}")
    public ResponseEntity<List<InventarioService.MovimientoInventarioDto>> obtenerKardex(@PathVariable Long productoId) {
        List<InventarioService.MovimientoInventarioDto> kardex = inventarioService.obtenerKardexProductoDetallado(productoId);
        return ResponseEntity.ok(kardex);
    }

    /**
     * POST /inventario/api/registrar - Registrar producto en almacén
     */
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarProducto(
            @RequestParam Long productoId,
            @RequestParam Long almacenId,
            @RequestParam Integer stockMinimo,
            @RequestParam Integer cantidadInicial,
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones) {

        try {
            InventarioService.InventarioDetalleDto inventario = inventarioService.registrarProductoEnAlmacenDetallado(
                productoId, almacenId, stockMinimo, cantidadInicial, referencia, observaciones
            );
            return ResponseEntity.ok(inventario);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /inventario/api/estadisticas - Estadísticas del inventario
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> stats = inventarioService.obtenerEstadisticasInventario();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /inventario/api/productos - Listar productos disponibles para registrar en inventario
     */
    @GetMapping("/productos")
    public ResponseEntity<List<InventarioService.ProductoDisponibleDto>> obtenerProductosDisponibles() {
        List<InventarioService.ProductoDisponibleDto> productos = inventarioService.obtenerProductosDisponibles();
        return ResponseEntity.ok(productos);
    }

    /**
     * GET /inventario/api/almacenes - Listar almacenes disponibles
     */
    @GetMapping("/almacenes")
    public ResponseEntity<List<InventarioService.AlmacenDto>> obtenerAlmacenes() {
        List<InventarioService.AlmacenDto> almacenes = inventarioService.obtenerAlmacenesDto();
        return ResponseEntity.ok(almacenes);
    }

    /**
     * GET /inventario/api/tipos-movimiento - Listar tipos de movimiento disponibles
     */
    @GetMapping("/tipos-movimiento")
    public ResponseEntity<List<InventarioService.TipoMovimientoDto>> obtenerTiposMovimiento() {
        List<InventarioService.TipoMovimientoDto> tiposMovimiento = inventarioService.obtenerTiposMovimientoDto();
        return ResponseEntity.ok(tiposMovimiento);
    }

    // === ENDPOINTS PARA GESTIÓN DE INVENTARIO POR TALLAS ===

    /**
     * GET /inventario/api/{id}/tallas - Obtener tallas de un inventario
     */
    @GetMapping("/{id}/tallas")
    public ResponseEntity<InventarioService.InventarioConTallasDto> obtenerInventarioConTallas(@PathVariable Long id) {
        try {
            InventarioService.InventarioConTallasDto inventarioConTallas = inventarioService.obtenerInventarioConTallas(id);
            return ResponseEntity.ok(inventarioConTallas);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /inventario/api/registrar-con-tallas - Registrar producto con tallas
     */
    @PostMapping("/registrar-con-tallas")
    public ResponseEntity<?> registrarProductoConTallas(
            @RequestParam Long productoId,
            @RequestParam Long almacenId,
            @RequestParam Integer stockMinimo,
            @RequestParam String tallasJson, // JSON array de tallas
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones) {

        try {
            // Parsear JSON de tallas
            List<InventarioService.TallaStockDto> tallasStock = parseTallasJson(tallasJson);

            InventarioService.InventarioDetalleDto inventario = inventarioService.registrarProductoEnAlmacenDetallado(
                productoId, almacenId, stockMinimo, 0, referencia, observaciones
            );

            // Registrar tallas
            inventarioService.registrarProductoConTallas(
                productoId, almacenId, stockMinimo, tallasStock, referencia, observaciones, 1
            );

            return ResponseEntity.ok(inventario);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PUT /inventario/api/{id}/talla/ajuste - Ajustar stock de una talla específica
     */
    @PutMapping("/{id}/talla/ajuste")
    public ResponseEntity<?> ajustarStockTalla(
            @PathVariable Long id,
            @RequestParam String talla,
            @RequestParam Long tipoMovimientoId,
            @RequestParam Integer cantidad,
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones,
            Authentication authentication) {

        try {
            // Obtener ID del usuario autenticado
            Integer usuarioId = obtenerIdUsuario(authentication);
            
            inventarioService.ajustarStockTalla(id, talla, tipoMovimientoId, cantidad, referencia, observaciones, usuarioId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Ajuste de stock aplicado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * POST /inventario/api/transferencia-talla - Transferir stock de una talla específica
     */
    @PostMapping("/transferencia-talla")
    public ResponseEntity<Map<String, String>> transferirStockTalla(
            @RequestParam Long inventarioOrigenId,
            @RequestParam String talla,
            @RequestParam Long almacenDestinoId,
            @RequestParam Integer cantidad,
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones) {

        try {
            inventarioService.transferirStockTalla(inventarioOrigenId, talla, almacenDestinoId, cantidad, referencia, observaciones, 1);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Transferencia realizada correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /inventario/api/producto/{productoId}/tallas - Obtener tallas disponibles de un producto
     */
    @GetMapping("/producto/{productoId}/tallas")
    public ResponseEntity<List<String>> obtenerTallasProducto(@PathVariable Long productoId) {
        try {
            // Obtener tallas desde la tabla ProductoTalla
            List<String> tallas = inventarioService.obtenerProductosDisponibles().stream()
                .filter(p -> p.id().equals(productoId))
                .findFirst()
                .map(p -> {
                    // Aquí necesitaríamos acceder a las tallas del producto
                    // Por simplicidad, devolveremos tallas comunes
                    return List.of("XS", "S", "M", "L", "XL", "XXL");
                })
                .orElse(List.of());

            return ResponseEntity.ok(tallas);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /inventario/api/{id}/agregar-tallas - Agregar tallas a un inventario existente
     */
    @PostMapping("/{id}/agregar-tallas")
    public ResponseEntity<?> agregarTallasAInventario(
            @PathVariable Long id,
            @RequestParam String tallasJson,
            @RequestParam(required = false) String referencia,
            @RequestParam(required = false) String observaciones,
            Authentication authentication) {

        try {
            // Parsear JSON de tallas
            List<InventarioService.TallaStockDto> tallasStock = parseTallasJson(tallasJson);

            // Obtener ID del usuario autenticado
            Integer usuarioId = obtenerIdUsuario(authentication);

            inventarioService.agregarTallasAInventario(id, tallasStock, referencia, observaciones, usuarioId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Tallas agregadas correctamente al inventario");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Método auxiliar para parsear JSON de tallas
     */
    private List<InventarioService.TallaStockDto> parseTallasJson(String tallasJson) {
        // Implementación simplificada - en producción usar Jackson ObjectMapper
        try {
            // Parsear JSON manualmente (simplificado)
            // Formato esperado: [{"talla":"M","cantidadInicial":10,"stockMinimo":5},...]
            List<InventarioService.TallaStockDto> tallas = new java.util.ArrayList<>();

            // Limpieza básica del JSON
            String cleanJson = tallasJson.trim();
            if (cleanJson.startsWith("[") && cleanJson.endsWith("]")) {
                cleanJson = cleanJson.substring(1, cleanJson.length() - 1);
                if (!cleanJson.trim().isEmpty()) {
                    String[] items = cleanJson.split("\\},\\s*\\{");
                    for (String item : items) {
                        item = item.replaceAll("[\\{\\}]", "");
                        String[] pairs = item.split(",");
                        String talla = null;
                        Integer cantidadInicial = 0;
                        Integer stockMinimo = 0;

                        for (String pair : pairs) {
                            String[] keyValue = pair.split(":");
                            if (keyValue.length == 2) {
                                String key = keyValue[0].replaceAll("\"", "").trim();
                                String value = keyValue[1].replaceAll("\"", "").trim();

                                switch (key) {
                                    case "talla":
                                        talla = value;
                                        break;
                                    case "cantidadInicial":
                                        cantidadInicial = Integer.parseInt(value);
                                        break;
                                    case "stockMinimo":
                                        stockMinimo = Integer.parseInt(value);
                                        break;
                                }
                            }
                        }

                        if (talla != null) {
                            tallas.add(new InventarioService.TallaStockDto(talla, cantidadInicial, stockMinimo));
                        }
                    }
                }
            }

            return tallas;
        } catch (Exception e) {
            throw new RuntimeException("Error al parsear JSON de tallas: " + e.getMessage());
        }
    }

    /**
     * Método auxiliar para obtener el ID del usuario autenticado
     */
    private Integer obtenerIdUsuario(Authentication authentication) {
        // Si no hay autenticación, retornar ID por defecto
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            System.out.println("⚠️ MODO DESARROLLO: Usuario no autenticado, usando ID 4");
            return 4; // ⚠️ CAMBIAR cuando implementes login real
        }
        
        try {
            Usuario userDetails = (Usuario) authentication.getPrincipal();
            return userDetails.getId();
        } catch (ClassCastException e) {
            System.out.println("⚠️ Error de casting, usando ID por defecto: 4");
            return 4; // ⚠️ Fallback
        }
    }
}