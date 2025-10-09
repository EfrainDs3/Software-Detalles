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
    PermisoRequest request = new PermisoRequest("USERS_AUDIT", "Auditar usuarios", "Acceso a registros de auditoría", "ACTIVO");

        PermisoResponse response = permisoService.crearPermiso(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.codigo()).isEqualTo("USERS_AUDIT");
    assertThat(response.estado()).isEqualTo("ACTIVO");
    assertThat(permisoRepository.findById(response.id())).isPresent();
    }

    @Test
    void eliminarPermisoAsignadoProvocaError() {
        Permiso permiso = permisoRepository.save(crearPermiso("USERS_VIEW", "Ver usuarios"));
        Rol rol = rolRepository.save(crearRol("Administrador"));
        rol.getPermisos().add(permiso);
        rolRepository.save(rol);

    assertThatThrownBy(() -> permisoService.eliminarPermiso(permiso.getIdPermiso()))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("permiso");
    }

    @Test
    void actualizarPermisosRolReemplazaColeccion() {
        Permiso permisoA = permisoRepository.save(crearPermiso("A", "Permiso A"));
        Permiso permisoB = permisoRepository.save(crearPermiso("B", "Permiso B"));
        Permiso permisoC = permisoRepository.save(crearPermiso("C", "Permiso C"));
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
        Permiso permisoRol = permisoRepository.save(crearPermiso("R", "Permiso Rol"));
        Permiso permisoDirecto = permisoRepository.save(crearPermiso("D", "Permiso Directo"));
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
        usuario.getPermisosExtra().add(permisoDirecto);
        usuario = usuarioRepository.save(usuario);

        List<PermisoUsuarioDetalleResponse> permisos = permisoService.listarPermisosPorUsuario(usuario.getId());

        assertThat(permisos).hasSize(2);
        assertThat(permisos).filteredOn(p -> p.permiso().codigo().equals("R"))
            .singleElement()
            .satisfies(detalle -> {
                assertThat(detalle.asignadoDirecto()).isFalse();
                assertThat(detalle.rolesOrigen()).containsExactly("Gerente");
            });
        assertThat(permisos).filteredOn(p -> p.permiso().codigo().equals("D"))
            .singleElement()
            .satisfies(detalle -> {
                assertThat(detalle.asignadoDirecto()).isTrue();
                assertThat(detalle.rolesOrigen()).isEmpty();
            });
    }

    @Test
    void actualizarPermisosUsuarioReemplazaAsignaciones() {
        Permiso permiso1 = permisoRepository.save(crearPermiso("P1", "Permiso 1"));
        Permiso permiso2 = permisoRepository.save(crearPermiso("P2", "Permiso 2"));
        Usuario usuario = new Usuario();
        usuario.setNombres("Luis");
        usuario.setApellidos("Lopez");
        usuario.setUsername("luis.lopez");
        usuario.setEmail("luis.lopez@example.com");
        usuario.setPasswordHash("hash");
        usuario = usuarioRepository.save(usuario);

    List<PermisoResumenResponse> asignados = permisoService.actualizarPermisosUsuario(usuario.getId(), List.of(permiso1.getIdPermiso()));
    assertThat(asignados).extracting(PermisoResumenResponse::id).containsExactly(permiso1.getIdPermiso());

    List<PermisoResumenResponse> reemplazo = permisoService.actualizarPermisosUsuario(usuario.getId(), List.of(permiso2.getIdPermiso()));
    assertThat(reemplazo).extracting(PermisoResumenResponse::id).containsExactly(permiso2.getIdPermiso());
    }

    private Permiso crearPermiso(String codigo, String nombre) {
        Permiso permiso = new Permiso();
        permiso.setCodigo(codigo);
    permiso.setNombrePermiso(nombre);
        permiso.setEstado("ACTIVO");
        return permiso;
    }

    private Rol crearRol(String nombre) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        rol.setEstado(Boolean.TRUE);
        return rol;
    }
}
