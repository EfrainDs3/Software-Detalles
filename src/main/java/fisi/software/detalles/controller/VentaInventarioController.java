package fisi.software.detalles.controller;

import fisi.software.detalles.entity.Inventario;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.repository.InventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ventas/api")
public class VentaInventarioController {

    @Autowired
    private InventarioRepository inventarioRepository;

    @GetMapping("/productos-disponibles")
    public ResponseEntity<List<ProductoVentaDto>> getProductosDisponibles() {
        // Obtenemos solo productos con stock disponible (mayor que el mínimo)
        // Nota: Si se requiere mostrar productos con stock > 0 aunque estén bajo el
        // mínimo,
        // se debería usar otra consulta o filtrar aquí.
        // Asumiremos que para ventas queremos todo lo que tenga stock > 0.

        List<Inventario> inventarios = inventarioRepository.findAll();

        // Agrupamos por producto para sumar stock de diferentes almacenes si fuera el
        // caso
        // y mapeamos al DTO
        List<ProductoVentaDto> productos = inventarios.stream()
                .filter(inv -> inv.getCantidadStock() > 0 && inv.getProducto().getEstado())
                .collect(Collectors.groupingBy(Inventario::getProducto))
                .entrySet().stream()
                .map(entry -> {
                    Producto p = entry.getKey();
                    int totalStock = entry.getValue().stream().mapToInt(Inventario::getCantidadStock).sum();
                    return new ProductoVentaDto(
                            p.getId(),
                            p.getNombre(),
                            p.getCodigoBarra(),
                            p.getPrecioVenta(),
                            totalStock);
                })
                .sorted(Comparator.comparing(ProductoVentaDto::nombre))
                .collect(Collectors.toList());

        return ResponseEntity.ok(productos);
    }

    // DTO interno para respuesta simple
    public record ProductoVentaDto(
            Long id,
            String nombre,
            String codigoBarra,
            BigDecimal precioVenta,
            Integer stockDisponible) {
    }
}
