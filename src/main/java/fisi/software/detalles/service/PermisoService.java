package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.permiso.*;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PermisoService {

    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;

    public List<PermisoResponse> listarPermisos(Boolean soloActivos) {
        List<Permiso> permisos = Boolean.TRUE.equals(soloActivos)
            ? permisoRepository.findAllByEstadoIgnoreCaseOrderByNombrePermisoAsc(ESTADO_ACTIVO)
            : permisoRepository.findAllByOrderByNombrePermisoAsc();
        return permisos.stream().map(PermisoResponse::fromEntity).toList();
    }

    public PermisoResponse obtenerPermiso(Long id) {
        return PermisoResponse.fromEntity(obtenerEntidad(id));
    }

    public PermisoResponse crearPermiso(PermisoRequest request) {
        validarCodigoUnico(null, request.codigo());
        Permiso permiso = new Permiso();
        aplicarDatos(permiso, request, true);
        return PermisoResponse.fromEntity(permisoRepository.save(permiso));
    }

    public PermisoResponse actualizarPermiso(Long id, PermisoRequest request) {
        Permiso permiso = obtenerEntidad(id);
        validarCodigoUnico(id, request.codigo());
        aplicarDatos(permiso, request, false);
        return PermisoResponse.fromEntity(permisoRepository.save(permiso));
    }

    public void eliminarPermiso(Long id) {
        Permiso permiso = obtenerEntidad(id);
        if (!permiso.getRoles().isEmpty() || !permiso.getUsuarios().isEmpty()) {
            throw new ValidationException("No se puede eliminar el permiso porque se encuentra asignado");
        }
        permisoRepository.delete(permiso);
    }

    public PermisoRolDetalleResponse listarPermisosPorRol(Integer rolId) {
        Rol rol = rolRepository.findWithPermisosById(rolId)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        List<PermisoResumenResponse> permisos = rol.getPermisos().stream()
            .sorted(Comparator.comparing(Permiso::getNombrePermiso, String.CASE_INSENSITIVE_ORDER))
            .map(PermisoResumenResponse::fromEntity)
            .toList();
        return new PermisoRolDetalleResponse(rol.getId(), rol.getNombre(), permisos);
    }

    public PermisoRolDetalleResponse actualizarPermisosRol(Integer rolId, List<Long> permisoIds) {
        Rol rol = rolRepository.findWithPermisosById(rolId)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        Set<Permiso> nuevosPermisos = obtenerPermisosDesdeIds(permisoIds);
        rol.getPermisos().clear();
        rol.getPermisos().addAll(nuevosPermisos);
        Rol guardado = rolRepository.save(rol);
        List<PermisoResumenResponse> respuesta = guardado.getPermisos().stream()
            .sorted(Comparator.comparing(Permiso::getNombrePermiso, String.CASE_INSENSITIVE_ORDER))
            .map(PermisoResumenResponse::fromEntity)
            .toList();
        return new PermisoRolDetalleResponse(guardado.getId(), guardado.getNombre(), respuesta);
    }

    public List<PermisoUsuarioDetalleResponse> listarPermisosPorUsuario(Integer usuarioId) {
        Usuario usuario = usuarioRepository.findWithRolesAndPermisosById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Map<Long, PermisoUsuarioDetalleBuilder> acumulador = new HashMap<>();

        usuario.getRoles().forEach(rol -> rol.getPermisos().forEach(permiso ->
            acumulador.computeIfAbsent(permiso.getIdPermiso(), id -> new PermisoUsuarioDetalleBuilder(permiso))
                .agregarRol(rol.getNombre())
        ));

        usuario.getPermisosExtra().forEach(permiso ->
            acumulador.computeIfAbsent(permiso.getIdPermiso(), id -> new PermisoUsuarioDetalleBuilder(permiso))
                .marcarAsignadoDirecto()
        );

        return acumulador.values().stream()
            .map(PermisoUsuarioDetalleBuilder::construir)
            .sorted(Comparator.comparing(o -> o.permiso().nombre(), String.CASE_INSENSITIVE_ORDER))
            .toList();
    }

    public List<PermisoResumenResponse> actualizarPermisosUsuario(Integer usuarioId, List<Long> permisoIds) {
        Usuario usuario = usuarioRepository.findWithRolesAndPermisosById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        Set<Permiso> permisos = obtenerPermisosDesdeIds(permisoIds);
        usuario.getPermisosExtra().clear();
        usuario.getPermisosExtra().addAll(permisos);
        Usuario guardado = usuarioRepository.save(usuario);
        return guardado.getPermisosExtra().stream()
            .sorted(Comparator.comparing(Permiso::getNombrePermiso, String.CASE_INSENSITIVE_ORDER))
            .map(PermisoResumenResponse::fromEntity)
            .toList();
    }

    private Set<Permiso> obtenerPermisosDesdeIds(List<Long> permisoIds) {
        if (permisoIds == null) {
            return new HashSet<>();
        }
        List<Permiso> permisos = permisoRepository.findAllById(permisoIds);
        if (permisos.size() != new HashSet<>(permisoIds).size()) {
            throw new EntityNotFoundException("Uno o más permisos no existen");
        }
        return new HashSet<>(permisos);
    }

    private Permiso obtenerEntidad(Long id) {
        return permisoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Permiso no encontrado"));
    }

    private void aplicarDatos(Permiso permiso, PermisoRequest request, boolean esNuevo) {
        permiso.setCodigo(normalizarTexto(request.codigo(), "El código es obligatorio"));
        permiso.setNombrePermiso(normalizarTexto(request.nombre(), "El nombre es obligatorio"));
        permiso.setDescripcion(StringUtils.hasText(request.descripcion()) ? request.descripcion().trim() : null);
        if (StringUtils.hasText(request.estado())) {
            permiso.setEstado(request.estado().trim().toUpperCase(Locale.ROOT));
        } else if (esNuevo && !StringUtils.hasText(permiso.getEstado())) {
            permiso.setEstado(ESTADO_ACTIVO);
        }
        if (!StringUtils.hasText(permiso.getEstado())) {
            permiso.setEstado(ESTADO_ACTIVO);
        }
    }

    private void validarCodigoUnico(Long permisoId, String codigo) {
        String codigoNormalizado = normalizarTexto(codigo, "El código es obligatorio");
        permisoRepository.findByCodigoIgnoreCase(codigoNormalizado)
            .ifPresent(existing -> {
                if (permisoId == null || !existing.getIdPermiso().equals(permisoId)) {
                    throw new ValidationException("El código del permiso ya está registrado");
                }
            });
    }

    private String normalizarTexto(String valor, String mensajeError) {
        if (!StringUtils.hasText(valor)) {
            throw new ValidationException(mensajeError);
        }
        return valor.trim();
    }

    private static class PermisoUsuarioDetalleBuilder {
        private final Permiso permiso;
        private boolean asignadoDirecto;
        private final Set<String> roles = new HashSet<>();

        private PermisoUsuarioDetalleBuilder(Permiso permiso) {
            this.permiso = permiso;
        }

        private PermisoUsuarioDetalleBuilder agregarRol(String rolNombre) {
            if (StringUtils.hasText(rolNombre)) {
                roles.add(rolNombre);
            }
            return this;
        }

        private PermisoUsuarioDetalleBuilder marcarAsignadoDirecto() {
            this.asignadoDirecto = true;
            return this;
        }

        private PermisoUsuarioDetalleResponse construir() {
            List<String> rolesOrdenados = roles.stream()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
            return new PermisoUsuarioDetalleResponse(
                PermisoResumenResponse.fromEntity(permiso),
                asignadoDirecto,
                rolesOrdenados
            );
        }
    }
}
