package fisi.software.detalles.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReniecService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String baseUrl;
    private final String token;
    private final String pathTemplate;
    private static final Pattern DIGITS = Pattern.compile("\\d+");
    private final Logger log = LoggerFactory.getLogger(ReniecService.class);

    // Simple in-memory cache to avoid repeating lookups in a short period
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final long ttlMillis = 5 * 60 * 1000; // 5 minutes

    public ReniecService(@Value("${reniec.api.base-url:}") String baseUrl,
                         @Value("${reniec.api.token:}") String token,
                         @Value("${reniec.api.path-template:}") String pathTemplate) {
        String b = baseUrl != null ? baseUrl.trim() : "";
        // normalize: remove trailing slash to avoid double slashes when pathTemplate starts with '/'
        if (b.endsWith("/")) b = b.substring(0, b.length() - 1);
        this.baseUrl = b;
        this.token = token != null ? token.trim() : "";
        this.pathTemplate = pathTemplate != null ? pathTemplate.trim() : "";
    }

    public Map<String, Object> lookup(String tipo, String numero) {
        if (baseUrl == null || baseUrl.isEmpty()) {
            throw new IllegalStateException("reniec.api.base-url no está configurada. Agrega reniec.api.base-url en application.properties");
        }

        String normalizedTipo = normalizarTipo(tipo);
        String normalizedNumero = normalizarNumero(normalizedTipo, numero);
        final String key = (normalizedTipo + ':' + normalizedNumero).toLowerCase(Locale.ROOT);

        // Check cache
        CacheEntry cached = cache.get(key);
        if (cached != null && Instant.now().toEpochMilli() - cached.timestamp <= ttlMillis) {
            return cached.data;
        }

        // Build URL: prefer explicit path-template property when present
        String url = null;
        if (pathTemplate != null && !pathTemplate.isEmpty()) {
            try {
                String pt = pathTemplate.startsWith("/") ? pathTemplate : "/" + pathTemplate;
                UriComponentsBuilder b = UriComponentsBuilder.fromUriString(baseUrl).path(pt);
                if (pt.contains("{")) {
                    // replace named placeholders like {numero} and {tipo}
                    url = b.buildAndExpand(Map.of(
                        "numero", normalizedNumero,
                        "tipo", resolveTipoPathToken(normalizedTipo)
                    )).toUriString();
                } else {
                    // no placeholders: append as query params
                    url = b
                        .queryParam("tipo", normalizedTipo)
                        .queryParam("numero", normalizedNumero)
                        .toUriString();
                }
            } catch (Exception ex) {
                log.warn("Fallo al construir la URL con pathTemplate={}, fallback a heurística. Error={}", pathTemplate, ex.toString());
                url = null; // fallthrough to fallback heuristics below
            }
        }

        // Fallback heuristics (backwards-compatible)
        if (url == null) {
            url = baseUrl;

            // If baseUrl contains a placeholder for the number (e.g. https://api/consulta/{numero}) replace it
            if (url.contains("{numero}")) {
                url = url
                    .replace("{numero}", normalizedNumero)
                    .replace("{tipo}", resolveTipoPathToken(normalizedTipo));

            // If provider expects a path like /dni/{numero} and baseUrl looks like a v1 root
            } else if (url.endsWith("/v1") || url.endsWith("/v1/") || url.contains("/dni") || url.contains("/ruc")) {
                String sanitized = removeTrailingSlash(url);
                String lastSegment = extraerUltimoSegmento(sanitized);

                if ("dni".equals(lastSegment) || "ruc".equals(lastSegment)) {
                    url = ensureEndsWithSlash(sanitized) + normalizedNumero;
                } else {
                    url = ensureEndsWithSlash(sanitized)
                        + resolveTipoPathToken(normalizedTipo)
                        + "/"
                        + normalizedNumero;
                }

            } else {
                // Default: append as query parameters tipo & numero
                if (!url.contains("?")) {
                    url = url + "?tipo=" + normalizedTipo + "&numero=" + normalizedNumero;
                } else {
                    url = url + "&tipo=" + normalizedTipo + "&numero=" + normalizedNumero;
                }
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("Accept", "application/json");
        if (token != null && !token.isEmpty()) {
            // Common convention: Bearer <token>
            headers.add("Authorization", "Bearer " + token);
        }

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            log.debug("Calling RENIEC provider url={} tipo={} numero={}", url, normalizedTipo, normalizedNumero);
            ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    request,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> body = resp.getBody();
            if (body != null) {
                cache.put(key, new CacheEntry(Instant.now().toEpochMilli(), body));
            }
            return body;
        } catch (RestClientException ex) {
            log.error("Error calling RENIEC provider url={} tipo={} numero={}: {}", url, normalizedTipo, normalizedNumero, ex.toString());
            return null;
        }
    }

    private String normalizarTipo(String tipo) {
        if (tipo == null || tipo.trim().isEmpty()) {
            throw new IllegalArgumentException("El parámetro 'tipo' es obligatorio (DNI o RUC)");
        }
        String normalized = tipo.trim().toUpperCase(Locale.ROOT);
        if (!Objects.equals(normalized, "DNI") && !Objects.equals(normalized, "RUC")) {
            throw new IllegalArgumentException("Tipo de documento no soportado: " + normalized + ". Usa DNI o RUC.");
        }
        return normalized;
    }

    private String normalizarNumero(String tipo, String numero) {
        if (numero == null || numero.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de documento es obligatorio");
        }
        String trimmed = numero.trim();
        if (!DIGITS.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("El número de documento solo debe contener dígitos");
        }
        if ("DNI".equals(tipo) && trimmed.length() != 8) {
            throw new IllegalArgumentException("El DNI debe tener 8 dígitos");
        }
        if ("RUC".equals(tipo) && trimmed.length() != 11) {
            throw new IllegalArgumentException("El RUC debe tener 11 dígitos");
        }
        return trimmed;
    }

    private String resolveTipoPathToken(String normalizedTipo) {
        return normalizedTipo.toLowerCase(Locale.ROOT);
    }

    private String removeTrailingSlash(String value) {
        if (value == null || value.length() < 2) {
            return value;
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String ensureEndsWithSlash(String value) {
        if (value == null || value.isEmpty()) {
            return "/";
        }
        return value.endsWith("/") ? value : value + "/";
    }

    private String extraerUltimoSegmento(String url) {
        if (url == null || url.isEmpty()) {
            return "";
        }
        int lastSlash = url.lastIndexOf('/');
        if (lastSlash == -1 || lastSlash == url.length() - 1) {
            return url.toLowerCase(Locale.ROOT);
        }
        return url.substring(lastSlash + 1).toLowerCase(Locale.ROOT);
    }

    private static class CacheEntry {
        final long timestamp;
        final Map<String, Object> data;

        CacheEntry(long timestamp, Map<String, Object> data) {
            this.timestamp = timestamp;
            this.data = data;
        }
    }
}
