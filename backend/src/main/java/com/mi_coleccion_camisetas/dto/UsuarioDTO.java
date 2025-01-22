package com.mi_coleccion_camisetas.dto;

import com.mi_coleccion_camisetas.model.Usuario;

public class UsuarioDTO {
    private Long id;
    private String username;
    private String email;
    private Usuario.Role role; // Usar el enum directamente
    private String password;

    // Constructor para convertir entidad a DTO
    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.username = usuario.getUsername();
        this.email = usuario.getEmail();
        this.role = usuario.getRole();
    }

    // Constructor vacío para el uso en controladores
    public UsuarioDTO() {
    }

    // Getters y setters
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
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
}
