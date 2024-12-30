package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya existe.");
        }

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        return usuarioRepository.save(usuario);
    }

    /**
     * Obtiene un usuario por su ID.
     *
     * @param id Identificador del usuario.
     * @return Usuario encontrado o null si no existe.
     */
    public Optional<Usuario> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    /**
     * Busca un usuario por su nombre de usuario.
     *
     * @param nombre Nombre de usuario a buscar.
     * @return Usuario encontrado o null si no existe.
     */
    public Optional<Usuario> buscarUsuarioPorNombre(String nombre) {
        return usuarioRepository.findByUsername(nombre);
    }

    /**
     * Obtiene todos los usuarios registrados.
     *
     * @return Lista de usuarios.
     */
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Actualiza los datos de un usuario.
     *
     * @param id      Identificador del usuario a actualizar.
     * @param usuario Datos actualizados.
     * @return Usuario actualizado.
     */
    public Usuario actualizarUsuario(Long id, Usuario usuario) {
        Usuario usuarioExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("El usuario no existe."));

        usuarioExistente.setUsername(usuario.getUsername());
        usuarioExistente.setEmail(usuario.getEmail());
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            usuarioExistente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioRepository.save(usuarioExistente);
    }

    /**
     * Elimina un usuario por su ID.
     *
     * @param id Identificador del usuario a eliminar.
     */
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new IllegalArgumentException("El usuario no existe.");
        }
        usuarioRepository.deleteById(id);
    }

    /**
     * Verifica si la contraseña sin encriptar coincide con la contraseña
     * encriptada.
     *
     * @param rawPassword     Contraseña sin encriptar.
     * @param encodedPassword Contraseña encriptada.
     * @return true si coinciden, false de lo contrario.
     */
    public boolean verificarPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
