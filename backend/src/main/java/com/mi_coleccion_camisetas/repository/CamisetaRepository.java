package com.mi_coleccion_camisetas.repository;

import com.mi_coleccion_camisetas.model.Camiseta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CamisetaRepository extends JpaRepository<Camiseta, Long> {
    List<Camiseta> findByUsuarioId(Long usuarioId); // Obtener camisetas por ID de usuario
}
