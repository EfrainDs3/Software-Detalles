package fisi.software.detalles.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import fisi.software.detalles.entity.Catalogo;
import fisi.software.detalles.entity.Catalogo.Material;
import fisi.software.detalles.entity.Catalogo.Modelo;
import fisi.software.detalles.entity.Catalogo.Tipo;
import fisi.software.detalles.entity.Catalogo.Unidad;
import fisi.software.detalles.entity.CategoriaProducto;
import fisi.software.detalles.entity.Producto;
import fisi.software.detalles.entity.ProductoTalla;
import fisi.software.detalles.entity.Proveedor;
import fisi.software.detalles.repository.CatalogoRepository;
import fisi.software.detalles.repository.CategoriaProductoRepository;
import fisi.software.detalles.repository.ProductoRepository;
import fisi.software.detalles.repository.ProveedorRepository;
import fisi.software.detalles.service.storage.ProductoImageStorageService;

@Service
@Transactional
public class ProductoService {

    private static final int ESTADO_PROVEEDOR_ACTIVO = 1;

    private final ProductoRepository productoRepository;
    private final CategoriaProductoRepository categoriaProductoRepository;
    private final ProveedorRepository proveedorRepository;
    private final CatalogoRepository catalogoRepository;
    private final ProductoImageStorageService productoImageStorageService;
    public ProductoService(ProductoRepository productoRepository,
                           CategoriaProductoRepository categoriaProductoRepository,
                           ProveedorRepository proveedorRepository,
                           CatalogoRepository catalogoRepository,
                           ProductoImageStorageService productoImageStorageService) {
        this.productoRepository = productoRepository;
        this.categoriaProductoRepository = categoriaProductoRepository;
        this.proveedorRepository = proveedorRepository;
        this.catalogoRepository = catalogoRepository;
        this.productoImageStorageService = productoImageStorageService;
    }

    public List<ProductoResponse> listarPorCategoria(CategoriaCodigo categoriaCodigo) {
        return listarPorCategoria(categoriaCodigo, null, null);
    }

    public List<ProductoResponse> listarPorCategoria(CategoriaCodigo categoriaCodigo, String sexo, String tipoNombre) {
        CategoriaProducto categoria = obtenerCategoria(categoriaCodigo);
        List<Producto> productos = productoRepository.findByCategoriaIdWithDetallesAndFilters(categoria.getId(),
                StringUtils.hasText(sexo) ? sexo.trim() : null,
                StringUtils.hasText(tipoNombre) ? tipoNombre.trim() : null);
        if (productos.isEmpty()) {
            return List.of();
        }
        return productos.stream()
                .filter(producto -> !Boolean.FALSE.equals(producto.getEstado()))
                .sorted(Comparator.comparing(Producto::getNombre, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::mapear)
                .toList();
    }

    public ProductoResponse obtenerPorId(Long id) {
        Producto producto = productoRepository.findByIdWithDetalles(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (Boolean.FALSE.equals(producto.getEstado())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
        }
        return mapear(producto);
    }

    public ProductoResponse crearParaCategoria(CategoriaCodigo categoriaCodigo, ProductoRequest request) {
        CategoriaProducto categoria = obtenerCategoria(categoriaCodigo);
        Producto producto = new Producto();
        producto.setCategoria(categoria);
    producto.setEstado(Boolean.TRUE);
        aplicarDatosBasicos(producto, request, categoriaCodigo);
        productoRepository.save(producto);
        productoRepository.flush();
        Producto guardado = productoRepository.findByIdWithDetalles(producto.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo recuperar el producto creado"));
        return mapear(guardado);
    }

    public ProductoResponse actualizarParaCategoria(Long id, CategoriaCodigo categoriaCodigo, ProductoRequest request) {
        Producto producto = productoRepository.findByIdWithDetalles(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (Boolean.FALSE.equals(producto.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto se encuentra desactivado");
        }
        CategoriaProducto categoria = obtenerCategoria(categoriaCodigo);
        if (!Objects.equals(producto.getCategoria().getId(), categoria.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El producto no pertenece a la categoría solicitada");
        }
        aplicarDatosBasicos(producto, request, categoriaCodigo);
        productoRepository.save(producto);
        return mapear(producto);
    }

    public void eliminar(Long id) {
        Producto producto = productoRepository.findByIdWithDetalles(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (Boolean.FALSE.equals(producto.getEstado())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
        }
        producto.setEstado(Boolean.FALSE);
        productoRepository.save(producto);
    }

    private void aplicarDatosBasicos(Producto producto, ProductoRequest request, CategoriaCodigo categoriaCodigo) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los datos del producto son obligatorios");
        }
        String nombre = normalizarTexto(request.nombre());
        if (!StringUtils.hasText(nombre)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del producto es obligatorio");
        }
        producto.setNombre(nombre);
        producto.setDescripcion(normalizarTexto(request.descripcion()));
        producto.setCodigoBarra(normalizarTexto(request.codigoBarra()));
        producto.setColor(normalizarTexto(request.color()));
        producto.setTipo(normalizarTexto(request.tipo()));
        producto.setDimensiones(normalizarTexto(request.dimensiones()));
        producto.setPesoGramos(request.pesoGramos());

        Proveedor proveedor = null;
        if (request.proveedorId() != null) {
            proveedor = proveedorRepository.findByIdProveedorAndEstado(request.proveedorId(), ESTADO_PROVEEDOR_ACTIVO)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proveedor no válido"));
        }
        producto.setProveedor(proveedor);

        Modelo modelo = null;
        if (request.modeloId() != null) {
            modelo = catalogoRepository.findModeloById(request.modeloId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Modelo no válido"));
        }
        producto.setModelo(modelo);

        Material material = null;
        if (request.materialId() != null) {
            material = catalogoRepository.findMaterialById(request.materialId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Material no válido"));
        }
        producto.setMaterial(material);

        Unidad unidad = null;
        if (request.unidadId() != null) {
            unidad = catalogoRepository.findUnidadById(request.unidadId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidad de medida no válida"));
        }
        producto.setUnidad(unidad);

        producto.limpiarTiposProducto();
        if (request.tipoProductoId() != null) {
            Tipo tipoProducto = catalogoRepository.findTipoById(request.tipoProductoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de producto no válido"));
            producto.getTiposProducto().add(tipoProducto);
        }

        String categoriaCarpeta = resolverCarpetaCategoria(categoriaCodigo);
        String imagenProcesada = productoImageStorageService.handleImage(
            request.imagen(),
            categoriaCarpeta,
            producto.getImagen(),
            producto.getNombre()
        );
        producto.setImagen(imagenProcesada);

        BigDecimal precioVenta = normalizarBigDecimal(request.precioVenta());
        BigDecimal costoCompra = normalizarBigDecimal(request.costoCompra());

        if (precioVenta == null && !CollectionUtils.isEmpty(request.tallas())) {
            precioVenta = request.tallas().stream()
                    .map(TallaRequest::precioVenta)
                    .filter(Objects::nonNull)
                    .map(this::normalizarBigDecimal)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }
        if (costoCompra == null && !CollectionUtils.isEmpty(request.tallas())) {
            costoCompra = request.tallas().stream()
                    .map(TallaRequest::costoCompra)
                    .filter(Objects::nonNull)
                    .map(this::normalizarBigDecimal)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }

        producto.setPrecioVenta(precioVenta);
        producto.setCostoCompra(costoCompra);

        // Validar tallas según categoría
        boolean sinTallas = CollectionUtils.isEmpty(request.tallas());
        if (sinTallas) {
            if (categoriaCodigo == CategoriaCodigo.CALZADO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los calzados deben registrar al menos una talla con precio de venta");
            }
            if (precioVenta == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio de venta es obligatorio cuando no se registran tallas");
            }
        }

        actualizarTallas(producto, request.tallas());
    }

    private void actualizarTallas(Producto producto, List<TallaRequest> tallasRequest) {
        producto.getTallas().clear();
        if (CollectionUtils.isEmpty(tallasRequest)) {
            return;
        }
        Set<String> tallasUnicas = new HashSet<>();
        for (TallaRequest talla : tallasRequest) {
            if (talla == null || !StringUtils.hasText(talla.talla())) {
                continue;
            }
            String tallaNormalizada = talla.talla().trim();
            if (!tallasUnicas.add(tallaNormalizada.toLowerCase(Locale.ROOT))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La talla '" + tallaNormalizada + "' está repetida");
            }
            BigDecimal precioVenta = normalizarBigDecimal(talla.precioVenta());
            if (precioVenta == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio de venta es obligatorio para la talla " + tallaNormalizada);
            }
            BigDecimal costoCompra = normalizarBigDecimal(talla.costoCompra());
            ProductoTalla entidad = new ProductoTalla(producto, tallaNormalizada, precioVenta, costoCompra);
            producto.agregarTalla(entidad);
        }
    }

    private ProductoResponse mapear(Producto producto) {
        List<TallaResponse> tallas = producto.getTallas().stream()
                .map(t -> new TallaResponse(
                        t.getTalla(),
                        t.getPrecioVenta(),
                        t.getCostoCompra()))
                .sorted(Comparator.comparing(TallaResponse::talla, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        Tipo tipoPrincipal = producto.getTiposProducto().stream().findFirst().orElse(null);

        Modelo modelo = producto.getModelo();
        Catalogo.Marca marca = modelo != null ? modelo.getMarca() : null;

        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getCodigoBarra(),
                producto.getCategoria() != null ? new CategoriaDto(producto.getCategoria().getId(), producto.getCategoria().getNombre()) : null,
                marca != null ? new MarcaDto(marca.getId(), marca.getNombre()) : null,
                modelo != null ? new ModeloDto(modelo.getId(), modelo.getNombre()) : null,
                producto.getMaterial() != null ? new MaterialDto(producto.getMaterial().getId(), producto.getMaterial().getNombre()) : null,
                producto.getUnidad() != null ? new UnidadDto(producto.getUnidad().getId(), producto.getUnidad().getNombre(), producto.getUnidad().getAbreviatura()) : null,
                producto.getProveedor() != null ? new ProveedorDto(producto.getProveedor().getIdProveedor(), producto.getProveedor().getRazonSocial(), producto.getProveedor().getNombreComercial()) : null,
                producto.getPrecioVenta(),
                producto.getCostoCompra(),
                producto.getColor(),
                producto.getTipo(),
                producto.getDimensiones(),
                producto.getPesoGramos(),
                producto.getImagen(),
                tallas,
                tipoPrincipal != null ? List.of(new TipoDto(tipoPrincipal.getId(), tipoPrincipal.getNombre())) : List.of(),
                !Boolean.FALSE.equals(producto.getEstado())
        );
    }

    private CategoriaProducto obtenerCategoria(CategoriaCodigo categoriaCodigo) {
        return categoriaProductoRepository.findByNombreIgnoreCase(categoriaCodigo.nombre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La categoría '" + categoriaCodigo.nombre + "' no existe en la base de datos"));
    }

    private static String normalizarTexto(String valor) {
        return StringUtils.hasText(valor) ? valor.trim() : null;
    }

    private BigDecimal normalizarBigDecimal(BigDecimal valor) {
        if (valor == null) {
            return null;
        }
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private String resolverCarpetaCategoria(CategoriaCodigo categoriaCodigo) {
        return switch (categoriaCodigo) {
            case CALZADO -> "calzados";
            case ACCESORIO -> "accesorios";
        };
    }

    public enum CategoriaCodigo {
        CALZADO("Calzado"),
        ACCESORIO("Accesorio");

        private final String nombre;

        CategoriaCodigo(String nombre) {
            this.nombre = nombre;
        }

        public String getNombre() {
            return nombre;
        }
    }

    public record ProductoRequest(
            String nombre,
            String descripcion,
            String codigoBarra,
            Integer proveedorId,
            Long modeloId,
            Long materialId,
            Long unidadId,
            Long tipoProductoId,
            BigDecimal precioVenta,
            BigDecimal costoCompra,
            String color,
            String tipo,
            String dimensiones,
            Integer pesoGramos,
            List<TallaRequest> tallas,
            String imagen
    ) {
    }

    public record TallaRequest(String talla, BigDecimal precioVenta, BigDecimal costoCompra) {
    }

    public record ProductoResponse(
            Long id,
            String nombre,
            String descripcion,
            String codigoBarra,
            CategoriaDto categoria,
            MarcaDto marca,
            ModeloDto modelo,
            MaterialDto material,
            UnidadDto unidad,
            ProveedorDto proveedor,
            BigDecimal precioVenta,
            BigDecimal costoCompra,
            String color,
            String tipo,
            String dimensiones,
            Integer pesoGramos,
            String imagen,
            List<TallaResponse> tallas,
            List<TipoDto> tiposProducto,
            Boolean activo
    ) {
    }

    public record TallaResponse(String talla, BigDecimal precioVenta, BigDecimal costoCompra) {
    }

    public record CategoriaDto(Long id, String nombre) {
    }

    public record MarcaDto(Long id, String nombre) {
    }

    public record ModeloDto(Long id, String nombre) {
    }

    public record MaterialDto(Long id, String nombre) {
    }

    public record UnidadDto(Long id, String nombre, String abreviatura) {
    }

    public record ProveedorDto(Integer id, String razonSocial, String nombreComercial) {
    }

    public record TipoDto(Long id, String nombre) {
    }
}
