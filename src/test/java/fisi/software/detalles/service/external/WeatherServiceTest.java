package fisi.software.detalles.service.external;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestToUriTemplate;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import fisi.software.detalles.controller.dto.AiContextResponse.WeatherContext;
import fisi.software.detalles.exception.ExternalServiceException;

class WeatherServiceTest {

    private static final String BASE_URL = "https://api.example.com/weather";
    private static final String API_KEY = "test-key";

    private WeatherService weatherService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        weatherService = new WeatherService(new RestTemplateBuilder(), new ObjectMapper(), BASE_URL, API_KEY, "Tarapoto",
                "PE", "metric", "es");
        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(weatherService, "restTemplate");
        mockServer = MockRestServiceServer.bindTo(restTemplate).ignoreExpectOrder(true).build();
    }

    @Test
    void obtenerClimaActual_devuelveContextoCuandoRespuestaEsValida() {
        String payload = "{" +
                "\"weather\":[{" +
                "\"description\":\"lluvia ligera\",\"icon\":\"10d\"" +
                "}]," +
                "\"main\":{\"temp\":26.4,\"feels_like\":27.0,\"humidity\":83}," +
                "\"wind\":{\"speed\":2.5}" +
                "}";

        mockServer.expect(requestToUriTemplate(BASE_URL + "?q={city},{country}&units={units}&lang={lang}&appid={key}",
                "Tarapoto", "PE", "metric", "es", API_KEY))
                .andExpect(method(GET))
                .andRespond(withSuccess(payload, MediaType.APPLICATION_JSON));

        WeatherContext context = weatherService.obtenerClimaActual();

        mockServer.verify();
        assertThat(context.source()).isEqualTo("OpenWeatherMap");
        assertThat(context.description()).isEqualTo("Lluvia ligera");
        assertThat(context.temperatureC()).isEqualTo(26.4);
        assertThat(context.narrative()).contains("Tarapoto", "temperatura", "humedad");
    }

    @Test
    void obtenerClimaActual_lanzaExcepcionSiServicioFalla() {
        mockServer.expect(requestToUriTemplate(BASE_URL + "?q={city},{country}&units={units}&lang={lang}&appid={key}",
                "Tarapoto", "PE", "metric", "es", API_KEY))
                .andExpect(method(GET))
                .andRespond(withServerError().body("Error").contentType(new MediaType("text", "plain", StandardCharsets.UTF_8)));

        assertThrows(ExternalServiceException.class, () -> weatherService.obtenerClimaActual());
        mockServer.verify();
    }
}
