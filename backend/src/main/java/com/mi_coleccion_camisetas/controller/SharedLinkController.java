package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.dto.SharedLinkDTO;
import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.model.SharedLink;
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.CamisetaRepository;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import com.mi_coleccion_camisetas.service.SharedLinkService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/shared")
public class SharedLinkController {

    private final SharedLinkService sharedLinkService;
    private final UsuarioRepository usuarioRepository;
    private final CamisetaRepository camisetaRepository;

    @Autowired
    public SharedLinkController(
        SharedLinkService sharedLinkService,
        UsuarioRepository usuarioRepository,
        CamisetaRepository camisetaRepository
    ) {
        this.sharedLinkService = sharedLinkService;
        this.usuarioRepository = usuarioRepository;
        this.camisetaRepository = camisetaRepository;
    }

    @PostMapping("/generar-link")
    public ResponseEntity<SharedLinkDTO> generarLinkCompartido(Principal principal) {
        // Obtener el usuario actual
        String username = principal.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    
        // Generar SIEMPRE un nuevo link
        String token = sharedLinkService.generarLinkCompartido(usuario.getId());
        
        SharedLink sharedLink = sharedLinkService.validarToken(token)
            .orElseThrow(() -> new RuntimeException("Error al generar link"));
    
        // Construir URL completa
        String urlCompleta = "http://localhost:3000/shared/" + token;
    
        SharedLinkDTO linkDTO = new SharedLinkDTO();
        linkDTO.setUrlCompleta(urlCompleta);
        
        return ResponseEntity.ok(linkDTO);
    }

    /**
     * Obtener camisetas de un link compartido
     */
    @GetMapping("/camisetas/{token}")
    public ResponseEntity<List<Camiseta>> getCamisetasCompartidas(@PathVariable String token) {
        // Validar token
        SharedLink sharedLink = sharedLinkService.validarToken(token)
            .orElseThrow(() -> new RuntimeException("Link inválido o expirado"));

        // Obtener camisetas del usuario
        List<Camiseta> camisetas = camisetaRepository.findByUsuarioId(sharedLink.getUsuarioId());
        
        // Limpiar datos sensibles
        camisetas.forEach(c -> {
            c.setImagenCompleta(null);
            // Puedes agregar más limpieza si es necesario
        });
        
        return ResponseEntity.ok(camisetas);
    }

    /**
     * Obtener todos los links compartidos del usuario
     */
    @GetMapping("/mis-links")
    public ResponseEntity<List<SharedLinkDTO>> getMisLinks(Principal principal) {
        // Obtener el usuario actual
        String username = principal.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Obtener links del usuario
        List<SharedLink> links = sharedLinkService.obtenerLinksDeUsuario(usuario.getId());
        
        // Convertir a DTOs
        List<SharedLinkDTO> linksDTO = links.stream()
            .map(link -> SharedLinkDTO.crear(link, "http://localhost:3000"))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(linksDTO);
    }

    /**
     * Renovar un link compartido
     */
    @PostMapping("/renovar-link/{token}")
    public ResponseEntity<SharedLinkDTO> renovarLink(@PathVariable String token) {
        // Renovar link
        String nuevoToken = sharedLinkService.renovarLink(token)
            .orElseThrow(() -> new RuntimeException("No se pudo renovar el link"));

        // Buscar el nuevo link
        SharedLink sharedLink = sharedLinkService.validarToken(nuevoToken)
            .orElseThrow(() -> new RuntimeException("Error al renovar link"));

        // Crear DTO con URL completa
        SharedLinkDTO linkDTO = SharedLinkDTO.crear(sharedLink, "http://localhost:3000");
        
        return ResponseEntity.ok(linkDTO);
    }

    /**
     * Eliminar un link compartido
     */
    @DeleteMapping("/eliminar-link/{token}")
    public ResponseEntity<Void> eliminarLink(
        @PathVariable String token, 
        Principal principal
    ) {
        // Obtener el usuario actual
        String username = principal.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que el link pertenezca al usuario
        SharedLink sharedLink = sharedLinkService.validarToken(token)
            .orElseThrow(() -> new RuntimeException("Link inválido"));
        
        if (!sharedLink.getUsuarioId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este link");
        }

        // Eliminar link
        sharedLinkService.eliminarLink(token);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Manejo de errores
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleExceptions(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}