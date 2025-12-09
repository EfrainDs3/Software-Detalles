package fisi.software.detalles.service.external;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestToUriTemplate;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Duration;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import fisi.software.detalles.controller.dto.AiContextResponse.WeatherForecastContext;
import fisi.software.detalles.exception.ExternalServiceException;

class WeatherForecastServiceTest {

    private static final String BASE_URL = "https://api.example.com/forecast";
    private WeatherForecastService forecastService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        forecastService = new WeatherForecastService(new RestTemplateBuilder(),
                BASE_URL,
                "test-key",
                -6.4820,
                -76.3760,
                "metric",
                "es",
                4,
                2,
                Duration.ofMinutes(30).toMinutes());
        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(forecastService, "restTemplate");
        mockServer = MockRestServiceServer.bindTo(restTemplate).ignoreExpectOrder(true).build();
    }

    @Test
    void obtenerPronostico_devuelveContextoCuandoRespuestaEsValida() {
        long epoch1 = OffsetDateTime.now().plusHours(3).toEpochSecond();
        long epoch2 = epoch1 + 10_800; // +3 horas

        String payload = "{" +
            "\"list\":[" +
            "{" +
            "\"dt\":" + epoch1 + "," +
                "\"main\":{\"temp\":29.4,\"temp_min\":28.0,\"temp_max\":30.1,\"humidity\":78}," +
                "\"weather\":[{\"description\":\"nubes dispersas\",\"icon\":\"03d\"}]," +
                "\"pop\":0.3" +
                "},{" +
            "\"dt\":" + epoch2 + "," +
                "\"main\":{\"temp\":27.0,\"temp_min\":26.0,\"temp_max\":28.0,\"humidity\":85}," +
                "\"weather\":[{\"description\":\"lluvia ligera\",\"icon\":\"10n\"}]," +
                "\"pop\":0.6," +
                "\"rain\":{\"3h\":1.2}" +
                "}]" +
                "}";

        mockServer.expect(requestToUriTemplate(BASE_URL + "?lat={lat}&lon={lon}&units={units}&lang={lang}&appid={key}",
                -6.4820, -76.3760, "metric", "es", "test-key"))
                .andExpect(method(GET))
                .andRespond(withSuccess(payload, MediaType.APPLICATION_JSON));

        WeatherForecastContext context = forecastService.obtenerPronostico();
        mockServer.verify();

        assertThat(context.nextHours()).isNotEmpty();
        assertThat(context.nextDays()).isNotEmpty();
        assertThat(context.narrative()).contains("Pronóstico próximos días");
    }

    @Test
    void obtenerPronostico_lanzaErrorCuandoServicioFalla() {
        mockServer.expect(requestToUriTemplate(BASE_URL + "?lat={lat}&lon={lon}&units={units}&lang={lang}&appid={key}",
                -6.4820, -76.3760, "metric", "es", "test-key"))
                .andExpect(method(GET))
                .andRespond(withServerError());

        assertThrows(ExternalServiceException.class, () -> forecastService.obtenerPronostico());
        mockServer.verify();
    }
}
