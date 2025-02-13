package com.mi_coleccion_camisetas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        // Si no estás autenticado, redirige a la página de login
        return "redirect:/login"; // Cambia esta URL según sea necesario
    }
}
