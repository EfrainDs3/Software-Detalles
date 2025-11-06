package fisi.software.detalles.security;

import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Representa la información de autenticación y autorización de un {@link Usuario} en Spring Security.
 */
public class UsuarioPrincipal implements UserDetails {

    private final Integer id;
    private final String username;
    private final String password;
    private final boolean enabled;
    private final String nombres;
    private final String apellidos;
    private final String email;
    private final LocalDateTime fechaUltimaSesion;
    private final Set<String> roles;
    private final Set<String> permisos;
    private final Set<GrantedAuthority> authorities;

    private UsuarioPrincipal(
        Integer id,
        String username,
        String password,
        boolean enabled,
        String nombres,
        String apellidos,
        String email,
        LocalDateTime fechaUltimaSesion,
        Set<String> roles,
        Set<String> permisos,
        Set<GrantedAuthority> authorities
    ) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.email = email;
        this.fechaUltimaSesion = fechaUltimaSesion;
        this.roles = roles;
        this.permisos = permisos;
        this.authorities = authorities;
    }

    public static UsuarioPrincipal fromUsuario(Usuario usuario) {
        Set<String> rolesNormalizados = usuario.getRoles() == null
            ? Set.of()
            : usuario.getRoles().stream()
                .map(Rol::getNombre)
                .filter(StringUtils::hasText)
                .map(nombre -> Permisos.normalizar(nombre))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<String> permisosNormalizados = usuario.getRoles() == null
            ? Set.of()
            : usuario.getRoles().stream()
                .filter(Objects::nonNull)
                .flatMap(rol -> rol.getPermisos().stream())
                .filter(Objects::nonNull)
                .filter(permiso -> "ACTIVO".equalsIgnoreCase(permiso.getEstado()))
                .map(Permiso::getNombrePermiso)
                .filter(StringUtils::hasText)
                .map(Permisos::normalizar)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<GrantedAuthority> grantedAuthorities = new LinkedHashSet<>();
        permisosNormalizados.forEach(permiso -> grantedAuthorities.add(new SimpleGrantedAuthority(permiso)));
        rolesNormalizados.forEach(rol -> grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + rol)));

        return new UsuarioPrincipal(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getPasswordHash(),
            Boolean.TRUE.equals(usuario.getEstado()),
            usuario.getNombres(),
            usuario.getApellidos(),
            usuario.getEmail(),
            usuario.getFechaUltimaSesion(),
            rolesNormalizados,
            permisosNormalizados,
            grantedAuthorities
        );
    }

    public Integer getId() {
        return id;
    }

    public String getNombres() {
        return nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getFechaUltimaSesion() {
        return fechaUltimaSesion;
    }

    public Set<String> getRolesSistema() {
        return roles;
    }

    public Set<String> getPermisosSistema() {
        return permisos;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
