package fisi.software.detalles.security;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Constantes y utilidades para trabajar con los permisos del sistema.
 */
public final class Permisos {

    private static final Set<String> VERBOS_INICIALES = Set.of(
        "ver", "gestionar", "crear", "editar", "registrar", "acceder",
        "administrar", "eliminar", "listar", "consultar", "actualizar",
        "generar", "descargar"
    );

    public static final String ACCEDER_AL_DASHBOARD = normalizar("Acceder al dashboard");
    public static final String VER_USUARIOS = normalizar("Ver usuarios");
    public static final String GESTIONAR_USUARIOS = normalizar("Gestionar usuarios");
    public static final String VER_ROLES = normalizar("Ver roles");
    public static final String GESTIONAR_ROLES = normalizar("Gestionar roles");
    public static final String VER_PERMISOS = normalizar("Ver permisos");
    public static final String GESTIONAR_PERMISOS = normalizar("Gestionar permisos");
    public static final String GESTIONAR_CLIENTES = normalizar("Gestionar clientes");
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

    public static String autoridadModulo(String modulo) {
        String destino = resolverModulo(modulo, null);
        return "MODULO_" + normalizar(destino);
    }

    public static String autoridadModulo(String modulo, String nombrePermiso) {
        String destino = resolverModulo(modulo, nombrePermiso);
        return "MODULO_" + normalizar(destino);
    }

    public static String resolverModulo(String modulo, String nombrePermiso) {
        if (hasText(modulo)) {
            return toTitleCase(modulo);
        }
        if (!hasText(nombrePermiso)) {
            return "General";
        }
        String[] tokens = nombrePermiso.trim().split("\\s+");
        if (tokens.length == 0) {
            return "General";
        }
        String first = tokens[0].toLowerCase(Locale.ROOT);
        String candidato = tokens.length > 1 && VERBOS_INICIALES.contains(first)
            ? tokens[tokens.length - 1]
            : tokens[0];
        return toTitleCase(candidato);
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String toTitleCase(String valor) {
        if (!hasText(valor)) {
            return "General";
        }
        String lower = valor.trim().toLowerCase(Locale.ROOT);
        String[] tokens = lower.split("\\s+");
        return Arrays.stream(tokens)
            .filter(token -> !token.isBlank())
            .map(token -> Character.toUpperCase(token.charAt(0)) + token.substring(1))
            .collect(Collectors.joining(" "));
    }
}
