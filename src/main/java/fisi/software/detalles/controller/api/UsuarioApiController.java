package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.controller.dto.usuario.UsuarioCreateRequest;
import fisi.software.detalles.controller.dto.usuario.UsuarioResponse;
import fisi.software.detalles.controller.dto.usuario.UsuarioUpdateRequest;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import fisi.software.detalles.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Validated
public class UsuarioApiController {

    private final UsuarioService usuarioService;
    private final TipoDocumentoRepository tipoDocumentoRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).VER_USUARIOS, T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).VER_USUARIOS, T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public UsuarioResponse obtenerUsuario(@PathVariable Integer id) {
        return usuarioService.obtenerUsuario(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public UsuarioResponse crearUsuario(@Valid @RequestBody UsuarioCreateRequest request) {
        return usuarioService.crearUsuario(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public UsuarioResponse actualizarUsuario(@PathVariable Integer id, @Valid @RequestBody UsuarioUpdateRequest request) {
        return usuarioService.actualizarUsuario(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public List<RolResponse> listarRoles() {
        return usuarioService.listarRoles();
    }

    @GetMapping("/tipos-documento")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_USUARIOS)")
    public List<TipoDocumento> listarTiposDocumento() {
        return tipoDocumentoRepository.findAll();
    }
}
