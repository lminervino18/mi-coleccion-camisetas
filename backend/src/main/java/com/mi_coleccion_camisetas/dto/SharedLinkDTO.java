package com.mi_coleccion_camisetas.dto;

import com.mi_coleccion_camisetas.model.SharedLink;
import java.time.LocalDateTime;

public class SharedLinkDTO {
    private Long id;
    private String token;
    private Long usuarioId;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaExpiracion;
    private long tiempoRestante; // En minutos

    // Constructor vacío
    public SharedLinkDTO() {}

    // Constructor desde entidad
    public SharedLinkDTO(SharedLink sharedLink) {
        this.id = sharedLink.getId();
        this.token = sharedLink.getToken();
        this.usuarioId = sharedLink.getUsuarioId();
        this.fechaCreacion = sharedLink.getFechaCreacion();
        this.fechaExpiracion = sharedLink.getFechaExpiracion();
        
        // Calcular tiempo restante
        this.tiempoRestante = calcularTiempoRestante();
    }

    // Método para calcular tiempo restante
    private long calcularTiempoRestante() {
        LocalDateTime now = LocalDateTime.now();
        if (fechaExpiracion.isAfter(now)) {
            return java.time.Duration.between(now, fechaExpiracion).toMinutes();
        }
        return 0;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public long getTiempoRestante() {
        return tiempoRestante;
    }

    public void setTiempoRestante(long tiempoRestante) {
        this.tiempoRestante = tiempoRestante;
    }

    // Método para verificar si el link está expirado
    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(fechaExpiracion);
    }

    // Método para generar URL completa del link
    public String getUrlCompleta(String baseUrl) {
        return baseUrl + "/shared/" + token;
    }

    // toString para depuración
    @Override
    public String toString() {
        return "SharedLinkDTO{" +
                "id=" + id +
                ", token='" + token + '\'' +
                ", usuarioId=" + usuarioId +
                ", fechaCreacion=" + fechaCreacion +
                ", fechaExpiracion=" + fechaExpiracion +
                ", tiempoRestante=" + tiempoRestante +
                '}';
    }

    // Método de fábrica para crear un DTO con URL base
    public static SharedLinkDTO crear(SharedLink sharedLink, String baseUrl) {
        SharedLinkDTO dto = new SharedLinkDTO(sharedLink);
        dto.setToken(dto.getUrlCompleta(baseUrl));
        return dto;
    }
}