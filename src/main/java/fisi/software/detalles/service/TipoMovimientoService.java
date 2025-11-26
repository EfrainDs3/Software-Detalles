package fisi.software.detalles.service;

import fisi.software.detalles.entity.TipoMovimientoInventario;
import fisi.software.detalles.repository.TipoMovimientoInventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para la gestión de tipos de movimiento de inventario
 */
@Service
@Transactional
@RequiredArgsConstructor
public class TipoMovimientoService {

    private final TipoMovimientoInventarioRepository tipoMovimientoRepository;

    /**
     * Listar todos los tipos de movimiento
     */
    public List<TipoMovimientoInventario> listarTodos() {
        return tipoMovimientoRepository.findAll();
    }

    /**
     * Obtener tipo de movimiento por ID
     */
    public TipoMovimientoInventario obtenerPorId(Long id) {
        return tipoMovimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de movimiento no encontrado con ID: " + id));
    }

    /**
     * Crear nuevo tipo de movimiento
     */
    public TipoMovimientoInventario crear(TipoMovimientoInventario tipo) {
        // Validaciones
        if (tipo.getNombre() == null || tipo.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del tipo de movimiento es obligatorio");
        }

        if (tipo.getEsEntrada() == null) {
            throw new RuntimeException("Debe especificar si es entrada o salida");
        }

        // Verificar que no exista un tipo con el mismo nombre
        if (tipoMovimientoRepository.findByNombre(tipo.getNombre()).isPresent()) {
            throw new RuntimeException("Ya existe un tipo de movimiento con ese nombre");
        }

        return tipoMovimientoRepository.save(tipo);
    }

    /**
     * Actualizar tipo de movimiento existente
     */
    public TipoMovimientoInventario actualizar(Long id, TipoMovimientoInventario tipoActualizado) {
        TipoMovimientoInventario tipoExistente = obtenerPorId(id);

        // Validaciones
        if (tipoActualizado.getNombre() == null || tipoActualizado.getNombre().trim().isEmpty()) {
            throw new RuntimeException("El nombre del tipo de movimiento es obligatorio");
        }

        if (tipoActualizado.getEsEntrada() == null) {
            throw new RuntimeException("Debe especificar si es entrada o salida");
        }

        // Verificar que no exista otro tipo con el mismo nombre
        tipoMovimientoRepository.findByNombre(tipoActualizado.getNombre())
                .ifPresent(tipo -> {
                    if (!tipo.getId().equals(tipoExistente.getId())) {
                        throw new RuntimeException("Ya existe otro tipo de movimiento con ese nombre");
                    }
                });

        // Actualizar campos
        tipoExistente.setNombre(tipoActualizado.getNombre());
        tipoExistente.setEsEntrada(tipoActualizado.getEsEntrada());

        return tipoMovimientoRepository.save(tipoExistente);
    }
}
