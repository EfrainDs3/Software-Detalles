package fisi.software.detalles.service.external;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import fisi.software.detalles.controller.dto.AiContextResponse.HolidayContext;
import fisi.software.detalles.exception.ExternalServiceException;

class HolidayServiceTest {

    private static final String BASE_URL = "https://date.example.com/api/v3";
    private static final ZoneId LIMA = ZoneId.of("America/Lima");

    private HolidayService holidayService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        holidayService = new HolidayService(new RestTemplateBuilder(), BASE_URL, "PE", LIMA.getId());
        holidayService.setClock(fixedClock(LocalDate.of(2025, 6, 24)));
        RestTemplate restTemplate = (RestTemplate) ReflectionTestUtils.getField(holidayService, "restTemplate");
        mockServer = MockRestServiceServer.bindTo(restTemplate).ignoreExpectOrder(true).build();
    }

    @Test
    void obtenerContexto_retornaNarrativaConFeriados() {
        String publicHolidays = "[{" +
                "\"date\":\"2025-06-24\",\"localName\":\"Fiesta local\",\"name\":\"Local Celebration\",\"countryCode\":\"PE\",\"fixed\":false,\"global\":false,\"types\":[\"Public\"]},{" +
                "\"date\":\"2025-06-29\",\"localName\":\"San Pedro y San Pablo\",\"name\":\"Saint Peter and Saint Paul\",\"countryCode\":\"PE\",\"fixed\":false,\"global\":true,\"types\":[\"Public\"]}]";
        String longWeekend = "[{" +
            "\"start\":\"2025-07-26\",\"end\":\"2025-07-29\",\"dayCount\":4},{" +
            "\"start\":null,\"end\":null,\"dayCount\":0}]";

        mockServer.expect(requestTo(BASE_URL + "/PublicHolidays/2025/PE"))
                .andExpect(method(GET))
                .andRespond(withSuccess(publicHolidays, MediaType.APPLICATION_JSON));

        mockServer.expect(requestTo(BASE_URL + "/LongWeekend/2025/PE"))
                .andExpect(method(GET))
                .andRespond(withSuccess(longWeekend, MediaType.APPLICATION_JSON));

        HolidayContext context = holidayService.obtenerContexto();
        mockServer.verify();

        assertThat(context.today()).isNotNull();
        assertThat(context.today().localName()).isEqualTo("Fiesta local");
        assertThat(context.upcoming()).isNotNull();
        assertThat(context.narrative()).contains("Fiesta local", "San Pedro y San Pablo");
    }

    @Test
    void obtenerContexto_lanzaExcepcionCuandoApiFalla() {
        mockServer.expect(requestTo(BASE_URL + "/PublicHolidays/2025/PE"))
                .andExpect(method(GET))
                .andRespond(withServerError());

        assertThrows(ExternalServiceException.class, () -> holidayService.obtenerContexto());
        mockServer.verify();
    }

    private static Clock fixedClock(LocalDate date) {
        return Clock.fixed(date.atStartOfDay(LIMA).toInstant(), LIMA);
    }
}
