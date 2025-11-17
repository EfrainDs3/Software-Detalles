package fisi.software.detalles.config;

import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import fisi.software.detalles.service.DataCleanupService;
import fisi.software.detalles.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/* */
/* */

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Configuración para inicializar datos en la base de datos
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class DataInitializer {
    
    private static final String ESTADO_ACTIVO = "ACTIVO";

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DataCleanupService dataCleanupService;
    
    /**
     * Inicializa los tipos de documento si no existen
     */
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Run cleanup through a dedicated transactional service to avoid lazy-init outside session
            dataCleanupService.performFullCleanup();
            dataCleanupService.deletePermissionByName("Ver roles");
            log.info("📝 Roles actualmente en la base de datos:");
            rolRepository.findAll().forEach(r -> log.info("  - id={} nombre='{}' estado={}", r.getId(), r.getNombre(), r.getEstado()));
            inicializarTiposDocumento();
            inicializarRoles();
            inicializarPermisos();
        };
    }

    private void inicializarTiposDocumento() {
        long count = tipoDocumentoRepository.count();

        if (count == 0) {
            log.info("Inicializando tipos de documento...");

            List<TipoDocumento> tiposDocumento = Arrays.asList(
                new TipoDocumento(null, "DNI"),
                new TipoDocumento(null, "RUC"),
                new TipoDocumento(null, "Pasaporte"),
                new TipoDocumento(null, "Carnet Extranjería")
            );

            tipoDocumentoRepository.saveAll(tiposDocumento);

            log.info("✅ Tipos de documento creados exitosamente:");
            tipoDocumentoRepository.findAll().forEach(tipo ->
                log.info("  - ID: {}, Nombre: {}", tipo.getIdTipoDocumento(), tipo.getNombreTipoDocumento())
            );
        } else {
            log.info("✅ Tipos de documento ya existen en la base de datos (Total: {})", count);
        }
    }

    @SuppressWarnings("unused")
    private void deleteTestUsers() {
        log.error("🔍 Eliminando usuarios de prueba...");

        List<String> testEmails = Arrays.asList(
            "admin@test.com",
            "gerente@test.com", 
            "supervisor@test.com",
            "analista@test.com",
            "vendedor@test.com",
            "cajero@test.com",
            "almacenero@test.com",
            "compras@test.com"
        );

        testEmails.forEach(email -> {
            usuarioRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                usuarioRepository.delete(user);
                log.error("  🗑️ Usuario de prueba eliminado: {}", email);
            });
        });

        log.error("✅ Eliminación de usuarios de prueba completada");
    }

    /**
     * Elimina de raíz el rol llamado "Usuario" y todas sus asociaciones.
     */
    // Cleanup operations moved to DataCleanupService to ensure proper transactional boundaries

    private void inicializarRoles() {
        log.info("Verificando catálogo de roles por defecto...");

        List<RolSeed> rolesPorDefecto = Arrays.asList(
            new RolSeed("Administrador", "Acceso total al sistema"),
            new RolSeed("Gerente", "Gestión de operaciones y reportes"),
            new RolSeed("Supervisor", "Supervisión general de las operaciones"),
            new RolSeed("Analista", "Acceso a reportes y estadísticas"),
            new RolSeed("Vendedor", "Acceso a ventas y clientes"),
            new RolSeed("Cajero", "Gestión de caja y cobranzas"),
            new RolSeed("Almacenero", "Gestión de inventario y almacén"),
            new RolSeed("Compras", "Gestión de proveedores y compras")
        );

        List<Rol> rolesNuevos = rolesPorDefecto.stream()
            .filter(seed -> rolRepository.findByNombreIgnoreCase(seed.nombre()).isEmpty())
            .map(seed -> crearRol(seed.nombre(), seed.descripcion()))
            .toList();

        if (!rolesNuevos.isEmpty()) {
            rolRepository.saveAll(rolesNuevos);
            log.info("✅ Se agregaron {} nuevos roles por defecto", rolesNuevos.size());
            rolesNuevos.forEach(rol ->
                log.info("  - {}", rol.getNombre())
            );
        } else {
            log.info("✅ Todos los roles por defecto ya existen (Total actual: {})", rolRepository.count());
        }
    }

    private Rol crearRol(String nombre, String descripcion) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setDescripcion(descripcion);
        rol.setEstado(Boolean.TRUE);
        return rol;
    }

    private void inicializarPermisos() {
        log.info("Verificando permisos por defecto...");

        List<PermisoSeed> permisos = Arrays.asList(
            new PermisoSeed(
                "Acceder al dashboard",
                "Permite visualizar el panel principal",
                "Dashboard",
                List.of("Administrador", "Gerente", "Analista")
            ),
            new PermisoSeed(
                "Ver usuarios",
                "Permite visualizar la lista de usuarios",
                "Usuarios",
                List.of("Administrador", "Gerente", "Supervisor")
            ),
            new PermisoSeed(
                "Gestionar usuarios",
                "Permite crear, editar y eliminar usuarios",
                "Usuarios",
                List.of("Administrador", "Gerente")
            ),
            new PermisoSeed(
                "Gestionar clientes",
                "Permite crear, editar y eliminar clientes",
                "Clientes",
                List.of("Administrador", "Gerente", "Vendedor")
            ),
            // ROLES_VIEW removed by initializer for seguridad - not seeded
            new PermisoSeed(
                "Gestionar roles",
                "Permite crear, editar y eliminar roles",
                "Roles",
                List.of("Administrador")
            ),
            new PermisoSeed(
                "Ver permisos",
                "Permite visualizar permisos del sistema",
                "Permisos",
                List.of("Administrador", "Gerente")
            ),
            new PermisoSeed(
                "Gestionar permisos",
                "Permite asignar y revocar permisos",
                "Permisos",
                List.of("Administrador")
            ),
            new PermisoSeed(
                "Registrar ventas",
                "Permite registrar nuevas ventas",
                "Ventas",
                List.of("Administrador", "Vendedor", "Cajero")
            ),
            new PermisoSeed(
                "Gestionar inventario",
                "Permite gestionar stock y movimientos",
                "Inventario",
                List.of("Administrador", "Almacenero")
            ),
            new PermisoSeed(
                "Gestionar compras",
                "Permite registrar órdenes de compra",
                "Compras",
                List.of("Administrador", "Compras")
            )
        );

        Map<String, Permiso> permisosMap = new HashMap<>();

        permisos.forEach(seed -> {
            final String moduloNormalizado = normalizarModulo(seed.modulo());
            permisoRepository.findByNombrePermisoIgnoreCase(seed.nombre())
                .ifPresentOrElse(existing -> {
                    actualizarDatosPermiso(existing, seed, moduloNormalizado);
                    permisosMap.put(clavePermiso(existing.getNombrePermiso()), existing);
                }, () -> {
                    Permiso permiso = new Permiso();
                    permiso.setNombrePermiso(seed.nombre());
                    permiso.setDescripcion(seed.descripcion());
                    permiso.setEstado(ESTADO_ACTIVO);
                    permiso.setModulo(moduloNormalizado);
                    Permiso guardado = permisoRepository.save(permiso);
                    permisosMap.put(clavePermiso(guardado.getNombrePermiso()), guardado);
                    log.info("  ➕ Permiso creado: {}", guardado.getNombrePermiso());
                });
        });

        if (!permisosMap.isEmpty()) {
            permisoRepository.saveAll(permisosMap.values());
        }

        asignarPermisosPorRol(permisos, permisosMap);
    }

    private void actualizarDatosPermiso(Permiso permiso, PermisoSeed seed, String moduloNormalizado) {
        boolean requiereActualizacion = false;
        if (!Objects.equals(permiso.getNombrePermiso(), seed.nombre())) {
            permiso.setNombrePermiso(seed.nombre());
            requiereActualizacion = true;
        }
        if (!Objects.equals(permiso.getDescripcion(), seed.descripcion())) {
            permiso.setDescripcion(seed.descripcion());
            requiereActualizacion = true;
        }
        if (!Objects.equals(permiso.getModulo(), moduloNormalizado)) {
            permiso.setModulo(moduloNormalizado);
            requiereActualizacion = true;
        }
        if (permiso.getEstado() == null || !permiso.getEstado().equalsIgnoreCase(ESTADO_ACTIVO)) {
            permiso.setEstado(ESTADO_ACTIVO);
            requiereActualizacion = true;
        }
        if (requiereActualizacion) {
            permisoRepository.save(permiso);
        }
    }

    private void asignarPermisosPorRol(List<PermisoSeed> seeds, Map<String, Permiso> permisosMap) {
        Map<String, Rol> roles = rolRepository.findAll().stream()
            .collect(java.util.stream.Collectors.toMap(rol -> rol.getNombre().toLowerCase(), rol -> rol));

        seeds.forEach(seed -> seed.rolesPorDefecto().forEach(rolNombre -> {
            Rol rol = roles.get(rolNombre.toLowerCase());
            Permiso permiso = permisosMap.get(clavePermiso(seed.nombre()));
            if (rol != null && permiso != null && rol.getPermisos().stream().noneMatch(p -> p.getIdPermiso().equals(permiso.getIdPermiso()))) {
                rol.getPermisos().add(permiso);
                log.info("  ✅ Permiso '{}' asignado al rol {}", permiso.getNombrePermiso(), rol.getNombre());
            }
        }));

        rolRepository.saveAll(roles.values());
    }

    private record RolSeed(String nombre, String descripcion) { }

    private record PermisoSeed(String nombre, String descripcion, String modulo, List<String> rolesPorDefecto) { }

    private String clavePermiso(String nombre) {
        return nombre == null ? "" : nombre.trim().toLowerCase();
    }

    private String normalizarModulo(String modulo) {
        if (modulo == null || modulo.trim().isEmpty()) {
            return "General";
        }
        String[] tokens = modulo.trim().toLowerCase(Locale.ROOT).split("\\s+");
        return Arrays.stream(tokens)
            .filter(token -> !token.isBlank())
            .map(token -> Character.toUpperCase(token.charAt(0)) + token.substring(1))
            .collect(Collectors.joining(" "));
    }

    // deletePermissionByName moved to DataCleanupService
}
