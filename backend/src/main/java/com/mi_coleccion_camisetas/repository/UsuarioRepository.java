package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Métodos existentes
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Métodos para actualización segura
    @Query("SELECT u FROM Usuario u WHERE u.id = :id AND u.email != :email AND u.username != :username")
    Optional<Usuario> findByIdForUpdate(@Param("id") Long id, @Param("email") String email,
            @Param("username") String username);

    // Verificar si email o username están en uso por otro usuario
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email AND u.id != :userId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("userId") Long userId);

    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.username = :username AND u.id != :userId")
    boolean existsByUsernameAndIdNot(@Param("username") String username, @Param("userId") Long userId);

    // Borrado seguro con verificación
    @Modifying
    @Query("DELETE FROM Usuario u WHERE u.id = :id")
    void deleteByIdWithCheck(@Param("id") Long id);

    // Nuevos métodos para manejo de foto de perfil
    @Query("SELECT u.fotoDePerfil FROM Usuario u WHERE u.id = :id")
    Optional<String> findFotoDePerfilById(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Usuario u SET u.fotoDePerfil = :fotoDePerfil WHERE u.id = :id")
    int updateFotoDePerfil(@Param("id") Long id, @Param("fotoDePerfil") String fotoDePerfil);

    @Modifying
    @Query("UPDATE Usuario u SET u.fotoDePerfil = NULL WHERE u.id = :id")
    int deleteFotoDePerfil(@Param("id") Long id);

    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.id = :id AND u.fotoDePerfil IS NOT NULL")
    boolean hasFotoDePerfil(@Param("id") Long id);
}