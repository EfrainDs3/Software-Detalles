package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.permiso.*;
import fisi.software.detalles.service.PermisoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
public class PermisoApiController {

    private final PermisoService permisoService;

    @GetMapping
    public List<PermisoResponse> listarPermisos(
        @RequestParam(name = "soloActivos", required = false) Boolean soloActivos,
        @RequestParam(name = "estado", required = false) String estado,
        @RequestParam(name = "termino", required = false) String termino
    ) {
        return permisoService.listarPermisos(soloActivos, estado, termino);
    }

    @GetMapping("/{id}")
    public PermisoResponse obtenerPermiso(@PathVariable Long id) {
        return permisoService.obtenerPermiso(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PermisoResponse crearPermiso(@Valid @RequestBody PermisoRequest request) {
        return permisoService.crearPermiso(request);
    }

    @PutMapping("/{id}")
    public PermisoResponse actualizarPermiso(@PathVariable Long id, @Valid @RequestBody PermisoRequest request) {
        return permisoService.actualizarPermiso(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarPermiso(@PathVariable Long id) {
        permisoService.eliminarPermiso(id);
    }

    @GetMapping("/auditoria")
    public List<PermisoAuditoriaResponse> listarAuditoria(
        @RequestParam(name = "permisoId", required = false) Long permisoId,
        @RequestParam(name = "limite", required = false) Integer limite
    ) {
        return permisoService.obtenerAuditoriaPermisos(permisoId, limite);
    }

    @GetMapping("/roles/{rolId}")
    public PermisoRolDetalleResponse listarPermisosPorRol(@PathVariable Integer rolId) {
        return permisoService.listarPermisosPorRol(rolId);
    }

    @PutMapping("/roles/{rolId}")
    public PermisoRolDetalleResponse actualizarPermisosRol(@PathVariable Integer rolId, @Valid @RequestBody PermisoAsignacionRequest request) {
        return permisoService.actualizarPermisosRol(rolId, request.permisoIds());
    }

    @GetMapping("/usuarios/{usuarioId}")
    public List<PermisoUsuarioDetalleResponse> listarPermisosPorUsuario(@PathVariable Integer usuarioId) {
        return permisoService.listarPermisosPorUsuario(usuarioId);
    }

    @PutMapping("/usuarios/{usuarioId}")
    public List<PermisoResumenResponse> actualizarPermisosUsuario(@PathVariable Integer usuarioId, @Valid @RequestBody PermisoAsignacionRequest request) {
        return permisoService.actualizarPermisosUsuario(usuarioId, request.permisoIds());
    }
}
