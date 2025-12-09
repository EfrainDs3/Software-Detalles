package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.Carrito;
import fisi.software.detalles.service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CartApiController {

    private final CarritoService carritoService;

    @PostMapping("/agregar")
    public Carrito agregar(
            @RequestParam Integer idUsuario,
            @RequestParam Integer idProducto,
            @RequestParam Integer cantidad) {
        return carritoService.agregarProducto(idUsuario, idProducto, cantidad);
    }

    // Endpoint para el frontend (index-add-to-cart.js)
    @PostMapping("/{userId}/agregar")
    public ResponseEntity<?> agregarConBody(
            @PathVariable Integer userId,
            @RequestBody Map<String, Object> body) {
        try {
            System.out.println("========================================");
            System.out.println("ENDPOINT /agregar LLAMADO");
            System.out.println("User ID: " + userId);
            System.out.println("Body recibido: " + body);

            // Parsear correctamente los valores del JSON
            Integer idProducto = Integer.valueOf(body.get("idProducto").toString());
            Integer cantidad = Integer.valueOf(body.get("cantidad").toString());

            System.out.println("Producto ID parseado: " + idProducto);
            System.out.println("Cantidad parseada: " + cantidad);
            System.out.println("Llamando a carritoService.agregarProducto...");

            Carrito carrito = carritoService.agregarProducto(userId, idProducto, cantidad);

            System.out.println("Producto agregado exitosamente!");
            System.out.println("========================================");

            return ResponseEntity.ok(carrito);
        } catch (Exception e) {
            System.err.println("ERROR EN ENDPOINT /agregar:");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/ver")
    public Carrito ver(@RequestParam Integer idUsuario) {
        return carritoService.obtenerCarritoDeUsuario(idUsuario);
    }

    // Endpoint para checkout - retorna carrito con totales calculados
    @GetMapping("/{userId}")
    public Map<String, Object> obtenerCarritoConTotales(@PathVariable Integer userId) {
        Carrito carrito = carritoService.obtenerCarritoConDetalles(userId);

        // Mapear items con detalles
        var items = carrito.getDetalles() != null ? carrito.getDetalles().stream()
                .map(detalle -> Map.of(
                        "idDetalle", detalle.getIdDetalle(),
                        "nombreProducto", detalle.getProducto().getNombre(),
                        "precio", detalle.getProducto().getPrecioVenta(),
                        "precioVenta", detalle.getProducto().getPrecioVenta(),
                        "cantidad", detalle.getCantidad(),
                        "imagenUrl",
                        detalle.getProducto().getImagen() != null ? detalle.getProducto().getImagen()
                                : "/img/placeholder-product.jpg"))
                .toList() : java.util.Collections.emptyList();

        // Calcular totales
        double subtotal = carrito.getDetalles() != null ? carrito.getDetalles().stream()
                .mapToDouble(d -> d.getProducto().getPrecioVenta()
                        .multiply(java.math.BigDecimal.valueOf(d.getCantidad()))
                        .doubleValue())
                .sum() : 0.0;

        double igv = subtotal * 0.18;
        double total = subtotal + igv;

        return Map.of(
                "items", items,
                "subtotal", subtotal,
                "igv", igv,
                "total", total);
    }

    @GetMapping("/{idUsuario}/count")
    public Map<String, Object> contar(@PathVariable Integer idUsuario) {
        int count = carritoService.contarProductos(idUsuario);
        return Map.of("count", count);
    }

    @PutMapping("/detalle/{idDetalle}/cantidad")
    public Map<String, Object> cambiarCantidad(
            @PathVariable Integer idDetalle,
            @RequestBody Map<String, Object> body) {
        Integer cantidad = (Integer) body.get("cantidad");
        carritoService.cambiarCantidad(idDetalle, cantidad);
        return Map.of("ok", true);
    }

    @DeleteMapping("/detalle/{idDetalle}")
    public Map<String, Object> eliminarDetalle(@PathVariable Integer idDetalle) {
        carritoService.eliminarDetalle(idDetalle);
        return Map.of("ok", true);
    }

    @DeleteMapping("/{userId}/vaciar")
    public ResponseEntity<?> vaciarCarrito(@PathVariable Integer userId) {
        try {
            carritoService.vaciarCarrito(userId);
            return ResponseEntity.ok(Map.of("message", "Carrito vaciado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

}
