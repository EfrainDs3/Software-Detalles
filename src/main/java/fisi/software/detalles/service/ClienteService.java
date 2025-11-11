package fisi.software.detalles.service;

import fisi.software.detalles.entity.Cliente;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.repository.ClienteRepository;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Servicio para la gestión de clientes
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class ClienteService {
    
    private final ClienteRepository clienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private static final Pattern SOLO_DIGITOS = Pattern.compile("\\d+");
    
    /**
     * Obtiene todos los clientes
     * 
     * @return Lista de todos los clientes
     */
    @Transactional(readOnly = true)
    public List<Cliente> obtenerTodos() {
        return clienteRepository.findAll();
    }
    
    /**
     * Obtiene solo los clientes activos
     * 
     * @return Lista de clientes activos
     */
    @Transactional(readOnly = true)
    public List<Cliente> obtenerActivos() {
        return clienteRepository.findByEstadoTrue();
    }
    
    /**
     * Obtiene un cliente por su ID
     * 
     * @param id ID del cliente
     * @return Optional con el cliente encontrado
     */
    @Transactional(readOnly = true)
    public Optional<Cliente> obtenerPorId(Integer id) {
        return clienteRepository.findById(id);
    }
    
    /**
     * Busca clientes por término de búsqueda
     * 
     * @param searchTerm Término de búsqueda
     * @return Lista de clientes encontrados
     */
    @Transactional(readOnly = true)
    public List<Cliente> buscarClientes(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return obtenerActivos();
        }
        return clienteRepository.searchClientesActivos(searchTerm.trim());
    }
    
    /**
     * Obtiene un cliente por su tipo de documento y número de documento (DNI/RUC)
     * * @param tipoDocumento Tipo de documento (Entity TipoDocumento)
     * @param numeroDocumento Número de documento
     * @return Optional con el cliente encontrado
     */
    @Transactional(readOnly = true)
    public Optional<Cliente> obtenerPorTipoDocYNumeroDoc(TipoDocumento tipoDocumento, String numeroDocumento) {
        // Busca por tipo de documento, número de documento y estado activo (true)
        return clienteRepository.findByTipoDocumentoAndNumeroDocumentoAndEstadoTrue(tipoDocumento, numeroDocumento);
    }

    /**
     * Crea un nuevo cliente
     * 
     * @param cliente Cliente a crear
     * @return Cliente creado
     * @throws IllegalArgumentException Si los datos son inválidos
     */
    @Transactional
    public Cliente crear(Cliente cliente) {
        // Verificar si el tipo de documento existe y adjuntar entidad completa antes de validar
        if (cliente.getTipoDocumento() != null && cliente.getTipoDocumento().getIdTipoDocumento() != null) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findById(cliente.getTipoDocumento().getIdTipoDocumento())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de documento no válido"));
            cliente.setTipoDocumento(tipoDoc);
        }

        // Validaciones
        validarCliente(cliente);
        
        // Verificar duplicados
        if (cliente.getTipoDocumento() != null && cliente.getNumeroDocumento() != null) {
            Optional<Cliente> existente = clienteRepository.findByTipoDocumentoAndNumeroDocumento(
                cliente.getTipoDocumento(), cliente.getNumeroDocumento());
            if (existente.isPresent()) {
                throw new IllegalArgumentException("Ya existe un cliente con ese tipo y número de documento");
            }
        }
        
        // Verificar email duplicado
        if (cliente.getEmail() != null && !cliente.getEmail().isEmpty()) {
            Optional<Cliente> existente = clienteRepository.findByEmail(cliente.getEmail());
            if (existente.isPresent()) {
                throw new IllegalArgumentException("Ya existe un cliente con ese email");
            }
        }
        
        // Establecer valores por defecto
        if (cliente.getFechaRegistro() == null) {
            cliente.setFechaRegistro(LocalDateTime.now());
        }
        if (cliente.getEstado() == null) {
            cliente.setEstado(true);
        }
        
        return clienteRepository.save(cliente);
    }
    
    /**
     * Actualiza un cliente existente
     * 
     * @param id ID del cliente a actualizar
     * @param clienteActualizado Datos actualizados del cliente
     * @return Cliente actualizado
     * @throws IllegalArgumentException Si el cliente no existe o los datos son inválidos
     */
    @Transactional
    public Cliente actualizar(Integer id, Cliente clienteActualizado) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        
        // Verificar si el tipo de documento existe y adjuntar entidad completa antes de validar
        if (clienteActualizado.getTipoDocumento() != null && 
            clienteActualizado.getTipoDocumento().getIdTipoDocumento() != null) {
            TipoDocumento tipoDoc = tipoDocumentoRepository.findById(
                clienteActualizado.getTipoDocumento().getIdTipoDocumento())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de documento no válido"));
            clienteActualizado.setTipoDocumento(tipoDoc);
        }
        
        // Validaciones
        validarCliente(clienteActualizado);
        
        // Verificar duplicados (excluyendo el cliente actual)
        if (clienteActualizado.getTipoDocumento() != null && 
            clienteActualizado.getNumeroDocumento() != null) {
            boolean existe = clienteRepository.existsByTipoDocumentoAndNumeroDocumentoAndIdClienteNot(
                clienteActualizado.getTipoDocumento(), 
                clienteActualizado.getNumeroDocumento(), 
                id);
            if (existe) {
                throw new IllegalArgumentException("Ya existe otro cliente con ese tipo y número de documento");
            }
        }
        
        // Actualizar campos
        cliente.setNombre(clienteActualizado.getNombre());
        cliente.setApellido(clienteActualizado.getApellido());
        cliente.setTipoDocumento(clienteActualizado.getTipoDocumento());
        cliente.setNumeroDocumento(clienteActualizado.getNumeroDocumento());
        cliente.setDireccion(clienteActualizado.getDireccion());
        cliente.setTelefono(clienteActualizado.getTelefono());
        cliente.setEmail(clienteActualizado.getEmail());
        
        // Mantener fecha de registro original
        // No actualizar el estado aquí, usar método separado
        
        return clienteRepository.save(cliente);
    }
    
    /**
     * Elimina un cliente (eliminación lógica)
     * 
     * @param id ID del cliente a eliminar
     * @throws IllegalArgumentException Si el cliente no existe
     */
    @Transactional
    public void eliminar(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        
        // Eliminación lógica
        cliente.setEstado(false);
        clienteRepository.save(cliente);
    }
    
    /**
     * Elimina permanentemente un cliente de la base de datos
     * 
     * @param id ID del cliente a eliminar
     * @throws IllegalArgumentException Si el cliente no existe
     */
    @Transactional
    public void eliminarPermanentemente(Integer id) {
        if (!clienteRepository.existsById(id)) {
            throw new IllegalArgumentException("Cliente no encontrado");
        }
        clienteRepository.deleteById(id);
    }
    
    /**
     * Reactiva un cliente inactivo
     * 
     * @param id ID del cliente a reactivar
     * @return Cliente reactivado
     * @throws IllegalArgumentException Si el cliente no existe
     */
    @Transactional
    public Cliente reactivar(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        
        cliente.setEstado(true);
        return clienteRepository.save(cliente);
    }
    
    /**
     * Obtiene todos los tipos de documento disponibles
     * 
     * @return Lista de tipos de documento
     */
    @Transactional(readOnly = true)
    public List<TipoDocumento> obtenerTiposDocumento() {
        return tipoDocumentoRepository.findAll();
    }
    
    /**
     * Valida los datos básicos de un cliente
     * 
     * @param cliente Cliente a validar
     * @throws IllegalArgumentException Si los datos son inválidos
     */
    private void validarCliente(Cliente cliente) {
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        
        boolean requiereApellido = requiereApellido(cliente);
        if (requiereApellido && (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty())) {
            throw new IllegalArgumentException("El apellido es obligatorio");
        }
        if (!requiereApellido) {
            if (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty()) {
                cliente.setApellido("");
            } else {
                cliente.setApellido(cliente.getApellido().trim());
            }
        }
        
        if (cliente.getDireccion() == null || cliente.getDireccion().trim().isEmpty()) {
            throw new IllegalArgumentException("La dirección es obligatoria");
        }
        
        // Validar email si se proporciona
        if (cliente.getEmail() != null && !cliente.getEmail().isEmpty()) {
            if (!cliente.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new IllegalArgumentException("El email no tiene un formato válido");
            }
        }
        
        // Validar documento si se proporciona
        if (cliente.getNumeroDocumento() != null && !cliente.getNumeroDocumento().isEmpty()) {
            if (cliente.getTipoDocumento() == null) {
                throw new IllegalArgumentException("Debe especificar el tipo de documento");
            }
            String numeroNormalizado = cliente.getNumeroDocumento().trim();
            if (!SOLO_DIGITOS.matcher(numeroNormalizado).matches()) {
                throw new IllegalArgumentException("El número de documento solo debe contener dígitos");
            }

            validarFormatoNumeroDocumento(cliente.getTipoDocumento(), numeroNormalizado);
            cliente.setNumeroDocumento(numeroNormalizado);
        } else {
            cliente.setNumeroDocumento(null);
        }
    }

    private boolean requiereApellido(Cliente cliente) {
        if (cliente == null) {
            return true;
        }

        TipoDocumento tipo = cliente.getTipoDocumento();
        if (tipo == null || tipo.getNombreTipoDocumento() == null) {
            return true;
        }

        String nombreTipo = tipo.getNombreTipoDocumento().trim().toUpperCase();
        if (!nombreTipo.contains("RUC")) {
            return true;
        }

        String numeroDoc = cliente.getNumeroDocumento();
        if (numeroDoc == null) {
            return true;
        }

        String normalizedDoc = numeroDoc.trim();
        if (normalizedDoc.length() != 11) {
            return true;
        }

        // Prefijos RUC de personas naturales: 10, 15, 16, 17. Empresas suelen iniciar con 20
        if (normalizedDoc.startsWith("20")) {
            return false;
        }

        return true;
    }

    private void validarFormatoNumeroDocumento(TipoDocumento tipoDocumento, String numeroDocumento) {
        if (tipoDocumento == null || tipoDocumento.getNombreTipoDocumento() == null) {
            return;
        }

        String nombreTipo = tipoDocumento.getNombreTipoDocumento().trim().toUpperCase(Locale.ROOT);
        if (nombreTipo.contains("DNI") && numeroDocumento.length() != 8) {
            throw new IllegalArgumentException("El DNI debe tener exactamente 8 dígitos");
        }
        if (nombreTipo.contains("RUC") && numeroDocumento.length() != 11) {
            throw new IllegalArgumentException("El RUC debe tener exactamente 11 dígitos");
        }
    }
}
