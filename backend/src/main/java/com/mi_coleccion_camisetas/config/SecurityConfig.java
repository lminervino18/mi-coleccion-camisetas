package com.mi_coleccion_camisetas.config;

import com.mi_coleccion_camisetas.service.CustomUserDetailsService;
import com.mi_coleccion_camisetas.filter.JwtAuthenticationFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Endpoints públicos de autenticación y registro
                .requestMatchers(
                    "/api/auth/login", 
                    "/api/auth/registro", 
                    "/api/auth/verificar"
                ).permitAll()
                
                // Endpoint público para camisetas compartidas
                .requestMatchers("/api/shared/camisetas/{token}").permitAll()
                
                 // Endpoint público para camisetas compartidas
                 .requestMatchers("/api/shared/user/{token}").permitAll()

                // Endpoints públicos para verificación de usuarios
                .requestMatchers("/api/usuarios").permitAll()
                
                // Endpoints de registro público
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                
                // Endpoints que requieren autenticación
                .requestMatchers(
                    "/api/camisetas/**", 
                    "/api/usuarios/**"
                ).authenticated()
                
                // Cualquier otro endpoint requiere autenticación
                .anyRequest().authenticated()
            )
            .userDetailsService(userDetailsService)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}