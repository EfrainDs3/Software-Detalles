package fisi.software.detalles.config;

import fisi.software.detalles.security.CustomUserDetailsService;
import fisi.software.detalles.security.Permisos;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Habilitar CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Deshabilitar CSRF para desarrollo
            .csrf(csrf -> csrf.disable())
            
            // Configurar autorización
            .authorizeHttpRequests(authorize -> {
                // Recursos públicos
                authorize.requestMatchers("/css/**", "/js/**", "/img/**", "/images/**", "/login", "/forgot-password", "/forgot-password/**").permitAll();
                authorize.requestMatchers("/api/auth/login", "/api/auth/forgot-password/**").permitAll();
                authorize.requestMatchers("/api/productos/**").permitAll();

                // Rutas protegidas por permisos específicos
                authorize.requestMatchers("/dashboard", "/dashboard/**").hasAuthority(Permisos.ACCEDER_AL_DASHBOARD);
                authorize.requestMatchers(HttpMethod.POST, "/ventas/api/**").hasAuthority(Permisos.REGISTRAR_VENTAS);
                authorize.requestMatchers(HttpMethod.PUT, "/ventas/api/**").hasAuthority(Permisos.REGISTRAR_VENTAS);
                authorize.requestMatchers(HttpMethod.POST, "/inventario/api/**").hasAuthority(Permisos.GESTIONAR_INVENTARIO);
                authorize.requestMatchers(HttpMethod.PUT, "/inventario/api/**").hasAuthority(Permisos.GESTIONAR_INVENTARIO);
                authorize.requestMatchers(HttpMethod.POST, "/api/almacenes/**").hasAuthority(Permisos.GESTIONAR_INVENTARIO);
                authorize.requestMatchers(HttpMethod.PUT, "/api/almacenes/**").hasAuthority(Permisos.GESTIONAR_INVENTARIO);
                authorize.requestMatchers(HttpMethod.DELETE, "/api/almacenes/**").hasAuthority(Permisos.GESTIONAR_INVENTARIO);
                authorize.requestMatchers(HttpMethod.POST, "/api/proveedores/**").hasAuthority(Permisos.GESTIONAR_COMPRAS);
                authorize.requestMatchers(HttpMethod.PUT, "/api/proveedores/**").hasAuthority(Permisos.GESTIONAR_COMPRAS);
                authorize.requestMatchers(HttpMethod.DELETE, "/api/proveedores/**").hasAuthority(Permisos.GESTIONAR_COMPRAS);
                authorize.requestMatchers(HttpMethod.POST, "/clientes/api/**").hasAuthority(Permisos.GESTIONAR_CLIENTES);
                authorize.requestMatchers(HttpMethod.PUT, "/clientes/api/**").hasAuthority(Permisos.GESTIONAR_CLIENTES);
                authorize.requestMatchers(HttpMethod.DELETE, "/clientes/api/**").hasAuthority(Permisos.GESTIONAR_CLIENTES);

                authorize.requestMatchers("/api/reniec/**").hasAnyAuthority(
                    Permisos.GESTIONAR_CLIENTES,
                    Permisos.autoridadModulo("Clientes"),
                    Permisos.GESTIONAR_USUARIOS,
                    Permisos.autoridadModulo("Usuarios"),
                    Permisos.REGISTRAR_VENTAS,
                    Permisos.autoridadModulo("Ventas")
                );

                authorize.requestMatchers("/software/**").authenticated();

                // API de gestión de usuarios, roles y permisos con privilegios finos
                authorize.requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAnyAuthority(Permisos.GESTIONAR_USUARIOS, Permisos.VER_USUARIOS);
                authorize.requestMatchers(HttpMethod.POST, "/api/usuarios/**").hasAuthority(Permisos.GESTIONAR_USUARIOS);
                authorize.requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasAuthority(Permisos.GESTIONAR_USUARIOS);
                authorize.requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasAuthority(Permisos.GESTIONAR_USUARIOS);

                authorize.requestMatchers(HttpMethod.GET, "/api/roles/**").hasAnyAuthority(Permisos.GESTIONAR_ROLES, Permisos.VER_ROLES);
                authorize.requestMatchers(HttpMethod.POST, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES);
                authorize.requestMatchers(HttpMethod.PUT, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES);
                authorize.requestMatchers(HttpMethod.PATCH, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES);
                authorize.requestMatchers(HttpMethod.DELETE, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES);

                authorize.requestMatchers(HttpMethod.GET, "/api/permisos/**").hasAnyAuthority(Permisos.GESTIONAR_PERMISOS, Permisos.VER_PERMISOS);
                authorize.requestMatchers(HttpMethod.POST, "/api/permisos/**").hasAuthority(Permisos.GESTIONAR_PERMISOS);
                authorize.requestMatchers(HttpMethod.PUT, "/api/permisos/**").hasAuthority(Permisos.GESTIONAR_PERMISOS);
                authorize.requestMatchers(HttpMethod.DELETE, "/api/permisos/**").hasAuthority(Permisos.GESTIONAR_PERMISOS);

                authorize.requestMatchers("/api/**").authenticated();
                authorize.anyRequest().authenticated();
            })
            
            // Configurar sesiones para mantener la autenticación
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            
            // Configurar formulario de login
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/auth/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            
            // Configurar logout
            .logout(logout -> logout
                .logoutUrl("/auth/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        http.userDetailsService(userDetailsService);
            
        return http.build();
    }

    // Configuración de CORS para permitir credenciales
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:8081", "http://localhost:8080"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    // AuthenticationManager para login programático
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}