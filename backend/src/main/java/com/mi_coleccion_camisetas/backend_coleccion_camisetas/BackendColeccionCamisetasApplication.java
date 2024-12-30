package com.mi_coleccion_camisetas.backend_coleccion_camisetas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class }) // Deshabilitar configuración automática
public class BackendColeccionCamisetasApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendColeccionCamisetasApplication.class, args);
	}
}
