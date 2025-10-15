package fisi.software.detalles.repository;

import fisi.software.detalles.entity.ComprobantePago; // 👈 AJUSTA EL NOMBRE DE LA ENTIDAD SI ES NECESARIO
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para la entidad ComprobantePago (Tabla: comprobantespago).
 * Extiende JpaRepository para obtener las funcionalidades CRUD básicas.
 */
@Repository
public interface VentaRepository extends JpaRepository<ComprobantePago, Long> {
    
    // Spring Data JPA automáticamente proporciona:
    // - findAll() para listar todas las ventas.
    // - save(ComprobantePago venta) para guardar o actualizar una venta.
    // - findById(Long id) para buscar por ID.
    
    // Si necesitas métodos de consulta específicos, los agregarías aquí.
    // Ejemplo:
    // List<ComprobantePago> findByEstado(String estado);
}