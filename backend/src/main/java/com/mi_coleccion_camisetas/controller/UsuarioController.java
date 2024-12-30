package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // 1. Registrar un usuario (PUBLIC)
    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok("Usuario registrado exitosamente: " + nuevoUsuario.getUsername());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Iniciar sesión (PUBLIC)
    @PostMapping("/login")
    public ResponseEntity<?> loginUsuario(@RequestBody Usuario usuario) {
        Optional<Usuario> usuarioExistente = usuarioService.buscarUsuarioPorNombre(usuario.getUsername());

        if (usuarioExistente.isPresent() &&
                usuarioService.verificarPassword(usuario.getPassword(), usuarioExistente.get().getPassword())) {
            return ResponseEntity.ok("Inicio de sesión exitoso para: " + usuario.getUsername());
        } else {
            return ResponseEntity.status(401).body("Credenciales inválidas.");
        }
    }

    // 3. Obtener todos los usuarios (ACCESIBLE PARA TODOS LOS ROLES)
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.ok(usuarios);
    }

    // 4. Obtener un usuario por ID (ACCESIBLE PARA TODOS LOS ROLES)
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.obtenerUsuarioPorId(id);

        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get()); // Si el usuario existe, devuelve un 200 OK con el usuario
        } else {
            return ResponseEntity.status(404).body("Usuario no encontrado"); // Si no, devuelve un 404 con el mensaje
        }
    }

    // 5. Actualizar un usuario por ID (ACCESIBLE PARA TODOS LOS ROLES)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        try {
            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, usuario);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 6. Eliminar un usuario por ID (ACCESIBLE PARA TODOS LOS ROLES)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok("Usuario eliminado exitosamente.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. Buscar un usuario por nombre (ACCESIBLE PARA TODOS LOS ROLES)
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarUsuarioPorNombre(@RequestParam String nombre) {
        Optional<Usuario> usuario = usuarioService.buscarUsuarioPorNombre(nombre);

        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get()); // Si el usuario existe, devuelve un 200 OK
        } else {
            return ResponseEntity.status(404).body("Usuario no encontrado"); // Si no, devuelve un 404
        }
    }
}
