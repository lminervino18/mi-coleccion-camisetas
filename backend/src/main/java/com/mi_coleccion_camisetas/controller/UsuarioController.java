package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.dto.UsuarioDTO;
import com.mi_coleccion_camisetas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Autowired
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<?> createUsuario(@Validated @RequestBody UsuarioDTO usuarioDTO) {
        try {
            // Verificar si el correo ya está registrado
            if (usuarioService.existsByEmail(usuarioDTO.getEmail())) {
                return new ResponseEntity<>("El correo ya está registrado", HttpStatus.CONFLICT);
            }

            // Verificar si el nombre de usuario ya está registrado
            if (usuarioService.existsByUsername(usuarioDTO.getUsername())) {
                return new ResponseEntity<>("El nombre de usuario ya está en uso", HttpStatus.CONFLICT);
            }

            // Crear el nuevo usuario utilizando el DTO
            UsuarioDTO nuevoUsuario = usuarioService.createUsuario(usuarioDTO);
            return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios() {
        List<UsuarioDTO> usuarios = usuarioService.getAllUsuarios();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getUsuarioById(@PathVariable Long id) {
        Optional<UsuarioDTO> usuario = usuarioService.getUsuarioById(id);
        return usuario.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUsuario(
            @PathVariable Long id,
            @Validated @RequestBody UsuarioDTO usuarioDTO) {
        try {
            // Verificar si el email actualizado ya existe en otro usuario
            if (!usuarioService.getUsuarioById(id).get().getEmail().equals(usuarioDTO.getEmail()) 
                && usuarioService.existsByEmail(usuarioDTO.getEmail())) {
                return new ResponseEntity<>("El correo ya está registrado por otro usuario", HttpStatus.CONFLICT);
            }

            // Verificar si el username actualizado ya existe en otro usuario
            if (!usuarioService.getUsuarioById(id).get().getUsername().equals(usuarioDTO.getUsername()) 
                && usuarioService.existsByUsername(usuarioDTO.getUsername())) {
                return new ResponseEntity<>("El nombre de usuario ya está en uso por otro usuario", HttpStatus.CONFLICT);
            }

            UsuarioDTO usuarioActualizado = usuarioService.updateUsuario(id, usuarioDTO);
            return new ResponseEntity<>(usuarioActualizado, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error al actualizar el usuario", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id) {
        try {
            // Verificar si el usuario existe
            if (usuarioService.getUsuarioById(id).isEmpty()) {
                return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
            }
            
            usuarioService.deleteUsuario(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("No se puede eliminar el usuario: " + e.getMessage(), 
                                     HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}