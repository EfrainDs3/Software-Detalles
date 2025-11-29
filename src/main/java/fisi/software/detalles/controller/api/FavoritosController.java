package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.Favorito;
import fisi.software.detalles.service.FavoritoService;
import fisi.software.detalles.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritosController {

    private final FavoritoService favoritoService;

    /**
     * GET /api/favoritos
     * Obtiene la lista de favoritos del usuario autenticado
     */
    @GetMapping
    public ResponseEntity<?> obtenerFavoritos(Authentication auth, jakarta.servlet.http.HttpSession session) {
        Integer userId = getUserId(auth, session);

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            List<Favorito> favoritos = favoritoService.obtenerFavoritosDeUsuario(userId);

            // Convertir a formato JSON sin referencias circulares
            List<Map<String, Object>> favoritosDTO = favoritos.stream()
                    .map(f -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("idFavorito", f.getIdFavorito());
                        dto.put("fechaAgregado", f.getFechaAgregado().toString());

                        // Datos del producto
                        Map<String, Object> producto = new HashMap<>();
                        producto.put("id", f.getProducto().getId());
                        producto.put("nombre", f.getProducto().getNombre());
                        producto.put("descripcion", f.getProducto().getDescripcion());
                        producto.put("precio", f.getProducto().getPrecioVenta());
                        producto.put("imagen", f.getProducto().getImagen());
                        producto.put("estado", f.getProducto().getEstado());

                        dto.put("producto", producto);
                        return dto;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "favoritos", favoritosDTO,
                    "total", favoritos.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al obtener favoritos: " + e.getMessage()));
        }
    }

    /**
     * POST /api/favoritos/agregar
     * Agrega un producto a favoritos
     */
    @PostMapping("/agregar")
    public ResponseEntity<?> agregarFavorito(
            @RequestBody Map<String, Object> body,
            Authentication auth,
            jakarta.servlet.http.HttpSession session) {

        Integer userId = getUserId(auth, session);

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            Integer idProducto = Integer.valueOf(body.get("idProducto").toString());

            Favorito favorito = favoritoService.agregarFavorito(userId, idProducto);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Producto agregado a favoritos",
                    "idFavorito", favorito.getIdFavorito()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al agregar a favoritos: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/favoritos/{idProducto}
     * Elimina un producto de favoritos
     */
    @DeleteMapping("/{idProducto}")
    public ResponseEntity<?> eliminarFavorito(
            @PathVariable Integer idProducto,
            Authentication auth,
            jakarta.servlet.http.HttpSession session) {

        Integer userId = getUserId(auth, session);

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        try {
            favoritoService.eliminarFavorito(userId, idProducto);

            return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado de favoritos"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error al eliminar de favoritos: " + e.getMessage()));
        }
    }

    /**
     * GET /api/favoritos/verificar/{idProducto}
     * Verifica si un producto está en favoritos
     */
    @GetMapping("/verificar/{idProducto}")
    public ResponseEntity<?> verificarFavorito(
            @PathVariable Integer idProducto,
            Authentication auth,
            jakarta.servlet.http.HttpSession session) {

        Integer userId = getUserId(auth, session);

        if (userId == null) {
            return ResponseEntity.ok(Map.of("esFavorito", false));
        }

        try {
            boolean esFavorito = favoritoService.esFavorito(userId, idProducto);

            return ResponseEntity.ok(Map.of("esFavorito", esFavorito));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al verificar favorito: " + e.getMessage()));
        }
    }

    /**
     * GET /api/favoritos/count
     * Obtiene el número de favoritos del usuario
     */
    @GetMapping("/count")
    public ResponseEntity<?> contarFavoritos(Authentication auth, jakarta.servlet.http.HttpSession session) {
        Integer userId = getUserId(auth, session);

        if (userId == null) {
            return ResponseEntity.ok(Map.of("count", 0));
        }

        try {
            long count = favoritoService.contarFavoritos(userId);

            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error al contar favoritos: " + e.getMessage()));
        }
    }

    /**
     * Método helper para obtener el ID del usuario desde Spring Security o sesión
     * HTTP
     */
    private Integer getUserId(Authentication auth, jakarta.servlet.http.HttpSession session) {
        // Intentar obtener el ID del usuario desde Spring Security
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            UsuarioPrincipal principal = (UsuarioPrincipal) auth.getPrincipal();
            return principal.getId();
        }
        // Si no hay autenticación Spring, intentar desde la sesión HTTP
        else if (session.getAttribute("USER_ID") != null) {
            return (Integer) session.getAttribute("USER_ID");
        }

        return null;
    }
}
