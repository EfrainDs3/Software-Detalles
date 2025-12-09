package fisi.software.detalles.service.external;

import java.net.URI;
import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import fisi.software.detalles.controller.dto.AiContextResponse.HolidayContext;
import fisi.software.detalles.controller.dto.AiContextResponse.HolidayInfo;
import fisi.software.detalles.exception.ExternalServiceException;

/**
 * Cliente para obtener los feriados públicos de Perú utilizando la API pública
 * de Nager.Date.
 */
@Service
public class HolidayService {

    private static final Logger LOGGER = LoggerFactory.getLogger(HolidayService.class);
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String countryCode;
    private final ZoneId zoneId;
    private Clock clock;

    public HolidayService(RestTemplateBuilder restTemplateBuilder,
            @Value("${detalles.ai.holiday.base-url}") String baseUrl,
            @Value("${detalles.ai.holiday.country:PE}") String countryCode,
            @Value("${detalles.ai.holiday.timezone:America/Lima}") String timezoneId) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(java.time.Duration.ofSeconds(5))
                .setReadTimeout(java.time.Duration.ofSeconds(7))
                .build();
        this.baseUrl = baseUrl;
        this.countryCode = countryCode;
        this.zoneId = ZoneId.of(timezoneId);
        this.clock = Clock.system(this.zoneId);
    }

    public HolidayContext obtenerContexto() {
        try {
            LocalDate today = LocalDate.now(clock);
            List<PublicHoliday> currentYear = obtenerFeriados(today.getYear());
            List<PublicHoliday> nextYear = today.getMonthValue() == 12 ? obtenerFeriados(today.plusYears(1).getYear())
                    : List.of();

            PublicHoliday todayHoliday = currentYear.stream()
                    .filter(holiday -> holiday.date.equals(today))
                    .findFirst()
                    .orElse(null);

            PublicHoliday upcoming = encontrarProximoFeriado(today, currentYear, nextYear);
            PublicHoliday longWeekend = obtenerProximoLongWeekend(today);

            HolidayInfo todayInfo = todayHoliday != null ? mapToInfo(todayHoliday, today) : null;
            HolidayInfo upcomingInfo = upcoming != null ? mapToInfo(upcoming, today) : null;
            HolidayInfo longWeekendInfo = longWeekend != null ? mapToInfo(longWeekend, today) : null;

            String narrative = construirNarrativa(todayInfo, upcomingInfo);

            return new HolidayContext(todayInfo, upcomingInfo, longWeekendInfo, narrative);
        } catch (RestClientException ex) {
            LOGGER.error("Error al consultar Nager.Date", ex);
            throw new ExternalServiceException("No se pudo obtener la información de feriados para Perú", ex);
        }
    }

    /**
     * Permite fijar el reloj utilizado para calcular la fecha actual. Útil en pruebas.
     */
    void setClock(Clock clock) {
        this.clock = clock == null ? Clock.system(this.zoneId) : clock;
    }

    private List<PublicHoliday> obtenerFeriados(int year) {
        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .pathSegment("PublicHolidays", String.valueOf(year), countryCode)
            .build()
            .toUri();

        ResponseEntity<PublicHoliday[]> response = restTemplate.exchange(uri, HttpMethod.GET, null,
            PublicHoliday[].class);

        PublicHoliday[] body = response.getBody();
        return body != null ? Arrays.asList(body) : List.of();
    }

    private PublicHoliday obtenerProximoLongWeekend(LocalDate today) {
        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .pathSegment("LongWeekend", String.valueOf(today.getYear()), countryCode)
            .build()
            .toUri();

        ResponseEntity<LongWeekend[]> response = restTemplate.exchange(uri, HttpMethod.GET, null,
            LongWeekend[].class);

        LongWeekend[] body = response.getBody();
        if (body == null || body.length == 0) {
            return null;
        }

        return Arrays.stream(body)
            .filter(weekend -> weekend.start != null)
            .filter(weekend -> !weekend.start.isBefore(today))
            .map(LongWeekend::toHoliday)
                .min(Comparator.comparing(holiday -> holiday.date))
                .orElse(null);
    }

    private PublicHoliday encontrarProximoFeriado(LocalDate today, List<PublicHoliday> currentYear,
            List<PublicHoliday> nextYear) {
        Optional<PublicHoliday> upcomingThisYear = currentYear.stream()
                .filter(holiday -> holiday.date.isAfter(today))
                .min(Comparator.comparing(holiday -> holiday.date));

        if (upcomingThisYear.isPresent()) {
            return upcomingThisYear.get();
        }

        return nextYear.stream()
                .filter(holiday -> holiday.date.isAfter(today))
                .min(Comparator.comparing(holiday -> holiday.date))
                .orElse(null);
    }

    private HolidayInfo mapToInfo(PublicHoliday holiday, LocalDate today) {
        Integer daysUntil = null;
        if (!holiday.date.isBefore(today)) {
            daysUntil = Period.between(today, holiday.date).getDays();
        }
        String narrative = construirNarrativa(holiday, today);
        return new HolidayInfo(
                ISO_DATE.format(holiday.date),
                holiday.localName,
                holiday.name,
                holiday.types != null && Arrays.asList(holiday.types).contains("Public"),
                Boolean.TRUE.equals(holiday.global),
                daysUntil,
                narrative);
    }

    private String construirNarrativa(HolidayInfo todayInfo, HolidayInfo upcomingInfo) {
        StringBuilder sb = new StringBuilder("Calendario de festividades Perú (Tarapoto)");
        if (todayInfo != null) {
            sb.append(": hoy se celebra ");
            sb.append(todayInfo.localName() != null ? todayInfo.localName() : todayInfo.englishName());
            sb.append('.');
        } else {
            sb.append(": hoy no hay feriado oficial.");
        }
        if (upcomingInfo != null) {
            sb.append(' ');
            sb.append("El siguiente feriado es ");
            sb.append(upcomingInfo.localName() != null ? upcomingInfo.localName() : upcomingInfo.englishName());
            sb.append(" (" + upcomingInfo.date() + ")");
            if (upcomingInfo.daysUntil() != null) {
                sb.append(", en ").append(upcomingInfo.daysUntil()).append(" día");
                if (upcomingInfo.daysUntil() != null && upcomingInfo.daysUntil() != 1) {
                    sb.append('s');
                }
            }
            sb.append('.');
        }
        return sb.toString();
    }

    private String construirNarrativa(PublicHoliday holiday, LocalDate today) {
        StringBuilder sb = new StringBuilder();
        sb.append(holiday.localName != null ? holiday.localName : holiday.name);
        sb.append(" el ").append(ISO_DATE.format(holiday.date));
        if (!holiday.date.isBefore(today)) {
            int days = Period.between(today, holiday.date).getDays();
            if (days > 0) {
                sb.append(", faltan ").append(days).append(" día");
                if (days != 1) {
                    sb.append('s');
                }
            } else {
                sb.append(", se celebra hoy");
            }
        }
        sb.append('.');
        return sb.toString();
    }

    private record PublicHoliday(LocalDate date,
            String localName,
            String name,
            String countryCode,
            Boolean fixed,
            Boolean global,
            String[] counties,
            String launchYear,
            String[] types) {
    }

    private record LongWeekend(LocalDate start, LocalDate end, Integer dayCount) {
        private PublicHoliday toHoliday() {
            String name = "Fin de semana largo";
            String localName = "Fin de semana largo";
            return new PublicHoliday(start, localName, name, null, null, Boolean.TRUE, null, null,
                    new String[] { "Public" });
        }
    }
}
