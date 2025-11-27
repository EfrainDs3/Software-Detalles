package fisi.software.detalles.controller;

import fisi.software.detalles.service.CatalogoService;
import fisi.software.detalles.service.CatalogoService.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/catalogos")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    // ========================
    // MARCAS
    // ========================

    @GetMapping("/marcas")
    public ResponseEntity<List<MarcaResponse>> listarMarcas() {
        return ResponseEntity.ok(catalogoService.listarMarcas());
    }

    @PostMapping("/marcas")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<MarcaResponse> crearMarca(@RequestBody MarcaRequest request) {
        return ResponseEntity.ok(catalogoService.crearMarca(request));
    }

    @PutMapping("/marcas/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<MarcaResponse> actualizarMarca(@PathVariable Long id, @RequestBody MarcaRequest request) {
        return ResponseEntity.ok(catalogoService.actualizarMarca(id, request));
    }

    @DeleteMapping("/marcas/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<Void> eliminarMarca(@PathVariable Long id) {
        catalogoService.eliminarMarca(id);
        return ResponseEntity.noContent().build();
    }

    // ========================
    // MODELOS
    // ========================

    @GetMapping("/modelos")
    public ResponseEntity<List<ModeloResponse>> listarModelos() {
        return ResponseEntity.ok(catalogoService.listarModelos());
    }

    @PostMapping("/modelos")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<ModeloResponse> crearModelo(@RequestBody ModeloRequest request) {
        return ResponseEntity.ok(catalogoService.crearModelo(request));
    }

    @PutMapping("/modelos/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<ModeloResponse> actualizarModelo(@PathVariable Long id, @RequestBody ModeloRequest request) {
        return ResponseEntity.ok(catalogoService.actualizarModelo(id, request));
    }

    @DeleteMapping("/modelos/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<Void> eliminarModelo(@PathVariable Long id) {
        catalogoService.eliminarModelo(id);
        return ResponseEntity.noContent().build();
    }

    // ========================
    // MATERIALES
    // ========================

    @GetMapping("/materiales")
    public ResponseEntity<List<MaterialResponse>> listarMateriales() {
        return ResponseEntity.ok(catalogoService.listarMateriales());
    }

    @PostMapping("/materiales")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<MaterialResponse> crearMaterial(@RequestBody MaterialRequest request) {
        return ResponseEntity.ok(catalogoService.crearMaterial(request));
    }

    @PutMapping("/materiales/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<MaterialResponse> actualizarMaterial(@PathVariable Long id,
            @RequestBody MaterialRequest request) {
        return ResponseEntity.ok(catalogoService.actualizarMaterial(id, request));
    }

    @DeleteMapping("/materiales/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<Void> eliminarMaterial(@PathVariable Long id) {
        catalogoService.eliminarMaterial(id);
        return ResponseEntity.noContent().build();
    }

    // ========================
    // UNIDADES
    // ========================

    @GetMapping("/unidades")
    public ResponseEntity<List<UnidadResponse>> listarUnidades() {
        return ResponseEntity.ok(catalogoService.listarUnidades());
    }

    @PostMapping("/unidades")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<UnidadResponse> crearUnidad(@RequestBody UnidadRequest request) {
        return ResponseEntity.ok(catalogoService.crearUnidad(request));
    }

    @PutMapping("/unidades/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<UnidadResponse> actualizarUnidad(@PathVariable Long id, @RequestBody UnidadRequest request) {
        return ResponseEntity.ok(catalogoService.actualizarUnidad(id, request));
    }

    @DeleteMapping("/unidades/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<Void> eliminarUnidad(@PathVariable Long id) {
        catalogoService.eliminarUnidad(id);
        return ResponseEntity.noContent().build();
    }

    // ========================
    // TIPOS
    // ========================

    @GetMapping("/tipos")
    public ResponseEntity<List<TipoResponse>> listarTipos() {
        return ResponseEntity.ok(catalogoService.listarTipos());
    }

    @PostMapping("/tipos")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<TipoResponse> crearTipo(@RequestBody TipoRequest request) {
        return ResponseEntity.ok(catalogoService.crearTipo(request));
    }

    @PutMapping("/tipos/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<TipoResponse> actualizarTipo(@PathVariable Long id, @RequestBody TipoRequest request) {
        return ResponseEntity.ok(catalogoService.actualizarTipo(id, request));
    }

    @DeleteMapping("/tipos/{id}")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_INVENTARIO, T(fisi.software.detalles.security.Permisos).MODULO_CATALOGOS)")
    public ResponseEntity<Void> eliminarTipo(@PathVariable Long id) {
        catalogoService.eliminarTipo(id);
        return ResponseEntity.noContent().build();
    }

    // ========================
    // CATEGORÍAS FIJAS
    // ========================

    @GetMapping("/categorias")
    public ResponseEntity<List<Map<String, Object>>> listarCategorias() {
        return ResponseEntity.ok(catalogoService.listarCategoriasFijas());
    }
}
