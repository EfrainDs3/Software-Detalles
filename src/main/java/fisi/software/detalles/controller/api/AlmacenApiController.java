package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.Almacen;
import fisi.software.detalles.service.AlmacenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la API de almacenes
 */
@RestController
@RequestMapping("/api/almacenes")
@RequiredArgsConstructor
@Validated
public class AlmacenApiController {

    private final AlmacenService almacenService;

    /**
     * GET /api/almacenes - Listar todos los almacenes
     */
    @GetMapping
    public ResponseEntity<List<Almacen>> listarAlmacenes() {
        List<Almacen> almacenes = almacenService.obtenerTodosAlmacenes();
        return ResponseEntity.ok(almacenes);
    }

    /**
     * GET /api/almacenes/{id} - Obtener almacén por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Almacen> obtenerAlmacen(@PathVariable Long id) {
        return almacenService.obtenerAlmacenPorId(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/almacenes - Crear nuevo almacén
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> crearAlmacen(
            @RequestParam String nombre,
            @RequestParam(required = false) String ubicacion) {

        try {
            Almacen almacen = almacenService.crearAlmacen(nombre, ubicacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(almacen);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * PUT /api/almacenes/{id} - Actualizar almacén
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarAlmacen(
            @PathVariable Long id,
            @RequestParam String nombre,
            @RequestParam(required = false) String ubicacion) {

        try {
            Almacen almacen = almacenService.actualizarAlmacen(id, nombre, ubicacion);
            return ResponseEntity.ok(almacen);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * DELETE /api/almacenes/{id} - Eliminar almacén
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarAlmacen(@PathVariable Long id) {
        try {
            almacenService.eliminarAlmacen(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Almacén eliminado correctamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET /api/almacenes/verificar-nombre - Verificar si existe un nombre
     */
    @GetMapping("/verificar-nombre")
    public ResponseEntity<Map<String, Boolean>> verificarNombre(@RequestParam String nombre) {
        boolean existe = almacenService.existeAlmacenPorNombre(nombre);
        Map<String, Boolean> response = new HashMap<>();
        response.put("existe", existe);
        return ResponseEntity.ok(response);
    }
}