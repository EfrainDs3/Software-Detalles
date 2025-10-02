package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    
    // Buscar por RUC
    Optional<Proveedor> findByRuc(String ruc);

    // Buscar por estado
    List<Proveedor> findByEstado(Integer estado);

    // Buscar por razón social (contiene) y estado
    List<Proveedor> findByRazonSocialContainingIgnoreCaseAndEstado(String razonSocial, Integer estado);

    // Buscar por nombre comercial (contiene) y estado
    List<Proveedor> findByNombreComercialContainingIgnoreCaseAndEstado(String nombreComercial, Integer estado);

    // Buscar por rubro y estado
    List<Proveedor> findByRubroAndEstado(String rubro, Integer estado);

    // Buscar por ID y estado
    Optional<Proveedor> findByIdProveedorAndEstado(Integer idProveedor, Integer estado);

    // Verificar si existe un RUC con estado específico
    boolean existsByRucAndEstado(String ruc, Integer estado);
}
