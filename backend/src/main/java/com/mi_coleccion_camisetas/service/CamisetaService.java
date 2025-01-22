package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.dto.CamisetaDTO;
import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.repository.CamisetaRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CamisetaService {

    private final CamisetaRepository camisetaRepository;

    public CamisetaService(CamisetaRepository camisetaRepository) {
        this.camisetaRepository = camisetaRepository;
    }

    public CamisetaDTO saveCamiseta(CamisetaDTO camisetaDTO, MultipartFile file) throws IOException {
        Camiseta camiseta = new Camiseta();
        camiseta.setClub(camisetaDTO.getClub());
        camiseta.setPais(camisetaDTO.getPais());
        camiseta.setDorsal(camisetaDTO.getDorsal());
        camiseta.setNombre(camisetaDTO.getNombre());
        camiseta.setTalle(camisetaDTO.getTalle());
        camiseta.setColores(camisetaDTO.getColores());
        camiseta.setNumeroEquipacion(camisetaDTO.getNumeroEquipacion());
        camiseta.setComentarios(camisetaDTO.getComentarios());

        if (file != null && !file.isEmpty()) {
            camiseta.setImagen(file.getBytes());
        }

        Camiseta savedCamiseta = camisetaRepository.save(camiseta);
        return new CamisetaDTO(savedCamiseta);
    }

    public List<CamisetaDTO> getCamisetasByUsuario(Long usuarioId) {
        List<Camiseta> camisetas = camisetaRepository.findByUsuarioId(usuarioId);
        return camisetas.stream()
                .map(CamisetaDTO::new) // Convertir entidad Camiseta a DTO
                .collect(Collectors.toList());
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
