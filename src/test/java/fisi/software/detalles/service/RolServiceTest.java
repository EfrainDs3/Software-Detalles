package fisi.software.detalles.service;

import fisi.software.detalles.controller.dto.rol.RolEstadoRequest;
import fisi.software.detalles.controller.dto.rol.RolRequest;
import fisi.software.detalles.controller.dto.rol.RolResponse;
import fisi.software.detalles.controller.dto.rol.RolUsuarioAsignadoResponse;
import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.Usuario;
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
class RolServiceTest {

    @Autowired
    private RolService rolService;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
    }

    @Test
    void crearRolEstableceValoresPorDefecto() {
        RolRequest request = new RolRequest("Supervisor", "Gestiona equipos", null);

        RolResponse response = rolService.crearRol(request);

        assertThat(response.id()).isNotNull();
        assertThat(response.nombre()).isEqualTo("Supervisor");
        assertThat(response.estado()).isTrue();
    assertThat(response.totalUsuarios()).isZero();
    assertThat(response.usuarios()).isEmpty();
        assertThat(rolRepository.findById(response.id())).isPresent();
    }

    @Test
    void crearRolConNombreDuplicadoLanzaExcepcion() {
        rolService.crearRol(new RolRequest("Analista", null, Boolean.TRUE));

        assertThatThrownBy(() -> rolService.crearRol(new RolRequest("analista", "Duplicado", Boolean.TRUE)))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("nombre del rol ya está registrado");
    }

    @Test
    void listarRolesSoloActivosCuandoSeSolicita() {
        Rol activo = new Rol();
        activo.setNombre("Activo");
        activo.setEstado(Boolean.TRUE);
        rolRepository.save(activo);

        Rol inactivo = new Rol();
        inactivo.setNombre("Inactivo");
        inactivo.setEstado(Boolean.FALSE);
        rolRepository.save(inactivo);

        List<RolResponse> activos = rolService.listarRoles(true);

        assertThat(activos).extracting(RolResponse::nombre).containsExactly("Activo");
    }

    @Test
    void eliminarRolAsignadoLanzaExcepcion() {
        Rol rol = new Rol();
        rol.setNombre("Asignado");
        rol.setEstado(Boolean.TRUE);
        Integer rolId = rolRepository.save(rol).getId();

        Usuario usuario = new Usuario();
        usuario.setNombres("Test");
        usuario.setApellidos("Usuario");
        usuario.setUsername("test.usuario");
        usuario.setEmail("test.usuario@example.com");
        usuario.setPasswordHash("hash");
        usuario.setRoles(Set.of(rolRepository.findById(rolId).orElseThrow()));
        usuarioRepository.save(usuario);

        assertThatThrownBy(() -> rolService.eliminarRol(rolId))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("No se puede eliminar el rol");
    }

    @Test
    void actualizarEstadoModificaValor() {
        Rol rol = new Rol();
        rol.setNombre("Temporal");
        rol.setEstado(Boolean.TRUE);
        Integer rolId = rolRepository.save(rol).getId();

        RolResponse actualizado = rolService.actualizarEstado(rolId, new RolEstadoRequest(Boolean.FALSE));

        assertThat(actualizado.estado()).isFalse();
        assertThat(actualizado.totalUsuarios()).isZero();
        assertThat(rolRepository.findById(rolId))
            .hasValueSatisfying(rolActualizado -> assertThat(rolActualizado.getEstado()).isFalse());
    }

    @Test
    void listarRolesIncluyeConteoYUsuarios() {
        Rol rol = new Rol();
        rol.setNombre("Soporte");
        rol.setEstado(Boolean.TRUE);
        Integer rolId = rolRepository.save(rol).getId();

        Usuario usuario = new Usuario();
        usuario.setNombres("Maria");
        usuario.setApellidos("Gomez");
        usuario.setUsername("maria.gomez");
        usuario.setEmail("maria.gomez@example.com");
        usuario.setPasswordHash("hash");
        usuario.setRoles(Set.of(rolRepository.findById(rolId).orElseThrow()));
        usuarioRepository.save(usuario);

        List<RolResponse> roles = rolService.listarRoles(false);

        assertThat(roles)
            .filteredOn(r -> r.id().equals(rolId))
            .singleElement()
            .satisfies(r -> {
                assertThat(r.totalUsuarios()).isEqualTo(1L);
                assertThat(r.usuarios()).extracting(RolUsuarioAsignadoResponse::nombreCompleto)
                    .containsExactly("Maria Gomez");
            });
    }
}
