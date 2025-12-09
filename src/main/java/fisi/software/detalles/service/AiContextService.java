package fisi.software.detalles.service;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import fisi.software.detalles.controller.dto.AiContextResponse;
import fisi.software.detalles.controller.dto.AiContextResponse.HolidayContext;
import fisi.software.detalles.controller.dto.AiContextResponse.HolidayInfo;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherContext;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext;
import fisi.software.detalles.exception.ExternalServiceException;
import fisi.software.detalles.service.external.HolidayService;
import fisi.software.detalles.service.external.WeatherForecastService;
import fisi.software.detalles.service.external.WeatherService;

/**
 * Orquesta la información contextual que consume el asistente IA combinando
 * clima y festividades.
 */
@Service
public class AiContextService {

    private static final ZoneId LIMA_ZONE = ZoneId.of("America/Lima");
    private static final Logger LOGGER = LoggerFactory.getLogger(AiContextService.class);

    private final WeatherService weatherService;
    private final HolidayService holidayService;
    private final WeatherForecastService weatherForecastService;

    public AiContextService(WeatherService weatherService,
            HolidayService holidayService,
            WeatherForecastService weatherForecastService) {
        this.weatherService = weatherService;
        this.holidayService = holidayService;
        this.weatherForecastService = weatherForecastService;
    }

    public AiContextResponse obtenerContexto() {
        WeatherContext weather = null;
        HolidayContext holidays = null;
        WeatherForecastContext forecast = null;
        ExternalServiceException weatherError = null;
        ExternalServiceException holidayError = null;
        ExternalServiceException forecastError = null;

        try {
            weather = weatherService.obtenerClimaActual();
        } catch (ExternalServiceException ex) {
            weatherError = ex;
            LOGGER.warn("No se pudo obtener el clima actual", ex);
        }

        try {
            holidays = holidayService.obtenerContexto();
        } catch (ExternalServiceException ex) {
            holidayError = ex;
            LOGGER.warn("No se pudo obtener la información de festividades", ex);
        }

        try {
            forecast = weatherForecastService.obtenerPronostico();
        } catch (ExternalServiceException ex) {
            forecastError = ex;
            LOGGER.warn("No se pudo obtener el pronóstico del clima", ex);
        }

        if (weather == null && holidays == null && forecast == null) {
            String weatherMsg = weatherError != null ? weatherError.getMessage() : "";
            String holidayMsg = holidayError != null ? holidayError.getMessage() : "";
            String forecastMsg = forecastError != null ? forecastError.getMessage() : "";
            String message = String.join(" ", weatherMsg, holidayMsg, forecastMsg).trim();
            if (!org.springframework.util.StringUtils.hasText(message)) {
                message = "No se pudo recuperar el contexto situacional";
            }
            throw new ExternalServiceException(message,
                    forecastError != null ? forecastError
                            : holidayError != null ? holidayError
                                    : weatherError);
        }

        String narrative = construirNarrativa(weather, holidays, forecast);

        return new AiContextResponse(
                OffsetDateTime.now(LIMA_ZONE),
                weather,
                holidays,
                forecast,
                narrative);
    }

    private String construirNarrativa(WeatherContext weather, HolidayContext holidays, WeatherForecastContext forecast) {
        StringBuilder sb = new StringBuilder();
        if (weather != null && weather.narrative() != null) {
            sb.append(weather.narrative()).append(' ');
        }
        if (holidays != null && holidays.narrative() != null) {
            sb.append(holidays.narrative());
        }
        if (forecast != null && forecast.narrative() != null) {
            sb.append(forecast.narrative());
        }
        return sb.toString().trim();
    }
}
