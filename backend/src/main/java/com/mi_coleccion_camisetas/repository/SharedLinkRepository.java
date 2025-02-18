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
    
    Optional<SharedLink> findByToken(String token);
    boolean existsByToken(String token);
    void deleteByToken(String token);
    void deleteByUsuarioId(Long usuarioId);
    List<SharedLink> findByUsuarioId(Long usuarioId);
    // Eliminar links expirados
    @Modifying
    @Query("DELETE FROM SharedLink sl WHERE sl.fechaExpiracion < :fechaActual")
    void deleteExpiredLinks(@Param("fechaActual") LocalDateTime fechaActual);
    // Buscar links cercanos a expirar
    @Query("SELECT sl FROM SharedLink sl WHERE sl.fechaExpiracion BETWEEN :fechaInicio AND :fechaFin")
    List<SharedLink> findLinksProximosAExpirar(
        @Param("fechaInicio") LocalDateTime fechaInicio, 
        @Param("fechaFin") LocalDateTime fechaFin
    );
}