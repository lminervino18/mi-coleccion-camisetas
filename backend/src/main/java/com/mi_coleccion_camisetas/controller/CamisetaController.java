package com.mi_coleccion_camisetas.controller;

import com.mi_coleccion_camisetas.dto.CamisetaDTO;
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
@CrossOrigin(origins = {
    "https://micoleccioncamisetas-o2i9s0ka7-lorenzo-minervinos-projects.vercel.app",
    "http://localhost:3000",
    "https://micoleccioncamisetas.com",                  // Agregar este
    "https://www.micoleccioncamisetas.com",             // Agregar este
})

public class CamisetaController {

    private final CamisetaService camisetaService;
    private final UsuarioService usuarioService;

    public CamisetaController(CamisetaService camisetaService, UsuarioService usuarioService) {
        this.camisetaService = camisetaService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<?> uploadCamiseta(
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam("imagenCompleta") MultipartFile imagenCompleta,
            @RequestParam("imagenRecortada") MultipartFile imagenRecortada,
            @RequestParam("club") String club,
            @RequestParam("pais") String pais,
            @RequestParam(required = false) Integer dorsal,
            @RequestParam("nombre") String nombre,
            @RequestParam("talle") String talle,
            @RequestParam("colores") String colores,
            @RequestParam("numeroEquipacion") String numeroEquipacion,
            @RequestParam("temporada") String temporada,
            @RequestParam("comentarios") String comentarios,
            @RequestParam("tipoDeCamiseta") String tipoDeCamiseta,
            @RequestParam(value = "liga", required = false) String liga) {
        try {
            if (usuarioService.getUsuarioById(usuarioId).isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
            }

            CamisetaDTO camisetaDTO = new CamisetaDTO();
            camisetaDTO.setUsuarioId(usuarioId);
            camisetaDTO.setClub(club);
            camisetaDTO.setPais(pais);
            camisetaDTO.setDorsal(dorsal);
            camisetaDTO.setNombre(nombre);
            camisetaDTO.setTalle(talle);
            camisetaDTO.setColores(List.of(colores.split(",")));
            camisetaDTO.setNumeroEquipacion(numeroEquipacion);
            camisetaDTO.setTemporada(temporada);
            camisetaDTO.setComentarios(comentarios);
            camisetaDTO.setTipoDeCamiseta(tipoDeCamiseta);
            camisetaDTO.setLiga(liga);

            CamisetaDTO nuevaCamiseta = camisetaService.saveCamiseta(camisetaDTO, imagenRecortada, imagenCompleta);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCamiseta);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al procesar la imagen");
        }
    }

    @PutMapping("/usuario/{usuarioId}/camiseta/{id}")
    public ResponseEntity<?> updateCamiseta(
            @PathVariable Long usuarioId,
            @PathVariable Long id,
            @RequestParam(value = "imagenCompleta", required = false) MultipartFile imagenCompleta,
            @RequestParam(value = "imagenRecortada", required = false) MultipartFile imagenRecortada,
            @RequestParam("club") String club,
            @RequestParam("pais") String pais,
            @RequestParam(required = false) Integer dorsal,
            @RequestParam("nombre") String nombre,
            @RequestParam("talle") String talle,
            @RequestParam("colores") String colores,
            @RequestParam("numeroEquipacion") String numeroEquipacion,
            @RequestParam("temporada") String temporada,
            @RequestParam("comentarios") String comentarios,
            @RequestParam("tipoDeCamiseta") String tipoDeCamiseta,
            @RequestParam(value = "liga", required = false) String liga) {
        try {
            CamisetaDTO camisetaDTO = new CamisetaDTO();
            camisetaDTO.setId(id);
            camisetaDTO.setUsuarioId(usuarioId);
            camisetaDTO.setClub(club);
            camisetaDTO.setPais(pais);
            camisetaDTO.setDorsal(dorsal);
            camisetaDTO.setNombre(nombre);
            camisetaDTO.setTalle(talle);
            camisetaDTO.setColores(List.of(colores.split(",")));
            camisetaDTO.setNumeroEquipacion(numeroEquipacion);
            camisetaDTO.setTemporada(temporada);
            camisetaDTO.setComentarios(comentarios);
            camisetaDTO.setTipoDeCamiseta(tipoDeCamiseta);
            camisetaDTO.setLiga(liga);

            CamisetaDTO updatedCamiseta = camisetaService.updateCamiseta(
                    camisetaDTO,
                    imagenRecortada,
                    imagenCompleta);
            return ResponseEntity.ok(updatedCamiseta);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Camiseta no encontrada o no pertenece al usuario");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la imagen");
        }
    }

    // Los demás métodos permanecen sin cambios ya que no necesitan modificaciones
    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<CamisetaDTO>> getCamisetasByUsuario(@PathVariable Long usuarioId) {
        List<CamisetaDTO> camisetas = camisetaService.getCamisetasByUsuario(usuarioId);
        return ResponseEntity.ok(camisetas);
    }

    @DeleteMapping("/usuario/{usuarioId}/camiseta/{id}")
    public ResponseEntity<?> deleteCamiseta(
            @PathVariable Long usuarioId,
            @PathVariable Long id) {
        try {
            camisetaService.deleteCamiseta(id, usuarioId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Camiseta no encontrada o no pertenece al usuario");
        }
    }

    @GetMapping("/usuario/{usuarioId}/camiseta/{id}")
    public ResponseEntity<?> getCamisetaDetail(
            @PathVariable Long usuarioId,
            @PathVariable Long id) {
        try {
            Optional<CamisetaDTO> camiseta = camisetaService.getCamisetaDetail(usuarioId, id);
            return camiseta
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener el detalle de la camiseta: " + e.getMessage());
        }
    }
}