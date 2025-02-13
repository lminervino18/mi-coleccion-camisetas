package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.dto.CamisetaDTO;
import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.CamisetaRepository;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public CamisetaDTO saveCamiseta(CamisetaDTO camisetaDTO, MultipartFile imagenRecortada,
            MultipartFile imagenCompleta) throws IOException {
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
        // Nuevos campos
        camiseta.setTipoDeCamiseta(camisetaDTO.getTipoDeCamiseta());
        camiseta.setLiga(camisetaDTO.getLiga());

        // Guardar imagen recortada
        if (imagenRecortada != null && !imagenRecortada.isEmpty()) {
            camiseta.setImagenRecortada(imagenRecortada.getBytes());
        }

        // Guardar imagen completa
        if (imagenCompleta != null && !imagenCompleta.isEmpty()) {
            camiseta.setImagenCompleta(imagenCompleta.getBytes());
        }

        Camiseta savedCamiseta = camisetaRepository.save(camiseta);
        CamisetaDTO responseDTO = new CamisetaDTO(savedCamiseta);

        // Convertir ambas imágenes a Base64 para el frontend
        if (savedCamiseta.getImagenRecortada() != null) {
            responseDTO.setImagenRecortadaBase64(
                    Base64.getEncoder().encodeToString(savedCamiseta.getImagenRecortada()));
        }
        if (savedCamiseta.getImagenCompleta() != null) {
            responseDTO.setImagenCompletaBase64(
                    Base64.getEncoder().encodeToString(savedCamiseta.getImagenCompleta()));
        }

        return responseDTO;
    }

    @Transactional
    public CamisetaDTO updateCamiseta(CamisetaDTO camisetaDTO, MultipartFile imagenRecortada,
            MultipartFile imagenCompleta) throws IOException {
        Optional<Camiseta> camisetaOpt = camisetaRepository.findByIdAndUsuarioId(
                camisetaDTO.getId(),
                camisetaDTO.getUsuarioId());

        if (camisetaOpt.isEmpty()) {
            throw new RuntimeException("Camiseta no encontrada o no pertenece al usuario");
        }

        Camiseta camiseta = camisetaOpt.get();
        camiseta.setClub(camisetaDTO.getClub());
        camiseta.setPais(camisetaDTO.getPais());
        camiseta.setDorsal(camisetaDTO.getDorsal());
        camiseta.setNombre(camisetaDTO.getNombre());
        camiseta.setTalle(camisetaDTO.getTalle());
        camiseta.setColores(camisetaDTO.getColores());
        camiseta.setNumeroEquipacion(camisetaDTO.getNumeroEquipacion());
        camiseta.setTemporada(camisetaDTO.getTemporada());
        camiseta.setComentarios(camisetaDTO.getComentarios());
        // Nuevos campos
        camiseta.setTipoDeCamiseta(camisetaDTO.getTipoDeCamiseta());
        camiseta.setLiga(camisetaDTO.getLiga());

        // Actualizar imágenes solo si se proporcionan nuevas
        if (imagenRecortada != null && !imagenRecortada.isEmpty()) {
            camiseta.setImagenRecortada(imagenRecortada.getBytes());
        }
        if (imagenCompleta != null && !imagenCompleta.isEmpty()) {
            camiseta.setImagenCompleta(imagenCompleta.getBytes());
        }

        Camiseta updatedCamiseta = camisetaRepository.save(camiseta);
        CamisetaDTO responseDTO = new CamisetaDTO(updatedCamiseta);

        // Convertir imágenes a Base64
        if (updatedCamiseta.getImagenRecortada() != null) {
            responseDTO.setImagenRecortadaBase64(
                    Base64.getEncoder().encodeToString(updatedCamiseta.getImagenRecortada()));
        }
        if (updatedCamiseta.getImagenCompleta() != null) {
            responseDTO.setImagenCompletaBase64(
                    Base64.getEncoder().encodeToString(updatedCamiseta.getImagenCompleta()));
        }

        return responseDTO;
    }

    // Los demás métodos permanecen sin cambios ya que trabajan con el objeto
    // CamisetaDTO
    // que ya incluirá los nuevos campos

    public List<CamisetaDTO> getCamisetasByUsuario(Long usuarioId) {
        List<Camiseta> camisetas = camisetaRepository.findByUsuarioId(usuarioId);
        return camisetas.stream()
                .map(camiseta -> {
                    CamisetaDTO dto = new CamisetaDTO(camiseta);
                    if (camiseta.getImagenRecortada() != null) {
                        dto.setImagenRecortadaBase64(
                                Base64.getEncoder().encodeToString(camiseta.getImagenRecortada()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public Optional<CamisetaDTO> getCamisetaDetail(Long usuarioId, Long camisetaId) {
        Optional<Camiseta> camisetaOpt = camisetaRepository.findByIdAndUsuarioId(camisetaId, usuarioId);

        return camisetaOpt.map(camiseta -> {
            CamisetaDTO dto = new CamisetaDTO(camiseta);
            if (camiseta.getImagenRecortada() != null) {
                dto.setImagenRecortadaBase64(
                        Base64.getEncoder().encodeToString(camiseta.getImagenRecortada()));
            }
            if (camiseta.getImagenCompleta() != null) {
                dto.setImagenCompletaBase64(
                        Base64.getEncoder().encodeToString(camiseta.getImagenCompleta()));
            }
            return dto;
        });
    }

    @Transactional
    public void deleteCamisetaByUsuario(Long usuarioId, Long camisetaId) {
        if (!camisetaRepository.existsByIdAndUsuarioId(camisetaId, usuarioId)) {
            throw new RuntimeException("Camiseta no encontrada o no pertenece al usuario");
        }
        camisetaRepository.deleteByIdAndUsuarioId(camisetaId, usuarioId);
    }

    @Transactional
    public void deleteAllCamisetasByUsuario(Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        camisetaRepository.deleteAllByUsuarioId(usuarioId);
    }

    @Transactional
    public void deleteCamiseta(Long id, Long usuarioId) {
        Optional<Camiseta> camiseta = camisetaRepository.findByIdAndUsuarioId(id, usuarioId);
        if (camiseta.isPresent()) {
            camisetaRepository.deleteById(id);
        } else {
            throw new RuntimeException("Camiseta no encontrada o no pertenece al usuario");
        }
    }
}