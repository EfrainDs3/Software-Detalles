package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.permiso.PermisoResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoUsuarioDetalleResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoResumenResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoRolDetalleResponse;
import fisi.software.detalles.controller.dto.permiso.PermisoRequest;
import fisi.software.detalles.entity.Permiso;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.PermisoRepository;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import jakarta.validation.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class PermisoServiceTest {

    @Autowired
    private PermisoService permisoService;

    @Autowired
    private PermisoRepository permisoRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
        permisoRepository.deleteAll();
    }

    @Test
    void crearPermisoPersisteCorrectamente() {
        PermisoRequest request = new PermisoRequest("Permisos", "Auditar usuarios", "Acceso a registros de auditoría", "ACTIVO");

        PermisoResponse response = permisoService.crearPermiso(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.modulo()).isEqualTo("Permisos");
        assertThat(response.nombre()).isEqualTo("Auditar usuarios");
        assertThat(response.estado()).isEqualTo("ACTIVO");
        assertThat(response.rolesAsignados()).isEmpty();
        assertThat(response.fechaCreacion()).isNotNull();
        assertThat(permisoRepository.findById(response.id())).isPresent();
    }

    @Test
    void eliminarPermisoAsignadoProvocaError() {
        Permiso permiso = permisoRepository.save(crearPermiso("Usuarios", "Ver usuarios"));
        Rol rol = rolRepository.save(crearRol("Administrador"));
        rol.getPermisos().add(permiso);
        rolRepository.save(rol);

    assertThatThrownBy(() -> permisoService.eliminarPermiso(permiso.getIdPermiso()))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("permiso");
    }

    @Test
    void listarPermisosPermiteFiltrarPorEstadoYTermino() {
        permisoRepository.save(crearPermiso("Catalogo", "Ver catalogo", "ACTIVO", "permite ver catalogo"));
        permisoRepository.save(crearPermiso("Catalogo", "Editar catalogo", "ACTIVO", "editar"));
        permisoRepository.save(crearPermiso("Ventas", "Ver ventas", "INACTIVO", "consulta"));

        List<PermisoResponse> activos = permisoService.listarPermisos(null, "ACTIVO", "catalogo");
        assertThat(activos).hasSize(2);

        List<PermisoResponse> inactivos = permisoService.listarPermisos(null, "INACTIVO", null);
        assertThat(inactivos)
            .singleElement()
            .satisfies(resp -> assertThat(resp.modulo()).isEqualTo("Ventas"));

        List<PermisoResponse> sinCoincidencias = permisoService.listarPermisos(null, null, "inventario");
        assertThat(sinCoincidencias).isEmpty();
    }

    @Test
    void actualizarPermisosRolReemplazaColeccion() {
        Permiso permisoA = permisoRepository.save(crearPermiso("General", "Permiso A"));
        Permiso permisoB = permisoRepository.save(crearPermiso("General", "Permiso B"));
        Permiso permisoC = permisoRepository.save(crearPermiso("General", "Permiso C"));
        Rol rol = rolRepository.save(crearRol("Supervisor"));

        PermisoRolDetalleResponse response = permisoService.actualizarPermisosRol(rol.getId(), List.of(permisoA.getIdPermiso(), permisoB.getIdPermiso()));

        assertThat(response.permisos()).extracting(PermisoResumenResponse::id)
            .containsExactlyInAnyOrder(permisoA.getIdPermiso(), permisoB.getIdPermiso());

        PermisoRolDetalleResponse responseActualizado = permisoService.actualizarPermisosRol(rol.getId(), List.of(permisoC.getIdPermiso()));
        assertThat(responseActualizado.permisos()).extracting(PermisoResumenResponse::id)
            .containsExactly(permisoC.getIdPermiso());
    }

    @Test
    void listarPermisosUsuarioIncluyeRolesYAAsignacionesDirectas() {
        Permiso permisoRol = permisoRepository.save(crearPermiso("General", "Permiso Rol"));
        Rol rol = rolRepository.save(crearRol("Gerente"));
        rol.getPermisos().add(permisoRol);
        rolRepository.save(rol);

        Usuario usuario = new Usuario();
        usuario.setNombres("Ana");
        usuario.setApellidos("Perez");
        usuario.setUsername("ana.perez");
        usuario.setEmail("ana.perez@example.com");
        usuario.setPasswordHash("hash");
        usuario.setRoles(Set.of(rol));
        usuario = usuarioRepository.save(usuario);

        List<PermisoUsuarioDetalleResponse> permisos = permisoService.listarPermisosPorUsuario(usuario.getId());

        assertThat(permisos).hasSize(1);
        assertThat(permisos).filteredOn(p -> p.permiso().nombre().equals("Permiso Rol"))
            .singleElement()
            .satisfies(detalle -> {
                assertThat(detalle.asignadoDirecto()).isFalse();
                assertThat(detalle.rolesOrigen()).containsExactly("Gerente");
            });
    }

    private Permiso crearPermiso(String modulo, String nombre) {
        return crearPermiso(modulo, nombre, "ACTIVO", null);
    }

    private Permiso crearPermiso(String modulo, String nombre, String estado, String descripcion) {
        Permiso permiso = new Permiso();
        permiso.setModulo(modulo);
        permiso.setNombrePermiso(nombre);
        permiso.setEstado(estado);
        permiso.setDescripcion(descripcion);
        return permiso;
    }

    private Rol crearRol(String nombre) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setEstado(Boolean.TRUE);
        return rol;
    }
}
