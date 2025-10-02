package fisi.software.detalles.repository;

import fisi.software.detalles.entity.Catalogo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class CatalogoRepository {

    @PersistenceContext
    private EntityManager entityManager;

    // ========================
    // MARCAS
    // ========================

    public List<Catalogo.Marca> findAllMarcas() {
        return entityManager.createQuery("SELECT m FROM CatalogoMarca m ORDER BY m.nombre", Catalogo.Marca.class)
                .getResultList();
    }

    public Optional<Catalogo.Marca> findMarcaById(Long id) {
        return Optional.ofNullable(entityManager.find(Catalogo.Marca.class, id));
    }

    public boolean existsMarcaByNombre(String nombre, Long excludeId) {
        String jpql = "SELECT COUNT(m) FROM CatalogoMarca m WHERE LOWER(m.nombre) = LOWER(:nombre)" +
                (excludeId != null ? " AND m.id <> :exclude" : "");
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("nombre", nombre);
        if (excludeId != null) {
            query.setParameter("exclude", excludeId);
        }
        return query.getSingleResult() > 0;
    }

    public Catalogo.Marca saveMarca(Catalogo.Marca marca) {
        if (marca.getId() == null) {
            entityManager.persist(marca);
            return marca;
        }
        return entityManager.merge(marca);
    }

    public boolean existsModelosForMarca(Long marcaId) {
        Long count = entityManager.createQuery(
                        "SELECT COUNT(mo) FROM CatalogoModelo mo WHERE mo.marca.id = :marcaId", Long.class)
                .setParameter("marcaId", marcaId)
                .getSingleResult();
        return count > 0;
    }

    public void deleteMarca(Catalogo.Marca marca) {
        entityManager.remove(marca);
    }

    // ========================
    // MODELOS
    // ========================

    public List<Catalogo.Modelo> findAllModelos() {
        return entityManager.createQuery(
                        "SELECT mo FROM CatalogoModelo mo JOIN FETCH mo.marca ORDER BY mo.nombre", Catalogo.Modelo.class)
                .getResultList();
    }

    public Optional<Catalogo.Modelo> findModeloById(Long id) {
        return Optional.ofNullable(entityManager.find(Catalogo.Modelo.class, id));
    }

    public boolean existsModeloByNombreAndMarca(String nombre, Long marcaId, Long excludeId) {
        String jpql = "SELECT COUNT(mo) FROM CatalogoModelo mo WHERE LOWER(mo.nombre) = LOWER(:nombre)" +
                " AND mo.marca.id = :marca" + (excludeId != null ? " AND mo.id <> :exclude" : "");
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("nombre", nombre)
                .setParameter("marca", marcaId);
        if (excludeId != null) {
            query.setParameter("exclude", excludeId);
        }
        return query.getSingleResult() > 0;
    }

    public Catalogo.Modelo saveModelo(Catalogo.Modelo modelo) {
        if (modelo.getId() == null) {
            entityManager.persist(modelo);
            return modelo;
        }
        return entityManager.merge(modelo);
    }

    public void deleteModelo(Catalogo.Modelo modelo) {
        entityManager.remove(modelo);
    }

    // ========================
    // MATERIALES
    // ========================

    public List<Catalogo.Material> findAllMateriales() {
        return entityManager.createQuery("SELECT ma FROM CatalogoMaterial ma ORDER BY ma.nombre", Catalogo.Material.class)
                .getResultList();
    }

    public Optional<Catalogo.Material> findMaterialById(Long id) {
        return Optional.ofNullable(entityManager.find(Catalogo.Material.class, id));
    }

    public boolean existsMaterialByNombre(String nombre, Long excludeId) {
        String jpql = "SELECT COUNT(ma) FROM CatalogoMaterial ma WHERE LOWER(ma.nombre) = LOWER(:nombre)" +
                (excludeId != null ? " AND ma.id <> :exclude" : "");
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("nombre", nombre);
        if (excludeId != null) {
            query.setParameter("exclude", excludeId);
        }
        return query.getSingleResult() > 0;
    }

    public Catalogo.Material saveMaterial(Catalogo.Material material) {
        if (material.getId() == null) {
            entityManager.persist(material);
            return material;
        }
        return entityManager.merge(material);
    }

    public void deleteMaterial(Catalogo.Material material) {
        entityManager.remove(material);
    }

    // ========================
    // UNIDADES
    // ========================

    public List<Catalogo.Unidad> findAllUnidades() {
        return entityManager.createQuery("SELECT un FROM CatalogoUnidad un ORDER BY un.nombre", Catalogo.Unidad.class)
                .getResultList();
    }

    public Optional<Catalogo.Unidad> findUnidadById(Long id) {
        return Optional.ofNullable(entityManager.find(Catalogo.Unidad.class, id));
    }

    public boolean existsUnidadByNombre(String nombre, Long excludeId) {
        String jpql = "SELECT COUNT(un) FROM CatalogoUnidad un WHERE LOWER(un.nombre) = LOWER(:nombre)" +
                (excludeId != null ? " AND un.id <> :exclude" : "");
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("nombre", nombre);
        if (excludeId != null) {
            query.setParameter("exclude", excludeId);
        }
        return query.getSingleResult() > 0;
    }

    public Catalogo.Unidad saveUnidad(Catalogo.Unidad unidad) {
        if (unidad.getId() == null) {
            entityManager.persist(unidad);
            return unidad;
        }
        return entityManager.merge(unidad);
    }

    public void deleteUnidad(Catalogo.Unidad unidad) {
        entityManager.remove(unidad);
    }

    // ========================
    // TIPOS
    // ========================

    public List<Catalogo.Tipo> findAllTipos() {
        return entityManager.createQuery("SELECT ti FROM CatalogoTipo ti ORDER BY ti.nombre", Catalogo.Tipo.class)
                .getResultList();
    }

    public Optional<Catalogo.Tipo> findTipoById(Long id) {
        return Optional.ofNullable(entityManager.find(Catalogo.Tipo.class, id));
    }

    public boolean existsTipoByNombre(String nombre, Long excludeId) {
        String jpql = "SELECT COUNT(ti) FROM CatalogoTipo ti WHERE LOWER(ti.nombre) = LOWER(:nombre)" +
                (excludeId != null ? " AND ti.id <> :exclude" : "");
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("nombre", nombre);
        if (excludeId != null) {
            query.setParameter("exclude", excludeId);
        }
        return query.getSingleResult() > 0;
    }

    public Catalogo.Tipo saveTipo(Catalogo.Tipo tipo) {
        if (tipo.getId() == null) {
            entityManager.persist(tipo);
            return tipo;
        }
        return entityManager.merge(tipo);
    }

    public void deleteTipo(Catalogo.Tipo tipo) {
        entityManager.remove(tipo);
    }
}
