package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Cliente
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    
    /**
     * Busca clientes activos
     * 
     * @return Lista de clientes activos
     */
    List<Cliente> findByEstadoTrue();
    
    /**
     * Busca clientes por tipo de documento y número de documento
     * 
     * @param tipoDocumento Tipo de documento
     * @param numeroDocumento Número de documento
     * @return Optional con el cliente encontrado
     */
    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento);
    // En ClienteRepository.java (solo para referencia, no es un archivo que me enviaste)
       Optional<Cliente> findByTipoDocumentoAndNumeroDocumentoAndEstadoTrue(TipoDocumento tipoDocumento, String numeroDocumento);
    
    /**
     * Busca clientes por email
     * 
     * @param email Email del cliente
     * @return Optional con el cliente encontrado
     */
    Optional<Cliente> findByEmail(String email);
    
    /**
     * Busca clientes por nombre o apellido (búsqueda flexible)
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de clientes encontrados
     */
    @Query("SELECT c FROM Cliente c WHERE " +
           "LOWER(c.nombre) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.apellido) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.numeroDocumento) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.telefono) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Cliente> searchClientes(@Param("searchTerm") String searchTerm);
    
    /**
     * Busca clientes activos por término de búsqueda
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de clientes activos encontrados
     */
    @Query("SELECT c FROM Cliente c WHERE c.estado = true AND (" +
           "LOWER(c.nombre) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.apellido) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.numeroDocumento) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.telefono) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Cliente> searchClientesActivos(@Param("searchTerm") String searchTerm);
    
    /**
     * Verifica si existe un cliente con el mismo tipo y número de documento
     * 
     * @param tipoDocumento Tipo de documento
     * @param numeroDocumento Número de documento
     * @param idCliente ID del cliente a excluir (para edición)
     * @return true si existe, false si no
     */
    @Query("SELECT COUNT(c) > 0 FROM Cliente c WHERE " +
           "c.tipoDocumento = :tipoDocumento AND " +
           "c.numeroDocumento = :numeroDocumento AND " +
           "c.idCliente != :idCliente")
    boolean existsByTipoDocumentoAndNumeroDocumentoAndIdClienteNot(
        @Param("tipoDocumento") TipoDocumento tipoDocumento,
        @Param("numeroDocumento") String numeroDocumento,
        @Param("idCliente") Integer idCliente
    );
}
