package fisi.software.detalles.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; // Importación necesaria para la excepción
import org.springframework.security.core.Authentication; 
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fisi.software.detalles.controller.dto.CajaEstadoDTO;
import fisi.software.detalles.controller.dto.CajaListaDTO;
import fisi.software.detalles.controller.dto.MovimientoCajaDTO;
import fisi.software.detalles.service.CajaService;
import fisi.software.detalles.entity.Caja;
import fisi.software.detalles.entity.Usuario; // Asegúrate de que esta entidad existe

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/caja")
// Reemplazo de @RequiredArgsConstructor con Constructor estándar
public class CajaController {
    
    private final CajaService cajaService;

    // Constructor que reemplaza a @RequiredArgsConstructor
    public CajaController(CajaService cajaService) {
        this.cajaService = cajaService;
    }

    // 1. GET /api/caja/estado - Obtener estado actual
    @GetMapping("/estado")
    public ResponseEntity<CajaEstadoDTO> getEstadoCaja() {
        return ResponseEntity.ok(cajaService.getEstadoCaja());
    }

    // 2. POST /api/caja/abrir - Apertura de caja
    @PostMapping("/abrir")
    public ResponseEntity<CajaEstadoDTO> abrirCaja(@RequestBody AperturaRequestDTO request, Authentication authentication) {
        try {
            // OBTENEMOS EL ID DEL USUARIO LOGUEADO
            Integer idUsuario = obtenerIdUsuario(authentication); 
            
            CajaEstadoDTO estado = cajaService.abrirCaja(request.getMontoInicial(), idUsuario, request.getIdCaja());
            return new ResponseEntity<>(estado, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null); 
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); 
        }
    }

    // 3. POST /api/caja/cerrar - Cierre de caja
    @PostMapping("/cerrar")
    public ResponseEntity<Void> cerrarCaja(@RequestBody CierreRequestDTO request, Authentication authentication) {
        try {
            // OBTENEMOS EL ID DEL USUARIO LOGUEADO
            Integer idUsuario = obtenerIdUsuario(authentication); 
            
            cajaService.cerrarCaja(request.getIdApertura(), request.getMontoFinal(), idUsuario);
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

    // 5. GET /api/caja/cajas/activas - Listar Cajas Activas
    @GetMapping("/cajas/activas")
    public ResponseEntity<List<CajaListaDTO>> listarCajasActivas() {
        return ResponseEntity.ok(cajaService.listarCajasActivas());
    }

    // 6. POST /api/caja/cajas - Agregar Nueva Caja
    @PostMapping("/cajas")
    public ResponseEntity<Caja> agregarNuevaCaja(@RequestBody CajaNuevaRequest request) {
        
        // SE LLAMA AL SERVICE CON LAS PROPIEDADES
        Caja nuevaCaja = cajaService.agregarCaja(
            request.getNombreCaja(), 
            request.getUbicacionCaja()
        ); 
        
        // 201 Created
        return new ResponseEntity<>(nuevaCaja, HttpStatus.CREATED);
    }
    
    // ======================================================
    // MÉTODO AUXILIAR PARA OBTENER EL ID DEL USUARIO
    // ======================================================
    private Integer obtenerIdUsuario(Authentication authentication) {
    // Si no hay autenticación, retornar ID por defecto
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            System.out.println("⚠️ MODO DESARROLLO: Usuario no autenticado, usando ID 4");
            return 4; // ⚠️ CAMBIAR cuando implementes login real
        }
        
        try {
            Usuario userDetails = (Usuario) authentication.getPrincipal();
            return userDetails.getId();
        } catch (ClassCastException e) {
            System.out.println("⚠️ Error de casting, usando ID por defecto: 4");
            return 4; // ⚠️ Fallback
        }
    }
    // ======================================================
    // DTOs (Data Transfer Objects) - Reemplazo de @Data
    // ======================================================
    public static class CajaNuevaRequest {
        private String nombreCaja;
        private String ubicacionCaja; 
        
        // Constructor sin argumentos
        public CajaNuevaRequest() {}

        // Getters
        public String getNombreCaja() {
            return nombreCaja;
        }

        public String getUbicacionCaja() {
            return ubicacionCaja;
        }

        // Setters
        public void setNombreCaja(String nombreCaja) {
            this.nombreCaja = nombreCaja;
        }

        public void setUbicacionCaja(String ubicacionCaja) {
            this.ubicacionCaja = ubicacionCaja;
        }
    }
    
    public static class AperturaRequestDTO {
        private Integer idCaja;
        private BigDecimal montoInicial;

        // Constructor sin argumentos
        public AperturaRequestDTO() {}

        // Getters
        public Integer getIdCaja() {
            return idCaja;
        }

        public BigDecimal getMontoInicial() {
            return montoInicial;
        }

        // Setters
        public void setIdCaja(Integer idCaja) {
            this.idCaja = idCaja;
        }

        public void setMontoInicial(BigDecimal montoInicial) {
            this.montoInicial = montoInicial;
        }
    }

    public static class CierreRequestDTO {
        private Long idApertura;
        private BigDecimal montoFinal;
        
        // Constructor sin argumentos
        public CierreRequestDTO() {}

        // Getters
        public Long getIdApertura() {
            return idApertura;
        }

        public BigDecimal getMontoFinal() {
            return montoFinal;
        }

        // Setters
        public void setIdApertura(Long idApertura) {
            this.idApertura = idApertura;
        }

        public void setMontoFinal(BigDecimal montoFinal) {
            this.montoFinal = montoFinal;
        }
    }
}