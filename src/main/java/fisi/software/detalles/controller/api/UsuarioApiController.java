package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.usuario.RolResponse;
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
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtenerUsuario(@PathVariable Integer id) {
        return usuarioService.obtenerUsuario(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crearUsuario(@Valid @RequestBody UsuarioCreateRequest request) {
        return usuarioService.crearUsuario(request);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizarUsuario(@PathVariable Integer id, @Valid @RequestBody UsuarioUpdateRequest request) {
        return usuarioService.actualizarUsuario(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Integer id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public List<RolResponse> listarRoles() {
        return usuarioService.listarRoles().stream()
            .map(RolResponse::fromEntity)
            .toList();
    }

    @GetMapping("/tipos-documento")
    public List<TipoDocumento> listarTiposDocumento() {
        return tipoDocumentoRepository.findAll();
    }
}
