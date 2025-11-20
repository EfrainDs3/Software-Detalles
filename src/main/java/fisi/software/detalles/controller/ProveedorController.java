package fisi.software.detalles.controller;

import fisi.software.detalles.entity.Proveedor;
import fisi.software.detalles.security.Permisos;
import fisi.software.detalles.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@CrossOrigin(origins = "*")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    // GET: Cargar vista de proveedores
    @GetMapping("/compras/proveedores")
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_PROVEEDORES, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_PROVEEDORES)")
    public String showProveedoresView(Model model, Authentication authentication) {
        boolean puedeGestionarCompras = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> Permisos.GESTIONAR_COMPRAS.equals(authority.getAuthority()));
        model.addAttribute("puedeGestionarCompras", puedeGestionarCompras);
        return "software/compras/proveedores";
    }

    // GET: Obtener todos los proveedores
    @GetMapping("/api/proveedores")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_PROVEEDORES, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_PROVEEDORES)")
    public ResponseEntity<List<Proveedor>> getAllProveedores() {
        try {
            List<Proveedor> proveedores = proveedorService.getAllProveedores();
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET: Obtener proveedor por ID
    @GetMapping("/api/proveedores/{id}")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_PROVEEDORES, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_PROVEEDORES)")
    public ResponseEntity<Proveedor> getProveedorById(@PathVariable Integer id) {
        try {
            return proveedorService.getProveedorById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET: Buscar proveedores (por razón social, nombre comercial o RUC)
    @GetMapping("/api/proveedores/buscar")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_PROVEEDORES, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_PROVEEDORES)")
    public ResponseEntity<List<Proveedor>> buscarProveedores(@RequestParam String query) {
        try {
            // Intentar buscar por diferentes criterios
            List<Proveedor> proveedores = proveedorService.searchByRazonSocial(query);
            
            if (proveedores.isEmpty()) {
                proveedores = proveedorService.searchByNombreComercial(query);
            }
            
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET: Buscar por rubro
    @GetMapping("/api/proveedores/rubro/{rubro}")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_PROVEEDORES, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_PROVEEDORES)")
    public ResponseEntity<List<Proveedor>> getProveedoresByRubro(@PathVariable String rubro) {
        try {
            List<Proveedor> proveedores = proveedorService.getProveedoresByRubro(rubro);
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST: Crear nuevo proveedor
    @PostMapping("/api/proveedores")
    @ResponseBody
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    public ResponseEntity<Map<String, Object>> createProveedor(@RequestBody Proveedor proveedor) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validaciones
            if (proveedor.getRazonSocial() == null || proveedor.getRazonSocial().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "La razón social es obligatoria");
                return ResponseEntity.badRequest().body(response);
            }

            if (proveedor.getRuc() == null || proveedor.getRuc().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El RUC es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            // Verificar si el RUC ya existe
            if (proveedorService.existsByRuc(proveedor.getRuc())) {
                response.put("success", false);
                response.put("message", "Ya existe un proveedor con el RUC: " + proveedor.getRuc());
                return ResponseEntity.badRequest().body(response);
            }

            Proveedor nuevoProveedor = proveedorService.saveProveedor(proveedor);
            response.put("success", true);
            response.put("message", "Proveedor creado exitosamente");
            response.put("data", nuevoProveedor);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al crear el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // PUT: Actualizar proveedor existente
    @PutMapping("/api/proveedores/{id}")
    @ResponseBody
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    public ResponseEntity<Map<String, Object>> updateProveedor(
            @PathVariable Integer id, 
            @RequestBody Proveedor proveedor) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validaciones
            if (proveedor.getRazonSocial() == null || proveedor.getRazonSocial().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "La razón social es obligatoria");
                return ResponseEntity.badRequest().body(response);
            }

            if (proveedor.getRuc() == null || proveedor.getRuc().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "El RUC es obligatorio");
                return ResponseEntity.badRequest().body(response);
            }

            Proveedor proveedorActualizado = proveedorService.updateProveedor(id, proveedor);
            response.put("success", true);
            response.put("message", "Proveedor actualizado exitosamente");
            response.put("data", proveedorActualizado);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // DELETE: Eliminar proveedor
    @DeleteMapping("/api/proveedores/{id}")
    @ResponseBody
    @PreAuthorize("hasAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS)")
    public ResponseEntity<Map<String, Object>> deleteProveedor(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            proveedorService.deleteProveedor(id);
            response.put("success", true);
            response.put("message", "Proveedor eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al eliminar el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // GET: Verificar si existe un RUC
    @GetMapping("/api/proveedores/verificar-ruc/{ruc}")
    @ResponseBody
    @PreAuthorize("hasAnyAuthority(T(fisi.software.detalles.security.Permisos).GESTIONAR_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_COMPRAS, T(fisi.software.detalles.security.Permisos).VER_PROVEEDORES, T(fisi.software.detalles.security.Permisos).MODULO_COMPRAS, T(fisi.software.detalles.security.Permisos).MODULO_PROVEEDORES)")
    public ResponseEntity<Map<String, Boolean>> verificarRuc(@PathVariable String ruc) {
        Map<String, Boolean> response = new HashMap<>();
        try {
            boolean existe = proveedorService.existsByRuc(ruc);
            response.put("existe", existe);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
