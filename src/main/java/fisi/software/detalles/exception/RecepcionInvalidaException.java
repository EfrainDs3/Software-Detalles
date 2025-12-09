package fisi.software.detalles.exception;

/**
 * Se lanza cuando los datos de recepción de compra son inconsistentes con el pedido.
 */
public class RecepcionInvalidaException extends RuntimeException {

    public RecepcionInvalidaException(String message) {
        super(message);
    }
}
