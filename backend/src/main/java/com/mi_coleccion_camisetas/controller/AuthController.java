package com.mi_coleccion_camisetas.controller;

import java.util.Map;
import com.mi_coleccion_camisetas.util.JwtUtil; // Importa la clase JwtUtil para la generación del token 
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
        Usuario foundUser = usuarioService.findByUsernameAndPassword(usuario.getUsername(), usuario.getPassword());

        if (foundUser == null) {
            return ResponseEntity.status(401).body("Usuario o contraseña incorrectos");
        }

        // Generar token con usuarioId incluido
        String token = jwtUtil.generateToken(foundUser.getUsername(), foundUser.getId());

        // Enviar token y usuarioId en la respuesta
        return ResponseEntity.ok(Map.of(
                "token", token,
                "usuarioId", foundUser.getId()));
    }

}
