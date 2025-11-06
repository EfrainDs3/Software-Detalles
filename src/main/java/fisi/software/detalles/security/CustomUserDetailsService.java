package fisi.software.detalles.security;

import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        if (!StringUtils.hasText(usernameOrEmail)) {
            throw new UsernameNotFoundException("El usuario es obligatorio");
        }

        Usuario usuario = usuarioRepository.findWithRolesAndPermisosByUsernameIgnoreCase(usernameOrEmail.trim())
            .or(() -> usuarioRepository.findWithRolesAndPermisosByEmailIgnoreCase(usernameOrEmail.trim()))
            .orElseThrow(() -> new UsernameNotFoundException("Usuario o correo no registrado"));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new DisabledException("El usuario se encuentra inactivo");
        }

        return UsuarioPrincipal.fromUsuario(usuario);
    }
}
