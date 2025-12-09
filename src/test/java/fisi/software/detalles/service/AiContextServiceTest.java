package fisi.software.detalles.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import fisi.software.detalles.controller.dto.AiContextResponse;
import fisi.software.detalles.controller.dto.AiContextResponse.HolidayContext;
import fisi.software.detalles.controller.dto.AiContextResponse.HolidayInfo;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherContext;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext.DailyForecast;
import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext.HourlyForecast;
import fisi.software.detalles.exception.ExternalServiceException;
import fisi.software.detalles.service.external.HolidayService;
import fisi.software.detalles.service.external.WeatherForecastService;
import fisi.software.detalles.service.external.WeatherService;

@ExtendWith(MockitoExtension.class)
class AiContextServiceTest {

    @Mock
    private WeatherService weatherService;

    @Mock
    private HolidayService holidayService;

    @Mock
    private WeatherForecastService weatherForecastService;

    @InjectMocks
    private AiContextService aiContextService;

    private WeatherContext sampleWeather;
    private HolidayContext sampleHoliday;
    private WeatherForecastContext sampleForecast;

    @BeforeEach
    void setUp() {
        sampleWeather = new WeatherContext(
                "OpenWeatherMap",
                "Tarapoto",
                "PE",
                "Cielo nublado",
                31.0,
                32.0,
                70,
                4.2,
                "10d",
                "Condiciones climáticas en Tarapoto: Cielo nublado, temperatura 31.0 °C (sensación 32.0 °C), humedad 70%, viento 4.2 m/s.");

        HolidayInfo today = new HolidayInfo("2025-06-24", "Fiesta local", "Local Celebration", true, false, 0,
                "Fiesta local el 2025-06-24, se celebra hoy.");
        sampleHoliday = new HolidayContext(today, null, null, "Calendario de festividades Perú (Tarapoto): hoy se celebra Fiesta local.");

        HourlyForecast nextHour = new HourlyForecast(OffsetDateTime.now().plusHours(3), 30.5, 75d,
            "Cielo cubierto", "04d", 40d, 0.5d);
        DailyForecast nextDay = new DailyForecast(LocalDate.now().plusDays(1), 24d, 31d, 80d, 60d,
            "Lluvia ligera", "10d", 5d);
        sampleForecast = new WeatherForecastContext(List.of(nextHour), List.of(nextDay),
            "Pronóstico próximos días: martes 9 de diciembre: Lluvia ligera (min 24 °C, max 31 °C).");
    }

    @Test
    void obtenerContexto_combinaClimaYFestividadesCuandoAmbosExitosos() {
        when(weatherService.obtenerClimaActual()).thenReturn(sampleWeather);
        when(holidayService.obtenerContexto()).thenReturn(sampleHoliday);
        when(weatherForecastService.obtenerPronostico()).thenReturn(sampleForecast);

        AiContextResponse response = aiContextService.obtenerContexto();

        assertThat(response.weather()).isEqualTo(sampleWeather);
        assertThat(response.holidays()).isEqualTo(sampleHoliday);
        assertThat(response.forecast()).isEqualTo(sampleForecast);
        assertThat(response.generatedAt()).isNotNull();
        assertThat(response.narrative()).contains("Cielo nublado").contains("Fiesta local").contains("Pronóstico");
    }

    @Test
    void obtenerContexto_devuelveSoloFestividadesCuandoClimaFalla() {
        when(weatherService.obtenerClimaActual()).thenThrow(new ExternalServiceException("Sin clima"));
        when(holidayService.obtenerContexto()).thenReturn(sampleHoliday);
        when(weatherForecastService.obtenerPronostico()).thenReturn(sampleForecast);

        AiContextResponse response = aiContextService.obtenerContexto();

        assertThat(response.weather()).isNull();
        assertThat(response.holidays()).isEqualTo(sampleHoliday);
        assertThat(response.forecast()).isEqualTo(sampleForecast);
        assertThat(response.narrative()).contains("Fiesta local");
    }

    @Test
    void obtenerContexto_lanzaErrorCuandoAmbosServiciosFallo() {
        when(weatherService.obtenerClimaActual()).thenThrow(new ExternalServiceException("Sin clima"));
        when(holidayService.obtenerContexto()).thenThrow(new ExternalServiceException("Sin festividades"));
        when(weatherForecastService.obtenerPronostico()).thenThrow(new ExternalServiceException("Sin pronóstico"));

        assertThrows(ExternalServiceException.class, () -> aiContextService.obtenerContexto());
    }
}
