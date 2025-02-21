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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // 🔥 Deshabilitar CSRF para evitar problemas con APIs
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // 🔥 Aplicar configuración CORS
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
                .requestMatchers("/api/shared/user/{token}").permitAll()

                // Endpoints públicos para verificación de usuarios
                .requestMatchers("/api/usuarios").permitAll()
                
                // Endpoints de registro público
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()

                // Permitir solicitudes `OPTIONS` (preflight requests para CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Endpoints que requieren autenticación
                .requestMatchers(
                    "/api/camisetas/**", 
                    "/api/usuarios/**"
                ).authenticated()
                
                // Permitir archivos estáticos
                .requestMatchers(
                    "/manifest.json",
                    "/*.png",
                    "/static/**",
                    "/favicon.ico",
                    "/icono-chico.png",
                    "/icono-mediano.png",
                    "/icono-grande.png"
                ).permitAll()

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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 🔥 PERMITIR TODOS LOS ORÍGENES TEMPORALMENTE PARA PROBAR (luego restringimos)
        configuration.setAllowedOrigins(Arrays.asList("*")); 
        
        // 🔥 MÉTODOS PERMITIDOS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 🔥 HEADERS PERMITIDOS
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        
        // 🔥 PERMITIR ENVÍO DE CREDENCIALES (COOKIES, JWT)
        configuration.setAllowCredentials(true);
        
        // 🔥 REGISTRAR CORS PARA TODAS LAS RUTAS
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
