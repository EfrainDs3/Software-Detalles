package fisi.software.detalles.service.external;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

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

import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext.DailyForecast;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext.HourlyForecast;
import fisi.software.detalles.exception.ExternalServiceException;

/**
 * Cliente para recuperar el pronóstico de las próximas horas y días usando el
 * endpoint de OpenWeatherMap "forecast" (bloques de 3 horas).
 */
@Service
public class WeatherForecastService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WeatherForecastService.class);
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Lima");
    private static final Locale LOCALE_ES = new Locale("es", "PE");
    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", LOCALE_ES);

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;
    private final double latitude;
    private final double longitude;
    private final String units;
    private final String language;
    private final int horizonHours;
    private final int horizonDays;
    private final long cacheMillis;

    private final AtomicReference<CachedForecast> cache = new AtomicReference<>();

    public WeatherForecastService(RestTemplateBuilder restTemplateBuilder,
            @Value("${detalles.ai.weather.forecast-base-url}") String baseUrl,
            @Value("${detalles.ai.weather.api-key:}") String apiKey,
            @Value("${detalles.ai.weather.lat}") double latitude,
            @Value("${detalles.ai.weather.lon}") double longitude,
            @Value("${detalles.ai.weather.units:metric}") String units,
            @Value("${detalles.ai.weather.lang:es}") String language,
            @Value("${detalles.ai.weather.forecast-hours:6}") int horizonHours,
            @Value("${detalles.ai.weather.forecast-days:3}") int horizonDays,
            @Value("${detalles.ai.weather.forecast-cache-minutes:60}") long cacheMinutes) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(7))
                .build();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.latitude = latitude;
        this.longitude = longitude;
        this.units = units;
        this.language = language;
        this.horizonHours = Math.max(1, horizonHours);
        this.horizonDays = Math.max(1, horizonDays);
        this.cacheMillis = Duration.ofMinutes(Math.max(5, cacheMinutes)).toMillis();
    }

    public WeatherForecastContext obtenerPronostico() {
        if (!StringUtils.hasText(apiKey)) {
            throw new ExternalServiceException("No se ha configurado la API Key de OpenWeatherMap para pronóstico");
        }

        long now = System.currentTimeMillis();
        CachedForecast cached = cache.get();
        if (cached != null && now - cached.timestamp <= cacheMillis) {
            return cached.context;
        }

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("units", units)
                    .queryParam("lang", language)
                    .queryParam("appid", apiKey)
                    .build(true)
                    .toUri();

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(uri, JsonNode.class);
            JsonNode body = response.getBody();
            if (body == null || !body.has("list")) {
                throw new ExternalServiceException("El servicio de pronóstico devolvió una respuesta vacía");
            }

            WeatherForecastContext context = construirContexto(body);
            cache.set(new CachedForecast(context, now));
            return context;
        } catch (RestClientException ex) {
            LOGGER.error("Error al consultar el pronóstico de OpenWeatherMap", ex);
            throw new ExternalServiceException("No se pudo obtener el pronóstico del clima", ex);
        }
    }

    private WeatherForecastContext construirContexto(JsonNode root) {
        List<JsonNode> entries = new ArrayList<>();
        root.withArray("list").forEach(node -> entries.add(node));
        if (entries.isEmpty()) {
            throw new ExternalServiceException("El servicio de pronóstico no devolvió bloques de datos");
        }

        List<HourlyForecast> nextHours = construirPronosticoHoras(entries);
        List<DailyForecast> nextDays = construirPronosticoDias(entries);

        String narrative = construirNarrativa(nextDays);
        return new WeatherForecastContext(nextHours, nextDays, narrative);
    }

    private List<HourlyForecast> construirPronosticoHoras(List<JsonNode> entries) {
        return entries.stream()
                .limit(horizonHours)
                .map(this::mapToHourly)
                .filter(Objects::nonNull)
                .toList();
    }

    private List<DailyForecast> construirPronosticoDias(List<JsonNode> entries) {
        Map<LocalDate, List<JsonNode>> porDia = new LinkedHashMap<>();
        for (JsonNode node : entries) {
            HourlyForecast hourly = mapToHourly(node);
            if (hourly == null) {
                continue;
            }
            LocalDate date = hourly.timestamp().toLocalDate();
            if (date.isBefore(LocalDate.now(DEFAULT_ZONE))) {
                continue;
            }
            porDia.computeIfAbsent(date, key -> new ArrayList<>()).add(node);
        }

        return porDia.entrySet().stream()
                .map(entry -> mapToDaily(entry.getKey(), entry.getValue()))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(DailyForecast::date))
                .limit(horizonDays)
                .toList();
    }

    private HourlyForecast mapToHourly(JsonNode node) {
        long epochSeconds = node.path("dt").asLong(0);
        if (epochSeconds <= 0) {
            return null;
        }
        OffsetDateTime timestamp = OffsetDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), DEFAULT_ZONE);

        JsonNode main = node.path("main");
        Double temperature = toDouble(main.path("temp"));
        Double humidity = toDouble(main.path("humidity"));
        JsonNode weatherInfo = node.path("weather").isArray() && node.path("weather").size() > 0
                ? node.path("weather").get(0)
                : null;
        String description = weatherInfo != null ? normalizeSentence(weatherInfo.path("description").asText(null)) : null;
        String icon = weatherInfo != null ? weatherInfo.path("icon").asText(null) : null;
        Double pop = toDouble(node.path("pop"));

        Double precipitation = Optional.ofNullable(node.path("rain"))
                .filter(JsonNode::isObject)
                .map(rain -> toDouble(rain.path("3h")))
                .orElse(null);

        return new HourlyForecast(timestamp, temperature, humidity, description, icon, percentage(pop), precipitation);
    }

    private DailyForecast mapToDaily(LocalDate date, List<JsonNode> nodes) {
        if (nodes == null || nodes.isEmpty()) {
            return null;
        }

        double minTemp = nodes.stream()
                .map(node -> toDouble(node.path("main").path("temp_min")))
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(Double.NaN);

        double maxTemp = nodes.stream()
                .map(node -> toDouble(node.path("main").path("temp_max")))
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(Double.NaN);

        double avgHumidity = nodes.stream()
                .map(node -> toDouble(node.path("main").path("humidity")))
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(Double.NaN);

        double avgPop = nodes.stream()
                .map(node -> toDouble(node.path("pop")))
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(Double.NaN);

        Map<String, Long> descriptionCount = nodes.stream()
                .map(node -> node.path("weather"))
                .filter(JsonNode::isArray)
                .flatMap(array -> {
                    List<JsonNode> list = new ArrayList<>();
                    array.forEach(list::add);
                    return list.stream();
                })
                .map(item -> normalizeSentence(item.path("description").asText(null)))
                .filter(StringUtils::hasText)
                .collect(Collectors.groupingBy(desc -> desc, LinkedHashMap::new, Collectors.counting()));

        String dominantDescription = descriptionCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        String icon = nodes.stream()
                .map(node -> node.path("weather"))
                .filter(JsonNode::isArray)
                .flatMap(array -> {
                    List<JsonNode> list = new ArrayList<>();
                    array.forEach(list::add);
                    return list.stream();
                })
                .map(item -> item.path("icon").asText(null))
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse(null);

        Double precipitation = nodes.stream()
                .map(node -> Optional.ofNullable(node.path("rain"))
                        .filter(JsonNode::isObject)
                        .map(rain -> toDouble(rain.path("3h")))
                        .orElse(null))
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();

        return new DailyForecast(date, toNullable(minTemp), toNullable(maxTemp), toNullable(avgHumidity),
                percentage(avgPop), dominantDescription, icon, toNullable(precipitation));
    }

    private String construirNarrativa(List<DailyForecast> nextDays) {
        if (nextDays == null || nextDays.isEmpty()) {
            return null;
        }
        StringBuilder sb = new StringBuilder("Pronóstico próximos días: ");
        sb.append(nextDays.stream()
                .map(day -> {
                    StringBuilder line = new StringBuilder();
                    line.append(formatDay(day.date())).append(':');
                    if (StringUtils.hasText(day.description())) {
                        line.append(' ').append(day.description());
                    }
                    if (day.minTemperatureC() != null && day.maxTemperatureC() != null) {
                        line.append(" (min ")
                                .append(String.format(Locale.ROOT, "%.0f", day.minTemperatureC()))
                                .append(" °C, max ")
                                .append(String.format(Locale.ROOT, "%.0f", day.maxTemperatureC()))
                                .append(" °C)");
                    }
                    if (day.precipitationProbability() != null) {
                        line.append(", lluvia ")
                                .append(String.format(Locale.ROOT, "%.0f%%", day.precipitationProbability()));
                    }
                    return line.toString();
                })
                .collect(Collectors.joining(" | ")));
        return sb.toString();
    }

    private static String normalizeSentence(String text) {
        if (!StringUtils.hasText(text)) {
            return null;
        }
        String trimmed = text.trim();
        return trimmed.isEmpty() ? null : Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1);
    }

    private static Double toDouble(JsonNode node) {
        return node != null && node.isNumber() ? node.asDouble() : null;
    }

    private static Double toNullable(double value) {
        return Double.isNaN(value) ? null : value;
    }

    private static Double percentage(Double value) {
        if (value == null || Double.isNaN(value)) {
            return null;
        }
        double percent = Math.max(0d, Math.min(100d, value * 100d));
        return Double.valueOf(percent);
    }

    private static String formatDay(LocalDate date) {
        try {
            return DAY_FORMAT.format(date);
        } catch (Exception ex) {
            return date.toString();
        }
    }

    private record CachedForecast(WeatherForecastContext context, long timestamp) {
    }
}
