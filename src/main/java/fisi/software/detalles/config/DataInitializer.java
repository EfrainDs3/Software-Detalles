package fisi.software.detalles.config;

import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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
    
    /**
     * Inicializa los tipos de documento si no existen
     */
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
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
            new RolSeed("Compras", "Gestión de proveedores y compras"),
            new RolSeed("Usuario", "Acceso limitado a módulos asignados")
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
            new PermisoSeed("DASHBOARD_VIEW", "Acceder al dashboard", "Permite visualizar el panel principal", List.of("Administrador", "Gerente", "Analista")),
            new PermisoSeed("USERS_VIEW", "Ver usuarios", "Permite visualizar la lista de usuarios", List.of("Administrador", "Gerente", "Supervisor")),
            new PermisoSeed("USERS_MANAGE", "Gestionar usuarios", "Permite crear, editar y eliminar usuarios", List.of("Administrador", "Gerente")),
            new PermisoSeed("ROLES_VIEW", "Ver roles", "Permite visualizar los roles registrados", List.of("Administrador", "Gerente", "Supervisor")),
            new PermisoSeed("ROLES_MANAGE", "Gestionar roles", "Permite crear, editar y eliminar roles", List.of("Administrador")),
            new PermisoSeed("PERMISSIONS_VIEW", "Ver permisos", "Permite visualizar permisos del sistema", List.of("Administrador", "Gerente")),
            new PermisoSeed("PERMISSIONS_MANAGE", "Gestionar permisos", "Permite asignar y revocar permisos", List.of("Administrador")),
            new PermisoSeed("VENTAS_REGISTRAR", "Registrar ventas", "Permite registrar nuevas ventas", List.of("Administrador", "Vendedor", "Cajero")),
            new PermisoSeed("INVENTARIO_GESTIONAR", "Gestionar inventario", "Permite gestionar stock y movimientos", List.of("Administrador", "Almacenero")),
            new PermisoSeed("COMPRAS_GESTIONAR", "Gestionar compras", "Permite registrar órdenes de compra", List.of("Administrador", "Compras"))
        );

        Map<String, Permiso> permisosMap = new HashMap<>();

        permisos.forEach(seed -> {
            permisoRepository.findByCodigoIgnoreCase(seed.codigo())
                .ifPresentOrElse(existing -> {
                    actualizarDatosPermiso(existing, seed);
                    permisosMap.put(existing.getCodigo(), existing);
                }, () -> {
                    Permiso permiso = new Permiso();
                    permiso.setCodigo(seed.codigo());
                    permiso.setNombrePermiso(seed.nombre());
                    permiso.setDescripcion(seed.descripcion());
                    permiso.setEstado(ESTADO_ACTIVO);
                    Permiso guardado = permisoRepository.save(permiso);
                    permisosMap.put(guardado.getCodigo(), guardado);
                    log.info("  ➕ Permiso creado: {}", guardado.getCodigo());
                });
        });

        if (!permisosMap.isEmpty()) {
            permisoRepository.saveAll(permisosMap.values());
        }

        asignarPermisosPorRol(permisos, permisosMap);
    }

    private void actualizarDatosPermiso(Permiso permiso, PermisoSeed seed) {
        boolean requiereActualizacion = false;
        if (!Objects.equals(permiso.getNombrePermiso(), seed.nombre())) {
            permiso.setNombrePermiso(seed.nombre());
            requiereActualizacion = true;
        }
        if (!Objects.equals(permiso.getDescripcion(), seed.descripcion())) {
            permiso.setDescripcion(seed.descripcion());
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
            Permiso permiso = permisosMap.get(seed.codigo());
            if (rol != null && permiso != null && rol.getPermisos().stream().noneMatch(p -> p.getIdPermiso().equals(permiso.getIdPermiso()))) {
                rol.getPermisos().add(permiso);
                log.info("  ✅ Permiso {} asignado al rol {}", permiso.getCodigo(), rol.getNombre());
            }
        }));

        rolRepository.saveAll(roles.values());
    }

    private record RolSeed(String nombre, String descripcion) { }

    private record PermisoSeed(String codigo, String nombre, String descripcion, List<String> rolesPorDefecto) { }
}
