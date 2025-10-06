package fisi.software.detalles.config;

import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
public class DataInitializer {
    
    private final TipoDocumentoRepository tipoDocumentoRepository;
    
    /**
     * Inicializa los tipos de documento si no existen
     */
    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Verificar si ya existen tipos de documento
            long count = tipoDocumentoRepository.count();
            
            if (count == 0) {
                log.info("Inicializando tipos de documento...");
                
                // Crear tipos de documento
                List<TipoDocumento> tiposDocumento = Arrays.asList(
                    new TipoDocumento(null, "DNI"),
                    new TipoDocumento(null, "RUC")
                );
                
                // Guardar en la base de datos
                tipoDocumentoRepository.saveAll(tiposDocumento);
                
                log.info("✅ Tipos de documento creados exitosamente:");
                tipoDocumentoRepository.findAll().forEach(tipo -> 
                    log.info("  - ID: {}, Nombre: {}", tipo.getIdTipoDocumento(), tipo.getNombreTipoDocumento())
                );
            } else {
                log.info("✅ Tipos de documento ya existen en la base de datos (Total: {})", count);
            }
        };
    }
}
