package com.mi_coleccion_camisetas.dto;

import com.mi_coleccion_camisetas.model.Camiseta;
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
    private String comentarios;

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

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }
}
