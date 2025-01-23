package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.dto.CamisetaDTO;
import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.CamisetaRepository;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CamisetaService {

    private final CamisetaRepository camisetaRepository;
    private final UsuarioRepository usuarioRepository;

    public CamisetaService(CamisetaRepository camisetaRepository, UsuarioRepository usuarioRepository) {
        this.camisetaRepository = camisetaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public CamisetaDTO saveCamiseta(CamisetaDTO camisetaDTO, MultipartFile file) throws IOException {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(camisetaDTO.getUsuarioId());

        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado con ID: " + camisetaDTO.getUsuarioId());
        }

        Camiseta camiseta = new Camiseta();
        camiseta.setUsuario(usuarioOpt.get());
        camiseta.setClub(camisetaDTO.getClub());
        camiseta.setPais(camisetaDTO.getPais());
        camiseta.setDorsal(camisetaDTO.getDorsal());
        camiseta.setNombre(camisetaDTO.getNombre());
        camiseta.setTalle(camisetaDTO.getTalle());
        camiseta.setColores(camisetaDTO.getColores());
        camiseta.setNumeroEquipacion(camisetaDTO.getNumeroEquipacion());
        camiseta.setTemporada(camisetaDTO.getTemporada());
        camiseta.setComentarios(camisetaDTO.getComentarios());

        // Verificar y guardar la imagen
        if (file != null && !file.isEmpty()) {
            camiseta.setImagen(file.getBytes());
        }

        Camiseta savedCamiseta = camisetaRepository.save(camiseta);
        CamisetaDTO responseDTO = new CamisetaDTO(savedCamiseta);

        // Convertir la imagen a Base64 para enviarla al frontend
        if (savedCamiseta.getImagen() != null) {
            responseDTO.setImagenBase64(Base64.getEncoder().encodeToString(savedCamiseta.getImagen()));
        }

        return responseDTO;
    }

    public List<CamisetaDTO> getCamisetasByUsuario(Long usuarioId) {
        List<Camiseta> camisetas = camisetaRepository.findByUsuarioId(usuarioId);
        return camisetas.stream()
                .map(camiseta -> {
                    CamisetaDTO dto = new CamisetaDTO(camiseta);
                    // Convertir la imagen a Base64 para el frontend
                    if (camiseta.getImagen() != null) {
                        dto.setImagenBase64(Base64.getEncoder().encodeToString(camiseta.getImagen()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void deleteCamiseta(Long id) {
        if (camisetaRepository.existsById(id)) {
            camisetaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Camiseta no encontrada con el ID: " + id);
        }
    }
}
