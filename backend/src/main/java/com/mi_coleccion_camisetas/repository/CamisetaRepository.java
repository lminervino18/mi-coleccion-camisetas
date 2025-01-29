package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.Camiseta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CamisetaRepository extends JpaRepository<Camiseta, Long> {

        // Métodos existentes...
        List<Camiseta> findByUsuarioId(Long usuarioId);

        Optional<Camiseta> findByIdAndUsuarioId(Long id, Long usuarioId);

        List<Camiseta> findByUsuarioIdAndClubContainingIgnoreCase(Long usuarioId, String club);

        List<Camiseta> findByUsuarioIdAndTemporada(Long usuarioId, String temporada);

        List<Camiseta> findByUsuarioIdAndNumeroEquipacion(Long usuarioId, String numeroEquipacion);

        boolean existsByIdAndUsuarioId(Long id, Long usuarioId);

        long countByUsuarioId(Long usuarioId);

        // Métodos para borrado
        @Modifying
        @Query("DELETE FROM Camiseta c WHERE c.id = :id AND c.usuario.id = :usuarioId")
        void deleteByIdAndUsuarioId(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

        @Modifying
        @Query("DELETE FROM Camiseta c WHERE c.usuario.id = :usuarioId")
        void deleteAllByUsuarioId(@Param("usuarioId") Long usuarioId);

        // Verificación antes de borrar
        @Query("SELECT COUNT(c) > 0 FROM Camiseta c WHERE c.id = :id AND c.usuario.id = :usuarioId")
        boolean canDeleteCamiseta(@Param("id") Long id, @Param("usuarioId") Long usuarioId);

        // Búsquedas existentes...
        @Query("SELECT c FROM Camiseta c WHERE c.usuario.id = :usuarioId " +
                        "AND (:club IS NULL OR LOWER(c.club) LIKE LOWER(CONCAT('%', :club, '%'))) " +
                        "AND (:temporada IS NULL OR c.temporada = :temporada) " +
                        "AND (:numeroEquipacion IS NULL OR c.numeroEquipacion = :numeroEquipacion)")
        List<Camiseta> buscarCamisetas(
                        @Param("usuarioId") Long usuarioId,
                        @Param("club") String club,
                        @Param("temporada") String temporada,
                        @Param("numeroEquipacion") String numeroEquipacion);

        @Query("SELECT DISTINCT c FROM Camiseta c JOIN c.colores color " +
                        "WHERE c.usuario.id = :usuarioId AND LOWER(color) = LOWER(:color)")
        List<Camiseta> findByColor(
                        @Param("usuarioId") Long usuarioId,
                        @Param("color") String color);

        @Query("SELECT DISTINCT c.temporada FROM Camiseta c WHERE c.usuario.id = :usuarioId ORDER BY c.temporada")
        List<String> findTemporadasByUsuarioId(@Param("usuarioId") Long usuarioId);

        @Query("SELECT DISTINCT c.club FROM Camiseta c WHERE c.usuario.id = :usuarioId ORDER BY c.club")
        List<String> findClubesByUsuarioId(@Param("usuarioId") Long usuarioId);

        @Query("SELECT DISTINCT color FROM Camiseta c JOIN c.colores color " +
                        "WHERE c.usuario.id = :usuarioId ORDER BY color")
        List<String> findColoresByUsuarioId(@Param("usuarioId") Long usuarioId);

        // Método para actualización segura
        @Query("SELECT c FROM Camiseta c WHERE c.id = :id AND c.usuario.id = :usuarioId")
        Optional<Camiseta> findForUpdate(@Param("id") Long id, @Param("usuarioId") Long usuarioId);
}