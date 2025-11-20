package fisi.software.detalles.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import fisi.software.detalles.entity.AperturaCaja;

@Repository
public interface AperturaCajaRepository extends JpaRepository<AperturaCaja, Long> {
    
    // Buscar apertura activa (sin cierre) de una caja específica
    @Query("SELECT a FROM AperturaCaja a WHERE a.caja.idCaja = :idCaja AND a.cierre IS NULL")
    Optional<AperturaCaja> findActiveAperturaByCajaId(@Param("idCaja") Integer idCaja);

    @Query("SELECT a FROM AperturaCaja a WHERE a.cierre IS NULL ORDER BY a.idApertura DESC")
    Optional<AperturaCaja> findAnyActiveApertura();
    
    // Listar todas las aperturas con sus cierres y usuarios
    @Query("SELECT a FROM AperturaCaja a LEFT JOIN FETCH a.cierre LEFT JOIN FETCH a.usuario ORDER BY a.idApertura DESC")
    List<AperturaCaja> findAllWithCierreAndUsuario();
    
    // ✅ MÉTODO CORREGIDO: Calcular ventas de una apertura específica
    // Usa COALESCE para devolver 0 en lugar de null si no hay ventas
    @Query("SELECT COALESCE(SUM(cp.total), 0.0) FROM ComprobantePago cp WHERE cp.apertura.idApertura = :idApertura")
    BigDecimal findVentasByAperturaId(@Param("idApertura") Long idApertura);
}