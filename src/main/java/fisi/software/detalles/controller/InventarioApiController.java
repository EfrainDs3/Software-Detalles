package fisi.software.detalles.controller;

import fisi.software.detalles.service.InventarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(required = false) String observaciones) {

        try {
            InventarioService.MovimientoInventarioDto movimiento = inventarioService.aplicarAjusteStockDetallado(
                id, tipoMovimientoId, cantidad, referencia, observaciones
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
}