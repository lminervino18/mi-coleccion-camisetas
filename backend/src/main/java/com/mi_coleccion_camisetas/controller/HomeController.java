package com.mi_coleccion_camisetas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "redirect:/api/usuarios"; // Cambia la ruta según tu necesidad
    }
}
