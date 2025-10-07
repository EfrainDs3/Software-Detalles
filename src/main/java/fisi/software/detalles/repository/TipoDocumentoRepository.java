package fisi.software.detalles.repository;

import fisi.software.detalles.entity.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para la entidad TipoDocumento
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Repository
public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Integer> {
    
    /**
     * Busca un tipo de documento por su nombre
     * 
     * @param nombreTipoDocumento Nombre del tipo de documento
     * @return Optional con el tipo de documento encontrado
     */
    Optional<TipoDocumento> findByNombreTipoDocumento(String nombreTipoDocumento);
}
