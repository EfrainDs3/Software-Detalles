package fisi.software.detalles.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entidad que mapea la tabla `comprobantespago`.
 */
@Entity
@Table(name = "comprobantespago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "usuario", "cliente", "tipoComprobante" })
public class ComprobantePago {

    // Clave Primaria: id_comprobante (BIGINT, AUTO_INCREMENT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_comprobante")
    private Long idComprobante;

    // -----------------------------------------------------------
    // RELACIONES (Claves Foráneas)
    // -----------------------------------------------------------

    // id_cliente (FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    // id_usuario (FK, NOT NULL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    // id_tipo_comprobante (FK, NOT NULL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_comprobante", nullable = false)
    private TipoComprobantePago tipoComprobante;

    // Relación con AperturaCaja
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_apertura", nullable = false)
    private AperturaCaja apertura;

    // Relación recursiva para ventas editadas
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_venta_original", nullable = true)
    private ComprobantePago ventaOriginal;

    // -----------------------------------------------------------
    // ATRIBUTOS DE LA TABLA
    // -----------------------------------------------------------

    @Column(name = "numero_comprobante", length = 20, nullable = false)
    private String numeroComprobante;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "total", precision = 10, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "igv", precision = 10, scale = 2, nullable = false)
    private BigDecimal igv;

    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado = "Emitido";

    @Column(name = "motivo_anulacion", columnDefinition = "TEXT")
    private String motivoAnulacion;

    // -----------------------------------------------------------
    // RELACIÓN CON DETALLES (OneToMany)
    // -----------------------------------------------------------
    @OneToMany(mappedBy = "comprobante", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleComprobantePago> detalles;
}