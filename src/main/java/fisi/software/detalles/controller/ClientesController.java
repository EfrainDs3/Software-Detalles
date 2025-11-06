package fisi.software.detalles.controller;

import fisi.software.detalles.controller.dto.ClienteRegistroRapidoDTO;
import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de clientes
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Controller
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClientesController {
    
    private final ClienteService clienteService;
    
    /**
     * Muestra la página de gestión de clientes
     * 
     * @return Vista de clientes
     */
    @GetMapping
    public String showClientes() {
        return "software/clientes/clientes";
    }
    
    /**
     * Lista todos los clientes activos
     * 
     * @return Lista de clientes
     */
    @GetMapping("/api")
    @ResponseBody
    public ResponseEntity<List<Cliente>> listarClientes() {
        try {
            List<Cliente> clientes = clienteService.obtenerActivos();
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /clientes/api/buscar?dniRuc={dniRuc}
     * Busca un cliente por su DNI o RUC
     * * @param dniRuc DNI o RUC a buscar
     * @return Cliente encontrado
     */
    @GetMapping("/api/buscar-documento")
    @ResponseBody
    public ResponseEntity<Cliente> buscarClientePorDocumento(@RequestParam Integer idTipoDoc, @RequestParam String numDoc) {
        try {
            // Se crea una entidad TipoDocumento de referencia solo con el ID
            TipoDocumento tipoDocFiltro = new TipoDocumento();
            tipoDocFiltro.setIdTipoDocumento(idTipoDoc);
            
            return clienteService.obtenerPorTipoDocYNumeroDoc(tipoDocFiltro, numDoc.trim())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al buscar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    


    /**
     * Obtiene un cliente por su ID
     * 
     * @param id ID del cliente
     * @return Cliente encontrado
     */
    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> obtenerCliente(@PathVariable Integer id) {
        try {
            return clienteService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Crea un nuevo cliente
     * 
     * @param cliente Datos del cliente a crear
     * @return Cliente creado
     */
    @PostMapping("/api")
    @ResponseBody
    public ResponseEntity<?> crearCliente(@RequestBody ClienteRegistroRapidoDTO dto) {
        try {
            // Mapeo simple del DTO a la Entidad Cliente antes de llamar al servicio
            Cliente cliente = new Cliente();

            // Requerimos que el servicio maneje la existencia del TipoDocumento por ID
            TipoDocumento tipoDoc = new TipoDocumento();
            tipoDoc.setIdTipoDocumento(dto.getIdTipoDocumento());

            cliente.setTipoDocumento(tipoDoc);
            cliente.setNumeroDocumento(dto.getNumeroDocumento());
            // Mapear nombres/apellidos
            cliente.setNombre(dto.getNombres());
            cliente.setApellido(dto.getApellidos());

            // Usar los campos opcionales si vienen del frontend; si no, mantener valores por defecto
            if (dto.getDireccion() != null && !dto.getDireccion().trim().isEmpty()) {
                cliente.setDireccion(dto.getDireccion().trim());
            } else {
                cliente.setDireccion("-");
            }

            if (dto.getTelefono() != null && !dto.getTelefono().trim().isEmpty()) {
                cliente.setTelefono(dto.getTelefono().trim());
            } else {
                cliente.setTelefono("-");
            }

            if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
                cliente.setEmail(dto.getEmail().trim());
            } else {
                cliente.setEmail(null);
            }

            Cliente nuevoCliente = clienteService.crear(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Actualiza un cliente existente
     * 
     * @param id ID del cliente a actualizar
     * @param cliente Datos actualizados del cliente
     * @return Cliente actualizado
     */
    @PutMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> actualizarCliente(@PathVariable Integer id, @RequestBody Cliente cliente) {
        try {
            Cliente clienteActualizado = clienteService.actualizar(id, cliente);
            return ResponseEntity.ok(clienteActualizado);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Elimina un cliente (eliminación lógica)
     * 
     * @param id ID del cliente a eliminar
     * @return Respuesta sin contenido
     */
    @DeleteMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<?> eliminarCliente(@PathVariable Integer id) {
        try {
            clienteService.eliminar(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Cliente eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Busca clientes por término de búsqueda
     * 
     * @param q Término de búsqueda
     * @return Lista de clientes encontrados
     */
    @GetMapping("/api/search")
    @ResponseBody
    public ResponseEntity<List<Cliente>> buscarClientes(@RequestParam(required = false) String q) {
        try {
            List<Cliente> clientes = clienteService.buscarClientes(q);
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtiene todos los tipos de documento disponibles
     * 
     * @return Lista de tipos de documento
     */
    @GetMapping("/api/tipos-documento")
    @ResponseBody
    public ResponseEntity<List<TipoDocumento>> obtenerTiposDocumento() {
        try {
            List<TipoDocumento> tipos = clienteService.obtenerTiposDocumento();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Reactiva un cliente inactivo
     * 
     * @param id ID del cliente a reactivar
     * @return Cliente reactivado
     */
    @PutMapping("/api/{id}/reactivar")
    @ResponseBody
    public ResponseEntity<?> reactivarCliente(@PathVariable Integer id) {
        try {
            Cliente cliente = clienteService.reactivar(id);
            return ResponseEntity.ok(cliente);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al reactivar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
