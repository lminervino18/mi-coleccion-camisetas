package com.mi_coleccion_camisetas.config;

import com.mi_coleccion_camisetas.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    // Bean para encriptar contraseñas
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Configuración del AuthenticationProvider
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService); // Servicio personalizado
        authProvider.setPasswordEncoder(passwordEncoder()); // Encriptación con BCrypt
        return authProvider;
    }

    // Configuración del AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Configuración del SecurityFilterChain
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Deshabilitar CSRF para pruebas locales (habilitar en producción si usas
                                              // un frontend separado)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login", "/api/usuarios/register", "/api/csrf").permitAll() // Acceso
                                                                                                           // público
                        .anyRequest().authenticated() // Cualquier otra ruta requiere autenticación
                )
                .formLogin(form -> form
                        .loginPage("/login") // Página de inicio de sesión personalizada (ajusta si usas un frontend
                                             // separado)
                        .defaultSuccessUrl("/", true) // Redirige tras login exitoso
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout") // URL de logout
                        .logoutSuccessUrl("/") // Redirige tras logout exitoso
                        .permitAll());

        return http.build();
    }
}
