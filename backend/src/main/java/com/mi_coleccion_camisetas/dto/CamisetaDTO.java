package com.mi_coleccion_camisetas.dto;

import com.mi_coleccion_camisetas.model.Camiseta;
import java.util.Base64;
import java.util.List;

public class CamisetaDTO {
    private Long id;
    private Long usuarioId; // Relacionar con el usuario
    private String club;
    private String pais;
    private Integer dorsal;
    private String nombre;
    private String talle;
    private List<String> colores;
    private String numeroEquipacion;
    private String temporada;
    private String comentarios;
    private String imagenCompletaBase64;
    private String imagenRecortadaBase64; // Campo para almacenar la imagen en formato Base64 con prefijo

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
        this.temporada = camiseta.getTemporada();
        this.numeroEquipacion = camiseta.getNumeroEquipacion();
        this.comentarios = camiseta.getComentarios();
        if (camiseta.getImagenCompleta() != null && camiseta.getImagenCompleta().length > 0) {
            this.imagenCompletaBase64 = "data:image/jpeg;base64,"
                    + Base64.getEncoder().encodeToString(camiseta.getImagenCompleta());
        }
        if (camiseta.getImagenRecortada() != null && camiseta.getImagenRecortada().length > 0) {
            this.imagenRecortadaBase64 = "data:image/jpeg;base64,"
                    + Base64.getEncoder().encodeToString(camiseta.getImagenRecortada());
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

    public Integer getDorsal() {
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

    public String getNumeroEquipacion() {
        return numeroEquipacion;
    }

    public String getComentarios() {
        return comentarios;
    }

    public String getImagenCompletaBase64() {
        return imagenCompletaBase64;
    }

    public String getImagenRecortadaBase64() {
        return imagenRecortadaBase64;
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

    public void setDorsal(Integer dorsal) {
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

    public void setNumeroEquipacion(String numeroEquipacion) {
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

    public void setImagenCompletaBase64(String imagenBase64) {
        this.imagenCompletaBase64 = imagenBase64;
    }

    public void setImagenRecortadaBase64(String imagenBase64) {
        this.imagenRecortadaBase64 = imagenBase64;
    }
}
