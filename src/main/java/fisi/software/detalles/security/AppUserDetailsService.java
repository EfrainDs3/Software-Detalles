package fisi.software.detalles.security;

import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.stereotype.Service;  // Deshabilitado para evitar conflicto con CustomUserDetailsService

@RequiredArgsConstructor
// @Service  // Deshabilitado: Spring usa CustomUserDetailsService en su lugar
public class AppUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // la entidad se carga con @EntityGraph en el repositorio para incluir roles/permisos
        return new AppUserDetails(usuario);
    }
}
