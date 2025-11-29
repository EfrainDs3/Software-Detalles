package fisi.software.detalles.service;

import fisi.software.detalles.entity.Favorito;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.FavoritoRepository;
import fisi.software.detalles.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioService usuarioService;

    /**
     * Obtiene todos los favoritos de un usuario
     */
    public List<Favorito> obtenerFavoritosDeUsuario(Integer idUsuario) {
        return favoritoRepository.findByUsuarioId(idUsuario);
    }

    /**
     * Agrega un producto a favoritos
     */
    @Transactional
    public Favorito agregarFavorito(Integer idUsuario, Integer idProducto) {
        // Verificar si ya existe
        Optional<Favorito> existente = favoritoRepository.findByUsuarioIdAndProductoId(idUsuario, idProducto);
        if (existente.isPresent()) {
            throw new IllegalArgumentException("El producto ya está en favoritos");
        }

        // Obtener usuario y producto
        Usuario usuario = usuarioService.obtenerUsuarioConRoles(idUsuario);
        if (usuario == null) {
            throw new IllegalArgumentException("Usuario no encontrado");
        }

        // Convertir Integer a Long para el ProductoRepository
        Producto producto = productoRepository.findById(Long.valueOf(idProducto))
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // Crear favorito
        Favorito favorito = Favorito.builder()
                .usuario(usuario)
                .producto(producto)
                .fechaAgregado(LocalDateTime.now())
                .build();

        return favoritoRepository.save(favorito);
    }

    /**
     * Elimina un producto de favoritos
     */
    @Transactional
    public void eliminarFavorito(Integer idUsuario, Integer idProducto) {
        favoritoRepository.deleteByUsuarioIdAndProductoId(idUsuario, idProducto);
    }

    /**
     * Verifica si un producto está en favoritos
     */
    public boolean esFavorito(Integer idUsuario, Integer idProducto) {
        return favoritoRepository.findByUsuarioIdAndProductoId(idUsuario, idProducto).isPresent();
    }

    /**
     * Cuenta los favoritos de un usuario
     */
    public long contarFavoritos(Integer idUsuario) {
        return favoritoRepository.countByUsuarioId(idUsuario);
    }
}
