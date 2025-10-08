package fisi.software.detalles.config;

import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.List;

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
    
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final RolRepository rolRepository;
    
    /**
     * Inicializa los tipos de documento si no existen
     */
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            inicializarTiposDocumento();
            inicializarRoles();
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
        long rolesCount = rolRepository.count();

        if (rolesCount == 0) {
            log.info("Inicializando roles de usuario...");

            List<Rol> roles = Arrays.asList(
                crearRol("Administrador", "Acceso total al sistema"),
                crearRol("Gerente", "Gestión de operaciones y reportes"),
                crearRol("Usuario", "Acceso limitado a módulos asignados"),
                crearRol("Vendedor", "Acceso a ventas y clientes")
            );

            rolRepository.saveAll(roles);

            log.info("✅ Roles creados exitosamente:");
            rolRepository.findAll().forEach(rol ->
                log.info("  - ID: {}, Nombre: {}", rol.getId(), rol.getNombre())
            );
        } else {
            log.info("✅ Roles ya existen en la base de datos (Total: {})", rolesCount);
        }
    }

    private Rol crearRol(String nombre, String descripcion) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setDescripcion(descripcion);
        rol.setEstado(Boolean.TRUE);
        return rol;
    }
}
