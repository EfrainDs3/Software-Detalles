package fisi.software.detalles.controller.dto.auth;

import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.security.Permisos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public record LoginResponse(
    Integer id,
    String nombres,
    String apellidos,
    String nombreCompleto,
    String username,
    String email,
    Boolean estado,
    LocalDateTime fechaUltimaSesion,
    List<RolResponse> roles,
    List<String> permisos,
    String message
) {

    public static LoginResponse fromEntity(Usuario usuario) {
        String nombreCompleto = String.format("%s %s", usuario.getNombres(), usuario.getApellidos()).trim();
        List<String> permisosNormalizados = usuario.getRoles().stream()
            .filter(Objects::nonNull)
            .flatMap(rol -> rol.getPermisos().stream())
            .filter(Objects::nonNull)
            .map(Permiso::getNombrePermiso)
            .filter(Objects::nonNull)
            .map(Permisos::normalizar)
            .distinct()
            .collect(Collectors.toList());
        return new LoginResponse(
            usuario.getId(),
            usuario.getNombres(),
            usuario.getApellidos(),
            nombreCompleto,
            usuario.getUsername(),
            usuario.getEmail(),
            usuario.getEstado(),
            usuario.getFechaUltimaSesion(),
            usuario.getRoles().stream()
                .map(rol -> RolResponse.fromEntity(rolConPermisos(rol), 0L, List.of()))
                .toList(),
            permisosNormalizados,
            "Autenticación exitosa"
        );
    }

    private static Rol rolConPermisos(Rol rol) {
        if (rol.getPermisos().isEmpty()) {
            return rol;
        }
        // Asegura que las colecciones estén ordenadas de forma consistente en la respuesta
        rol.setPermisos(rol.getPermisos().stream()
            .sorted((p1, p2) -> {
                String nombre1 = p1 != null ? p1.getNombrePermiso() : "";
                String nombre2 = p2 != null ? p2.getNombrePermiso() : "";
                return nombre1.compareToIgnoreCase(nombre2);
            })
            .collect(Collectors.toCollection(java.util.LinkedHashSet::new))
        );
        return rol;
    }
}
