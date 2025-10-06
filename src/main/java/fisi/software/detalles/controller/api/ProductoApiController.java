package fisi.software.detalles.controller.api;

import fisi.software.detalles.service.ProductoService;
import fisi.software.detalles.service.ProductoService.CategoriaCodigo;
import fisi.software.detalles.service.ProductoService.ProductoRequest;
import fisi.software.detalles.service.ProductoService.ProductoResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoApiController {

    private final ProductoService productoService;

    public ProductoApiController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping("/calzados")
    public ResponseEntity<List<ProductoResponse>> listarCalzados() {
        return ResponseEntity.ok(productoService.listarPorCategoria(CategoriaCodigo.CALZADO));
    }

    @GetMapping("/accesorios")
    public ResponseEntity<List<ProductoResponse>> listarAccesorios() {
        return ResponseEntity.ok(productoService.listarPorCategoria(CategoriaCodigo.ACCESORIO));
    }

    @GetMapping("/calzados/{id}")
    public ResponseEntity<ProductoResponse> obtenerCalzado(@PathVariable Long id) {
        ProductoResponse response = productoService.obtenerPorId(id);
        validarCategoria(response, CategoriaCodigo.CALZADO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/accesorios/{id}")
    public ResponseEntity<ProductoResponse> obtenerAccesorio(@PathVariable Long id) {
        ProductoResponse response = productoService.obtenerPorId(id);
        validarCategoria(response, CategoriaCodigo.ACCESORIO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calzados")
    public ResponseEntity<ProductoResponse> crearCalzado(@RequestBody ProductoRequest request) {
        ProductoResponse response = productoService.crearParaCategoria(CategoriaCodigo.CALZADO, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/accesorios")
    public ResponseEntity<ProductoResponse> crearAccesorio(@RequestBody ProductoRequest request) {
        ProductoResponse response = productoService.crearParaCategoria(CategoriaCodigo.ACCESORIO, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/calzados/{id}")
    public ResponseEntity<ProductoResponse> actualizarCalzado(@PathVariable Long id, @RequestBody ProductoRequest request) {
        ProductoResponse response = productoService.actualizarParaCategoria(id, CategoriaCodigo.CALZADO, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/accesorios/{id}")
    public ResponseEntity<ProductoResponse> actualizarAccesorio(@PathVariable Long id, @RequestBody ProductoRequest request) {
        ProductoResponse response = productoService.actualizarParaCategoria(id, CategoriaCodigo.ACCESORIO, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/calzados/{id}")
    public ResponseEntity<Void> eliminarCalzado(@PathVariable Long id) {
        ProductoResponse response = productoService.obtenerPorId(id);
        validarCategoria(response, CategoriaCodigo.CALZADO);
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/accesorios/{id}")
    public ResponseEntity<Void> eliminarAccesorio(@PathVariable Long id) {
        ProductoResponse response = productoService.obtenerPorId(id);
        validarCategoria(response, CategoriaCodigo.ACCESORIO);
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private void validarCategoria(ProductoResponse response, CategoriaCodigo categoriaEsperada) {
        String categoriaNombre = response.categoria() != null ? response.categoria().nombre() : null;
        if (categoriaNombre == null || !categoriaNombre.equalsIgnoreCase(categoriaEsperada.getNombre())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado en la categoría solicitada");
        }
    }
}
