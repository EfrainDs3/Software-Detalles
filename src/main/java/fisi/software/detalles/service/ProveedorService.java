package fisi.software.detalles.service;

import fisi.software.detalles.entity.Proveedor;
import fisi.software.detalles.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    private static final int ESTADO_ACTIVO = 1;
    private static final int ESTADO_INACTIVO = 0;

    // Obtener todos los proveedores
    public List<Proveedor> getAllProveedores() {
        return proveedorRepository.findByEstado(ESTADO_ACTIVO);
    }

    // Obtener proveedor por ID
    public Optional<Proveedor> getProveedorById(Integer id) {
    return proveedorRepository.findByIdProveedorAndEstado(id, ESTADO_ACTIVO);
    }

    // Obtener proveedor por RUC
    public Optional<Proveedor> getProveedorByRuc(String ruc) {
        return proveedorRepository.findByRuc(ruc);
    }

    // Buscar proveedores por razón social
    public List<Proveedor> searchByRazonSocial(String razonSocial) {
        return proveedorRepository.findByRazonSocialContainingIgnoreCaseAndEstado(razonSocial, ESTADO_ACTIVO);
    }

    // Buscar proveedores por nombre comercial
    public List<Proveedor> searchByNombreComercial(String nombreComercial) {
        return proveedorRepository.findByNombreComercialContainingIgnoreCaseAndEstado(nombreComercial, ESTADO_ACTIVO);
    }

    // Buscar proveedores por rubro
    public List<Proveedor> getProveedoresByRubro(String rubro) {
        return proveedorRepository.findByRubroAndEstado(rubro, ESTADO_ACTIVO);
    }

    // Crear o actualizar proveedor
    public Proveedor saveProveedor(Proveedor proveedor) {
        // Validar que el RUC no exista (solo para nuevos proveedores)
        if (proveedor.getIdProveedor() == null && proveedor.getRuc() != null) {
            if (proveedorRepository.existsByRucAndEstado(proveedor.getRuc(), ESTADO_ACTIVO)) {
                throw new RuntimeException("Ya existe un proveedor con el RUC: " + proveedor.getRuc());
            }
        }

        if (proveedor.getEstado() == null) {
            proveedor.setEstado(ESTADO_ACTIVO);
        }
        return proveedorRepository.save(proveedor);
    }

    // Actualizar proveedor
    public Proveedor updateProveedor(Integer id, Proveedor proveedorActualizado) {
    return proveedorRepository.findByIdProveedorAndEstado(id, ESTADO_ACTIVO)
                .map(proveedor -> {
                    proveedor.setRazonSocial(proveedorActualizado.getRazonSocial());
                    proveedor.setNombreComercial(proveedorActualizado.getNombreComercial());
                    
                    // Validar RUC solo si cambió
                    if (!proveedor.getRuc().equals(proveedorActualizado.getRuc())) {
                        if (proveedorRepository.existsByRucAndEstado(proveedorActualizado.getRuc(), ESTADO_ACTIVO)) {
                            throw new RuntimeException("Ya existe un proveedor con el RUC: " + proveedorActualizado.getRuc());
                        }
                        proveedor.setRuc(proveedorActualizado.getRuc());
                    }
                    
                    proveedor.setRubro(proveedorActualizado.getRubro());
                    proveedor.setDireccion(proveedorActualizado.getDireccion());
                    proveedor.setTelefono(proveedorActualizado.getTelefono());
                    proveedor.setEmail(proveedorActualizado.getEmail());
                    
                    return proveedorRepository.save(proveedor);
                })
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + id));
    }

    // Eliminar proveedor
    public void deleteProveedor(Integer id) {
    Proveedor proveedor = proveedorRepository.findByIdProveedorAndEstado(id, ESTADO_ACTIVO)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con ID: " + id));

        proveedor.setEstado(ESTADO_INACTIVO);
        proveedorRepository.save(proveedor);
    }

    // Verificar si existe un RUC
    public boolean existsByRuc(String ruc) {
        return proveedorRepository.existsByRucAndEstado(ruc, ESTADO_ACTIVO);
    }
}
