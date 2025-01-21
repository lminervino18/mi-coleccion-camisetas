package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.util.JwtUtil; // Importa la clase JwtUtil para la generación del token
import com.mi_coleccion_camisetas.model.AuthResponse; // Importa la clase AuthResponse para devolver el token
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil; // Utilidad para generar el token JWT

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        // Verificar si el usuario existe y la contraseña es correcta
        Usuario foundUser = usuarioService.findByUsernameAndPassword(usuario.getUsername(), usuario.getPassword());

        if (foundUser == null) {
            return ResponseEntity.status(401).body("Usuario o contraseña incorrectos");
        }

        // Generar el token JWT
        String token = jwtUtil.generateToken(foundUser.getUsername());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
