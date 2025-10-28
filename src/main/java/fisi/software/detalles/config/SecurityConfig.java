package fisi.software.detalles.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authorize -> authorize
                // Permitir acceso a recursos estáticos
                .requestMatchers("/css/**", "/js/**", "/img/**", "/images/**", "/login", "/auth/login").permitAll()
                // Permitir acceso a todas las vistas por ahora (temporal para desarrollo)
                .requestMatchers("/**").permitAll()
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.disable()); // Deshabilitar CSRF temporalmente para desarrollo
            
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
