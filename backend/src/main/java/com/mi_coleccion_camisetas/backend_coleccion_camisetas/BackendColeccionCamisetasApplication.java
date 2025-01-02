package com.mi_coleccion_camisetas.backend_coleccion_camisetas;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.SpringApplication;

@SpringBootApplication(scanBasePackages = "com.mi_coleccion_camisetas")
@EnableJpaRepositories(basePackages = "com.mi_coleccion_camisetas")
public class BackendColeccionCamisetasApplication {
	public static void main(String[] args) {
		SpringApplication.run(BackendColeccionCamisetasApplication.class, args);
	}
}
