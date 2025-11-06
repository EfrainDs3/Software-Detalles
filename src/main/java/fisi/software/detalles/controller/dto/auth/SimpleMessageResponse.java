package fisi.software.detalles.controller.dto.auth;

public record SimpleMessageResponse(String message) {
    public static SimpleMessageResponse of(String message) {
        return new SimpleMessageResponse(message);
    }
}
