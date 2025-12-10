package fisi.software.detalles.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
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
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.ProductoTalla;
import fisi.software.detalles.repository.CategoriaProductoRepository;
import fisi.software.detalles.repository.EtiquetaProductoIaRepository;
import fisi.software.detalles.repository.ProductoRepository;

/**
 * Servicio que prepara un contexto real de productos para el asistente de IA
 * y filtra recomendaciones según la necesidad del cliente ignorando el stock.
 */
@Service
@Transactional(readOnly = true)
public class AiRecommendationService {

    private static final String CATEGORIA_CALZADO = "Calzado";
    private static final int MAX_RESULTS = 8;

    private static final Map<String, List<String>> EVENT_KEYWORDS = Map.of(
            "formal", List.of("formal", "gala", "boda", "terno", "oxford", "charol", "evento de noche", "salón"),
            "semiformal", List.of("semi", "reunión", "cocktail", "smart", "mocasín"),
            "casual", List.of("casual", "diario", "jean", "salida", "urbano"),
            "deportivo", List.of("deportivo", "running", "gym", "training", "amortiguación", "sneaker", "correr", "zapatilla"),
            "trabajo", List.of("oficina", "trabajo", "laboral", "ejecutivo", "comodidad todo el día"));

    private static final Map<String, List<String>> STYLE_KEYWORDS = Map.of(
            "elegante", List.of("elegante", "formal", "charol", "oxford", "tacón"),
            "moderno", List.of("moderno", "tendencia", "minimalista", "urbano"),
            "clasico", List.of("clásico", "tradicional", "atemporal", "mocasín"),
            "deportivo", List.of("deportivo", "running", "sport", "training", "correr", "zapatilla"),
            "casual", List.of("casual", "diario", "relajado", "urbano"));

    private static final Map<String, List<String>> INCOMPATIBLE_KEYWORDS = Map.ofEntries(
            Map.entry("formal", List.of("deportivo", "running", "sneaker", "sandalia", "playera", "trail")),
            Map.entry("deportivo", List.of("tacón", "charol", "formal", "mocasín", "vestir")),
            Map.entry("casual", List.of("tacón alto", "salón", "stiletto")),
            Map.entry("semiformal", List.of("playera", "sandalia plana")),
            Map.entry("elegante", List.of("deportivo", "sneaker", "running")),
            Map.entry("moderno", List.of("playera", "sandalia playera")));

    private static final List<String> HIGH_COMFORT_KEYWORDS = List.of(
            "amortiguación", "memory foam", "plantilla acolchada", "suela flexible", "ergonómico", "acolchado");
    private static final List<String> LOW_COMFORT_PRIORITY_KEYWORDS = List.of(
            "punta fina", "tacón", "plataforma", "estructura rígida", "tacones altos");

    private final CategoriaProductoRepository categoriaProductoRepository;
    private final ProductoRepository productoRepository;
    private final EtiquetaProductoIaRepository etiquetaProductoIaRepository;

    public AiRecommendationService(CategoriaProductoRepository categoriaProductoRepository,
            ProductoRepository productoRepository,
            EtiquetaProductoIaRepository etiquetaProductoIaRepository) {
        this.categoriaProductoRepository = categoriaProductoRepository;
        this.productoRepository = productoRepository;
        this.etiquetaProductoIaRepository = etiquetaProductoIaRepository;
    }

    public List<AiRecommendationResponse> obtenerRecomendaciones(AiRecommendationRequest request) {
        CategoriaProducto categoria = categoriaProductoRepository.findByNombreIgnoreCase(CATEGORIA_CALZADO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No se encontró la categoría de calzado"));

        List<Producto> productos = productoRepository.findByCategoriaIdWithDetalles(categoria.getId());
        if (productos.isEmpty()) {
            return List.of();
        }

        Map<Long, List<String>> etiquetasConfiguradas = agruparEtiquetasConfiguradas(productos);

        String eventKey = normalizarClave(request != null ? request.getEventType() : null);
        String styleKey = normalizarClave(request != null ? request.getStylePreference() : null);
        String colorKey = normalizarTexto(request != null ? request.getColorPreference() : null);
        String tallaSolicitada = normalizarTalla(request != null ? request.getShoeSize() : null);
        String comfortPriority = normalizarClave(request != null ? request.getComfortPriority() : null);
        String gender = normalizarClave(request != null ? request.getGender() : null);

        List<Candidate> candidatos = productos.stream()
                .filter(p -> p.getEstado() == null || Boolean.TRUE.equals(p.getEstado()))
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
                .limit(MAX_RESULTS)
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

        String textoProducto = construirTextoProducto(producto);

        if (StringUtils.hasText(eventKey)) {
            List<String> palabrasIncompatibles = INCOMPATIBLE_KEYWORDS.getOrDefault(eventKey, List.of());
            if (esProductoIncompatible(textoProducto, palabrasIncompatibles)) {
                return null;
            }
        }

        if (StringUtils.hasText(styleKey)) {
            List<String> palabrasIncompatibles = INCOMPATIBLE_KEYWORDS.getOrDefault(styleKey, List.of());
            if (esProductoIncompatible(textoProducto, palabrasIncompatibles)) {
                return null;
            }
        }

        List<ProductoTalla> tallasOrdenadas = producto.getTallas().stream()
                .sorted(Comparator.comparing(ProductoTalla::getTalla, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        List<TallaDisponibilidad> tallas = crearTallas(producto, tallasOrdenadas);

        MatchingScore matchingScore = calcularScore(producto, tallasOrdenadas, eventKey, styleKey, colorKey,
                tallaSolicitada, comfortPriority, gender);

        boolean hayFiltrosActivos = StringUtils.hasText(eventKey) || StringUtils.hasText(styleKey)
                || StringUtils.hasText(colorKey) || StringUtils.hasText(tallaSolicitada)
                || StringUtils.hasText(comfortPriority) || StringUtils.hasText(gender);

        if (hayFiltrosActivos && matchingScore.coincidencias().isEmpty()) {
            return null;
        }

        List<String> etiquetas = construirEtiquetasProducto(producto, etiquetasConfiguradas, eventKey, styleKey,
                colorKey, gender, matchingScore);

        AiRecommendationResponse respuesta = new AiRecommendationResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getCategoria() != null ? producto.getCategoria().getNombre() : null,
                producto.getColor(),
                matchingScore.estiloPrincipal(),
                producto.getTipo(),
                resolverPrecioReferencia(producto, tallas),
                null,
                true,
                tallas,
                producto.getImagen(),
                matchingScore.coincidencias(),
                etiquetas,
                matchingScore.score(),
                matchingScore.tallaDisponible());

        return new Candidate(respuesta, matchingScore.score());
    }

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
                return true;
            }
        }
        return false;
    }

    private List<TallaDisponibilidad> crearTallas(Producto producto, List<ProductoTalla> tallasOrdenadas) {
        if (!tallasOrdenadas.isEmpty()) {
            return tallasOrdenadas.stream()
                    .map(t -> new TallaDisponibilidad(
                            t.getTalla(),
                            normalizarPrecio(t.getPrecioVenta(), producto.getPrecioVenta()),
                            null))
                    .toList();
        }

        BigDecimal referencia = normalizarPrecio(producto.getPrecioVenta(), BigDecimal.ZERO);
        return List.of(new TallaDisponibilidad("Única", referencia, null));
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
            String eventKey,
            String styleKey,
            String colorKey,
            String tallaSolicitada,
            String comfortPriority,
            String gender) {

        double score = 10d;
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
            Set<String> tallasProducto = tallas.stream()
                    .map(ProductoTalla::getTalla)
                    .map(AiRecommendationService::normalizarTalla)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            if (tallasProducto.contains(tallaSolicitada)) {
                tallaDisponible = true;
                score += 12;
                coincidencias.add("Incluye talla " + denormalizarTalla(tallaSolicitada));
            } else {
                score -= 8;
            }
        }

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
                case "medium" -> score += 2;
                case "low" -> {
                    if (coincideCon(textoProducto, LOW_COMFORT_PRIORITY_KEYWORDS)) {
                        score += 6;
                    }
                }
                default -> {
                    // sin ajustes
                }
            }
        }

        score = Math.max(0, score);

        return new MatchingScore(score, List.copyOf(coincidencias), estiloPrincipal, tallaDisponible);
    }

    private List<String> construirEtiquetasProducto(Producto producto,
            List<String> etiquetasConfiguradas,
            String eventKey,
            String styleKey,
            String colorKey,
            String gender,
            MatchingScore matchingScore) {

        Set<String> etiquetas = new LinkedHashSet<>();
        agregarEtiqueta(etiquetas, producto.getNombre());
        agregarEtiqueta(etiquetas, producto.getCategoria() != null ? producto.getCategoria().getNombre() : null);
        agregarEtiqueta(etiquetas, producto.getColor());
        agregarEtiqueta(etiquetas, producto.getTipo());

        producto.getTiposProducto().stream()
                .map(Tipo::getNombre)
                .forEach(valor -> agregarEtiqueta(etiquetas, valor));

        if (etiquetasConfiguradas != null) {
            etiquetasConfiguradas.forEach(valor -> agregarEtiqueta(etiquetas, valor));
        }

        agregarEtiqueta(etiquetas, eventKey);
        agregarEtiqueta(etiquetas, styleKey);
        agregarEtiqueta(etiquetas, colorKey);
        agregarEtiqueta(etiquetas, gender);
        agregarEtiqueta(etiquetas, matchingScore.estiloPrincipal());

        matchingScore.coincidencias().forEach(valor -> agregarEtiqueta(etiquetas, valor));

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

    private record MatchingScore(double score, List<String> coincidencias, String estiloPrincipal,
            boolean tallaDisponible) {
    }

    private record Candidate(AiRecommendationResponse respuesta, double score) {
    }
}
