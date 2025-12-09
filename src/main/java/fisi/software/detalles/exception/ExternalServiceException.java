package fisi.software.detalles.exception;

/**
 * Se lanza cuando una integración con servicios externos (clima, festividades,
 * etc.) falla y se necesita notificar al consumidor sin simular éxito.
 */
public class ExternalServiceException extends RuntimeException {

    public ExternalServiceException(String message) {
        super(message);
    }

    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
