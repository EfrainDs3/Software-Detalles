package fisi.software.detalles.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fisi.software.detalles.controller.dto.CajaEstadoDTO;
import fisi.software.detalles.controller.dto.MovimientoCajaDTO;
import fisi.software.detalles.entity.AperturaCaja;
import fisi.software.detalles.entity.Caja;
import fisi.software.detalles.entity.CierreCaja;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.AperturaCajaRepository;
import fisi.software.detalles.repository.CajaRepository;
import fisi.software.detalles.repository.CierreCajaRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class CajaService {
    private final CajaRepository cajaRepository;
    private final AperturaCajaRepository aperturaRepository;
    private final CierreCajaRepository cierreRepository;
    private final UsuarioRepository usuarioRepository; 
    // private final ComprobantePagoRepository comprobanteRepository; // Necesario para calcular ventas reales

    // Asumimos el ID 1 para la caja principal
    private static final Integer CAJA_PRINCIPAL_ID = 1; 

    private Caja getCajaPrincipal() {
        return cajaRepository.findById(CAJA_PRINCIPAL_ID)
                .orElseThrow(() -> new EntityNotFoundException("Caja principal no encontrada."));
    }

    // ======================================================
    // 1. OBTENER ESTADO ACTUAL
    // ======================================================
    @Transactional(readOnly = true)
    public CajaEstadoDTO getEstadoCaja() {
        Caja caja = getCajaPrincipal();
        Optional<AperturaCaja> aperturaActiva = aperturaRepository.findActiveAperturaByCajaId(caja.getIdCaja());

        if (aperturaActiva.isPresent()) {
            AperturaCaja activa = aperturaActiva.get();
            String nombreCompleto = activa.getUsuario() != null 
                                  ? activa.getUsuario().getNombres() + " " + activa.getUsuario().getApellidos() // Asumiendo campos
                                  : "Trabajador Desconocido";

            return new CajaEstadoDTO(
                true,
                activa.getIdApertura(),
                nombreCompleto,
                activa.getMontoInicial()
            );
        }

        return new CajaEstadoDTO(false, null, null, null);
    }
    
    // ======================================================
    // 2. ABRIR CAJA (CHECK-IN)
    // ======================================================
    @Transactional
    public CajaEstadoDTO abrirCaja(BigDecimal montoInicial, Integer idUsuario) {
        if (getEstadoCaja().isAbierta()) {
            throw new IllegalStateException("Ya existe una caja abierta.");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado."));
        Caja caja = getCajaPrincipal();

        AperturaCaja nuevaApertura = new AperturaCaja();
        nuevaApertura.setCaja(caja);
        nuevaApertura.setUsuario(usuario);
        nuevaApertura.setMontoInicial(montoInicial);
        nuevaApertura.setFechaApertura(LocalDate.now());
        nuevaApertura.setHoraApertura(LocalTime.now());

        aperturaRepository.save(nuevaApertura);

        caja.setEstado("Abierta");
        cajaRepository.save(caja);
        
        String nombreCompleto = usuario.getNombres() + " " + usuario.getApellidos();
        
        return new CajaEstadoDTO(true, nuevaApertura.getIdApertura(), nombreCompleto, montoInicial);
    }
    
    // ======================================================
    // 3. CERRAR CAJA (CHECK-OUT)
    // ======================================================
    @Transactional
    public void cerrarCaja(Long idApertura, BigDecimal montoFinal, Integer idUsuario) {
        AperturaCaja apertura = aperturaRepository.findById(idApertura)
            .orElseThrow(() -> new EntityNotFoundException("Apertura de caja no encontrada."));

        if (apertura.getCierre() != null) {
            throw new IllegalStateException("Esta apertura ya fue cerrada.");
        }
        
        // --- LÓGICA DE NEGOCIO SIMPLIFICADA PARA MONTO ESPERADO ---
        // En producción: se calcularía Monto Inicial + Suma de MovimientosCaja/Ventas
        // Asumiremos unas ventas simuladas de 500.00 para la demo:
        BigDecimal montoVentasSimuladas = BigDecimal.valueOf(500.00); 
        BigDecimal montoEsperado = apertura.getMontoInicial().add(montoVentasSimuladas);
        // -----------------------------------------------------------

        BigDecimal diferencia = montoFinal.subtract(montoEsperado);
        Caja caja = getCajaPrincipal();

        CierreCaja cierre = new CierreCaja();
        cierre.setApertura(apertura);
        cierre.setIdCaja(caja.getIdCaja());
        cierre.setIdUsuario(idUsuario);
        cierre.setFechaCierre(LocalDate.now());
        cierre.setHoraCierre(LocalTime.now());
        cierre.setMontoFinal(montoFinal);
        cierre.setMontoEsperado(montoEsperado);
        cierre.setDiferencia(diferencia);
        cierre.setObservaciones("Cierre de turno manual."); 

        cierreRepository.save(cierre);

        caja.setEstado("Cerrada");
        cajaRepository.save(caja);
    }

    // ======================================================
    // 4. LISTAR HISTORIAL
    // ======================================================
    @Transactional(readOnly = true)
    public List<MovimientoCajaDTO> listarHistorial() {
        List<AperturaCaja> aperturas = aperturaRepository.findAllWithCierreAndUsuario();
        
        return aperturas.stream().map(a -> {
            CierreCaja c = a.getCierre();
            String estado = (c == null) ? "Abierta" : "Cerrada";
            String trabajador = a.getUsuario() != null 
                              ? a.getUsuario().getNombres() + " " + a.getUsuario().getApellidos() 
                              : "N/A";

            return new MovimientoCajaDTO(
                a.getIdApertura(),
                trabajador,
                a.getFechaApertura(),
                a.getHoraApertura(),
                a.getMontoInicial(),
                c != null ? c.getHoraCierre() : null,
                c != null ? c.getMontoFinal() : null,
                estado
            );
        }).collect(Collectors.toList());
    }
}
