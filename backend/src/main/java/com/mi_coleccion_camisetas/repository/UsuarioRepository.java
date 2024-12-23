package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método para verificar si un usuario ya existe por su nombre de usuario
    boolean existsByUsername(String username);

    // Método para verificar si un correo electrónico ya está registrado
    boolean existsByEmail(String email);

    // Método para encontrar un usuario por su nombre de usuario
    Optional<Usuario> findByUsername(String username);
}
