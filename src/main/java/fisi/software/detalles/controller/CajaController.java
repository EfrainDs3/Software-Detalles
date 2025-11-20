package fisi.software.detalles.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import fisi.software.detalles.controller.dto.*;
import fisi.software.detalles.entity.Caja;
import fisi.software.detalles.service.CajaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    // Método auxiliar para obtener el ID del usuario autenticado
    private Integer obtenerIdUsuario(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            org.springframework.security.core.userdetails.User userDetails = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
            return Integer.parseInt(userDetails.getUsername());
        }
        throw new IllegalStateException("Usuario no autenticado.");
    }

    // 1. GET /api/caja/estado
    @GetMapping("/estado")
    public ResponseEntity<CajaEstadoDTO> obtenerEstado() {
        CajaEstadoDTO estado = cajaService.getEstadoCaja();
        return ResponseEntity.ok(estado);
    }

    // 2. POST /api/caja/abrir
    @PostMapping("/abrir")
public ResponseEntity<?> abrirCaja(@RequestBody AperturaRequestDTO request) {
    try {
        // Usar el ID del usuario desde el request
        Integer idUsuario = request.getIdUsuario() != null ? request.getIdUsuario() : 4;
        
        CajaEstadoDTO estado = cajaService.abrirCaja(
            request.getMontoInicial(), 
            idUsuario, 
            request.getIdCaja()
        );
        
        return ResponseEntity.ok(estado);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error: " + e.getMessage());
    }
}

@PostMapping("/cerrar")
public ResponseEntity<?> cerrarCaja(@RequestBody CierreRequestDTO request) {
    try {
        // Usar el ID del usuario desde el request
        Integer idUsuario = request.getIdUsuario() != null ? request.getIdUsuario() : 4;
        
        cajaService.cerrarCaja(request.getIdApertura(), request.getMontoFinal(), idUsuario);
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error: " + e.getMessage());
    }
}

    // 4. GET /api/caja/historial
    @GetMapping("/historial")
    public ResponseEntity<List<MovimientoCajaDTO>> obtenerHistorial() {
        List<MovimientoCajaDTO> historial = cajaService.listarHistorial();
        return ResponseEntity.ok(historial);
    }

    // 5. POST /api/caja/cajas - Crear nueva caja
    @PostMapping("/cajas")
    public ResponseEntity<?> crearCaja(@RequestBody CrearCajaRequestDTO request) {
        try {
            if (request.getNombreCaja() == null || request.getNombreCaja().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre de la caja es requerido");
            }
            
            Caja nuevaCaja = cajaService.agregarCaja(
                request.getNombreCaja(), 
                request.getUbicacionCaja()
            );
            return ResponseEntity.ok(nuevaCaja);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al crear caja: " + e.getMessage());
        }
    }

    // 6. GET /api/caja/cajas/activas
    @GetMapping("/cajas/activas")
    public ResponseEntity<List<CajaListaDTO>> obtenerCajasActivas() {
        List<CajaListaDTO> cajas = cajaService.listarCajasActivas();
        return ResponseEntity.ok(cajas);
    }
}