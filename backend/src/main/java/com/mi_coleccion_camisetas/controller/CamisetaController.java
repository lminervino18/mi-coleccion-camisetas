package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.model.Camiseta;
import com.mi_coleccion_camisetas.model.Usuario;
import com.mi_coleccion_camisetas.service.CamisetaService;
import com.mi_coleccion_camisetas.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/camisetas")
public class CamisetaController {

    private final CamisetaService camisetaService;
    private final UsuarioService usuarioService; // Agregar el servicio de usuario

    public CamisetaController(CamisetaService camisetaService, UsuarioService usuarioService) {
        this.camisetaService = camisetaService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<?> uploadCamiseta(
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam("imagen") MultipartFile imagen,
            @RequestParam("club") String club,
            @RequestParam("pais") String pais,
            @RequestParam("dorsal") int dorsal,
            @RequestParam("nombre") String nombre,
            @RequestParam("talle") String talle,
            @RequestParam("colores") String colores,
            @RequestParam("numeroEquipacion") int numeroEquipacion,
            @RequestParam("comentarios") String comentarios) {
        try {
            Optional<Usuario> usuario = usuarioService.getUsuarioById(usuarioId);
            if (usuario.isEmpty()) {
                return new ResponseEntity<>("Usuario no encontrado", HttpStatus.NOT_FOUND);
            }

            Camiseta camiseta = new Camiseta();
            camiseta.setUsuario(usuario.get());
            camiseta.setClub(club);
            camiseta.setPais(pais);
            camiseta.setDorsal(dorsal);
            camiseta.setNombre(nombre);
            camiseta.setTalle(talle);
            camiseta.setColores(List.of(colores.split(","))); // Convierte colores a lista
            camiseta.setNumeroEquipacion(numeroEquipacion);
            camiseta.setComentarios(comentarios);

            Camiseta nuevaCamiseta = camisetaService.saveCamiseta(camiseta, imagen);
            return new ResponseEntity<>(nuevaCamiseta, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>("Error al procesar la imagen", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<Camiseta>> getCamisetasByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(camisetaService.getCamisetasByUsuario(usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCamiseta(@PathVariable Long id) {
        camisetaService.deleteCamiseta(id);
        return ResponseEntity.noContent().build();
    }
}
