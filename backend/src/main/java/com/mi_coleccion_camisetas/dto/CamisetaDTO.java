package com.mi_coleccion_camisetas.dto;

import com.mi_coleccion_camisetas.model.Camiseta;
import java.util.Base64;
import java.util.List;

public class CamisetaDTO {
    private Long id;
    private Long usuarioId; // Relacionar con el usuario
    private String club;
    private String pais;
    private int dorsal;
    private String nombre;
    private String talle;
    private List<String> colores;
    private int numeroEquipacion;
    private String temporada;
    private String comentarios;
    private String imagenBase64; // Campo para almacenar la imagen en formato Base64 con prefijo

    // Constructor vacío
    public CamisetaDTO() {
    }

    // Constructor para convertir entidad a DTO
    public CamisetaDTO(Camiseta camiseta) {
        this.id = camiseta.getId();
        this.usuarioId = camiseta.getUsuario().getId();
        this.club = camiseta.getClub();
        this.pais = camiseta.getPais();
        this.dorsal = camiseta.getDorsal();
        this.nombre = camiseta.getNombre();
        this.talle = camiseta.getTalle();
        this.colores = camiseta.getColores();
        this.numeroEquipacion = camiseta.getNumeroEquipacion();
        this.comentarios = camiseta.getComentarios();
        if (camiseta.getImagen() != null && camiseta.getImagen().length > 0) {
            this.imagenBase64 = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(camiseta.getImagen());
        }
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getClub() {
        return club;
    }

    public String getPais() {
        return pais;
    }

    public int getDorsal() {
        return dorsal;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTalle() {
        return talle;
    }

    public List<String> getColores() {
        return colores;
    }

    public int getNumeroEquipacion() {
        return numeroEquipacion;
    }

    public String getComentarios() {
        return comentarios;
    }

    public String getImagenBase64() {
        return imagenBase64;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void setClub(String club) {
        this.club = club;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public void setDorsal(int dorsal) {
        this.dorsal = dorsal;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setTalle(String talle) {
        this.talle = talle;
    }

    public void setColores(List<String> colores) {
        this.colores = colores;
    }

    public void setNumeroEquipacion(int numeroEquipacion) {
        this.numeroEquipacion = numeroEquipacion;
    }

    public String getTemporada() {
        return temporada;
    }

    public void setTemporada(String temporada) {
        this.temporada = temporada;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }

    public void setImagenBase64(String imagenBase64) {
        this.imagenBase64 = imagenBase64;
    }
}
