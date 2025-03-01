package com.mi_coleccion_camisetas.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.mi_coleccion_camisetas.util.JwtUtil;
import org.springframework.lang.NonNull;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AuthInterceptor.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    // Lista de rutas públicas
    private final String[] publicRoutes = {
        "/api/auth/login",
        "/api/auth/register",
        "/api/share/",
        "/api/public/",
        "/api/shared/camisetas/",
        "/api/shared/user/",
        "/api/usuarios"  // Añadida la ruta para registro de usuarios
    };

    // Lista de métodos permitidos sin autenticación para ciertas rutas
    private final String[][] publicPathMethods = {
        {"/api/usuarios", "POST"},    // Permitir POST para registro
        {"/api/usuarios", "GET"}      // Permitir GET para verificar usuario/email
    };

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) throws Exception {
        
        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();

        // Método OPTIONS siempre permitido
        if ("OPTIONS".equalsIgnoreCase(requestMethod)) {
            return true;
        }

        // Verificar combinaciones específicas de ruta y método
        for (String[] pathMethod : publicPathMethods) {
            if (requestPath.equals(pathMethod[0]) && requestMethod.equals(pathMethod[1])) {
                logger.info("Acceso permitido a ruta pública: {} {}", requestMethod, requestPath);
                return true;
            }
        }

        // Verificar rutas públicas generales
        for (String route : publicRoutes) {
            if (requestPath.startsWith(route)) {
                logger.info("Acceso permitido a ruta pública: {}", requestPath);
                return true;
            }
        }

        // Verificar autenticación para rutas protegidas
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("No token provided for path: {}", requestPath);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token no proporcionado");
            return false;
        }

        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            
            if (!jwtUtil.validateToken(token, userDetails)) {
                logger.warn("Invalid token for path: {}", requestPath);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
                return false;
            }
            
            logger.info("Acceso autorizado para usuario: {} en ruta: {}", username, requestPath);
            return true;

        } catch (Exception e) {
            logger.error("Error de autenticación en ruta: " + requestPath, e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error de autenticación");
            return false;
        }
    }
}