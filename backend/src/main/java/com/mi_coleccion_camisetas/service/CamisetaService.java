package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.repository.CamisetaRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class CamisetaService {

    private final CamisetaRepository camisetaRepository;

    public CamisetaService(CamisetaRepository camisetaRepository) {
        this.camisetaRepository = camisetaRepository;
    }

    public Camiseta saveCamiseta(Camiseta camiseta, MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            camiseta.setImagen(file.getBytes());
        }
        return camisetaRepository.save(camiseta);
    }

    public List<Camiseta> getCamisetasByUsuario(Long usuarioId) {
        return camisetaRepository.findByUsuarioId(usuarioId);
    }

    public void deleteCamiseta(Long id) {
        Optional<Camiseta> camiseta = camisetaRepository.findById(id);
        if (camiseta.isPresent()) {
            camisetaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Camiseta no encontrada con el ID: " + id);
        }
    }
}
