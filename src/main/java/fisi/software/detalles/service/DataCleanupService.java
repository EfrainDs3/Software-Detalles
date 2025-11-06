package fisi.software.detalles.service;

import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataCleanupService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    @Transactional
    public void performFullCleanup() {
        deleteTestUsers();
        deleteUsuarioRole();
        deleteUsuarioRolesByPattern();
    }

    @Transactional
    public void deleteTestUsers() {
        log.error("🔍 Eliminando usuarios de prueba...");

        List<String> testEmails = List.of(
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

    @Transactional
    public void deleteUsuarioRole() {
        final String nombreRol = "Usuario";
        log.info("🔍 Buscando rol '{}' en la base de datos...", nombreRol);

        rolRepository.findByNombreIgnoreCase(nombreRol).ifPresentOrElse(rol -> {
            log.info("🔍 Rol encontrado (id={}), procediendo a eliminar asociaciones...", rol.getId());

            // Buscar usuarios que tengan este rol usando el repo (evita problemas de lazy)
            List<fisi.software.detalles.entity.Usuario> usuariosConRol = usuarioRepository.findByRoles_IdOrderByNombresAscApellidosAsc(rol.getId());
            if (!usuariosConRol.isEmpty()) {
                usuariosConRol.forEach(usuario -> {
                    boolean removed = usuario.getRoles().removeIf(r -> r.getId().equals(rol.getId()));
                    if (removed) {
                        usuarioRepository.save(usuario);
                        log.info("  ➖ Rol '{}' removido del usuario: {}", nombreRol, usuario.getEmail());
                    }
                });
            } else {
                log.info("  ➖ No se encontraron usuarios con el rol '{}'", nombreRol);
            }

            // Limpiar permisos asociados al rol (join table) y eliminar
            rol.getPermisos().clear();
            rolRepository.save(rol);
            rolRepository.delete(rol);
            log.info("✅ Rol '{}' eliminado de la base de datos.", nombreRol);
        }, () -> log.info("ℹ️ Rol '{}' no existe en la base de datos, nada que eliminar.", nombreRol));
    }

    @Transactional
    public void deleteUsuarioRolesByPattern() {
        log.info("🔎 Buscando roles que contengan 'usuario' en el nombre para eliminación...\n");
        List<Rol> encontrados = rolRepository.findAll().stream()
            .filter(r -> r.getNombre() != null && r.getNombre().toLowerCase().contains("usuario"))
            .toList();

        if (encontrados.isEmpty()) {
            log.info("ℹ️ No se encontraron roles con 'usuario' en el nombre.");
            return;
        }

        encontrados.forEach(rol -> {
            log.info("  ➖ Eliminando rol encontrado: {} (id={})", rol.getNombre(), rol.getId());

            // Remover el rol de usuarios
            List<fisi.software.detalles.entity.Usuario> usuariosConRol = usuarioRepository.findByRoles_IdOrderByNombresAscApellidosAsc(rol.getId());
            usuariosConRol.forEach(usuario -> {
                usuario.getRoles().removeIf(r -> r.getId().equals(rol.getId()));
                usuarioRepository.save(usuario);
                log.info("    ✔ Rol removido del usuario {}", usuario.getEmail());
            });

            // Limpiar permisos y eliminar rol
            rol.getPermisos().clear();
            rolRepository.save(rol);
            rolRepository.delete(rol);
            log.info("    ✅ Rol {} eliminado.", rol.getNombre());
        });
    }

    @Transactional
    public void deletePermissionByName(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) return;
        String nombreNormalizado = nombre.trim();
        log.info("🔍 Buscando permiso '{}' para eliminación...", nombreNormalizado);
        permisoRepository.findByNombrePermisoIgnoreCase(nombreNormalizado).ifPresentOrElse(permiso -> {
            log.info("🔍 Permiso encontrado (id={}), removiendo asociaciones...", permiso.getIdPermiso());

            // Remover permiso de roles
            List<Rol> rolesConPermiso = rolRepository.findAll().stream()
                .filter(r -> r.getPermisos().stream().anyMatch(p -> Objects.equals(p.getIdPermiso(), permiso.getIdPermiso())))
                .toList();

            rolesConPermiso.forEach(rol -> {
                rol.getPermisos().removeIf(p -> Objects.equals(p.getIdPermiso(), permiso.getIdPermiso()));
                rolRepository.save(rol);
                log.info("  ➖ Permiso removido del rol {}", rol.getNombre());
            });

            // Finalmente eliminar el permiso
            permisoRepository.delete(permiso);
            log.info("✅ Permiso '{}' eliminado de la base de datos.", nombreNormalizado);
        }, () -> log.info("ℹ️ Permiso '{}' no existe en la base de datos, nada que eliminar.", nombreNormalizado));
    }
}
