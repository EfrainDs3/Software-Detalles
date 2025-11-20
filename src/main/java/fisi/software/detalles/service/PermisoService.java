package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.permiso.PermisoRequest;
import fisi.software.detalles.controller.dto.permiso.PermisoResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoResumenResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoRolDetalleResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoUsuarioDetalleResponse;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermisoService {

    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final PermisoRepository permisoRepository;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;

    private static final Set<String> RESTRICTED_MODULES_FOR_STANDARD_USER = Set.of(
        "PERMISOS",
        "ROLES",
        "USUARIOS"
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
            .filter(permiso -> {
                String modulo = Optional.ofNullable(permiso.getModulo()).orElse("");
                String normalized = modulo.toUpperCase(Locale.ROOT);
                return !normalized.equals("AUDITORÍA") && !normalized.equals("AUDITORIA");
            })
            .map(permiso -> {
                long totalUsuarios = permiso.getRoles().stream()
                    .mapToLong(rol -> usuarioRepository.countByRoles_Id(rol.getId()))
                    .sum();
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
        validarNombreUnico(null, request);
        Permiso permiso = new Permiso();
        aplicarDatos(permiso, request, true);
        Permiso guardado = permisoRepository.save(permiso);
        return PermisoResponse.fromEntity(guardado, 0L);
    }

    public PermisoResponse actualizarPermiso(Long id, PermisoRequest request) {
        Permiso permiso = obtenerEntidad(id);
        validarNombreUnico(id, request);
        aplicarDatos(permiso, request, false);
        Permiso guardado = permisoRepository.save(permiso);
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
        permisoRepository.delete(permiso);
    }

    public PermisoRolDetalleResponse listarPermisosPorRol(Integer rolId) {
        Rol rol = rolRepository.findWithPermisosById(rolId)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        // initialize permisos collection to avoid lazy loading in view
        Hibernate.initialize(rol.getPermisos());
        List<Permiso> permisosEnt = new ArrayList<>(rol.getPermisos());

        // NOTE: previous behavior removed filtering for 'usuario' roles so that
        // all roles can see the full set of permisos assigned to them. This
        // ensures that non-admin roles will still display permisos from all
        // modules (the UI can decide how to present or hide modules).

        List<PermisoResumenResponse> permisos = permisosEnt.stream()
            .filter(permiso -> {
                String modulo = Optional.ofNullable(permiso.getModulo()).orElse("");
                String normalized = modulo.toUpperCase(Locale.ROOT);
                return !normalized.equals("AUDITORÍA") && !normalized.equals("AUDITORIA");
            })
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

        rol.getPermisos().clear();
        rol.getPermisos().addAll(nuevosPermisos);
        Rol guardado = rolRepository.save(rol);

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
                .filter(r -> !RESTRICTED_MODULES_FOR_STANDARD_USER.contains(
                    Optional.ofNullable(r.permiso().modulo()).orElse("GENERAL").toUpperCase(Locale.ROOT)
                ))
                .toList();
        }

        return resultado;
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
        permiso.setModulo(normalizarTexto(request.modulo(), "El módulo es obligatorio"));
        permiso.setNombrePermiso(normalizarTexto(request.nombre(), "El nombre es obligatorio"));
        permiso.setDescripcion(StringUtils.hasText(request.descripcion()) ? request.descripcion().trim() : "");
        if (StringUtils.hasText(request.estado())) {
            permiso.setEstado(request.estado().trim().toUpperCase(Locale.ROOT));
        } else if (esNuevo && !StringUtils.hasText(permiso.getEstado())) {
            permiso.setEstado(ESTADO_ACTIVO);
        }
        if (!StringUtils.hasText(permiso.getEstado())) {
            permiso.setEstado(ESTADO_ACTIVO);
        }
    }

    private void validarNombreUnico(Long permisoId, PermisoRequest request) {
        String moduloNormalizado = normalizarTexto(request.modulo(), "El módulo es obligatorio");
        String nombreNormalizado = normalizarTexto(request.nombre(), "El nombre es obligatorio");
        permisoRepository.findByModuloIgnoreCaseAndNombrePermisoIgnoreCase(moduloNormalizado, nombreNormalizado)
            .ifPresent(existing -> {
                if (permisoId == null || !Objects.equals(existing.getIdPermiso(), permisoId)) {
                    throw new ValidationException("Ya existe un permiso con el mismo módulo y nombre");
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
        Map<String, List<PermisoResumenResponse>> agrupados = permisos.stream()
            .filter(item -> {
                String normalized = Optional.ofNullable(item.modulo()).orElse("").toUpperCase(Locale.ROOT);
                return !normalized.equals("AUDITORÍA") && !normalized.equals("AUDITORIA");
            })
            .collect(Collectors.groupingBy(p -> Optional.ofNullable(p.modulo()).orElse("GENERAL").toUpperCase(Locale.ROOT),
                Collectors.collectingAndThen(Collectors.toList(), list ->
                    list.stream()
                        .sorted(Comparator.comparing(PermisoResumenResponse::nombre, String.CASE_INSENSITIVE_ORDER))
                        .collect(Collectors.toList())
                )));
        agrupados.values().removeIf(List::isEmpty);
        return agrupados;
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
    // (Removed isStandardUserRole helper) role-based filtering moved to UI side if needed.

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
