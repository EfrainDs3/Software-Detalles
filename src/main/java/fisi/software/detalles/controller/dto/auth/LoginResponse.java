package fisi.software.detalles.controller.dto.auth;

import fisi.software.detalles.controller.dto.usuario.RolResponse;
import fisi.software.detalles.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;

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
    String message
) {

    public static LoginResponse fromEntity(Usuario usuario) {
        String nombreCompleto = String.format("%s %s", usuario.getNombres(), usuario.getApellidos()).trim();
        return new LoginResponse(
            usuario.getId(),
            usuario.getNombres(),
            usuario.getApellidos(),
            nombreCompleto,
            usuario.getUsername(),
            usuario.getEmail(),
            usuario.getEstado(),
            usuario.getFechaUltimaSesion(),
            usuario.getRoles().stream().map(RolResponse::fromEntity).toList(),
            "Autenticación exitosa"
        );
    }
}
