package fisi.software.detalles.controller;

import fisi.software.detalles.controller.dto.CompraRequestDTO;
import fisi.software.detalles.controller.dto.CompraResponseDTO;
import fisi.software.detalles.controller.dto.RecepcionCompraRequest;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.Proveedor;
import fisi.software.detalles.repository.ProductoRepository;
import fisi.software.detalles.repository.TipoPagoRepository;
import fisi.software.detalles.service.CompraService;
import fisi.software.detalles.service.ProveedorService;
import fisi.software.detalles.exception.RecepcionInvalidaException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador para la gestión de compras y proveedores
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/compras")
@RequiredArgsConstructor
public class ComprasController {

    private final CompraService compraService;
    private final ProveedorService proveedorService;
    private final ProductoRepository productoRepository;
    private final TipoPagoRepository tipoPagoRepository;

    /**
     * Muestra la página de gestión de compras
     * 
     * @return Vista de compras
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS)")
    public String showCompras() {
        return "software/compras/compras";
    }

    /**
     * Listar todas las compras
     * GET /compras/api
     */
    @GetMapping("/api")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS)")
    @ResponseBody
    public ResponseEntity<List<CompraResponseDTO>> listarCompras() {
        try {
            List<CompraResponseDTO> compras = compraService.listarCompras();
            return ResponseEntity.ok(compras);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener compra por ID
     * GET /compras/api/{id}
     */
    @GetMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> obtenerCompraPorId(@PathVariable Long id) {
        try {
            CompraResponseDTO compra = compraService.obtenerCompraPorId(id);
            return ResponseEntity.ok(compra);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener la compra");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Registrar nueva compra
     * POST /compras/api
     */
    @PostMapping("/api")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> registrarCompra(@RequestBody CompraRequestDTO request) {
        try {
            // TODO: Obtener ID del usuario autenticado desde el contexto de seguridad
            // Por ahora usaremos un valor por defecto
            Integer idUsuario = 4; // Ajustar según tu lógica de autenticación

            CompraResponseDTO compra = compraService.crearCompra(request, idUsuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(compra);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear la compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Registrar una recepción (parcial o total) para una compra existente
     * POST /compras/api/{id}/recepciones
     */
    @PostMapping("/api/{id}/recepciones")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> registrarRecepcion(@PathVariable Long id, @RequestBody RecepcionCompraRequest request) {
        try {
            CompraResponseDTO compra = compraService.registrarRecepcion(id, request);
            return ResponseEntity.ok(compra);
        } catch (RecepcionInvalidaException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al registrar la recepción de la compra");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Actualizar estado de compra
     * PUT /compras/api/{id}/estado
     */
    @PutMapping("/api/{id}/estado")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> actualizarEstadoCompra(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estado");
            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El estado es requerido");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            CompraResponseDTO compra = compraService.actualizarEstadoCompra(id, nuevoEstado);
            return ResponseEntity.ok(compra);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el estado de la compra");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Anular compra
     * DELETE /compras/api/{id}
     */
    @DeleteMapping("/api/{id}")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> anularCompra(@PathVariable Long id) {
        try {
            compraService.anularCompra(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Compra anulada exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al anular la compra");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Listar proveedores activos
     * GET /compras/api/proveedores
     */
    @GetMapping("/api/proveedores")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS)")
    @ResponseBody
    public ResponseEntity<List<Proveedor>> listarProveedores() {
        try {
            List<Proveedor> proveedores = proveedorService.getAllProveedores();
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Listar productos de un proveedor específico
     * GET /compras/api/productos/proveedor/{idProveedor}
     */
    @GetMapping("/api/productos/proveedor/{idProveedor}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> listarProductosPorProveedor(@PathVariable Integer idProveedor) {
        try {
            List<Producto> productos = productoRepository.findAll().stream()
                    .filter(p -> p.getProveedor() != null &&
                            p.getProveedor().getIdProveedor().equals(idProveedor) &&
                            p.getEstado())
                    .collect(Collectors.toList());

            // Convertir a DTO simplificado para el frontend
            List<Map<String, Object>> productosDTO = productos.stream()
                    .map(p -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", p.getId());
                        dto.put("nombre", p.getNombre());
                        dto.put("costoCompra", p.getCostoCompra());
                        dto.put("precioVenta", p.getPrecioVenta());
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(productosDTO);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener productos del proveedor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtener tallas de un producto
     * GET /compras/api/productos/{id}/tallas
     */
    @GetMapping("/api/productos/{id}/tallas")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> obtenerTallasProducto(@PathVariable Long id) {
        try {
            Producto producto = productoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            // Verificar si el producto tiene tallas
            List<Map<String, Object>> tallas = producto.getTallas().stream()
                    .map(pt -> {
                        Map<String, Object> tallaMap = new HashMap<>();
                        tallaMap.put("talla", pt.getTalla());
                        tallaMap.put("costoCompra", pt.getCostoCompra());
                        return tallaMap;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("tieneTallas", !tallas.isEmpty());
            response.put("tallas", tallas);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener tallas del producto");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtener tipos de pago
     * GET /compras/api/tipospago
     */
    @GetMapping("/api/tipospago")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS)")
    @ResponseBody
    public ResponseEntity<?> obtenerTiposPago() {
        try {
            List<Map<String, Object>> tiposPago = tipoPagoRepository.findAll().stream()
                    .map(tp -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", tp.getIdTipoPago());
                        map.put("nombre", tp.getTipoPago());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(tiposPago);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener tipos de pago");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
