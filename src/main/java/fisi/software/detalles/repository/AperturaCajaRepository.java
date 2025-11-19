package fisi.software.detalles.repository;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fisi.software.detalles.entity.AperturaCaja;

public interface AperturaCajaRepository extends JpaRepository<AperturaCaja, Long> {
    // Consulta para encontrar la apertura que NO tiene un cierre asociado (caja activa)
    @Query("SELECT a FROM AperturaCaja a WHERE a.cierre IS NULL AND a.caja.idCaja = :idCaja")
    Optional<AperturaCaja> findActiveAperturaByCajaId(@Param("idCaja") Integer idCaja);
    
    // Consulta para obtener el historial cargando las relaciones LAZY para evitar N+1
    @Query("SELECT a FROM AperturaCaja a LEFT JOIN FETCH a.cierre c LEFT JOIN FETCH a.usuario u ORDER BY a.idApertura DESC")
    List<AperturaCaja> findAllWithCierreAndUsuario();
    
    // Consulta para calcular el total de ventas durante un periodo de apertura
    @Query("SELECT SUM(v.total) FROM ComprobantePago v WHERE v.apertura.idApertura = :idApertura")
    BigDecimal findVentasByAperturaId(@Param("idApertura") Long idApertura);
}
