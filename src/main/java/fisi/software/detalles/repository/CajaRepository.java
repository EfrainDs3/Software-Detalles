package fisi.software.detalles.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fisi.software.detalles.entity.Caja;
import java.util.List;


public interface CajaRepository extends JpaRepository<Caja, Integer> {
    List<Caja> findByEstado(String estado);
}
