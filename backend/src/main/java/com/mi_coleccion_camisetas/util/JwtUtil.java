package com.mi_coleccion_camisetas.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.util.Date;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private String secretKey = "mi_secreto_super_seguro";

    // Generar el token
    public String generateToken(String username) {
        Algorithm algorithm = Algorithm.HMAC256(secretKey);
        return JWT.create()
                .withSubject(username)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // Expira en 1 hora
                .sign(algorithm);
    }

    // Extraer el nombre de usuario del token
    public String extractUsername(String token) {
        DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC256(secretKey))
                .build()
                .verify(token);
        return decodedJWT.getSubject();
    }

    // Verificar si el token ha expirado
    public boolean isTokenExpired(String token) {
        DecodedJWT decodedJWT = JWT.require(Algorithm.HMAC256(secretKey))
                .build()
                .verify(token);
        return decodedJWT.getExpiresAt().before(new Date());
    }

    // Extraer todos los claims del token
    public DecodedJWT extractAllClaims(String token) {
        return JWT.require(Algorithm.HMAC256(secretKey))
                .build()
                .verify(token);
    }
}
