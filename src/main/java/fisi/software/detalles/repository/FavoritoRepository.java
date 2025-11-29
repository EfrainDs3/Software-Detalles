package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {

    // Encontrar todos los favoritos de un usuario
    @Query("SELECT f FROM Favorito f WHERE f.usuario.id = :idUsuario ORDER BY f.fechaAgregado DESC")
    List<Favorito> findByUsuarioId(@Param("idUsuario") Integer idUsuario);

    // Verificar si un producto ya está en favoritos de un usuario
    @Query("SELECT f FROM Favorito f WHERE f.usuario.id = :idUsuario AND f.producto.id = :idProducto")
    Optional<Favorito> findByUsuarioIdAndProductoId(
            @Param("idUsuario") Integer idUsuario,
            @Param("idProducto") Integer idProducto);

    // Eliminar favorito por usuario y producto
    void deleteByUsuarioIdAndProductoId(Integer idUsuario, Integer idProducto);

    // Contar favoritos de un usuario
    @Query("SELECT COUNT(f) FROM Favorito f WHERE f.usuario.id = :idUsuario")
    long countByUsuarioId(@Param("idUsuario") Integer idUsuario);
}
