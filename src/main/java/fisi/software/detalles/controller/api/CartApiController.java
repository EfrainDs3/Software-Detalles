package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.Carrito;
import fisi.software.detalles.service.CarritoService;
import lombok.RequiredArgsConstructor;
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
            @RequestParam Integer cantidad
    ) {
        return carritoService.agregarProducto(idUsuario, idProducto, cantidad);
    }

    @GetMapping("/ver")
    public Carrito ver(@RequestParam Integer idUsuario) {
        return carritoService.obtenerCarritoDeUsuario(idUsuario);
    }
	@GetMapping("/{idUsuario}/count")
public Map<String, Object> contar(@PathVariable Integer idUsuario) {
    int count = carritoService.contarProductos(idUsuario);
    return Map.of("count", count);
	}
	@PutMapping("/detalle/{idDetalle}/cantidad")
public Map<String, Object> cambiarCantidad(
        @PathVariable Integer idDetalle,
        @RequestBody Map<String, Object> body
) {
    Integer cantidad = (Integer) body.get("cantidad");
    carritoService.cambiarCantidad(idDetalle, cantidad);
    return Map.of("ok", true);
}

@DeleteMapping("/detalle/{idDetalle}")
public Map<String, Object> eliminarDetalle(@PathVariable Integer idDetalle) {
    carritoService.eliminarDetalle(idDetalle);
    return Map.of("ok", true);
}


}
