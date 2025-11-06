package fisi.software.detalles.security;

import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class AppUserDetails implements UserDetails {

    private final Usuario usuario;
    private final Set<GrantedAuthority> authorities;

    public AppUserDetails(Usuario usuario) {
        this.usuario = usuario;
        this.authorities = new HashSet<>();

        // Roles as ROLE_{NAME}
        for (Rol rol : usuario.getRoles()) {
            if (rol.getNombre() != null) {
                this.authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNombre().toUpperCase()));
            }
            // permisos del rol
            if (rol.getPermisos() != null) {
                    for (Permiso p : rol.getPermisos()) {
                        if (p != null && p.getNombrePermiso() != null) {
                            this.authorities.add(new SimpleGrantedAuthority(p.getNombrePermiso().toUpperCase()));
                        }
                }
            }
        }
    }

    public Usuario getUsuario() {
        return usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return usuario.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
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
        return Boolean.TRUE.equals(usuario.getEstado());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AppUserDetails)) return false;
        AppUserDetails that = (AppUserDetails) o;
        return Objects.equals(usuario.getId(), that.usuario.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(usuario.getId());
    }
}
