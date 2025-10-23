package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.permiso.*;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermisoService {

    private static final String ESTADO_ACTIVO = "ACTIVO";
    private static final String ACCION_CREACION = "CREACION";
    private static final String ACCION_ACTUALIZACION = "ACTUALIZACION";
    private static final String ACCION_ELIMINACION = "ELIMINACION";
    private static final String ACCION_ROL_ACTUALIZADO = "ROL_ACTUALIZADO";

    private static final int LIMITE_AUDITORIA = 50;

    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PermisoAuditoriaService permisoAuditoriaService;

    // Permission codes that should be hidden for standard 'usuario' roles
    private static final Set<String> RESTRICTED_PERMISSION_CODES_FOR_STANDARD_USER = Set.of(
        "DASHBOARD_VIEW",
        "COMPRAS_GESTIONAR",
        "INVENTARIO_GESTIONAR",
        "PERMISSIONS_MANAGE",
        "ROLES_MANAGE",
        "USERS_MANAGE",
        "TEST_PERMISSION",
        "VENTAS_REGISTRAR",
        "PERMISSIONS_VIEW",
        "ROLES_VIEW",
        "USERS_VIEW"
    );

    // Permission codes that should be masked in the management listing (show only code)
    private static final Set<String> MASKED_PERMISSION_CODES = Set.of(
        "ROLES_VIEW",
        "DASHBOARD_VIEW"
    );

    @Transactional(readOnly = true)
    public List<PermisoResponse> listarPermisos(Boolean soloActivos, String estado, String termino) {
        String estadoNormalizado = normalizarEstado(soloActivos, estado);
        String terminoNormalizado = normalizarBusqueda(termino);

        List<Permiso> permisos = permisoRepository.buscarPorFiltros(
            estadoNormalizado,
            terminoNormalizado
        );

        // initialize roles collection for each permiso to avoid lazy init in DTO mapping
        permisos.forEach(p -> Hibernate.initialize(p.getRoles()));

        return permisos.stream()
            .map(permiso -> {
                long totalUsuarios = permiso.getRoles().stream()
                    .mapToLong(rol -> usuarioRepository.countByRoles_Id(rol.getId()))
                    .sum();
                String codigo = Optional.ofNullable(permiso.getCodigo()).orElse("").toUpperCase(Locale.ROOT);
                if (MASKED_PERMISSION_CODES.contains(codigo)) {
                    return PermisoResponse.fromEntityMasked(permiso, totalUsuarios);
                }
                return PermisoResponse.fromEntity(permiso, totalUsuarios);
            })
            .toList();
    }

    public PermisoResponse obtenerPermiso(Long id) {
        Permiso permiso = obtenerEntidad(id);
        long totalUsuarios = permiso.getRoles().stream()
            .mapToLong(rol -> usuarioRepository.countByRoles_Id(rol.getId()))
            .sum();
        return PermisoResponse.fromEntity(permiso, totalUsuarios);
    }

    @Transactional(readOnly = true)
    public PermisoResponse obtenerPermisoConInicializacion(Long id) {
        Permiso permiso = obtenerEntidad(id);
        Hibernate.initialize(permiso.getRoles());
        long totalUsuarios = permiso.getRoles().stream()
            .mapToLong(rol -> usuarioRepository.countByRoles_Id(rol.getId()))
            .sum();
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
        long totalUsuarios = guardado.getRoles().stream()
            .mapToLong(rol -> usuarioRepository.countByRoles_Id(rol.getId()))
            .sum();
        return PermisoResponse.fromEntity(guardado, totalUsuarios);
    }

    @Transactional
    public void eliminarPermiso(Long id) {
        Permiso permiso = obtenerEntidad(id);
        Hibernate.initialize(permiso.getRoles());
        if (!permiso.getRoles().isEmpty()) {
            throw new ValidationException("No se puede eliminar el permiso porque se encuentra asignado a roles");
        }
        String actor = resolverActor();
        registrarAuditoria(permiso, ACCION_ELIMINACION, "Se eliminó el permiso", actor);
        permisoRepository.delete(permiso);
    }

    public PermisoRolDetalleResponse listarPermisosPorRol(Integer rolId) {
        Rol rol = rolRepository.findWithPermisosById(rolId)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        // initialize permisos collection to avoid lazy loading in view
        Hibernate.initialize(rol.getPermisos());
        List<Permiso> permisosEnt = new ArrayList<>(rol.getPermisos());
        // apply filtering for 'usuario' like roles
        if (isStandardUserRole(rol)) {
            permisosEnt = permisosEnt.stream()
                .filter(p -> !RESTRICTED_PERMISSION_CODES_FOR_STANDARD_USER.contains(
                    Optional.ofNullable(p.getCodigo()).orElse("").toUpperCase(Locale.ROOT)
                ))
                .toList();
        }

        List<PermisoResumenResponse> permisos = permisosEnt.stream()
            .sorted(Comparator.comparing(Permiso::getNombrePermiso, String.CASE_INSENSITIVE_ORDER))
            .map(PermisoResumenResponse::fromEntity)
            .toList();
        Map<String, List<PermisoResumenResponse>> permisosPorModulo = agruparPorModulo(permisos);
        return new PermisoRolDetalleResponse(rol.getId(), rol.getNombre(), permisos, permisosPorModulo);
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
        Map<String, List<PermisoResumenResponse>> permisosPorModulo = agruparPorModulo(respuesta);
        return new PermisoRolDetalleResponse(guardado.getId(), guardado.getNombre(), respuesta, permisosPorModulo);
    }

    public List<PermisoUsuarioDetalleResponse> listarPermisosPorUsuario(Integer usuarioId) {
        Usuario usuario = usuarioRepository.findWithRolesAndPermisosById(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        // asegurarnos de inicializar las colecciones lazy necesarias
        usuario.getRoles().forEach(rol -> Hibernate.initialize(rol.getPermisos()));

        Map<Long, PermisoUsuarioDetalleBuilder> acumulador = new HashMap<>();

        usuario.getRoles().forEach(rol -> rol.getPermisos().forEach(permiso ->
            acumulador.computeIfAbsent(permiso.getIdPermiso(), id -> new PermisoUsuarioDetalleBuilder(permiso))
                .agregarRol(rol.getNombre())
        ));

        List<PermisoUsuarioDetalleResponse> resultado = acumulador.values().stream()
            .map(PermisoUsuarioDetalleBuilder::construir)
            .sorted(Comparator.comparing(o -> o.permiso().nombre(), String.CASE_INSENSITIVE_ORDER))
            .toList();

        // If the user is effectively a standard 'usuario' (has a usuario-like role and no admin role),
        // filter out restricted permission codes from the result
        if (shouldFilterForStandardUsuario(usuario)) {
            return resultado.stream()
                .filter(r -> !RESTRICTED_PERMISSION_CODES_FOR_STANDARD_USER.contains(
                    Optional.ofNullable(r.permiso().codigo()).orElse("").toUpperCase(Locale.ROOT)
                ))
                .toList();
        }

        return resultado;
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

    private Map<String, List<PermisoResumenResponse>> agruparPorModulo(List<PermisoResumenResponse> permisos) {
        if (permisos == null) return Collections.emptyMap();
        return permisos.stream()
            .collect(Collectors.groupingBy(p -> {
                String codigo = Optional.ofNullable(p.codigo()).orElse("");
                int idx = codigo.indexOf('_');
                if (idx > 0) return codigo.substring(0, idx).toUpperCase(Locale.ROOT);
                idx = codigo.indexOf('-');
                if (idx > 0) return codigo.substring(0, idx).toUpperCase(Locale.ROOT);
                return "GENERAL";
            }, Collectors.collectingAndThen(Collectors.toList(), list ->
                list.stream().sorted(Comparator.comparing(PermisoResumenResponse::nombre, String.CASE_INSENSITIVE_ORDER)).collect(Collectors.toList())
            )));
    }

    private void registrarAuditoria(Permiso permiso, String accion, String detalle, String actor) {
        permisoAuditoriaService.registrar(permiso, accion, detalle, actor);
    }

    private String resolverActor() {
        return permisoAuditoriaService.resolverUsuarioActual();
    }

    private static class PermisoUsuarioDetalleBuilder {
        private final Permiso permiso;
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

        private PermisoUsuarioDetalleResponse construir() {
            List<String> rolesOrdenados = roles.stream()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
            return new PermisoUsuarioDetalleResponse(
                PermisoResumenResponse.fromEntity(permiso),
                false,
                rolesOrdenados
            );
        }
    }

    /**
     * Detects roles that should be considered 'standard usuario' roles.
     * Current heuristic: role name contains the token "usuario" (case-insensitive).
     */
    private boolean isStandardUserRole(Rol rol) {
        if (rol == null || rol.getNombre() == null) return false;
        return rol.getNombre().toLowerCase(Locale.ROOT).contains("usuario");
    }

    /**
     * Decide whether to apply filtering for a user: user has at least one usuario-like role
     * and does not have any role with 'admin' in its name (case-insensitive).
     */
    private boolean shouldFilterForStandardUsuario(Usuario usuario) {
        if (usuario == null || usuario.getRoles() == null) return false;
        boolean hasUsuarioRole = usuario.getRoles().stream()
            .anyMatch(r -> r.getNombre() != null && r.getNombre().toLowerCase(Locale.ROOT).contains("usuario"));
        boolean hasAdminRole = usuario.getRoles().stream()
            .anyMatch(r -> r.getNombre() != null && r.getNombre().toLowerCase(Locale.ROOT).contains("admin"));
        return hasUsuarioRole && !hasAdminRole;
    }
}
