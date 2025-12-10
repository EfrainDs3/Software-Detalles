package fisi.software.detalles.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import fisi.software.detalles.controller.dto.AiRecommendationRequest;
import fisi.software.detalles.controller.dto.AiRecommendationResponse;
import fisi.software.detalles.entity.Catalogo.Tipo;
import fisi.software.detalles.entity.CategoriaProducto;
import fisi.software.detalles.entity.Inventario;
import fisi.software.detalles.entity.InventarioTalla;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.ProductoTalla;
import fisi.software.detalles.repository.CategoriaProductoRepository;
import fisi.software.detalles.repository.EtiquetaProductoIaRepository;
import fisi.software.detalles.repository.InventarioRepository;
import fisi.software.detalles.repository.InventarioTallaRepository;
import fisi.software.detalles.repository.ProductoRepository;

@ExtendWith(MockitoExtension.class)
class AiRecommendationServiceTest {

    @Mock
    private CategoriaProductoRepository categoriaProductoRepository;
    @Mock
    private ProductoRepository productoRepository;
    @Mock
    private InventarioRepository inventarioRepository;
    @Mock
    private InventarioTallaRepository inventarioTallaRepository;
    @Mock
    private EtiquetaProductoIaRepository etiquetaProductoIaRepository;

    @InjectMocks
    private AiRecommendationService aiRecommendationService;

    private CategoriaProducto categoriaCalzado;
    private Producto botasImpermeables;
    private Producto zapatillasUrbanas;

    @BeforeEach
    void setUp() {
        categoriaCalzado = new CategoriaProducto();
        categoriaCalzado.setId(1L);
        categoriaCalzado.setNombre("Calzado");

        when(etiquetaProductoIaRepository.findByProductoIdIn(anyList())).thenReturn(List.of());

        botasImpermeables = crearProducto(10L, "Botas impermeables urbanas", "Charol impermeable ideal para clima lluvioso con eventos formales", "Negro", "Hombre", new BigDecimal("350.00"));
        botasImpermeables.getTiposProducto().add(crearTipo("Formal"));

        zapatillasUrbanas = crearProducto(20L, "Zapatillas casuales", "Calzado ligero para caminatas de fin de semana", "Azul", "Unisex", new BigDecimal("220.00"));
        zapatillasUrbanas.getTiposProducto().add(crearTipo("Casual"));
    }

    @Test
    void obtenerRecomendaciones_priorizaProductosAdecuadosAlEvento() {
        when(categoriaProductoRepository.findByNombreIgnoreCase("Calzado"))
                .thenReturn(Optional.of(categoriaCalzado));
        when(productoRepository.findByCategoriaIdWithDetalles(1L))
                .thenReturn(List.of(botasImpermeables, zapatillasUrbanas));
        when(etiquetaProductoIaRepository.findByProductoIdIn(List.of(10L, 20L))).thenReturn(List.of());

        configurarInventario(botasImpermeables, 8, "42", 5);
        configurarInventario(zapatillasUrbanas, 0, "42", 0);

        AiRecommendationRequest request = new AiRecommendationRequest();
        request.setEventType("formal");
        request.setStylePreference("elegante");
        request.setShoeSize("42");
        request.setComfortPriority("high");
        request.setGender("hombre");

        List<AiRecommendationResponse> recomendaciones = aiRecommendationService.obtenerRecomendaciones(request);

        assertThat(recomendaciones).isNotEmpty();
        AiRecommendationResponse principal = recomendaciones.getFirst();
        assertThat(principal.nombre()).contains("Botas impermeables");
        assertThat(principal.stockTotal()).isEqualTo(8);
        assertThat(principal.stockDisponible()).isTrue();
        assertThat(principal.coincidencias())
                .anyMatch(texto -> texto.toLowerCase().contains("formal"))
                .anyMatch(texto -> texto.toLowerCase().contains("stock disponible"));
        assertThat(principal.etiquetas())
            .anyMatch(valor -> valor.toLowerCase().contains("formal"))
            .anyMatch(valor -> valor.toLowerCase().contains("botas"));
    }

    @Test
    void obtenerRecomendaciones_lanzaErrorSiCategoriaNoExiste() {
        when(categoriaProductoRepository.findByNombreIgnoreCase("Calzado"))
                .thenReturn(Optional.empty());

        AiRecommendationRequest request = new AiRecommendationRequest();
        assertThrows(ResponseStatusException.class, () -> aiRecommendationService.obtenerRecomendaciones(request));
    }

    private void configurarInventario(Producto producto, int stockTotal, String talla, int stockTalla) {
        Inventario inventario = new Inventario();
        inventario.setProducto(producto);
        inventario.setCantidadStock(stockTotal);
        inventario.setFechaUltimaActualizacion(LocalDateTime.now());

        InventarioTalla inventarioTalla = new InventarioTalla();
        inventarioTalla.setInventario(inventario);
        inventarioTalla.setTalla(talla);
        inventarioTalla.setCantidadStock(stockTalla);

        when(inventarioRepository.findByProducto(producto)).thenReturn(List.of(inventario));
        when(inventarioTallaRepository.findByInventario(inventario)).thenReturn(List.of(inventarioTalla));
    }

    private Producto crearProducto(Long id, String nombre, String descripcion, String color, String tipoPublico, BigDecimal precio) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setColor(color);
        producto.setTipo(tipoPublico);
        producto.setCategoria(categoriaCalzado);
        producto.setPrecioVenta(precio);

        ProductoTalla talla = new ProductoTalla();
        talla.setProducto(producto);
        talla.setTalla("42");
        talla.setPrecioVenta(precio);
        producto.getTallas().add(talla);
        return producto;
    }

    private Tipo crearTipo(String nombre) {
        Tipo tipo = new Tipo();
        tipo.setNombre(nombre);
        return tipo;
    }
}
