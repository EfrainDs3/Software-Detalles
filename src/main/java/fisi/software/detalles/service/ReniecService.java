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
import java.util.Map;
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

        final String key = (tipo + ":" + numero).toLowerCase();

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
                UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(baseUrl).path(pt);
                if (pt.contains("{")) {
                    // replace named placeholders like {numero} and {tipo}
                    url = b.buildAndExpand(Map.of("numero", numero, "tipo", tipo)).toUriString();
                } else {
                    // no placeholders: append as query params
                    url = b.queryParam("tipo", tipo).queryParam("numero", numero).toUriString();
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
                url = url.replace("{numero}", numero).replace("{tipo}", tipo);

            // If provider expects a path like /dni/{numero} and baseUrl looks like a v1 root
            } else if (url.endsWith("/v1") || url.endsWith("/v1/") || url.contains("/dni") || url.contains("/ruc")) {
                // prefer explicit path for DNI
                if ("DNI".equalsIgnoreCase(tipo)) {
                    if (!url.endsWith("/")) url = url + "/";
                    url = url + "dni/" + numero;
                } else if ("RUC".equalsIgnoreCase(tipo)) {
                    if (!url.endsWith("/")) url = url + "/";
                    url = url + "ruc/" + numero;
                } else {
                    // fallback to query params
                    if (!url.contains("?")) url = url + "?tipo=" + tipo + "&numero=" + numero;
                    else url = url + "&tipo=" + tipo + "&numero=" + numero;
                }

            } else {
                // Default: append as query parameters tipo & numero
                if (!url.contains("?")) {
                    url = url + "?tipo=" + tipo + "&numero=" + numero;
                } else {
                    url = url + "&tipo=" + tipo + "&numero=" + numero;
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
            log.debug("Calling RENIEC provider url={}", url);
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
            log.error("Error calling RENIEC provider url={}: {}", url, ex.toString());
            // Do not throw raw RuntimeException with stacktrace to avoid bubbling unexpected 500s to UI
            // Return null so controller can respond with an empty object or controlled error
            return null;
        }
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
