package fisi.software.detalles.controller.dto.rol;

import fisi.software.detalles.entity.Usuario;

public record RolUsuarioAsignadoResponse(Integer id, String nombreCompleto, String email) {

    public static RolUsuarioAsignadoResponse fromEntity(Usuario usuario) {
        String nombreCompleto = String.format("%s %s", usuario.getNombres(), usuario.getApellidos()).trim();
        return new RolUsuarioAsignadoResponse(usuario.getId(), nombreCompleto, usuario.getEmail());
    }
}
