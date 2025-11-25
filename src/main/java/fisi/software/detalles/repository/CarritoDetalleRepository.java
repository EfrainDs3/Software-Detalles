package fisi.software.detalles.repository;

import fisi.software.detalles.entity.CarritoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarritoDetalleRepository extends JpaRepository<CarritoDetalle, Long> {
int countByCarrito_IdCarrito(Long idCarrito);
}
