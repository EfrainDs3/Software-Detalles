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
import fisi.software.detalles.controller.dto.CajaListaDTO;
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

    // Asumimos el ID 1 para la caja principal
    private static final Integer CAJA_PRINCIPAL_ID = 1; 

    private Caja getCajaPrincipal() {
        return cajaRepository.findById(CAJA_PRINCIPAL_ID)
                .orElseThrow(() -> new EntityNotFoundException("Caja principal no encontrada."));
    }

    // ======================================================
    // NUEVO: AGREGAR NUEVA CAJA
    // ======================================================
    @Transactional
    public Caja agregarCaja(String nombre_caja, String ubicacion) {
        Caja nuevaCaja = new Caja();
        
        nuevaCaja.setNombreCaja(nombre_caja); 
        nuevaCaja.setUbicacion(ubicacion);
        nuevaCaja.setEstado("Cerrada"); 
        
        return cajaRepository.save(nuevaCaja);
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
                                     ? activa.getUsuario().getNombres() + " " + activa.getUsuario().getApellidos()
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
    // 2. ABRIR CAJA
    // ======================================================
    @Transactional
    public CajaEstadoDTO abrirCaja(BigDecimal montoInicial, Integer idUsuario, Integer idCajaSeleccionada) { 
        // 1. OBTENER LA CAJA SELECCIONADA POR EL USUARIO
        Caja caja = cajaRepository.findById(idCajaSeleccionada)
                .orElseThrow(() -> new EntityNotFoundException("Caja (ID: " + idCajaSeleccionada + ") no encontrada."));

        // 2. VERIFICAR si la caja seleccionada ya tiene una apertura activa
        Optional<AperturaCaja> aperturaActiva = aperturaRepository.findActiveAperturaByCajaId(caja.getIdCaja());

        if (aperturaActiva.isPresent()) {
            throw new IllegalStateException("La caja seleccionada ya tiene una apertura activa.");
        }
        
        // 3. JALANDO DATOS DE LA TABLA USUARIO
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario (ID: " + idUsuario + ") no encontrado."));

        // 4. Creamos la Apertura, usando la Caja Seleccionada
        AperturaCaja nuevaApertura = new AperturaCaja();
        nuevaApertura.setCaja(caja); 
        nuevaApertura.setUsuario(usuario); 
        nuevaApertura.setMontoInicial(montoInicial);
        nuevaApertura.setFechaApertura(LocalDate.now());
        nuevaApertura.setHoraApertura(LocalTime.now());

        aperturaRepository.save(nuevaApertura);

        // 5. Actualizar el estado de la caja seleccionada
        caja.setEstado("Abierta");
        cajaRepository.save(caja);
        
        String nombreCompleto = usuario.getNombres() + " " + usuario.getApellidos();
        
        return new CajaEstadoDTO(true, nuevaApertura.getIdApertura(), nombreCompleto, montoInicial);
    }

    // ======================================================
    // 3. CERRAR CAJA (✅ CORREGIDO)
    // ======================================================
    @Transactional
    public void cerrarCaja(Long idApertura, BigDecimal montoFinal, Integer idUsuario) {
        System.out.println("🔍 DEBUG - Cerrando caja con ID Apertura: " + idApertura);
        System.out.println("💰 Monto Final recibido: " + montoFinal);
        System.out.println("👤 Usuario ID: " + idUsuario);
        
        // 1. Verificar Apertura
        AperturaCaja apertura = aperturaRepository.findById(idApertura)
            .orElseThrow(() -> new EntityNotFoundException("Apertura de caja no encontrada con ID: " + idApertura));

        System.out.println("✅ Apertura encontrada: " + apertura.getIdApertura());
        
        if (apertura.getCierre() != null) {
            throw new IllegalStateException("Esta apertura ya fue cerrada.");
        }

        usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new EntityNotFoundException("Usuario que cierra (ID: " + idUsuario + ") no encontrado."));

        // --- LÓGICA DE NEGOCIO: Calcular ventas reales ---
        BigDecimal montoVentasRealizadas = aperturaRepository.findVentasByAperturaId(idApertura);
        
        // ✅ CORRECCIÓN CRÍTICA: Manejar el caso donde no hay ventas (null)
        if (montoVentasRealizadas == null) {
            System.out.println("⚠️ No se encontraron ventas, usando 0.00");
            montoVentasRealizadas = BigDecimal.ZERO;
        } else {
            System.out.println("💵 Ventas realizadas: " + montoVentasRealizadas);
        }
        
        BigDecimal montoEsperado = apertura.getMontoInicial().add(montoVentasRealizadas);
        System.out.println("📊 Monto esperado: " + montoEsperado);
        
        BigDecimal diferencia = montoFinal.subtract(montoEsperado);
        System.out.println("📉 Diferencia: " + diferencia);

        // Obtenemos la caja de la apertura
        Caja caja = apertura.getCaja();

        // 3. Crear Cierre
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
        System.out.println("💾 Cierre guardado correctamente");

        // 4. Actualizar estado de Caja
        caja.setEstado("Cerrada");
        cajaRepository.save(caja);
        System.out.println("🔒 Estado de caja actualizado a Cerrada");
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
            String observaciones = (c != null && c.getObservaciones() != null) 
                                    ? c.getObservaciones() 
                                    : null;

            return new MovimientoCajaDTO(
                a.getIdApertura(),
                trabajador,
                a.getFechaApertura(),
                a.getHoraApertura(),
                a.getMontoInicial(),
                c != null ? c.getHoraCierre() : null,
                c != null ? c.getMontoFinal() : null,
                estado,
                observaciones
            );
        }).collect(Collectors.toList());
    }

    // ======================================================
    // 5. LISTAR CAJAS ACTIVAS
    // ======================================================
    @Transactional(readOnly = true)
    public List<CajaListaDTO> listarCajasActivas() {
        List<Caja> cajas = cajaRepository.findByEstado("Cerrada");
        
        return cajas.stream()
            .map(caja -> {
                CajaListaDTO dto = new CajaListaDTO();
                dto.setIdCaja(caja.getIdCaja());
                dto.setNombreCaja(caja.getNombreCaja());
                return dto;
            })
            .collect(Collectors.toList());
    }
}