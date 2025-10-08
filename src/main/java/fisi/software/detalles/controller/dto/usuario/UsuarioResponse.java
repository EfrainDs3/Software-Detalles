package fisi.software.detalles.controller.dto.usuario;

import fisi.software.detalles.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public record UsuarioResponse(
    Integer id,
    String nombres,
    String apellidos,
    String nombreCompleto,
    String username,
    String email,
    String celular,
    String direccion,
    Boolean estado,
    String numeroDocumento,
    Integer tipoDocumentoId,
    String tipoDocumentoNombre,
    LocalDateTime fechaCreacion,
    LocalDateTime fechaUltimaSesion,
    List<RolResponse> roles
) {

    public static UsuarioResponse fromEntity(Usuario usuario) {
        var tipoDocumento = Optional.ofNullable(usuario.getTipoDocumento());
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNombres(),
            usuario.getApellidos(),
            String.format("%s %s", usuario.getNombres(), usuario.getApellidos()).trim(),
            usuario.getUsername(),
            usuario.getEmail(),
            usuario.getCelular(),
            usuario.getDireccion(),
            usuario.getEstado(),
            usuario.getNumeroDocumento(),
            tipoDocumento.map(td -> td.getIdTipoDocumento()).orElse(null),
            tipoDocumento.map(td -> td.getNombreTipoDocumento()).orElse(null),
            usuario.getFechaCreacion(),
            usuario.getFechaUltimaSesion(),
            usuario.getRoles().stream()
                .map(RolResponse::fromEntity)
                .toList()
        );
    }
}
