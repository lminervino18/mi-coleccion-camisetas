package com.mi_coleccion_camisetas.dto;

import com.mi_coleccion_camisetas.model.Usuario;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UsuarioDTO {
    private Long id;
    private String username;
    private String email;
    private Usuario.Role role;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    // Constructor vacío
    public UsuarioDTO() {
    }

    // Constructor para convertir entidad a DTO
    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.username = usuario.getUsername();
        this.email = usuario.getEmail();
        this.role = usuario.getRole();
        // No incluimos la contraseña por seguridad
    }

    // Método para actualizar una entidad existente
    public void actualizarUsuario(Usuario usuario) {
        if (this.username != null) {
            usuario.setUsername(this.username.trim());
        }
        if (this.email != null) {
            usuario.setEmail(this.email.trim());
        }
        if (this.role != null) {
            usuario.setRole(this.role);
        }
        // Solo actualizar la contraseña si se proporciona una nueva
        if (this.password != null && !this.password.trim().isEmpty()) {
            usuario.setPassword(this.password);
        }
    }

    // Método para validar los datos
    public void validar() {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario no puede estar vacío");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El email no puede estar vacío");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("El formato del email no es válido");
        }
        if (password != null && password.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
    }

    // Getters y setters con validaciones
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username != null ? username.trim() : null;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    public Usuario.Role getRole() {
        return role;
    }

    public void setRole(Usuario.Role role) {
        this.role = role;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "UsuarioDTO{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                // No incluimos la contraseña en el toString por seguridad
                '}';
    }
}