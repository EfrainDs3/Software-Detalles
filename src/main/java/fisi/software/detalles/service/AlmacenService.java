package fisi.software.detalles.service;

import fisi.software.detalles.entity.Almacen;
import fisi.software.detalles.repository.AlmacenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para la gestión de almacenes
 */
@Service
@Transactional
public class AlmacenService {

    @Autowired
    private AlmacenRepository almacenRepository;

    /**
     * Obtiene todos los almacenes activos
     */
    public List<Almacen> obtenerTodosAlmacenes() {
        return almacenRepository.findAll();
    }

    /**
     * Obtiene un almacén por ID
     */
    public Optional<Almacen> obtenerAlmacenPorId(Long id) {
        return almacenRepository.findById(id);
    }

    /**
     * Crea un nuevo almacén
     */
    public Almacen crearAlmacen(String nombre, String ubicacion) {
        if (almacenRepository.existsByNombre(nombre)) {
            throw new RuntimeException("Ya existe un almacén con ese nombre");
        }

        Almacen almacen = new Almacen(nombre, ubicacion);
        return almacenRepository.save(almacen);
    }

    /**
     * Actualiza un almacén existente
     */
    public Almacen actualizarAlmacen(Long id, String nombre, String ubicacion) {
        Almacen almacen = almacenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        // Verificar si el nombre ya existe en otro almacén
        Optional<Almacen> existente = almacenRepository.findByNombre(nombre);
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new RuntimeException("Ya existe un almacén con ese nombre");
        }

        almacen.setNombre(nombre);
        almacen.setUbicacion(ubicacion);

        return almacenRepository.save(almacen);
    }

    /**
     * Elimina un almacén (borrado lógico - verificar si tiene productos asociados)
     */
    public void eliminarAlmacen(Long id) {
        Almacen almacen = almacenRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Almacén no encontrado"));

        // Verificar si tiene productos asociados
        if (!almacen.getInventarios().isEmpty()) {
            throw new RuntimeException("No se puede eliminar el almacén porque tiene productos asociados");
        }

        almacenRepository.delete(almacen);
    }

    /**
     * Verifica si existe un almacén con el nombre especificado
     */
    public boolean existeAlmacenPorNombre(String nombre) {
        return almacenRepository.existsByNombre(nombre);
    }
}