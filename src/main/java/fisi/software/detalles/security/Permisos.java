package fisi.software.detalles.security;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Constantes y utilidades para trabajar con los permisos del sistema.
 */
public final class Permisos {

    public static final String ACCEDER_AL_DASHBOARD = normalizar("Acceder al dashboard");
    public static final String VER_USUARIOS = normalizar("Ver usuarios");
    public static final String GESTIONAR_USUARIOS = normalizar("Gestionar usuarios");
    public static final String VER_ROLES = normalizar("Ver roles");
    public static final String GESTIONAR_ROLES = normalizar("Gestionar roles");
    public static final String VER_PERMISOS = normalizar("Ver permisos");
    public static final String GESTIONAR_PERMISOS = normalizar("Gestionar permisos");
    public static final String REGISTRAR_VENTAS = normalizar("Registrar ventas");
    public static final String GESTIONAR_INVENTARIO = normalizar("Gestionar inventario");
    public static final String GESTIONAR_COMPRAS = normalizar("Gestionar compras");

    private Permisos() {
        // Utility class
    }

    public static String normalizar(String valor) {
        if (valor == null) {
            return "";
        }
        String normalized = Normalizer.normalize(valor.trim(), Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "")
            .toUpperCase(Locale.ROOT)
            .replaceAll("[^A-Z0-9]+", "_");
        normalized = normalized.replaceAll("_+", "_");
        if (normalized.endsWith("_")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        if (normalized.startsWith("_")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }
}
