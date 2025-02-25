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

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) throws Exception {
        
        // Método OPTIONS siempre permitido
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // Rutas públicas
        String[] publicRoutes = {
            "/api/auth/login",
            "/api/auth/register",
            "/api/share/",
            "/api/public/",
            "/api/shared/camisetas/",
            "/api/shared/user/"
        };

        String requestPath = request.getRequestURI();

        // Verificar rutas públicas
        for (String route : publicRoutes) {
            if (requestPath.startsWith(route)) {
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
            
            return true;
        } catch (Exception e) {
            logger.error("Authentication error", e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error de autenticación");
            return false;
        }
    }
}