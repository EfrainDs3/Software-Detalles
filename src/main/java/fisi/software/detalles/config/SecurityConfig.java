package fisi.software.detalles.config;

import java.util.List;

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

import fisi.software.detalles.security.CustomUserDetailsService;
import fisi.software.detalles.security.Permisos;
import lombok.RequiredArgsConstructor;

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
            .authorizeHttpRequests(authorize -> authorize
                // Recursos públicos
                .requestMatchers("/css/**", "/js/**", "/img/**", "/images/**", "/Detalles_web/**", "/login", "/index", "/forgot-password", "/forgot-password/**").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/forgot-password/**").permitAll()
                .requestMatchers("/api/productos/**").permitAll()
                // Rutas protegidas
                .requestMatchers("/dashboard", "/dashboard/**").hasAuthority(Permisos.ACCEDER_AL_DASHBOARD)
                .requestMatchers("/software/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/**").hasAnyAuthority(Permisos.GESTIONAR_USUARIOS, Permisos.VER_USUARIOS)
                .requestMatchers(HttpMethod.POST, "/api/usuarios/**").hasAuthority(Permisos.GESTIONAR_USUARIOS)
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasAuthority(Permisos.GESTIONAR_USUARIOS)
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasAuthority(Permisos.GESTIONAR_USUARIOS)
                .requestMatchers(HttpMethod.GET, "/api/roles/**").hasAnyAuthority(Permisos.GESTIONAR_ROLES, Permisos.VER_ROLES)
                .requestMatchers(HttpMethod.POST, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES)
                .requestMatchers(HttpMethod.PUT, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES)
                .requestMatchers(HttpMethod.PATCH, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES)
                .requestMatchers(HttpMethod.DELETE, "/api/roles/**").hasAuthority(Permisos.GESTIONAR_ROLES)
                .requestMatchers(HttpMethod.GET, "/api/permisos/**").hasAnyAuthority(Permisos.GESTIONAR_PERMISOS, Permisos.VER_PERMISOS)
                .requestMatchers(HttpMethod.POST, "/api/permisos/**").hasAuthority(Permisos.GESTIONAR_PERMISOS)
                .requestMatchers(HttpMethod.PUT, "/api/permisos/**").hasAuthority(Permisos.GESTIONAR_PERMISOS)
                .requestMatchers(HttpMethod.DELETE, "/api/permisos/**").hasAuthority(Permisos.GESTIONAR_PERMISOS)
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            
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