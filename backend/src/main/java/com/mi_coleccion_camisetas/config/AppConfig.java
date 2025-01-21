package com.mi_coleccion_camisetas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class AppConfig {

    /**
     * Bean de BCryptPasswordEncoder que se utiliza para encriptar contraseñas.
     * Este bean será detectado y utilizado en UsuarioService.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
