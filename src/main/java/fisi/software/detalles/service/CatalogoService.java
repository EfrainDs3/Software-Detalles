package fisi.software.detalles.service;

import fisi.software.detalles.entity.Catalogo;
import fisi.software.detalles.repository.CatalogoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class CatalogoService {

    private final CatalogoRepository catalogoRepository;
    public CatalogoService(CatalogoRepository catalogoRepository) {
        this.catalogoRepository = catalogoRepository;
    }

    // ========================
    // MARCAS
    // ========================

    @Transactional(readOnly = true)
    public List<MarcaResponse> listarMarcas() {
        return catalogoRepository.findAllMarcas().stream()
                .map(MarcaResponse::fromEntity)
                .toList();
    }

    public MarcaResponse crearMarca(MarcaRequest request) {
        String nombre = sanitizeNombre(request.nombre());
        if (catalogoRepository.existsMarcaByNombre(nombre, null)) {
            throw conflict("La marca ya se encuentra registrada");
        }
        Catalogo.Marca entity = new Catalogo.Marca(nombre);
        return MarcaResponse.fromEntity(catalogoRepository.saveMarca(entity));
    }

    public MarcaResponse actualizarMarca(Long id, MarcaRequest request) {
        Catalogo.Marca entity = catalogoRepository.findMarcaById(id)
                .orElseThrow(() -> notFound("Marca no encontrada"));
        String nombre = sanitizeNombre(request.nombre());
        if (catalogoRepository.existsMarcaByNombre(nombre, id)) {
            throw conflict("Ya existe una marca con el mismo nombre");
        }
        entity.setNombre(nombre);
        return MarcaResponse.fromEntity(catalogoRepository.saveMarca(entity));
    }

    public void eliminarMarca(Long id) {
        Catalogo.Marca entity = catalogoRepository.findMarcaById(id)
                .orElseThrow(() -> notFound("Marca no encontrada"));
        if (catalogoRepository.existsModelosForMarca(id)) {
            throw conflict("No se puede eliminar la marca porque tiene modelos asociados");
        }
        catalogoRepository.deleteMarca(entity);
    }

    // ========================
    // MODELOS
    // ========================

    @Transactional(readOnly = true)
    public List<ModeloResponse> listarModelos() {
        return catalogoRepository.findAllModelos().stream()
                .map(ModeloResponse::fromEntity)
                .toList();
    }

    public ModeloResponse crearModelo(ModeloRequest request) {
        String nombre = sanitizeNombre(request.nombre());
        Long marcaId = requireId(request.marcaId(), "Debe seleccionar una marca");
        Catalogo.Marca marca = catalogoRepository.findMarcaById(marcaId)
                .orElseThrow(() -> badRequest("Marca no válida"));
        if (catalogoRepository.existsModeloByNombreAndMarca(nombre, marcaId, null)) {
            throw conflict("Ya existe un modelo con el mismo nombre para la marca seleccionada");
        }
        Catalogo.Modelo entity = new Catalogo.Modelo(nombre, marca);
        return ModeloResponse.fromEntity(catalogoRepository.saveModelo(entity));
    }

    public ModeloResponse actualizarModelo(Long id, ModeloRequest request) {
        Catalogo.Modelo entity = catalogoRepository.findModeloById(id)
                .orElseThrow(() -> notFound("Modelo no encontrado"));
        String nombre = sanitizeNombre(request.nombre());
        Long marcaId = requireId(request.marcaId(), "Debe seleccionar una marca");
        Catalogo.Marca marca = catalogoRepository.findMarcaById(marcaId)
                .orElseThrow(() -> badRequest("Marca no válida"));
        if (catalogoRepository.existsModeloByNombreAndMarca(nombre, marcaId, id)) {
            throw conflict("Ya existe un modelo con el mismo nombre para la marca seleccionada");
        }
        entity.setNombre(nombre);
        entity.setMarca(marca);
        return ModeloResponse.fromEntity(catalogoRepository.saveModelo(entity));
    }

    public void eliminarModelo(Long id) {
        Catalogo.Modelo entity = catalogoRepository.findModeloById(id)
                .orElseThrow(() -> notFound("Modelo no encontrado"));
        catalogoRepository.deleteModelo(entity);
    }

    // ========================
    // MATERIALES
    // ========================

    @Transactional(readOnly = true)
    public List<MaterialResponse> listarMateriales() {
        return catalogoRepository.findAllMateriales().stream()
                .map(MaterialResponse::fromEntity)
                .toList();
    }

    public MaterialResponse crearMaterial(MaterialRequest request) {
        String nombre = sanitizeNombre(request.nombre());
        if (catalogoRepository.existsMaterialByNombre(nombre, null)) {
            throw conflict("El material ya se encuentra registrado");
        }
        Catalogo.Material entity = new Catalogo.Material(nombre);
        return MaterialResponse.fromEntity(catalogoRepository.saveMaterial(entity));
    }

    public MaterialResponse actualizarMaterial(Long id, MaterialRequest request) {
        Catalogo.Material entity = catalogoRepository.findMaterialById(id)
                .orElseThrow(() -> notFound("Material no encontrado"));
        String nombre = sanitizeNombre(request.nombre());
        if (catalogoRepository.existsMaterialByNombre(nombre, id)) {
            throw conflict("Ya existe un material con el mismo nombre");
        }
        entity.setNombre(nombre);
        return MaterialResponse.fromEntity(catalogoRepository.saveMaterial(entity));
    }

    public void eliminarMaterial(Long id) {
        Catalogo.Material entity = catalogoRepository.findMaterialById(id)
                .orElseThrow(() -> notFound("Material no encontrado"));
        catalogoRepository.deleteMaterial(entity);
    }

    // ========================
    // UNIDADES
    // ========================

    @Transactional(readOnly = true)
    public List<UnidadResponse> listarUnidades() {
        return catalogoRepository.findAllUnidades().stream()
                .map(UnidadResponse::fromEntity)
                .toList();
    }

    public UnidadResponse crearUnidad(UnidadRequest request) {
        String nombre = sanitizeNombre(request.nombre());
        String abreviatura = normalizeAbreviatura(request.abreviatura());
        if (catalogoRepository.existsUnidadByNombre(nombre, null)) {
            throw conflict("La unidad de medida ya se encuentra registrada");
        }
        Catalogo.Unidad entity = new Catalogo.Unidad(nombre, abreviatura);
        return UnidadResponse.fromEntity(catalogoRepository.saveUnidad(entity));
    }

    public UnidadResponse actualizarUnidad(Long id, UnidadRequest request) {
        Catalogo.Unidad entity = catalogoRepository.findUnidadById(id)
                .orElseThrow(() -> notFound("Unidad no encontrada"));
        String nombre = sanitizeNombre(request.nombre());
        String abreviatura = normalizeAbreviatura(request.abreviatura());
        if (catalogoRepository.existsUnidadByNombre(nombre, id)) {
            throw conflict("Ya existe una unidad con el mismo nombre");
        }
        entity.setNombre(nombre);
        entity.setAbreviatura(abreviatura);
        return UnidadResponse.fromEntity(catalogoRepository.saveUnidad(entity));
    }

    public void eliminarUnidad(Long id) {
        Catalogo.Unidad entity = catalogoRepository.findUnidadById(id)
                .orElseThrow(() -> notFound("Unidad no encontrada"));
        catalogoRepository.deleteUnidad(entity);
    }

    // ========================
    // TIPOS DE PRODUCTO
    // ========================

    @Transactional(readOnly = true)
    public List<TipoResponse> listarTipos() {
        return catalogoRepository.findAllTipos().stream()
                .map(TipoResponse::fromEntity)
                .toList();
    }

    public TipoResponse crearTipo(TipoRequest request) {
        String nombre = sanitizeNombre(request.nombre());
        if (catalogoRepository.existsTipoByNombre(nombre, null)) {
            throw conflict("El tipo de producto ya se encuentra registrado");
        }
        Catalogo.Tipo entity = new Catalogo.Tipo(nombre);
        return TipoResponse.fromEntity(catalogoRepository.saveTipo(entity));
    }

    public TipoResponse actualizarTipo(Long id, TipoRequest request) {
        Catalogo.Tipo entity = catalogoRepository.findTipoById(id)
                .orElseThrow(() -> notFound("Tipo no encontrado"));
        String nombre = sanitizeNombre(request.nombre());
        if (catalogoRepository.existsTipoByNombre(nombre, id)) {
            throw conflict("Ya existe un tipo con el mismo nombre");
        }
        entity.setNombre(nombre);
        return TipoResponse.fromEntity(catalogoRepository.saveTipo(entity));
    }

    public void eliminarTipo(Long id) {
        Catalogo.Tipo entity = catalogoRepository.findTipoById(id)
                .orElseThrow(() -> notFound("Tipo no encontrado"));
        catalogoRepository.deleteTipo(entity);
    }

    // ========================
    // CATEGORÍAS FIJAS
    // ========================

    public List<Map<String, Object>> listarCategoriasFijas() {
        return List.of(
                Map.of("id", 1L, "nombre", "Calzado"),
                Map.of("id", 2L, "nombre", "Accesorio")
        );
    }

    // ========================
    // DTOs
    // ========================

    public record MarcaRequest(String nombre) {
    }

    public record MarcaResponse(Long id, String nombre) {
        static MarcaResponse fromEntity(Catalogo.Marca entity) {
            return new MarcaResponse(entity.getId(), entity.getNombre());
        }
    }

    public record ModeloRequest(String nombre, Long marcaId) {
    }

    public record ModeloResponse(Long id, String nombre, Long marcaId, String marca) {
        static ModeloResponse fromEntity(Catalogo.Modelo entity) {
            return new ModeloResponse(
                    entity.getId(),
                    entity.getNombre(),
                    entity.getMarca() != null ? entity.getMarca().getId() : null,
                    entity.getMarca() != null ? entity.getMarca().getNombre() : null
            );
        }
    }

    public record MaterialRequest(String nombre) {
    }

    public record MaterialResponse(Long id, String nombre) {
        static MaterialResponse fromEntity(Catalogo.Material entity) {
            return new MaterialResponse(entity.getId(), entity.getNombre());
        }
    }

    public record UnidadRequest(String nombre, String abreviatura) {
    }

    public record UnidadResponse(Long id, String nombre, String abreviatura) {
        static UnidadResponse fromEntity(Catalogo.Unidad entity) {
            return new UnidadResponse(entity.getId(), entity.getNombre(), entity.getAbreviatura());
        }
    }

    public record TipoRequest(String nombre) {
    }

    public record TipoResponse(Long id, String nombre) {
        static TipoResponse fromEntity(Catalogo.Tipo entity) {
            return new TipoResponse(entity.getId(), entity.getNombre());
        }
    }

    // ========================
    // Helpers
    // ========================

    private String sanitizeNombre(String value) {
        if (!StringUtils.hasText(value)) {
            throw badRequest("El nombre es obligatorio");
        }
        return value.trim();
    }

    private String normalizeAbreviatura(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private Long requireId(Long id, String message) {
        if (id == null) {
            throw badRequest(message);
        }
        return id;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
