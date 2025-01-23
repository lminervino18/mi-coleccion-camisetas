package com.mi_coleccion_camisetas.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "camisetas")
public class Camiseta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // Relación con la tabla de usuarios

    @Lob
    @Column(name = "imagen", columnDefinition = "LONGBLOB")
    private byte[] imagen; // Almacenará la imagen en formato binario

    @Column(nullable = false)
    private String club;

    @Column(nullable = false)
    private String pais;

    private Integer dorsal;

    private String nombre;

    private String talle;

    @ElementCollection
    @CollectionTable(name = "camiseta_colores", joinColumns = @JoinColumn(name = "camiseta_id"))
    @Column(name = "color")
    private List<String> colores; // Lista de colores

    @Column(name = "numero_equipacion")
    private Integer numeroEquipacion;

    private String temporada;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    // Constructores
    public Camiseta() {
    }

    public Camiseta(Usuario usuario, byte[] imagen, String club, String pais, Integer dorsal, String nombre,
            String talle, List<String> colores, Integer numeroEquipacion, String temporada, String comentarios) {
        this.usuario = usuario;
        this.imagen = imagen;
        this.club = club;
        this.pais = pais;
        this.dorsal = dorsal;
        this.nombre = nombre;
        this.talle = talle;
        this.colores = colores;
        this.numeroEquipacion = numeroEquipacion;
        this.temporada = temporada;
        this.comentarios = comentarios;
    }

    // Getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public byte[] getImagen() {
        return imagen;
    }

    public void setImagen(byte[] imagen) {
        this.imagen = imagen;
    }

    public String getClub() {
        return club;
    }

    public void setClub(String club) {
        this.club = club;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public Integer getDorsal() {
        return dorsal;
    }

    public void setDorsal(Integer dorsal) {
        this.dorsal = dorsal;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTalle() {
        return talle;
    }

    public void setTalle(String talle) {
        this.talle = talle;
    }

    public List<String> getColores() {
        return colores;
    }

    public void setColores(List<String> colores) {
        this.colores = colores;
    }

    public Integer getNumeroEquipacion() {
        return numeroEquipacion;
    }

    public void setNumeroEquipacion(Integer numeroEquipacion) {
        this.numeroEquipacion = numeroEquipacion;
    }

    public String getTemporada() {
        return temporada;
    }

    public void setTemporada(String temporada) {
        this.temporada = temporada;
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios;
    }
}
