package fisi.software.detalles.controller.dto.usuario;

import fisi.software.detalles.entity.Rol;

public record RolResponse(Integer id, String nombre, Boolean estado, String descripcion) {

    public static RolResponse fromEntity(Rol rol) {
        return new RolResponse(rol.getId(), rol.getNombre(), rol.getEstado(), rol.getDescripcion());
    }
}
