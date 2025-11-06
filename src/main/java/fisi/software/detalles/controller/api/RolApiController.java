package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.rol.RolEstadoRequest;
import fisi.software.detalles.controller.dto.rol.RolRequest;
import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.service.RolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Validated
public class RolApiController {

    private final RolService rolService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).VER_ROLES, T(fisi.software.detalles.security.Permisos).GESTIONAR_ROLES)")
    public List<RolResponse> listarRoles(@RequestParam(value = "soloActivos", required = false) Boolean soloActivos) {
        return rolService.listarRoles(soloActivos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).VER_ROLES, T(fisi.software.detalles.security.Permisos).GESTIONAR_ROLES)")
    public RolResponse obtenerRol(@PathVariable Integer id) {
        return rolService.obtenerRol(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_ROLES)")
    public RolResponse crearRol(@Valid @RequestBody RolRequest request) {
        return rolService.crearRol(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_ROLES)")
    public RolResponse actualizarRol(@PathVariable Integer id, @Valid @RequestBody RolRequest request) {
        return rolService.actualizarRol(id, request);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_ROLES)")
    public RolResponse actualizarEstado(@PathVariable Integer id, @Valid @RequestBody RolEstadoRequest request) {
        return rolService.actualizarEstado(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_ROLES)")
    public void eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
    }
}
