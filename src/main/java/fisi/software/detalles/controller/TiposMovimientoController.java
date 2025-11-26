package fisi.software.detalles.controller;

import fisi.software.detalles.entity.TipoMovimientoInventario;
import fisi.software.detalles.service.TipoMovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de tipos de movimiento de inventario
 */
@Controller
@RequestMapping("/inventario/tipos-movimiento")
@RequiredArgsConstructor
public class TiposMovimientoController {

    private final TipoMovimientoService tipoMovimientoService;

    /**
     * Muestra la página de gestión de tipos de movimiento
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_INVENTARIO)")
    public String showTiposMovimiento() {
        return "software/inventario/tipos-movimiento";
    }

    /**
     * Listar todos los tipos de movimiento
     * GET /inventario/tipos-movimiento/api
     */
    @GetMapping("/api")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_INVENTARIO)")
    @ResponseBody
    public ResponseEntity<List<TipoMovimientoInventario>> listarTodos() {
        try {
            List<TipoMovimientoInventario> tipos = tipoMovimientoService.listarTodos();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener tipo de movimiento por ID
     * GET /inventario/tipos-movimiento/api/{id}
     */
    @GetMapping("/api/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_INVENTARIO)")
    @ResponseBody
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            TipoMovimientoInventario tipo = tipoMovimientoService.obtenerPorId(id);
            return ResponseEntity.ok(tipo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener el tipo de movimiento");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Crear nuevo tipo de movimiento
     * POST /inventario/tipos-movimiento/api
     */
    @PostMapping("/api")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO)")
    @ResponseBody
    public ResponseEntity<?> crear(@RequestBody TipoMovimientoInventario tipo) {
        try {
            TipoMovimientoInventario nuevoTipo = tipoMovimientoService.crear(tipo);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipo);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el tipo de movimiento");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Actualizar tipo de movimiento existente
     * PUT /inventario/tipos-movimiento/api/{id}
     */
    @PutMapping("/api/{id}")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO)")
    @ResponseBody
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody TipoMovimientoInventario tipo) {
        try {
            TipoMovimientoInventario tipoActualizado = tipoMovimientoService.actualizar(id, tipo);
            return ResponseEntity.ok(tipoActualizado);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el tipo de movimiento");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
