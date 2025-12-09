package fisi.software.detalles.service;

import fisi.software.detalles.entity.*;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoDetalleRepository detalleRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    public Carrito obtenerCarritoDeUsuario(Integer idUsuario) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return carritoRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = Carrito.builder()
                            .usuario(usuario)
                            .fechaCreacion(LocalDateTime.now())
                            .build();

                    return carritoRepository.save(nuevoCarrito);
                });
    }

    /**
     * Obtiene el carrito con los detalles cargados (eager loading)
     * Útil para evitar problemas con lazy loading
     */
    public Carrito obtenerCarritoConDetalles(Integer idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return carritoRepository.findCarritoWithDetalles(usuario)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = Carrito.builder()
                            .usuario(usuario)
                            .fechaCreacion(LocalDateTime.now())
                            .build();

                    return carritoRepository.save(nuevoCarrito);
                });
    }

    @Transactional
    public Carrito agregarProducto(Integer idUsuario, Integer idProducto, int cantidad) {
        try {
            System.out.println("=== AGREGANDO PRODUCTO AL CARRITO ===");
            System.out.println("Usuario ID: " + idUsuario);
            System.out.println("Producto ID: " + idProducto);
            System.out.println("Cantidad: " + cantidad);

            Carrito carrito = obtenerCarritoDeUsuario(idUsuario);
            System.out.println("Carrito encontrado/creado - ID: " + carrito.getIdCarrito());

            Producto producto = productoRepository
                    .findById(idProducto.longValue())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            System.out.println("Producto encontrado: " + producto.getNombre());

            // Verificar si el producto ya está en el carrito
            if (carrito.getDetalles() != null) {
                for (CarritoDetalle d : carrito.getDetalles()) {
                    if (d.getProducto().getId().equals(producto.getId())) {
                        // Ya existe, actualizar cantidad
                        d.setCantidad(d.getCantidad() + cantidad);
                        detalleRepository.save(d);
                        System.out.println("Producto ya existía, cantidad actualizada a: " + d.getCantidad());
                        return carrito;
                    }
                }
            }

            // No existe, crear nuevo
            CarritoDetalle detalle = CarritoDetalle.builder()
                    .carrito(carrito)
                    .producto(producto)
                    .cantidad(cantidad)
                    .build();

            CarritoDetalle detalleGuardado = detalleRepository.save(detalle);
            System.out.println("Detalle guardado con ID: " + detalleGuardado.getIdDetalle());
            System.out.println("=== PRODUCTO AGREGADO EXITOSAMENTE ===");

            return carrito;
        } catch (Exception e) {
            System.err.println("ERROR AL AGREGAR PRODUCTO: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al agregar producto al carrito: " + e.getMessage(), e);
        }
    }

    public int contarProductos(Integer idUsuario) {
        Carrito carrito = obtenerCarritoDeUsuario(idUsuario);
        return detalleRepository.countByCarrito_IdCarrito(carrito.getIdCarrito());
    }

    public void cambiarCantidad(Integer idDetalle, Integer cantidad) {
        CarritoDetalle d = detalleRepository.findById(idDetalle.longValue())
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado"));
        d.setCantidad(cantidad);
        detalleRepository.save(d);
    }

    public void eliminarDetalle(Integer idDetalle) {
        detalleRepository.deleteById(idDetalle.longValue());
    }

    @org.springframework.transaction.annotation.Transactional
    public void vaciarCarrito(Integer idUsuario) {
        Carrito carrito = obtenerCarritoDeUsuario(idUsuario);
        if (carrito.getDetalles() != null && !carrito.getDetalles().isEmpty()) {
            detalleRepository.deleteAll(carrito.getDetalles());
        }
    }

}
