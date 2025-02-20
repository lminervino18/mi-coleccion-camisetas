package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.dto.CamisetaDTO;
import com.mi_coleccion_camisetas.dto.SharedLinkDTO;
import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.model.SharedLink;
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.CamisetaRepository;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import com.mi_coleccion_camisetas.service.SharedLinkService;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
        
        // Construir URL completa
        String urlCompleta = "https://micoleccioncamisetas-o2i9s0ka7-lorenzo-minervinos-projects.vercel.app/shared/" + token;

    
        SharedLinkDTO linkDTO = new SharedLinkDTO();
        linkDTO.setUrlCompleta(urlCompleta);
        
        return ResponseEntity.ok(linkDTO);
    }

    @GetMapping("/user/{token}")
    public ResponseEntity<?> getUserInfo(@PathVariable String token) {
        try {
            // Validar token
            SharedLink sharedLink = sharedLinkService.validarToken(token)
                .orElseThrow(() -> new RuntimeException("Link inválido o expirado"));

            // Obtener usuario
            Usuario usuario = usuarioRepository.findById(sharedLink.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Crear un objeto con solo la información necesaria
            var userInfo = new HashMap<String, String>();
            userInfo.put("username", usuario.getUsername());
            userInfo.put("photoUrl", usuario.getFotoDePerfil());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Error al obtener información del usuario: " + e.getMessage());
        }
    }

    
    @GetMapping("/camisetas/{token}")
        public ResponseEntity<?> getCamisetasCompartidas(@PathVariable String token) {
            try {
                // Validar token
                SharedLink sharedLink = sharedLinkService.validarToken(token)
                    .orElseThrow(() -> new RuntimeException("Link inválido o expirado"));

                // Obtener camisetas del usuario
                List<Camiseta> camisetas = camisetaRepository.findByUsuarioId(sharedLink.getUsuarioId());
                
                // Convertir a DTOs
                List<CamisetaDTO> camisetasDTO = camisetas.stream()
                    .map(CamisetaDTO::new)
                    .collect(Collectors.toList());
                
                return ResponseEntity.ok(camisetasDTO);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error al obtener camisetas: " + e.getMessage());
            }
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
            .map(link -> SharedLinkDTO.crear(link, "https://micoleccioncamisetas-o2i9s0ka7-lorenzo-minervinos-projects.vercel.app"))
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
        SharedLinkDTO linkDTO = SharedLinkDTO.crear(sharedLink, "https://micoleccioncamisetas-o2i9s0ka7-lorenzo-minervinos-projects.vercel.app");
        
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