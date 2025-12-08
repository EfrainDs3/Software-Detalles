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

        // Obtiene la suma de TOTOTAL de las ventas (estado='Emitido') para una apertura
        // específica
        @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(v.total), 0) FROM ComprobantePago v WHERE v.apertura.idApertura = :idApertura AND v.estado = 'Emitido'")
        java.math.BigDecimal sumTotalByAperturaId(
                        @org.springframework.data.repository.query.Param("idApertura") Long idApertura);

        // Listar ventas por apertura ordenadas por fecha reciente
        @org.springframework.data.jpa.repository.Query("SELECT v FROM ComprobantePago v WHERE v.apertura.idApertura = :idApertura ORDER BY v.fechaEmision DESC")
        java.util.List<ComprobantePago> findByApertura_IdAperturaOrderByFechaEmisionDesc(
                        @org.springframework.data.repository.query.Param("idApertura") Long idApertura);

        // Contar ventas por rango de fechas (para numeración diaria)
        long countByFechaEmisionBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}