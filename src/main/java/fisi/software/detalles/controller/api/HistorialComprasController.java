package fisi.software.detalles.controller.api;

import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.ComprobantePago;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.ClienteRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import fisi.software.detalles.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class HistorialComprasController {

        private final VentaRepository ventaRepository;
        private final UsuarioRepository usuarioRepository;
        private final ClienteRepository clienteRepository;

        /**
         * GET /api/compras
         * Obtiene el historial de compras del usuario autenticado
         */
        @GetMapping
        public ResponseEntity<?> obtenerHistorialCompras(HttpSession session) {
                try {
                        Integer userId = (Integer) session.getAttribute("USER_ID");

                        if (userId == null) {
                                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
                        }

                        // Obtener usuario
                        Usuario usuario = usuarioRepository.findById(userId).orElse(null);
                        if (usuario == null) {
                                return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
                        }

                        // Buscar cliente asociado al usuario por número de documento
                        List<Cliente> clientes = clienteRepository.findAll();
                        Cliente cliente = clientes.stream()
                                        .filter(c -> c.getNumeroDocumento() != null &&
                                                        c.getNumeroDocumento().equals(usuario.getNumeroDocumento()))
                                        .findFirst()
                                        .orElse(null);

                        if (cliente == null) {
                                // Usuario no tiene compras aún
                                return ResponseEntity.ok(Map.of("compras", Collections.emptyList()));
                        }

                        // Obtener comprobantes del cliente
                        List<ComprobantePago> comprobantes = ventaRepository.findAll().stream()
                                        .filter(c -> c.getCliente() != null &&
                                                        c.getCliente().getIdCliente().equals(cliente.getIdCliente()))
                                        .sorted((c1, c2) -> c2.getFechaEmision().compareTo(c1.getFechaEmision())) // Más
                                                                                                                  // reciente
                                                                                                                  // primero
                                        .collect(Collectors.toList());

                        // Mapear a DTO
                        List<Map<String, Object>> comprasDTO = comprobantes.stream()
                                        .map(c -> {
                                                Map<String, Object> dto = new HashMap<>();
                                                dto.put("idComprobante", c.getIdComprobante());
                                                dto.put("numeroComprobante", c.getNumeroComprobante());
                                                dto.put("fechaEmision", c.getFechaEmision());
                                                dto.put("total", c.getTotal());
                                                dto.put("subtotal", c.getSubtotal());
                                                dto.put("igv", c.getIgv());
                                                dto.put("estado", c.getEstado());
                                                dto.put("tipoComprobante", c.getTipoComprobante().getNombreTipo());
                                                dto.put("cantidadItems",
                                                                c.getDetalles() != null ? c.getDetalles().size() : 0);
                                                return dto;
                                        })
                                        .collect(Collectors.toList());

                        return ResponseEntity.ok(Map.of("compras", comprasDTO));

                } catch (Exception e) {
                        log.error("Error al obtener historial de compras", e);
                        return ResponseEntity.status(500).body(Map.of("error", "Error al obtener historial"));
                }
        }

        /**
         * GET /api/compras/{id}
         * Obtiene el detalle de un comprobante específico
         */
        @GetMapping("/{id}")
        public ResponseEntity<?> obtenerDetalleCompra(@PathVariable Long id, HttpSession session) {
                try {
                        Integer userId = (Integer) session.getAttribute("USER_ID");

                        if (userId == null) {
                                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
                        }

                        ComprobantePago comprobante = ventaRepository.findById(id).orElse(null);

                        if (comprobante == null) {
                                return ResponseEntity.status(404).body(Map.of("error", "Comprobante no encontrado"));
                        }

                        // Verificar que el comprobante pertenece al usuario
                        Usuario usuario = usuarioRepository.findById(userId).orElse(null);
                        if (usuario == null || comprobante.getCliente() == null ||
                                        !comprobante.getCliente().getNumeroDocumento()
                                                        .equals(usuario.getNumeroDocumento())) {
                                return ResponseEntity.status(403).body(Map.of("error", "No autorizado"));
                        }

                        // Mapear detalles
                        List<Map<String, Object>> detallesDTO = comprobante.getDetalles().stream()
                                        .map(d -> {
                                                Map<String, Object> dto = new HashMap<>();
                                                dto.put("producto", d.getProducto().getNombre());
                                                dto.put("cantidad", d.getCantidad());
                                                dto.put("precioUnitario", d.getPrecioUnitario());
                                                dto.put("subtotal", d.getSubtotalLinea());
                                                return dto;
                                        })
                                        .collect(Collectors.toList());

                        Map<String, Object> comprobanteDTO = new HashMap<>();
                        comprobanteDTO.put("idComprobante", comprobante.getIdComprobante());
                        comprobanteDTO.put("numeroComprobante", comprobante.getNumeroComprobante());
                        comprobanteDTO.put("fechaEmision", comprobante.getFechaEmision());
                        comprobanteDTO.put("total", comprobante.getTotal());
                        comprobanteDTO.put("subtotal", comprobante.getSubtotal());
                        comprobanteDTO.put("igv", comprobante.getIgv());
                        comprobanteDTO.put("estado", comprobante.getEstado());
                        comprobanteDTO.put("tipoComprobante", comprobante.getTipoComprobante().getNombreTipo());
                        comprobanteDTO.put("detalles", detallesDTO);

                        return ResponseEntity.ok(comprobanteDTO);

                } catch (Exception e) {
                        log.error("Error al obtener detalle de compra", e);
                        return ResponseEntity.status(500).body(Map.of("error", "Error al obtener detalle"));
                }
        }
}