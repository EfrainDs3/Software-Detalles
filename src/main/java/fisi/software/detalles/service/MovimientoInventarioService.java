package fisi.software.detalles.service;

import fisi.software.detalles.entity.MovimientoInventario;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.repository.MovimientoInventarioRepository;
import fisi.software.detalles.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de movimientos de inventario
 */
@Service
@Transactional
@RequiredArgsConstructor
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    /**
     * Obtiene movimientos filtrados por fechas y otros criterios
     */
    public List<MovimientoInventario> obtenerMovimientosFiltrados(String fechaDesde, String fechaHasta,
                                                                 Long idProducto, Long idAlmacen) {
        LocalDateTime desde = fechaDesde != null ? LocalDateTime.parse(fechaDesde + "T00:00:00") : null;
        LocalDateTime hasta = fechaHasta != null ? LocalDateTime.parse(fechaHasta + "T23:59:59") : null;

        return movimientoRepository.findAll().stream()
            .filter(mov -> {
                if (desde != null && mov.getFechaMovimiento().isBefore(desde)) return false;
                if (hasta != null && mov.getFechaMovimiento().isAfter(hasta)) return false;
                if (idProducto != null && !mov.getProducto().getId().equals(idProducto)) return false;
                if (idAlmacen != null && !mov.getAlmacen().getId().equals(idAlmacen)) return false;
                return true;
            })
            .collect(Collectors.toList());
    }

    /**
     * Genera kardex de un producto
     */
    public List<Map<String, Object>> generarKardexProducto(Long idProducto) {
        Producto producto = productoRepository.findById(idProducto)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        List<MovimientoInventario> movimientos = movimientoRepository.findKardexByProducto(producto);

        // Calcular stock acumulado
        int[] stockAcumulado = {0};
        return movimientos.stream().map(movimiento -> {
            Map<String, Object> kardexEntry = new HashMap<>();
            kardexEntry.put("fecha", movimiento.getFechaMovimiento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            kardexEntry.put("tipo", movimiento.getTipoMovimiento().getNombre());
            kardexEntry.put("almacen", movimiento.getAlmacen().getNombre());

            int cantidad = movimiento.getCantidad();
            if (movimiento.isEntrada()) {
                kardexEntry.put("entrada", cantidad);
                kardexEntry.put("salida", 0);
                stockAcumulado[0] += cantidad;
            } else {
                kardexEntry.put("entrada", 0);
                kardexEntry.put("salida", cantidad);
                stockAcumulado[0] -= cantidad;
            }

            kardexEntry.put("stock", stockAcumulado[0]);
            kardexEntry.put("usuario", movimiento.getUsuario().getNombres() + " " + movimiento.getUsuario().getApellidos());
            kardexEntry.put("referencia", movimiento.getReferenciaDoc() != null ? movimiento.getReferenciaDoc() : "");
            kardexEntry.put("observaciones", movimiento.getObservaciones() != null ? movimiento.getObservaciones() : "");

            return kardexEntry;
        }).collect(Collectors.toList());
    }

    /**
     * Obtiene todos los movimientos
     */
    public List<MovimientoInventario> obtenerTodosMovimientos() {
        return movimientoRepository.findAll();
    }
}