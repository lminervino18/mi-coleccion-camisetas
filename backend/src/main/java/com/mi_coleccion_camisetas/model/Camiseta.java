package com.mi_coleccion_camisetas.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "camisetas")
public class Camiseta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Lob
    @Column(name = "imagen_completa", columnDefinition = "LONGBLOB")
    private byte[] imagenCompleta;

    @Lob
    @Column(name = "imagen_recortada", columnDefinition = "LONGBLOB")
    private byte[] imagenRecortada;

    @Column(nullable = false, length = 50)
    private String tipoDeCamiseta;

    @Column(length = 100)
    private String liga;

    @Column(nullable = false, length = 100)
    private String club;

    @Column(nullable = false, length = 100)
    private String pais;

    @Column(nullable = true)
    private Integer dorsal;

    @Column(length = 100)
    private String nombre;

    @Column(nullable = false, length = 10)
    private String talle;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "camiseta_colores", joinColumns = @JoinColumn(name = "camiseta_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            "camiseta_id", "color" }))
    @Column(name = "color", length = 50)
    private List<String> colores = new ArrayList<>();

    @Column(name = "numero_equipacion", nullable = false, length = 50)
    private String numeroEquipacion;

    @Column(nullable = false, length = 20)
    private String temporada;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    // Constructor vacío
    public Camiseta() {
        this.colores = new ArrayList<>();
    }

    // Constructor completo
    public Camiseta(Usuario usuario, byte[] imagenCompleta, byte[] imagenRecortada,
            String club, String pais, Integer dorsal, String nombre,
            String talle, List<String> colores, String numeroEquipacion,
            String temporada, String comentarios, String tipoDeCamiseta, String liga) {
        this.usuario = usuario;
        this.imagenCompleta = imagenCompleta != null ? imagenCompleta.clone() : null;
        this.imagenRecortada = imagenRecortada != null ? imagenRecortada.clone() : null;
        this.club = club;
        this.pais = pais;
        this.dorsal = dorsal;
        this.nombre = nombre;
        this.talle = talle;
        this.colores = colores != null ? new ArrayList<>(colores) : new ArrayList<>();
        this.numeroEquipacion = numeroEquipacion;
        this.temporada = temporada;
        this.comentarios = comentarios;
        this.tipoDeCamiseta = tipoDeCamiseta;
        this.liga = liga;
    }

    // Métodos de utilidad para manejar colores
    public void addColor(String color) {
        if (color != null && !color.isEmpty() && !this.colores.contains(color)) {
            this.colores.add(color);
        }
    }

    public void removeColor(String color) {
        this.colores.remove(color);
    }

    // Getters y setters con validaciones
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
        if (usuario == null) {
            throw new IllegalArgumentException("El usuario no puede ser null");
        }
        this.usuario = usuario;
    }

    public byte[] getImagenCompleta() {
        return imagenCompleta != null ? imagenCompleta.clone() : null;
    }

    public void setImagenCompleta(byte[] imagenCompleta) {
        this.imagenCompleta = imagenCompleta != null ? imagenCompleta.clone() : null;
    }

    public byte[] getImagenRecortada() {
        return imagenRecortada != null ? imagenRecortada.clone() : null;
    }

    public void setImagenRecortada(byte[] imagenRecortada) {
        this.imagenRecortada = imagenRecortada != null ? imagenRecortada.clone() : null;
    }

    public String getClub() {
        return club;
    }

    public void setClub(String club) {
        if (club == null || club.trim().isEmpty()) {
            throw new IllegalArgumentException("El club no puede estar vacío");
        }
        this.club = club.trim();
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        if (pais == null || pais.trim().isEmpty()) {
            throw new IllegalArgumentException("El país no puede estar vacío");
        }
        this.pais = pais.trim();
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
        this.nombre = nombre != null ? nombre.trim() : null;
    }

    public String getTalle() {
        return talle;
    }

    public void setTalle(String talle) {
        if (talle == null || talle.trim().isEmpty()) {
            throw new IllegalArgumentException("El talle no puede estar vacío");
        }
        this.talle = talle.trim();
    }

    public List<String> getColores() {
        return new ArrayList<>(colores);
    }

    public void setColores(List<String> colores) {
        this.colores = colores != null ? new ArrayList<>(colores) : new ArrayList<>();
    }

    public String getNumeroEquipacion() {
        return numeroEquipacion;
    }

    public void setNumeroEquipacion(String numeroEquipacion) {
        if (numeroEquipacion == null || numeroEquipacion.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de equipación no puede estar vacío");
        }
        this.numeroEquipacion = numeroEquipacion.trim();
    }

    public String getTemporada() {
        return temporada;
    }

    public void setTemporada(String temporada) {
        if (temporada == null || temporada.trim().isEmpty()) {
            throw new IllegalArgumentException("La temporada no puede estar vacía");
        }
        this.temporada = temporada.trim();
    }

    public String getComentarios() {
        return comentarios;
    }

    public void setComentarios(String comentarios) {
        this.comentarios = comentarios != null ? comentarios.trim() : null;
    }

    public String getTipoDeCamiseta() {
        return tipoDeCamiseta;
    }

    public void setTipoDeCamiseta(String tipoDeCamiseta) {
        if (tipoDeCamiseta == null || tipoDeCamiseta.trim().isEmpty()) {
            throw new IllegalArgumentException("El tipo de camiseta no puede estar vacío");
        }
        if (!tipoDeCamiseta.equals("Club") && !tipoDeCamiseta.equals("Seleccion")) {
            throw new IllegalArgumentException("El tipo de camiseta solo puede ser 'Club' o 'Seleccion'");
        }
        this.tipoDeCamiseta = tipoDeCamiseta.trim();
    }

    public String getLiga() {
        return liga;
    }

    public void setLiga(String liga) {
        this.liga = liga != null ? liga.trim() : null;
    }

    // Equals y HashCode basados solo en el ID
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Camiseta))
            return false;
        Camiseta camiseta = (Camiseta) o;
        return id != null && id.equals(camiseta.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}