package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.model.SharedLink;
import com.mi_coleccion_camisetas.repository.SharedLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Service
public class SharedLinkService {

    private final SharedLinkRepository sharedLinkRepository;

    @Autowired
    public SharedLinkService(SharedLinkRepository sharedLinkRepository) {
        this.sharedLinkRepository = sharedLinkRepository;
    }

    /**
     * Genera un nuevo link compartido para un usuario
     * @param usuarioId ID del usuario que genera el link
     * @return Token del link generado
     */
    @Transactional
    public String generarLinkCompartido(Long usuarioId) {
        // Generar un token único
        String token;
        do {
            token = UUID.randomUUID().toString();
        } while (sharedLinkRepository.existsByToken(token));
        
        // Crear y guardar el link compartido
        SharedLink sharedLink = new SharedLink();
        sharedLink.setToken(token);
        sharedLink.setUsuarioId(usuarioId);
        sharedLink.setFechaCreacion(LocalDateTime.now());
        sharedLink.setFechaExpiracion(LocalDateTime.now().plusDays(7));
        
        sharedLinkRepository.save(sharedLink);
        
        return token;
    }

    /**
     * Valida un token de link compartido
     * @param token Token a validar
     * @return Optional con el SharedLink si es válido
     */
    @Transactional(readOnly = true)
    public Optional<SharedLink> validarToken(String token) {
        Optional<SharedLink> sharedLink = sharedLinkRepository.findByToken(token);
        
        // Verificar si el link existe y no ha expirado
        return sharedLink.filter(link -> 
            link != null && 
            LocalDateTime.now().isBefore(link.getFechaExpiracion())
        );
    }

    /**
     * Elimina un link compartido específico
     * @param token Token del link a eliminar
     */
    @Transactional
    public void eliminarLink(String token) {
        sharedLinkRepository.deleteByToken(token);
    }

    /**
     * Elimina links expirados
     * Programado para ejecutarse cada día a medianoche
     */
    @Transactional
    @Scheduled(cron = "0 0 0 * * ?") // Cada día a medianoche
    public void eliminarLinksExpirados() {
        LocalDateTime now = LocalDateTime.now();
        sharedLinkRepository.deleteExpiredLinks(now);
    }

    /**
     * Obtiene todos los links de un usuario
     * @param usuarioId ID del usuario
     * @return Lista de links compartidos
     */
    @Transactional(readOnly = true)
    public List<SharedLink> obtenerLinksDeUsuario(Long usuarioId) {
        return sharedLinkRepository.findByUsuarioId(usuarioId);
    }

    /**
     * Encuentra links próximos a expirar
     * @param diasAntelacion Días de antelación para considerar
     * @return Lista de links próximos a expirar
     */
    @Transactional(readOnly = true)
    public List<SharedLink> encontrarLinksProximosAExpirar(int diasAntelacion) {
        LocalDateTime fechaInicio = LocalDateTime.now();
        LocalDateTime fechaFin = fechaInicio.plusDays(diasAntelacion);
        
        return sharedLinkRepository.findLinksProximosAExpirar(fechaInicio, fechaFin);
    }

    /**
     * Renueva un link compartido
     * @param token Token del link a renovar
     * @return Nuevo token si se renueva con éxito
     */
    @Transactional
    public Optional<String> renovarLink(String token) {
        return sharedLinkRepository.findByToken(token)
            .map(sharedLink -> {
                // Eliminar el link actual
                sharedLinkRepository.delete(sharedLink);
                
                // Generar un nuevo link
                return generarLinkCompartido(sharedLink.getUsuarioId());
            });
    }
}