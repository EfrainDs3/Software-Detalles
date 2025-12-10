package fisi.software.detalles.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import fisi.software.detalles.controller.dto.AiRecommendationRequest;
import fisi.software.detalles.controller.dto.AiRecommendationResponse;
import fisi.software.detalles.controller.dto.AiRecommendationResponse.TallaDisponibilidad;
import fisi.software.detalles.entity.Catalogo.Tipo;
import fisi.software.detalles.entity.CategoriaProducto;
import fisi.software.detalles.entity.EtiquetaProductoIa;
import fisi.software.detalles.entity.Inventario;
import fisi.software.detalles.entity.InventarioTalla;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.ProductoTalla;
import fisi.software.detalles.repository.CategoriaProductoRepository;
import fisi.software.detalles.repository.EtiquetaProductoIaRepository;
import fisi.software.detalles.repository.InventarioRepository;
import fisi.software.detalles.repository.InventarioTallaRepository;
import fisi.software.detalles.repository.ProductoRepository;

/**
 * Servicio dedicado a construir un contexto rico con productos reales de la
 * base
 * de datos para que el asistente de IA limite sus recomendaciones a artículos
 * disponibles.
 */
@Service
@Transactional(readOnly = true)
public class AiRecommendationService {

    private static final String CATEGORIA_CALZADO = "Calzado";
    private static final Map<String, List<String>> EVENT_KEYWORDS = Map.of(
            "formal", List.of("formal", "gala", "boda", "terno", "oxford", "charol", "evento de noche", "salón"),
            "semiformal", List.of("semi", "reunión", "cocktail", "smart", "mocasín"),
            "casual", List.of("casual", "diario", "jean", "salida", "urbano"),
            "deportivo",
            List.of("deportivo", "running", "gym", "training", "amortiguación", "sneaker", "correr", "zapatilla"),
            "trabajo", List.of("oficina", "trabajo", "laboral", "executivo", "comodidad todo el día"));

    private static final Map<String, List<String>> STYLE_KEYWORDS = Map.of(
            "elegante", List.of("elegante", "formal", "charol", "oxford", "tacón"),
            "moderno", List.of("moderno", "tendencia", "minimalista", "urbano"),
            "clasico", List.of("clásico", "tradicional", "atemporal", "mocasín"),
            "deportivo", List.of("deportivo", "running", "sport", "training", "correr", "zapatilla"),
            "casual", List.of("casual", "diario", "relajado", "urbano"));

    private static final List<String> HIGH_COMFORT_KEYWORDS = List.of("amortigu", "acolch", "suela suave",
            "plantilla", "espuma", "transpirable", "ergon", "deportivo", "running", "lightweight");

    private static final List<String> LOW_COMFORT_PRIORITY_KEYWORDS = List.of("tacón", "plataforma", "puntal",
            "brillo", "moda", "estilizado");

    // Palabras clave que DESCALIFICAN un producto para ciertos tipos de evento
    private static final Map<String, List<String>> INCOMPATIBLE_KEYWORDS = Map.of(
            "deportivo", List.of("sandalia", "chancleta", "tacón", "taco", "formal", "gala", "charol", "oxford"),
            "formal", List.of("deportivo", "running", "gym", "training", "sneaker", "sandalia", "chancleta"),
            "semiformal", List.of("deportivo", "running", "gym", "sandalia", "chancleta"),
            "trabajo", List.of("sandalia", "chancleta", "deportivo muy casual"));

    private final CategoriaProductoRepository categoriaProductoRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final InventarioTallaRepository inventarioTallaRepository;
    private final EtiquetaProductoIaRepository etiquetaProductoIaRepository;

    public AiRecommendationService(CategoriaProductoRepository categoriaProductoRepository,
            ProductoRepository productoRepository,
            InventarioRepository inventarioRepository,
            InventarioTallaRepository inventarioTallaRepository,
            EtiquetaProductoIaRepository etiquetaProductoIaRepository) {
        this.categoriaProductoRepository = categoriaProductoRepository;
        this.productoRepository = productoRepository;
        this.inventarioRepository = inventarioRepository;
        this.inventarioTallaRepository = inventarioTallaRepository;
        this.etiquetaProductoIaRepository = etiquetaProductoIaRepository;
    }

    public List<AiRecommendationResponse> obtenerRecomendaciones(AiRecommendationRequest request) {
        CategoriaProducto categoriaCalzado = categoriaProductoRepository.findByNombreIgnoreCase(CATEGORIA_CALZADO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "No se encontró la categoría '" + CATEGORIA_CALZADO + "'"));

        List<Producto> productos = productoRepository.findByCategoriaIdWithDetalles(categoriaCalzado.getId());
        if (productos.isEmpty()) {
            return List.of();
        }

        Map<Long, List<String>> etiquetasConfiguradas = agruparEtiquetasConfiguradas(productos);

        String eventKey = normalizarClave(request.getEventType());
        String styleKey = normalizarClave(request.getStylePreference());
        String colorKey = normalizarTexto(request.getColorPreference());
        String tallaSolicitada = normalizarTalla(request.getShoeSize());
        String comfortPriority = normalizarClave(request.getComfortPriority());
        String gender = normalizarClave(request.getGender());

        List<Candidate> candidatos = productos.stream()
                .filter(p -> !Boolean.FALSE.equals(p.getEstado()))
            .map(p -> construirCandidato(p, eventKey, styleKey, colorKey, tallaSolicitada, comfortPriority, gender,
                etiquetasConfiguradas.getOrDefault(p.getId(), List.of())))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(Candidate::score).reversed()
                        .thenComparing(c -> c.respuesta().nombre(), Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        if (candidatos.isEmpty()) {
            return List.of();
        }

        return candidatos.stream()
                .limit(8)
                .map(Candidate::respuesta)
                .toList();
    }

    private Candidate construirCandidato(Producto producto,
            String eventKey,
            String styleKey,
            String colorKey,
            String tallaSolicitada,
            String comfortPriority,
            String gender,
            List<String> etiquetasConfiguradas) {

        // FILTRADO CRÍTICO: Descartar productos incompatibles con el tipo de evento
        String textoProducto = construirTextoProducto(producto);

        // Si se especificó un tipo de evento, verificar que el producto no sea
        // incompatible
        if (StringUtils.hasText(eventKey)) {
            List<String> palabrasIncompatibles = INCOMPATIBLE_KEYWORDS.getOrDefault(eventKey, List.of());
            if (esProductoIncompatible(textoProducto, palabrasIncompatibles)) {
                return null; // Descartar este producto completamente
            }
        }

        // Si se especificó un estilo, verificar compatibilidad
        if (StringUtils.hasText(styleKey)) {
            List<String> palabrasIncompatibles = INCOMPATIBLE_KEYWORDS.getOrDefault(styleKey, List.of());
            if (esProductoIncompatible(textoProducto, palabrasIncompatibles)) {
                return null; // Descartar este producto completamente
            }
        }

        StockDetalle stock = calcularStock(producto);
        List<ProductoTalla> tallasOrdenadas = producto.getTallas().stream()
                .sorted(Comparator.comparing(ProductoTalla::getTalla,
                        Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        List<TallaDisponibilidad> tallas = crearTallas(producto, stock, tallasOrdenadas);
        Integer stockTotal = stock.total();

        if (stockTotal == null) {
            stockTotal = 0;
        }

        MatchingScore matchingScore = calcularScore(producto, tallasOrdenadas, stock, eventKey, styleKey, colorKey,
            tallaSolicitada, comfortPriority, gender);

        List<String> etiquetas = construirEtiquetasProducto(producto, etiquetasConfiguradas, eventKey, styleKey,
            colorKey, gender, matchingScore);
        boolean stockDisponible = stockTotal > 0;

        AiRecommendationResponse respuesta = new AiRecommendationResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getCategoria() != null ? producto.getCategoria().getNombre() : null,
                producto.getColor(),
                matchingScore.estiloPrincipal(),
                producto.getTipo(),
                resolverPrecioReferencia(producto, tallas),
                stockTotal,
            stockDisponible,
                tallas,
                producto.getImagen(),
                matchingScore.coincidencias(),
            etiquetas,
                matchingScore.score(),
                matchingScore.tallaDisponible());

        return new Candidate(respuesta, matchingScore.score());
    }

    /**
     * Verifica si un producto contiene palabras clave incompatibles
     */
    private boolean esProductoIncompatible(String textoProducto, List<String> palabrasIncompatibles) {
        if (!StringUtils.hasText(textoProducto) || palabrasIncompatibles == null || palabrasIncompatibles.isEmpty()) {
            return false;
        }

        for (String palabraIncompatible : palabrasIncompatibles) {
            if (!StringUtils.hasText(palabraIncompatible)) {
                continue;
            }
            String palabraNormalizada = normalizarTexto(palabraIncompatible);
            if (textoProducto.contains(palabraNormalizada)) {
                return true; // Producto incompatible encontrado
            }
        }
        return false;
    }

    private List<TallaDisponibilidad> crearTallas(Producto producto, StockDetalle stock,
            List<ProductoTalla> tallasOrdenadas) {
        if (!tallasOrdenadas.isEmpty()) {
            return tallasOrdenadas.stream()
                    .map(t -> new TallaDisponibilidad(
                            t.getTalla(),
                            normalizarPrecio(t.getPrecioVenta(), producto.getPrecioVenta()),
                            stock.stockPorTalla().getOrDefault(normalizarTalla(t.getTalla()), 0)))
                    .toList();
        }

        // Productos sin tallas diferenciadas
        BigDecimal referencia = normalizarPrecio(producto.getPrecioVenta(), BigDecimal.ZERO);
        return List.of(new TallaDisponibilidad("Única", referencia, stock.total()));
    }

    private BigDecimal resolverPrecioReferencia(Producto producto, List<TallaDisponibilidad> tallas) {
        if (producto.getPrecioVenta() != null) {
            return producto.getPrecioVenta();
        }
        return tallas.stream()
                .map(TallaDisponibilidad::precio)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private MatchingScore calcularScore(Producto producto,
            List<ProductoTalla> tallas,
            StockDetalle stock,
            String eventKey,
            String styleKey,
            String colorKey,
            String tallaSolicitada,
            String comfortPriority,
            String gender) {
        double score = 10d; // Base para todos los productos activos
        List<String> coincidencias = new ArrayList<>();
        boolean tallaDisponible = false;

        String textoProducto = construirTextoProducto(producto);
        String estiloPrincipal = producto.getTiposProducto().stream()
                .map(Tipo::getNombre)
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);

        if (StringUtils.hasText(eventKey)) {
            if (coincideCon(textoProducto, EVENT_KEYWORDS.getOrDefault(eventKey, List.of()))) {
                score += 24;
                coincidencias.add("Adecuado para eventos " + eventKey);
            } else {
                score -= 6;
            }
        }

        if (StringUtils.hasText(styleKey)) {
            if (coincideCon(textoProducto, STYLE_KEYWORDS.getOrDefault(styleKey, List.of()))) {
                score += 28;
                coincidencias.add("Estilo " + styleKey + " coincidente");
            } else if (StringUtils.hasText(estiloPrincipal) && estiloPrincipal.equalsIgnoreCase(styleKey)) {
                score += 25;
                coincidencias.add("Pertenece al tipo " + estiloPrincipal);
            } else {
                score -= 5;
            }
        }

        if (StringUtils.hasText(colorKey)) {
            String colorProducto = normalizarTexto(producto.getColor());
            if (StringUtils.hasText(colorProducto) && colorProducto.contains(colorKey)) {
                score += 8;
                coincidencias.add("Color " + colorKey + " disponible");
            } else {
                score -= 4;
            }
        }

        if (StringUtils.hasText(gender)) {
            String tipo = normalizarTexto(producto.getTipo());
            if (StringUtils.hasText(tipo) && tipo.contains(gender)) {
                score += 5;
                coincidencias.add("Enfoque para " + gender);
            }
        }

        if (StringUtils.hasText(tallaSolicitada)) {
            Set<String> tallasDisponibles = stock.stockPorTalla().keySet();
            if (tallasDisponibles.contains(tallaSolicitada)) {
                tallaDisponible = true;
                score += 20;
                coincidencias.add("Talla " + denormalizarTalla(tallaSolicitada) + " con stock");
            } else if (tallasDisponibles.isEmpty()) {
                // Si no tenemos tallas en inventario pero el producto declara la talla, usar
                // referencia
                tallaDisponible = tallas.stream()
                        .map(ProductoTalla::getTalla)
                        .map(AiRecommendationService::normalizarTalla)
                        .anyMatch(tallaSolicitada::equals);
                if (tallaDisponible) {
                    score += 12;
                    coincidencias.add("Talla " + denormalizarTalla(tallaSolicitada) + " disponible bajo pedido");
                } else {
                    score -= 12;
                }
            } else {
                score -= 14;
            }
        }

        // Ajustes por confort
        if (StringUtils.hasText(comfortPriority)) {
            switch (comfortPriority) {
                case "high" -> {
                    if (coincideCon(textoProducto, HIGH_COMFORT_KEYWORDS)) {
                        score += 10;
                        coincidencias.add("Pensado para alta comodidad");
                    } else {
                        score -= 5;
                    }
                }
                case "low" -> {
                    if (coincideCon(textoProducto, LOW_COMFORT_PRIORITY_KEYWORDS)) {
                        score += 4;
                    }
                }
                default -> {
                }
            }
        }

        // Favorecer disponibilidad
        int stockTotal = stock.total() != null ? stock.total() : 0;
        if (stockTotal > 0) {
            score += Math.min(10, stockTotal);
            if (!coincidencias.contains("Stock disponible")) {
                coincidencias.add("Stock disponible");
            }
        } else {
            score -= 8;
        }

        return new MatchingScore(Math.max(score, 1), coincidencias, estiloPrincipal, tallaDisponible);
    }

    private List<String> construirEtiquetasProducto(Producto producto,
            List<String> etiquetasConfiguradas,
            String eventKey,
            String styleKey,
            String colorKey,
            String gender,
            MatchingScore matchingScore) {
        Set<String> etiquetas = new LinkedHashSet<>();

        if (producto.getCategoria() != null) {
            agregarEtiqueta(etiquetas, producto.getCategoria().getNombre());
        }
        agregarEtiqueta(etiquetas, producto.getTipo());
        agregarEtiqueta(etiquetas, producto.getNombre());
        agregarEtiqueta(etiquetas, producto.getColor());

        producto.getTiposProducto().stream()
                .map(Tipo::getNombre)
                .forEach(valor -> agregarEtiqueta(etiquetas, valor));

        if (matchingScore != null) {
            agregarEtiqueta(etiquetas, matchingScore.estiloPrincipal());
        }

        if (etiquetasConfiguradas != null) {
            etiquetasConfiguradas.forEach(valor -> agregarEtiqueta(etiquetas, valor));
        }

        agregarEtiqueta(etiquetas, eventKey);
        agregarEtiqueta(etiquetas, styleKey);
        agregarEtiqueta(etiquetas, colorKey);
        agregarEtiqueta(etiquetas, gender);

        return etiquetas.stream()
                .map(valor -> valor != null ? valor.trim() : null)
                .filter(StringUtils::hasText)
                .limit(50)
                .toList();
    }

    private void agregarEtiqueta(Set<String> etiquetas, String valor) {
        if (!StringUtils.hasText(valor)) {
            return;
        }
        String base = valor.trim();
        if (base.isEmpty()) {
            return;
        }

        etiquetas.add(base);
        String minusculas = base.toLowerCase(Locale.ROOT);
        etiquetas.add(minusculas);

        String normalizada = normalizarTexto(base);
        if (StringUtils.hasText(normalizada)) {
            etiquetas.add(normalizada);
        }

        agregarVariaciones(etiquetas, minusculas);
    }

    private void agregarVariaciones(Set<String> etiquetas, String valor) {
        if (!StringUtils.hasText(valor)) {
            return;
        }

        String singular = singularizar(valor);
        if (StringUtils.hasText(singular)) {
            etiquetas.add(singular);
        }

        for (String token : valor.split("[\\s,/\\-]+")) {
            if (token.length() <= 2) {
                continue;
            }
            etiquetas.add(token);
            String tokenSingular = singularizar(token);
            if (StringUtils.hasText(tokenSingular)) {
                etiquetas.add(tokenSingular);
            }
        }
    }

    private String singularizar(String palabra) {
        if (!StringUtils.hasText(palabra)) {
            return null;
        }
        String procesada = palabra.trim().toLowerCase(Locale.ROOT);
        if (procesada.length() <= 3) {
            return procesada;
        }
        if (procesada.endsWith("es")) {
            return procesada.substring(0, procesada.length() - 2);
        }
        if (procesada.endsWith("s") && !procesada.endsWith("ss")) {
            return procesada.substring(0, procesada.length() - 1);
        }
        return procesada;
    }

    private StockDetalle calcularStock(Producto producto) {
        List<Inventario> inventarios = inventarioRepository.findByProducto(producto);
        if (inventarios.isEmpty()) {
            return new StockDetalle(0, Map.of());
        }

        Map<String, Integer> stockPorTalla = new HashMap<>();
        int total = 0;
        for (Inventario inventario : inventarios) {
            total += nullSafeInt(inventario.getCantidadStock());
            List<InventarioTalla> tallasInventario = inventarioTallaRepository.findByInventario(inventario);
            for (InventarioTalla inventarioTalla : tallasInventario) {
                String talla = normalizarTalla(inventarioTalla.getTalla());
                stockPorTalla.merge(talla, nullSafeInt(inventarioTalla.getCantidadStock()), Integer::sum);
            }
        }

        if (stockPorTalla.isEmpty()) {
            // Repartir stock total de forma aproximada si existen tallas declaradas en el
            // producto
            Set<String> tallasProducto = producto.getTallas().stream()
                    .map(ProductoTalla::getTalla)
                    .filter(StringUtils::hasText)
                    .map(AiRecommendationService::normalizarTalla)
                    .collect(Collectors.toCollection(HashSet::new));
            if (!tallasProducto.isEmpty() && total > 0) {
                int reparto = Math.max(1, total / tallasProducto.size());
                tallasProducto.forEach(t -> stockPorTalla.put(t, reparto));
            }
        }

        return new StockDetalle(total, stockPorTalla);
    }

    private Map<Long, List<String>> agruparEtiquetasConfiguradas(List<Producto> productos) {
        List<Long> ids = productos.stream()
                .map(Producto::getId)
                .filter(Objects::nonNull)
                .toList();

        if (ids.isEmpty()) {
            return Map.of();
        }

        List<EtiquetaProductoIa> registros = etiquetaProductoIaRepository.findByProductoIdIn(ids);
        if (registros.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<String>> agrupadas = new LinkedHashMap<>();
        for (EtiquetaProductoIa registro : registros) {
            if (registro.getProducto() == null || registro.getProducto().getId() == null) {
                continue;
            }
            if (!StringUtils.hasText(registro.getEtiqueta())) {
                continue;
            }
            agrupadas.computeIfAbsent(registro.getProducto().getId(), id -> new ArrayList<>())
                    .add(registro.getEtiqueta());
        }

        return agrupadas;
    }

    private String construirTextoProducto(Producto producto) {
        StringBuilder builder = new StringBuilder();
        appendIfNotBlank(builder, producto.getNombre());
        appendIfNotBlank(builder, producto.getDescripcion());
        appendIfNotBlank(builder, producto.getColor());
        appendIfNotBlank(builder, producto.getTipo());
        producto.getTiposProducto().stream()
                .map(Tipo::getNombre)
                .forEach(valor -> appendIfNotBlank(builder, valor));
        return normalizarTexto(builder.toString());
    }

    private static void appendIfNotBlank(StringBuilder builder, String value) {
        if (StringUtils.hasText(value)) {
            builder.append(' ').append(value);
        }
    }

    private static boolean coincideCon(String textoProducto, List<String> keywords) {
        if (!StringUtils.hasText(textoProducto) || keywords == null || keywords.isEmpty()) {
            return false;
        }
        for (String keyword : keywords) {
            if (!StringUtils.hasText(keyword)) {
                continue;
            }
            String keywordNormalizado = normalizarTexto(keyword);
            if (textoProducto.contains(keywordNormalizado)) {
                return true;
            }
        }
        return false;
    }

    private static String normalizarTexto(String valor) {
        if (!StringUtils.hasText(valor)) {
            return null;
        }
        String texto = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ROOT)
                .trim();
        return texto.isEmpty() ? null : texto;
    }

    private static String normalizarClave(String valor) {
        String texto = normalizarTexto(valor);
        return texto != null ? texto.replace('-', ' ') : null;
    }

    private static String normalizarTalla(String talla) {
        if (!StringUtils.hasText(talla)) {
            return null;
        }
        return talla.trim().toLowerCase(Locale.ROOT).replace(',', '.');
    }

    private static String denormalizarTalla(String tallaNormalizada) {
        return tallaNormalizada != null ? tallaNormalizada.toUpperCase(Locale.ROOT) : null;
    }

    private static BigDecimal normalizarPrecio(BigDecimal precio, BigDecimal respaldo) {
        BigDecimal valor = precio != null ? precio : respaldo;
        return valor != null ? valor.setScale(2, RoundingMode.HALF_UP) : null;
    }

    private static int nullSafeInt(Integer valor) {
        return valor != null ? valor : 0;
    }

    private record StockDetalle(Integer total, Map<String, Integer> stockPorTalla) {
    }

    private record MatchingScore(double score, List<String> coincidencias, String estiloPrincipal,
            boolean tallaDisponible) {
    }

    private record Candidate(AiRecommendationResponse respuesta, double score) {
    }
}
