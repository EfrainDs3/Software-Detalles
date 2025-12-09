package fisi.software.detalles.controller.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Representa el contexto situacional que complementa las respuestas del
 * asistente IA (clima actual, pronóstico y festividades relevantes para Tarapoto, Perú).
 */
public record AiContextResponse(
        OffsetDateTime generatedAt,
        WeatherContext weather,
        HolidayContext holidays,
         WeatherForecastContext forecast,
        String narrative) {

    public record WeatherContext(
            String source,
            String city,
            String country,
            String description,
            Double temperatureC,
            Double feelsLikeC,
            Integer humidity,
            Double windSpeed,
            String icon,
            String narrative) {
    }

    public record HolidayContext(
            HolidayInfo today,
            HolidayInfo upcoming,
            HolidayInfo longWeekend,
            String narrative) {
    }

    public record HolidayInfo(
            String date,
            String localName,
            String englishName,
            boolean isPublic,
            boolean isGlobal,
            Integer daysUntil,
            String narrative) {
    }

    public record WeatherForecastContext(
            List<HourlyForecast> nextHours,
            List<DailyForecast> nextDays,
            String narrative) {

        public record HourlyForecast(
                OffsetDateTime timestamp,
                Double temperatureC,
                Double humidity,
                String description,
                String icon,
                Double precipitationProbability,
                Double precipitationVolumeMm) {
        }

        public record DailyForecast(
                LocalDate date,
                Double minTemperatureC,
                Double maxTemperatureC,
                Double humidity,
                Double precipitationProbability,
                String description,
                String icon,
                Double precipitationVolumeMm) {
        }
    }
}
