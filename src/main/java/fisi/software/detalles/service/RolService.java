package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.rol.RolEstadoRequest;
import fisi.software.detalles.controller.dto.rol.RolRequest;
import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.controller.dto.rol.RolUsuarioAsignadoResponse;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RolService {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;

    public List<RolResponse> listarRoles(Boolean soloActivos) {
        List<Rol> roles = Boolean.TRUE.equals(soloActivos)
            ? rolRepository.findAllByEstadoTrueOrderByNombreAsc()
            : rolRepository.findAllByOrderByNombreAsc();
        return roles.stream().map(this::mapearResponse).toList();
    }

    public RolResponse obtenerRol(Integer id) {
        return mapearResponse(obtenerEntidad(id));
    }

    public RolResponse crearRol(RolRequest request) {
        validarNombreUnico(null, request.nombre());
        Rol rol = new Rol();
        aplicarDatos(rol, request, true);
        Rol guardado = rolRepository.save(rol);
        return mapearResponse(guardado);
    }

    public RolResponse actualizarRol(Integer id, RolRequest request) {
        Rol rol = obtenerEntidad(id);
        validarNombreUnico(id, request.nombre());
        aplicarDatos(rol, request, false);
        Rol guardado = rolRepository.save(rol);
        return mapearResponse(guardado);
    }

    public RolResponse actualizarEstado(Integer id, RolEstadoRequest request) {
        Rol rol = obtenerEntidad(id);
        rol.setEstado(request.estado());
        Rol guardado = rolRepository.save(rol);
        return mapearResponse(guardado);
    }

    public void eliminarRol(Integer id) {
        Rol rol = obtenerEntidad(id);
        if (usuarioRepository.existsByRoles_Id(id)) {
            throw new ValidationException("No se puede eliminar el rol porque está asignado a uno o más usuarios");
        }
        rolRepository.delete(rol);
    }

    @Transactional
    public Rol obtenerRolConPermisos(Integer id) {
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        rol.getPermisos().size();
        return rol;
    }

    private Rol obtenerEntidad(Integer id) {
        return rolRepository.findWithPermisosById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
    }

    private void aplicarDatos(Rol rol, RolRequest request, boolean esNuevo) {
        String nombreNormalizado = normalizarNombre(request.nombre());
        rol.setNombre(nombreNormalizado);
        String descripcionNormalizada = StringUtils.hasText(request.descripcion()) ? request.descripcion().trim() : null;
        rol.setDescripcion(descripcionNormalizada);
        if (request.estado() != null) {
            rol.setEstado(request.estado());
        } else if (esNuevo && rol.getEstado() == null) {
            rol.setEstado(Boolean.TRUE);
        }
    }

    private void validarNombreUnico(Integer idRol, String nombre) {
        String nombreNormalizado = normalizarNombre(nombre);
        rolRepository.findByNombreIgnoreCase(nombreNormalizado)
            .ifPresent(existing -> {
                if (idRol == null || !existing.getId().equals(idRol)) {
                    throw new ValidationException("El nombre del rol ya está registrado");
                }
            });
    }

    private String normalizarNombre(String nombre) {
        if (!StringUtils.hasText(nombre)) {
            throw new ValidationException("El nombre es obligatorio");
        }
        return nombre.trim();
    }

    private RolResponse mapearResponse(Rol rol) {
        if (rol.getId() == null) {
            return RolResponse.fromEntity(rol, 0L, List.of());
        }
        long totalUsuarios = usuarioRepository.countByRoles_Id(rol.getId());
        List<RolUsuarioAsignadoResponse> usuarios = usuarioRepository.findByRoles_IdOrderByNombresAscApellidosAsc(rol.getId()).stream()
            .map(RolUsuarioAsignadoResponse::fromEntity)
            .toList();
        return RolResponse.fromEntity(rol, totalUsuarios, usuarios);
    }
}
