package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.service.UsuarioService;
import com.mi_coleccion_camisetas.util.JwtUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "https://micoleccioncamisetas-o2i9s0ka7-lorenzo-minervinos-projects.vercel.app",
    "http://localhost:3000",
    "https://micoleccioncamisetas.com",                  // Agregar este
    "https://www.micoleccioncamisetas.com"           // Agregar este
}, methods = {RequestMethod.POST, RequestMethod.OPTIONS})

public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoint de prueba para verificar que el controlador funciona
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Auth endpoint is working");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            // Loguear el payload recibido
            logger.info("Login payload received: {}", payload);

            // Extraer username y password del payload
            String username = payload.get("username");
            String password = payload.get("password");

            // Validaciones
            if (username == null || username.trim().isEmpty()) {
                logger.warn("Login attempt with empty username");
                return ResponseEntity.badRequest().body("Username es requerido");
            }

            if (password == null || password.trim().isEmpty()) {
                logger.warn("Login attempt with empty password");
                return ResponseEntity.badRequest().body("Password es requerida");
            }

            // Buscar el usuario en la base de datos
            Usuario usuario = usuarioService.findByUsername(username);

            // Generar token JWT
            String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getId());

            // Loguear información de inicio de sesión exitoso
            logger.info("Successful login for user: {}", username);

            // Devolver token y ID de usuario
            return ResponseEntity.ok(Map.of(
                "token", token,
                "usuarioId", usuario.getId()
            ));

        } catch (BadCredentialsException e) {
            logger.error("Bad credentials for user: {}", payload.get("username"));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Credenciales inválidas");
        } catch (Exception e) {
            logger.error("Login error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error en el inicio de sesión: " + e.getMessage());
        }
    }
}