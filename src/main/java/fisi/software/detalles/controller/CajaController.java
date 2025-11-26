package fisi.software.detalles.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import fisi.software.detalles.controller.dto.*;
import fisi.software.detalles.entity.Caja;
import fisi.software.detalles.security.UsuarioPrincipal;
import fisi.software.detalles.service.CajaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    // ✅ Método auxiliar para obtener el ID del usuario autenticado
    private Integer obtenerIdUsuarioAutenticado(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UsuarioPrincipal) {
            UsuarioPrincipal userDetails = (UsuarioPrincipal) authentication.getPrincipal();
            return userDetails.getId();
        }
        throw new IllegalStateException("Usuario no autenticado");
    }

    // 1. GET /api/caja/estado
    // ✅ CORRECCIÓN: Agregar headers anti-caché para evitar que el navegador use
    // respuestas antiguas
    @GetMapping("/estado")
    public ResponseEntity<CajaEstadoDTO> obtenerEstado(HttpServletResponse response) {
        // Prevenir caché del navegador
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        System.out.println("\n📡 [CajaController] Solicitud GET /api/caja/estado recibida");
        CajaEstadoDTO estado = cajaService.getEstadoCaja();
        System.out.println("📤 [CajaController] Respondiendo con abierta=" + estado.isAbierta() + "\n");
        return ResponseEntity.ok(estado);
    }

    // 2. POST /api/caja/abrir
    @PostMapping("/abrir")
    public ResponseEntity<?> abrirCaja(
            @RequestBody AperturaRequestDTO request,
            Authentication authentication) {
        try {
            // ✅ Obtener ID del usuario autenticado
            Integer idUsuario = obtenerIdUsuarioAutenticado(authentication);
            CajaEstadoDTO estado = cajaService.abrirCaja(
                    request.getMontoInicial(),
                    idUsuario,
                    request.getIdCaja());
            return ResponseEntity.ok(estado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarCaja(
            @RequestBody CierreRequestDTO request,
            Authentication authentication) {
        try {
            // ✅ Obtener ID del usuario autenticado
            Integer idUsuario = obtenerIdUsuarioAutenticado(authentication);
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
                    request.getUbicacionCaja());
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