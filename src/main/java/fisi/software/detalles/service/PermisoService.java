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
    private static final String ACCION_CREACION = "CREACION";
    private static final String ACCION_ACTUALIZACION = "ACTUALIZACION";
    private static final String ACCION_ELIMINACION = "ELIMINACION";
    private static final String ACCION_ROL_ACTUALIZADO = "ROL_ACTUALIZADO";
    private static final String ACCION_USUARIO_ACTUALIZADO = "USUARIO_ACTUALIZADO";

    private static final int LIMITE_AUDITORIA = 50;

    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PermisoAuditoriaService permisoAuditoriaService;

    public List<PermisoResponse> listarPermisos(Boolean soloActivos, String estado, String termino) {
        String estadoNormalizado = normalizarEstado(soloActivos, estado);
        String terminoNormalizado = normalizarBusqueda(termino);

        List<Permiso> permisos = permisoRepository.buscarPorFiltros(
            estadoNormalizado,
            terminoNormalizado
        );

        return permisos.stream()
            .map(permiso -> PermisoResponse.fromEntity(
                permiso,
                usuarioRepository.countByPermisosExtra_IdPermiso(permiso.getIdPermiso())
            ))
            .toList();
    }

    public PermisoResponse obtenerPermiso(Long id) {
        Permiso permiso = obtenerEntidad(id);
        long totalUsuarios = usuarioRepository.countByPermisosExtra_IdPermiso(permiso.getIdPermiso());
        return PermisoResponse.fromEntity(permiso, totalUsuarios);
    }

    public PermisoResponse crearPermiso(PermisoRequest request) {
        String actor = resolverActor();
        validarCodigoUnico(null, request.codigo());
        Permiso permiso = new Permiso();
        aplicarDatos(permiso, request, true, actor);
        Permiso guardado = permisoRepository.save(permiso);
        registrarAuditoria(guardado, ACCION_CREACION, "Se creó el permiso", actor);
        return PermisoResponse.fromEntity(guardado, 0L);
    }

    public PermisoResponse actualizarPermiso(Long id, PermisoRequest request) {
        String actor = resolverActor();
        Permiso permiso = obtenerEntidad(id);
        validarCodigoUnico(id, request.codigo());
        aplicarDatos(permiso, request, false, actor);
        Permiso guardado = permisoRepository.save(permiso);
        registrarAuditoria(guardado, ACCION_ACTUALIZACION, "Se actualizó el permiso", actor);
        long totalUsuarios = usuarioRepository.countByPermisosExtra_IdPermiso(guardado.getIdPermiso());
        return PermisoResponse.fromEntity(guardado, totalUsuarios);
    }

    public void eliminarPermiso(Long id) {
        Permiso permiso = obtenerEntidad(id);
        if (!permiso.getRoles().isEmpty() || usuarioRepository.existsByPermisosExtra_IdPermiso(id)) {
            throw new ValidationException("No se puede eliminar el permiso porque se encuentra asignado");
        }
        String actor = resolverActor();
        registrarAuditoria(permiso, ACCION_ELIMINACION, "Se eliminó el permiso", actor);
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

        Set<Long> permisosOriginales = rol.getPermisos().stream()
            .map(Permiso::getIdPermiso)
            .collect(Collectors.toSet());
        Set<Long> nuevosIds = nuevosPermisos.stream()
            .map(Permiso::getIdPermiso)
            .collect(Collectors.toSet());

        rol.getPermisos().clear();
        rol.getPermisos().addAll(nuevosPermisos);
        Rol guardado = rolRepository.save(rol);

        String actor = resolverActor();
        Set<Long> agregados = new HashSet<>(nuevosIds);
        agregados.removeAll(permisosOriginales);

        Set<Long> removidos = new HashSet<>(permisosOriginales);
        removidos.removeAll(nuevosIds);

        if (!agregados.isEmpty()) {
            permisoRepository.findAllById(agregados)
                .forEach(permiso -> registrarAuditoria(
                    permiso,
                    ACCION_ROL_ACTUALIZADO,
                    String.format("Asignado al rol %s", guardado.getNombre()),
                    actor
                ));
        }

        if (!removidos.isEmpty()) {
            permisoRepository.findAllById(removidos)
                .forEach(permiso -> registrarAuditoria(
                    permiso,
                    ACCION_ROL_ACTUALIZADO,
                    String.format("Removido del rol %s", guardado.getNombre()),
                    actor
                ));
        }

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

        Set<Long> originales = usuario.getPermisosExtra().stream()
            .map(Permiso::getIdPermiso)
            .collect(Collectors.toSet());
        Set<Long> nuevosIds = permisos.stream()
            .map(Permiso::getIdPermiso)
            .collect(Collectors.toSet());

        usuario.getPermisosExtra().clear();
        usuario.getPermisosExtra().addAll(permisos);
        Usuario guardado = usuarioRepository.save(usuario);

        String actor = resolverActor();

        Set<Long> agregados = new HashSet<>(nuevosIds);
        agregados.removeAll(originales);
        if (!agregados.isEmpty()) {
            permisoRepository.findAllById(agregados)
                .forEach(permiso -> registrarAuditoria(
                    permiso,
                    ACCION_USUARIO_ACTUALIZADO,
                    String.format("Asignado directamente al usuario %s", guardado.getUsername()),
                    actor
                ));
        }

        Set<Long> removidos = new HashSet<>(originales);
        removidos.removeAll(nuevosIds);
        if (!removidos.isEmpty()) {
            permisoRepository.findAllById(removidos)
                .forEach(permiso -> registrarAuditoria(
                    permiso,
                    ACCION_USUARIO_ACTUALIZADO,
                    String.format("Removido del usuario %s", guardado.getUsername()),
                    actor
                ));
        }

        return guardado.getPermisosExtra().stream()
            .sorted(Comparator.comparing(Permiso::getNombrePermiso, String.CASE_INSENSITIVE_ORDER))
            .map(PermisoResumenResponse::fromEntity)
            .toList();
    }

    public List<PermisoAuditoriaResponse> obtenerAuditoriaPermisos(Long permisoId, Integer limite) {
        int limiteEfectivo = (limite != null && limite > 0 && limite <= LIMITE_AUDITORIA)
            ? limite
            : LIMITE_AUDITORIA;
        return permisoAuditoriaService.obtenerHistorial(permisoId, limiteEfectivo);
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

    private void aplicarDatos(Permiso permiso, PermisoRequest request, boolean esNuevo, String actor) {
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
        String actorNormalizado = StringUtils.hasText(actor) ? actor : resolverActor();
        if (esNuevo && !StringUtils.hasText(permiso.getCreadoPor())) {
            permiso.setCreadoPor(actorNormalizado);
        }
        permiso.setActualizadoPor(actorNormalizado);
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

    private String normalizarEstado(Boolean soloActivos, String estado) {
        if (StringUtils.hasText(estado)) {
            return estado.trim().toUpperCase(Locale.ROOT);
        }
        if (Boolean.TRUE.equals(soloActivos)) {
            return ESTADO_ACTIVO;
        }
        return null;
    }

    private String normalizarBusqueda(String valor) {
        if (!StringUtils.hasText(valor)) {
            return null;
        }
        return valor.trim();
    }

    private void registrarAuditoria(Permiso permiso, String accion, String detalle, String actor) {
        permisoAuditoriaService.registrar(permiso, accion, detalle, actor);
    }

    private String resolverActor() {
        return permisoAuditoriaService.resolverUsuarioActual();
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
