package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.controller.dto.usuario.UsuarioCreateRequest;
import fisi.software.detalles.controller.dto.usuario.UsuarioResponse;
import fisi.software.detalles.controller.dto.usuario.UsuarioUpdateRequest;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final RolService rolService;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAllByOrderByNombresAscApellidosAsc().stream()
            .map(UsuarioResponse::fromEntity)
            .collect(Collectors.toList());
    }

    public UsuarioResponse obtenerUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        return UsuarioResponse.fromEntity(usuario);
    }

    public UsuarioResponse crearUsuario(UsuarioCreateRequest request) {
        validarDatosUnicos(null, request.username(), request.email(), request.tipoDocumentoId(), request.numeroDocumento());
        Usuario usuario = new Usuario();
        mapearDatosBasicos(usuario, request.nombres(), request.apellidos(), request.username(), request.email(),
            request.celular(), request.direccion(), request.numeroDocumento(), request.tipoDocumentoId(), request.estado());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        asignarRoles(usuario, request.rolIds());
        Usuario guardado = usuarioRepository.save(usuario);
        return UsuarioResponse.fromEntity(guardado);
    }

    public UsuarioResponse actualizarUsuario(Integer id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        validarDatosUnicos(usuario.getId(), request.username(), request.email(), request.tipoDocumentoId(), request.numeroDocumento());
        mapearDatosBasicos(usuario, request.nombres(), request.apellidos(), request.username(), request.email(),
            request.celular(), request.direccion(), request.numeroDocumento(), request.tipoDocumentoId(), request.estado());
        if (StringUtils.hasText(request.password())) {
            usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        asignarRoles(usuario, request.rolIds());
        return UsuarioResponse.fromEntity(usuarioRepository.save(usuario));
    }

    public void eliminarUsuario(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario no encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    public List<RolResponse> listarRoles() {
    return rolService.listarRoles(true);
    }

    public Usuario autenticar(String identificador, String password) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(identificador)
            .or(() -> usuarioRepository.findByEmailIgnoreCase(identificador))
            .orElseThrow(() -> new BadCredentialsException("Usuario o contraseña incorrectos"));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new DisabledException("El usuario se encuentra inactivo");
        }

        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new BadCredentialsException("Usuario o contraseña incorrectos");
        }

        usuario.setFechaUltimaSesion(LocalDateTime.now());
        return usuarioRepository.save(usuario);
    }

    public Usuario validarUsuarioActivo(String username) {
        if (!StringUtils.hasText(username)) {
            throw new ValidationException("El usuario es obligatorio");
        }

        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username.trim())
            .orElseThrow(() -> new BadCredentialsException("El usuario no se encuentra registrado"));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new DisabledException("El usuario se encuentra inactivo");
        }

        return usuario;
    }

    public Usuario verificarDatosRecuperacion(String username, String nombres, String apellidos, String email, String numeroDocumento) {
        Usuario usuario = validarUsuarioActivo(username);

        if (!coincide(usuario.getNombres(), nombres) ||
            !coincide(usuario.getApellidos(), apellidos) ||
            !coincide(usuario.getEmail(), email) ||
            !coincide(usuario.getNumeroDocumento(), numeroDocumento)) {
            throw new BadCredentialsException("Los datos proporcionados no coinciden con el usuario");
        }

        return usuario;
    }

    public void restablecerPassword(String username, String nombres, String apellidos, String email, String numeroDocumento, String nuevaPassword) {
        if (!StringUtils.hasText(nuevaPassword)) {
            throw new ValidationException("Debes proporcionar una nueva contraseña válida");
        }

        Usuario usuario = verificarDatosRecuperacion(username, nombres, apellidos, email, numeroDocumento);
        usuario.setPasswordHash(passwordEncoder.encode(nuevaPassword.trim()));
        usuarioRepository.save(usuario);
    }

    private boolean coincide(String valorSistema, String valorIngresado) {
        if (!StringUtils.hasText(valorSistema) || !StringUtils.hasText(valorIngresado)) {
            return false;
        }
        return valorSistema.trim().equalsIgnoreCase(valorIngresado.trim());
    }

    private void mapearDatosBasicos(Usuario usuario, String nombres, String apellidos, String username, String email,
                                    String celular, String direccion, String numeroDocumento, Integer tipoDocumentoId,
                                    Boolean estado) {
        usuario.setNombres(nombres);
        usuario.setApellidos(apellidos);
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setCelular(celular);
        usuario.setDireccion(direccion);
        usuario.setNumeroDocumento(numeroDocumento);
        if (tipoDocumentoId != null) {
            var tipoDocumento = tipoDocumentoRepository.findById(tipoDocumentoId)
                .orElseThrow(() -> new EntityNotFoundException("Tipo de documento no encontrado"));
            usuario.setTipoDocumento(tipoDocumento);
        } else {
            usuario.setTipoDocumento(null);
        }
        usuario.setEstado(estado != null ? estado : Boolean.TRUE);
    }

    private void asignarRoles(Usuario usuario, List<Integer> rolIds) {
        Set<Rol> roles = new HashSet<>();
        if (rolIds != null && !rolIds.isEmpty()) {
            roles = rolRepository.findAllById(rolIds).stream().collect(Collectors.toSet());
            if (roles.size() != rolIds.size()) {
                throw new EntityNotFoundException("Uno o más roles no existen");
            }
        }
        usuario.setRoles(roles);
    }

    private void validarDatosUnicos(Integer idUsuario, String username, String email, Integer tipoDocumentoId, String numeroDocumento) {
        usuarioRepository.findByUsernameIgnoreCase(username)
            .ifPresent(existing -> {
                if (!existing.getId().equals(idUsuario)) {
                    throw new ValidationException("El nombre de usuario ya está registrado");
                }
            });
        usuarioRepository.findByEmailIgnoreCase(email)
            .ifPresent(existing -> {
                if (!existing.getId().equals(idUsuario)) {
                    throw new ValidationException("El correo electrónico ya está registrado");
                }
            });
        if (StringUtils.hasText(numeroDocumento) && tipoDocumentoId != null) {
            usuarioRepository.findByTipoDocumento_IdTipoDocumentoAndNumeroDocumento(tipoDocumentoId, numeroDocumento)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(idUsuario)) {
                        throw new ValidationException("El número de documento ya está registrado para el tipo seleccionado");
                    }
                });
        }
    }

}
