package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.SharedLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Repository
public interface SharedLinkRepository extends JpaRepository<SharedLink, Long> {
    
    // Buscar un link compartido por su token
    Optional<SharedLink> findByToken(String token);

    // Eliminar un link compartido por su token
    void deleteByToken(String token);

    // Eliminar links expirados
    @Modifying
    @Query("DELETE FROM SharedLink sl WHERE sl.fechaExpiracion < :fechaActual")
    void deleteExpiredLinks(@Param("fechaActual") LocalDateTime fechaActual);

    // Buscar links por usuario
    List<SharedLink> findByUsuarioId(Long usuarioId);

    // Verificar si existe un token
    boolean existsByToken(String token);

    // Buscar links cercanos a expirar
    @Query("SELECT sl FROM SharedLink sl WHERE sl.fechaExpiracion BETWEEN :fechaInicio AND :fechaFin")
    List<SharedLink> findLinksProximosAExpirar(
        @Param("fechaInicio") LocalDateTime fechaInicio, 
        @Param("fechaFin") LocalDateTime fechaFin
    );
}