package fisi.software.detalles.service;

import fisi.software.detalles.entity.*;
import fisi.software.detalles.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public Carrito agregarProducto(Integer idUsuario, Integer idProducto, int cantidad) {

        Carrito carrito = obtenerCarritoDeUsuario(idUsuario);

        Producto producto = productoRepository
                .findById(idProducto.longValue())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));


        CarritoDetalle detalle = CarritoDetalle.builder()
                .carrito(carrito)
                .producto(producto)
                .cantidad(cantidad)
                .build();

        detalleRepository.save(detalle);

        return carrito;
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



}


