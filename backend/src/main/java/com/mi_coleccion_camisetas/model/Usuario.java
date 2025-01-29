package com.mi_coleccion_camisetas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.Objects;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty(message = "El nombre de usuario es obligatorio.")
    @Column(unique = true)
    private String username;

    @Email(message = "Debe ser un correo electrónico válido.")
    @NotEmpty(message = "El correo es obligatorio.")
    @Column(unique = true)
    private String email;

    @NotEmpty(message = "La contraseña es obligatoria.")
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Camiseta> camisetas = new ArrayList<>();

    // Constructores
    public Usuario() {
    }

    public Usuario(String username, String email, String password, Role role) {
        setUsername(username);
        setEmail(email);
        setPassword(password);
        setRole(role);
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public List<Camiseta> getCamisetas() {
        return new ArrayList<>(camisetas);
    }

    // Setters con validaciones
    public void setUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario no puede estar vacío");
        }
        this.username = username.trim();
    }

    public void setEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El email no puede estar vacío");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Formato de email inválido");
        }
        this.email = email.trim().toLowerCase();
    }

    public void setPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía");
        }
        if (password.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
        this.password = password;
    }

    public void setRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("El rol no puede ser nulo");
        }
        this.role = role;
    }

    // Métodos para manejar la relación con camisetas
    public void addCamiseta(Camiseta camiseta) {
        camisetas.add(camiseta);
        camiseta.setUsuario(this);
    }

    public void removeCamiseta(Camiseta camiseta) {
        camisetas.remove(camiseta);
        camiseta.setUsuario(null);
    }

    // Métodos adicionales
    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Enum para roles
    public enum Role {
        ADMIN, USER
    }
}