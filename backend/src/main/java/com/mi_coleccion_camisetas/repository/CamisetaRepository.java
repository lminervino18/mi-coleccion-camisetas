package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.Camiseta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CamisetaRepository extends JpaRepository<Camiseta, Long> {

    // Métodos existentes
    List<Camiseta> findByUsuarioId(Long usuarioId);

    Optional<Camiseta> findByIdAndUsuarioId(Long id, Long usuarioId);

    // Búsqueda por club y usuario
    List<Camiseta> findByUsuarioIdAndClubContainingIgnoreCase(Long usuarioId, String club);

    // Búsqueda por temporada y usuario
    List<Camiseta> findByUsuarioIdAndTemporada(Long usuarioId, String temporada);

    // Búsqueda por número de equipación y usuario
    List<Camiseta> findByUsuarioIdAndNumeroEquipacion(Long usuarioId, String numeroEquipacion);

    // Verificar si existe una camiseta para un usuario
    boolean existsByIdAndUsuarioId(Long id, Long usuarioId);

    // Contar camisetas por usuario
    long countByUsuarioId(Long usuarioId);

    // Búsqueda personalizada con JPQL
    @Query("SELECT c FROM Camiseta c WHERE c.usuario.id = :usuarioId " +
            "AND (:club IS NULL OR LOWER(c.club) LIKE LOWER(CONCAT('%', :club, '%'))) " +
            "AND (:temporada IS NULL OR c.temporada = :temporada) " +
            "AND (:numeroEquipacion IS NULL OR c.numeroEquipacion = :numeroEquipacion)")
    List<Camiseta> buscarCamisetas(
            @Param("usuarioId") Long usuarioId,
            @Param("club") String club,
            @Param("temporada") String temporada,
            @Param("numeroEquipacion") String numeroEquipacion);

    // Búsqueda por color específico
    @Query("SELECT DISTINCT c FROM Camiseta c JOIN c.colores color " +
            "WHERE c.usuario.id = :usuarioId AND LOWER(color) = LOWER(:color)")
    List<Camiseta> findByColor(
            @Param("usuarioId") Long usuarioId,
            @Param("color") String color);

    // Obtener todas las temporadas distintas de un usuario
    @Query("SELECT DISTINCT c.temporada FROM Camiseta c WHERE c.usuario.id = :usuarioId ORDER BY c.temporada")
    List<String> findTemporadasByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Obtener todos los clubes distintos de un usuario
    @Query("SELECT DISTINCT c.club FROM Camiseta c WHERE c.usuario.id = :usuarioId ORDER BY c.club")
    List<String> findClubesByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Obtener todos los colores distintos de un usuario
    @Query("SELECT DISTINCT color FROM Camiseta c JOIN c.colores color " +
            "WHERE c.usuario.id = :usuarioId ORDER BY color")
    List<String> findColoresByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Eliminar todas las camisetas de un usuario
    void deleteByUsuarioId(Long usuarioId);
}