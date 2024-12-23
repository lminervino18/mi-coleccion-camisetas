package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * Registra un nuevo usuario después de realizar las validaciones necesarias.
     * 
     * @param usuario Datos del usuario a registrar.
     * @return Usuario registrado.
     */
    public Usuario registrarUsuario(Usuario usuario) {
        // Verificar si el nombre de usuario ya existe
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya existe.");
        }

        // Verificar si el correo ya está registrado
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }

        // Encriptar la contraseña antes de guardarla
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        // Guardar el usuario en la base de datos
        return usuarioRepository.save(usuario);
    }
}