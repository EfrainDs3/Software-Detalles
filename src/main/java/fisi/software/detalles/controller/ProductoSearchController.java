package fisi.software.detalles.controller;

import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.service.ProductoService;
import fisi.software.detalles.controller.dto.ProductoSearchRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para búsqueda y filtros de productos
 * 
 * @author Equipo Detalles
 * @version 1.0
 */
@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoSearchController {
    
    @Autowired
    private ProductoService productoService;
    
    /**
     * Búsqueda avanzada con filtros (POST)
     * 
     * @param searchRequest Filtros de búsqueda
     * @return Lista de productos que coinciden con los filtros
     */
    @PostMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarProductos(@RequestBody ProductoSearchRequest searchRequest) {
        List<Producto> productos = productoService.searchProductos(searchRequest);
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Búsqueda simple por nombre (GET)
     * 
     * @param nombre Nombre o parte del nombre del producto
     * @return Lista de productos que coinciden con el nombre
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarPorNombre(@RequestParam(required = false) String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            // Si no hay nombre, devolver todos los productos activos
            return ResponseEntity.ok(productoService.getAllProductosActivos());
        }
        List<Producto> productos = productoService.searchByNombre(nombre);
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Obtener opciones para filtros - Categorías
     * 
     * @return Lista de IDs de categorías únicas
     */
    @GetMapping("/filtros/categorias")
    public ResponseEntity<List<Long>> getCategoriasFiltro() {
        List<Long> categorias = productoService.getAllCategoriaIds();
        return ResponseEntity.ok(categorias);
    }
    
    /**
     * Obtener opciones para filtros - Tipos
     * 
     * @return Lista de tipos únicos
     */
    @GetMapping("/filtros/tipos")
    public ResponseEntity<List<String>> getTiposFiltro() {
        List<String> tipos = productoService.getAllTipos();
        return ResponseEntity.ok(tipos);
    }
    
    /**
     * Obtener opciones para filtros - Colores
     * 
     * @return Lista de colores únicos
     */
    @GetMapping("/filtros/colores")
    public ResponseEntity<List<String>> getColoresFiltro() {
        List<String> colores = productoService.getAllColores();
        return ResponseEntity.ok(colores);
    }
    
    /**
     * Obtener opciones para filtros - Materiales
     * 
     * @return Lista de IDs de materiales únicos
     */
    @GetMapping("/filtros/materiales")
    public ResponseEntity<List<Long>> getMaterialesFiltro() {
        List<Long> materiales = productoService.getAllMaterialIds();
        return ResponseEntity.ok(materiales);
    }
    
    /**
     * Obtener opciones para filtros - Modelos
     * 
     * @return Lista de IDs de modelos únicos
     */
    @GetMapping("/filtros/modelos")
    public ResponseEntity<List<Long>> getModelosFiltro() {
        List<Long> modelos = productoService.getAllModeloIds();
        return ResponseEntity.ok(modelos);
    }
    
    /**
     * Obtener productos por categoría
     * 
     * @param idCategoria ID de la categoría
     * @return Lista de productos de la categoría
     */
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<Producto>> getProductosPorCategoria(@PathVariable Long idCategoria) {
        List<Producto> productos = productoService.getProductosByCategoria(idCategoria);
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Obtener productos por tipo
     * 
     * @param tipo Tipo de producto
     * @return Lista de productos del tipo especificado
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Producto>> getProductosPorTipo(@PathVariable String tipo) {
        List<Producto> productos = productoService.getProductosByTipo(tipo);
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Obtener productos por color
     * 
     * @param color Color del producto
     * @return Lista de productos del color especificado
     */
    @GetMapping("/color/{color}")
    public ResponseEntity<List<Producto>> getProductosPorColor(@PathVariable String color) {
        List<Producto> productos = productoService.getProductosByColor(color);
        return ResponseEntity.ok(productos);
    }
    
    /**
     * Obtener todos los productos activos
     * 
     * @return Lista de todos los productos activos
     */
    @GetMapping
    public ResponseEntity<List<Producto>> getAllProductos() {
        List<Producto> productos = productoService.getAllProductosActivos();
        return ResponseEntity.ok(productos);
    }
}