package fisi.software.detalles.service;

import fisi.software.detalles.entity.Rol;
import fisi.software.detalles.entity.TipoDocumento;
import fisi.software.detalles.entity.Usuario;
import fisi.software.detalles.repository.RolRepository;
import fisi.software.detalles.repository.TipoDocumentoRepository;
import fisi.software.detalles.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class UsuarioServiceAuthTest {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Integer rolId;
    private Integer tipoDocumentoId;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
        tipoDocumentoRepository.deleteAll();

        TipoDocumento tipoDocumento = new TipoDocumento(null, "DNI");
        tipoDocumentoId = tipoDocumentoRepository.save(tipoDocumento).getIdTipoDocumento();

        Rol rol = new Rol();
        rol.setNombre("Administrador");
        rol.setDescripcion("Acceso total");
        rol.setEstado(Boolean.TRUE);
        rolId = rolRepository.save(rol).getId();

        Usuario usuario = new Usuario();
        usuario.setNombres("Usuario");
        usuario.setApellidos("Prueba");
        usuario.setUsername("usuario.prueba");
        usuario.setEmail("usuario.prueba@example.com");
        usuario.setNumeroDocumento("12345678");
        usuario.setTipoDocumento(tipoDocumentoRepository.findById(tipoDocumentoId).orElseThrow());
        usuario.setPasswordHash(passwordEncoder.encode("Secret123"));
        usuario.setRoles(Set.of(rolRepository.findById(rolId).orElseThrow()));

        usuarioRepository.save(usuario);
    }

    @Test
    void autenticarConCredencialesValidasPorUsername() {
        Usuario autenticado = usuarioService.autenticar("usuario.prueba", "Secret123");

        assertThat(autenticado.getId()).isNotNull();
        assertThat(autenticado.getUsername()).isEqualTo("usuario.prueba");
        assertThat(autenticado.getFechaUltimaSesion()).isNotNull();
    }

    @Test
    void autenticarConCredencialesValidasPorEmail() {
        Usuario autenticado = usuarioService.autenticar("usuario.prueba@example.com", "Secret123");

        assertThat(autenticado.getEmail()).isEqualTo("usuario.prueba@example.com");
    }

    @Test
    void autenticarConPasswordInvalidaLanzaExcepcion() {
        assertThatThrownBy(() -> usuarioService.autenticar("usuario.prueba", "ClaveInvalida"))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Usuario o contraseña incorrectos");
    }

    @Test
    void verificarDatosRecuperacionConDatosValidos() {
        Usuario verificado = usuarioService.verificarDatosRecuperacion(
            "usuario.prueba",
            "Usuario",
            "Prueba",
            "usuario.prueba@example.com",
            "12345678"
        );

        assertThat(verificado.getId()).isNotNull();
    }

    @Test
    void verificarDatosRecuperacionConDatosInvalidosLanzaExcepcion() {
        assertThatThrownBy(() -> usuarioService.verificarDatosRecuperacion(
            "usuario.prueba",
            "Usuario",
            "Prueba",
            "usuario.prueba@example.com",
            "00000000"
        ))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Los datos proporcionados no coinciden");
    }

    @Test
    void restablecerPasswordActualizaHash() {
        String nuevaClave = "ClaveNueva123";

        usuarioService.restablecerPassword(
            "usuario.prueba",
            "Usuario",
            "Prueba",
            "usuario.prueba@example.com",
            "12345678",
            nuevaClave
        );

        Usuario actualizado = usuarioRepository.findByUsernameIgnoreCase("usuario.prueba").orElseThrow();
        assertThat(passwordEncoder.matches(nuevaClave, actualizado.getPasswordHash())).isTrue();
    }
}
