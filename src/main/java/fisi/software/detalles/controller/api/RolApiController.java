package fisi.software.detalles.controller.api;

import fisi.software.detalles.controller.dto.rol.RolEstadoRequest;
import fisi.software.detalles.controller.dto.rol.RolRequest;
import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.service.RolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Validated
public class RolApiController {

    private final RolService rolService;

    @GetMapping
    public List<RolResponse> listarRoles(@RequestParam(value = "soloActivos", required = false) Boolean soloActivos) {
        return rolService.listarRoles(soloActivos);
    }

    @GetMapping("/{id}")
    public RolResponse obtenerRol(@PathVariable Integer id) {
        return rolService.obtenerRol(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RolResponse crearRol(@Valid @RequestBody RolRequest request) {
        return rolService.crearRol(request);
    }

    @PutMapping("/{id}")
    public RolResponse actualizarRol(@PathVariable Integer id, @Valid @RequestBody RolRequest request) {
        return rolService.actualizarRol(id, request);
    }

    @PatchMapping("/{id}/estado")
    public RolResponse actualizarEstado(@PathVariable Integer id, @Valid @RequestBody RolEstadoRequest request) {
        return rolService.actualizarEstado(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarRol(@PathVariable Integer id) {
        rolService.eliminarRol(id);
    }
}
