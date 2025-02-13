package com.mi_coleccion_camisetas.service;

import com.mi_coleccion_camisetas.dto.UsuarioDTO;
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final CamisetaService camisetaService;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder,
            CamisetaService camisetaService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.camisetaService = camisetaService;
    }

    @Transactional
    public UsuarioDTO createUsuario(UsuarioDTO usuarioDTO) {
        // Validar datos
        if (usuarioDTO.getUsername() == null || usuarioDTO.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario es obligatorio");
        }
        if (usuarioDTO.getEmail() == null || usuarioDTO.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        if (usuarioDTO.getPassword() == null || usuarioDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }

        // Verificar duplicados
        if (usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }
        if (usuarioRepository.existsByUsername(usuarioDTO.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(usuarioDTO.getUsername().trim());
        usuario.setEmail(usuarioDTO.getEmail().trim().toLowerCase());
        usuario.setRole(usuarioDTO.getRole() != null ? usuarioDTO.getRole() : Usuario.Role.USER);
        usuario.setPassword(passwordEncoder.encode(usuarioDTO.getPassword()));

        // Agregar foto de perfil si existe
        if (usuarioDTO.getFotoDePerfil() != null && !usuarioDTO.getFotoDePerfil().isEmpty()) {
            usuario.setFotoDePerfil(usuarioDTO.getFotoDePerfil());
        }

        Usuario savedUsuario = usuarioRepository.save(usuario);
        return new UsuarioDTO(savedUsuario);
    }

    public List<UsuarioDTO> getAllUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioDTO::new)
                .toList();
    }

    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email.trim().toLowerCase());
    }

    public boolean existsByUsername(String username) {
        return usuarioRepository.existsByUsername(username.trim());
    }

    public Optional<UsuarioDTO> getUsuarioById(Long id) {
        return usuarioRepository.findById(id).map(UsuarioDTO::new);
    }

    public Usuario findByUsernameAndPassword(String username, String password) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findByUsername(username.trim());
        if (optionalUsuario.isPresent()) {
            Usuario usuario = optionalUsuario.get();
            if (passwordEncoder.matches(password, usuario.getPassword())) {
                return usuario;
            }
        }
        return null;
    }

    @Transactional
    public UsuarioDTO updateUsuario(Long id, UsuarioDTO usuarioDTO) {
        return usuarioRepository.findById(id).map(usuario -> {
            // Verificar si el nuevo email ya está en uso por otro usuario
            if (!usuario.getEmail().equals(usuarioDTO.getEmail()) &&
                    usuarioRepository.existsByEmailAndIdNot(usuarioDTO.getEmail(), id)) {
                throw new IllegalArgumentException("El correo electrónico ya está en uso");
            }

            // Verificar si el nuevo username ya está en uso por otro usuario
            if (!usuario.getUsername().equals(usuarioDTO.getUsername()) &&
                    usuarioRepository.existsByUsernameAndIdNot(usuarioDTO.getUsername(), id)) {
                throw new IllegalArgumentException("El nombre de usuario ya está en uso");
            }

            // Actualizar campos
            usuario.setUsername(usuarioDTO.getUsername().trim());
            usuario.setEmail(usuarioDTO.getEmail().trim().toLowerCase());

            // Actualizar foto de perfil si se proporciona una nueva
            if (usuarioDTO.getFotoDePerfil() != null && !usuarioDTO.getFotoDePerfil().isEmpty()) {
                usuario.setFotoDePerfil(usuarioDTO.getFotoDePerfil());
            }

            // Actualizar contraseña solo si se proporciona una nueva
            if (usuarioDTO.getPassword() != null && !usuarioDTO.getPassword().trim().isEmpty()) {
                usuario.setPassword(passwordEncoder.encode(usuarioDTO.getPassword()));
            }

            // Actualizar rol solo si el usuario actual es ADMIN
            if (usuarioDTO.getRole() != null) {
                usuario.setRole(usuarioDTO.getRole());
            }

            Usuario updatedUsuario = usuarioRepository.save(usuario);
            return new UsuarioDTO(updatedUsuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    @Transactional
    public UsuarioDTO updateFotoDePerfil(Long id, String fotoDePerfil) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (fotoDePerfil != null && !fotoDePerfil.isEmpty()) {
                usuario.setFotoDePerfil(fotoDePerfil);
                Usuario updatedUsuario = usuarioRepository.save(usuario);
                return new UsuarioDTO(updatedUsuario);
            }
            throw new IllegalArgumentException("La foto de perfil no puede estar vacía");
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    @Transactional
    public void deleteUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        // Primero eliminar todas las camisetas asociadas
        camisetaService.deleteAllCamisetasByUsuario(id);

        // Luego eliminar el usuario
        usuarioRepository.delete(usuario);
    }

    @Transactional(readOnly = true)
    public boolean canDeleteUsuario(Long id) {
        return usuarioRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public boolean isValidPassword(String password) {
        return password != null &&
                password.trim().length() >= 6 &&
                !password.trim().equals(password); // Verifica que no haya espacios
    }

    // Método para eliminar la foto de perfil
    @Transactional
    public UsuarioDTO deleteFotoDePerfil(Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setFotoDePerfil(null);
            Usuario updatedUsuario = usuarioRepository.save(usuario);
            return new UsuarioDTO(updatedUsuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    // Método para verificar si un usuario tiene foto de perfil
    @Transactional(readOnly = true)
    public boolean hasFotoDePerfil(Long id) {
        return usuarioRepository.findById(id)
                .map(usuario -> usuario.getFotoDePerfil() != null && !usuario.getFotoDePerfil().isEmpty())
                .orElse(false);
    }
}