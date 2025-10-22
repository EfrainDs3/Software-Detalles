package fisi.software.detalles.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fisi.software.detalles.controller.dto.AperturaRequestDTO;
import fisi.software.detalles.controller.dto.CajaEstadoDTO;
import fisi.software.detalles.controller.dto.CierreRequestDTO;
import fisi.software.detalles.controller.dto.MovimientoCajaDTO;
import fisi.software.detalles.service.CajaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor

public class CajaController {
    private final CajaService cajaService;
    // Usamos el ID de usuario 6, asumiendo que este es el usuario logueado.
    private static final Integer ID_USUARIO_FIJO = 6; 

    // 1. GET /api/caja/estado - Obtener estado actual
    @GetMapping("/estado")
    public ResponseEntity<CajaEstadoDTO> getEstadoCaja() {
        return ResponseEntity.ok(cajaService.getEstadoCaja());
    }

    // 2. POST /api/caja/abrir - Apertura de caja
    @PostMapping("/abrir")
    public ResponseEntity<CajaEstadoDTO> abrirCaja(@RequestBody AperturaRequestDTO request) {
        try {
            CajaEstadoDTO estado = cajaService.abrirCaja(request.getMontoInicial(), ID_USUARIO_FIJO);
            return new ResponseEntity<>(estado, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); 
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); 
        }
    }

    // 3. POST /api/caja/cerrar - Cierre de caja
    @PostMapping("/cerrar")
    public ResponseEntity<Void> cerrarCaja(@RequestBody CierreRequestDTO request) {
        try {
            cajaService.cerrarCaja(request.getIdApertura(), request.getMontoFinal(), ID_USUARIO_FIJO);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); 
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); 
        }
    }

    // 4. GET /api/caja/historial - Listar Historial
    @GetMapping("/historial")
    public ResponseEntity<List<MovimientoCajaDTO>> listarHistorial() {
        return ResponseEntity.ok(cajaService.listarHistorial());
    }
}
