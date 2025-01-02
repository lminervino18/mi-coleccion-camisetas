package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Método para buscar un usuario por su correo electrónico
    Optional<Usuario> findByEmail(String email);

    // Método para buscar un usuario por su correo electrónico
    Optional<Usuario> findByUsername(String username);

    // Método para verificar si existe un usuario por su nombre de usuario
    boolean existsByUsername(String username);

    // Método para verificar si existe un usuario por su correo electrónico
    boolean existsByEmail(String email);
}
