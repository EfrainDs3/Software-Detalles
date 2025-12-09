package fisi.software.detalles.service.external;

import java.net.URI;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import fisi.software.detalles.controller.dto.AiContextResponse.WeatherContext;
import fisi.software.detalles.exception.ExternalServiceException;

/**
 * Cliente especializado para recuperar las condiciones climáticas actuales en
 * Tarapoto (Perú) usando OpenWeatherMap.
 */
@Service
public class WeatherService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WeatherService.class);
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Lima");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final String apiKey;
    private final String city;
    private final String country;
    private final String units;
    private final String language;

    public WeatherService(RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${detalles.ai.weather.base-url}") String baseUrl,
            @Value("${detalles.ai.weather.api-key:}") String apiKey,
            @Value("${detalles.ai.weather.city:Tarapoto}") String city,
            @Value("${detalles.ai.weather.country:PE}") String country,
            @Value("${detalles.ai.weather.units:metric}") String units,
            @Value("${detalles.ai.weather.lang:es}") String language) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(java.time.Duration.ofSeconds(5))
                .setReadTimeout(java.time.Duration.ofSeconds(7))
                .build();
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.city = city;
        this.country = country;
        this.units = units;
        this.language = language;
    }

    public WeatherContext obtenerClimaActual() {
        if (!StringUtils.hasText(apiKey)) {
            throw new ExternalServiceException("No se ha configurado la API Key de OpenWeatherMap");
        }

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .queryParam("q", city + "," + country)
                    .queryParam("units", units)
                    .queryParam("lang", language)
                    .queryParam("appid", apiKey)
                    .build(true)
                    .toUri();

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(uri, JsonNode.class);
            JsonNode body = response.getBody();
            if (body == null) {
                throw new ExternalServiceException("El servicio de clima devolvió una respuesta vacía");
            }

            String description = body.path("weather").path(0).path("description").asText(null);
            Double temperature = safeDouble(body.path("main").path("temp"));
            Double feelsLike = safeDouble(body.path("main").path("feels_like"));
            Integer humidity = safeInt(body.path("main").path("humidity"));
            Double windSpeed = safeDouble(body.path("wind").path("speed"));
            String icon = body.path("weather").path(0).path("icon").asText(null);

            String narrative = construirNarrativa(description, temperature, feelsLike, humidity, windSpeed);

            return new WeatherContext(
                    "OpenWeatherMap",
                    city,
                    country,
                    normalizeSentence(description),
                    temperature,
                    feelsLike,
                    humidity,
                    windSpeed,
                    icon,
                    narrative);
        } catch (RestClientException ex) {
            LOGGER.error("Error al consultar OpenWeatherMap", ex);
            throw new ExternalServiceException("No se pudo obtener el clima actual de Tarapoto", ex);
        }
    }

    private String construirNarrativa(String description, Double temperature, Double feelsLike,
            Integer humidity, Double windSpeed) {
        StringBuilder sb = new StringBuilder("Condiciones climáticas en Tarapoto");
        if (StringUtils.hasText(description)) {
            sb.append(": ").append(normalizeSentence(description));
        } else {
            sb.append(": sin descripción disponible");
        }
        if (temperature != null) {
            sb.append(", temperatura ").append(String.format(java.util.Locale.ROOT, "%.1f", temperature)).append(" °C");
        }
        if (feelsLike != null) {
            sb.append(" (sensación ").append(String.format(java.util.Locale.ROOT, "%.1f", feelsLike)).append(" °C)");
        }
        if (humidity != null) {
            sb.append(", humedad ").append(humidity).append('%');
        }
        if (windSpeed != null) {
            sb.append(", viento ").append(String.format(java.util.Locale.ROOT, "%.1f", windSpeed)).append(" m/s");
        }
        sb.append('.');
        return sb.toString();
    }

    private static Double safeDouble(JsonNode node) {
        return node != null && node.isNumber() ? node.asDouble() : null;
    }

    private static Integer safeInt(JsonNode node) {
        return node != null && node.isInt() ? node.asInt() : node != null && node.isNumber() ? node.asInt() : null;
    }

    private static String normalizeSentence(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String trimmed = text.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        return Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1);
    }
}
