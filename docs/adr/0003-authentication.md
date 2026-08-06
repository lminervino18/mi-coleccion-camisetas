# 0003 — Sesiones con cookie y Argon2id

Estado: aceptado — 6 de agosto de 2026

## Contexto

La autenticación previa presenta tres fallos independientes, documentados y verificados en
`docs/audit.md`: el inicio de sesión no compara la contraseña contra el hash almacenado, el JWT
se guarda en `localStorage`, y la propiedad de los recursos se deduce de un identificador que el
propio cliente envía en la URL.

No hay usuarios existentes que preservar, por lo que no hace falta convivencia entre esquemas de
hash ni migración progresiva.

## Problema

Definir un mecanismo de sesión que resista XSS, permita revocación real y cierre de sesión del
lado del servidor, y ligue la autorización a la identidad verificada y no a un dato del cliente.

## Alternativas consideradas

**JWT en `localStorage`.** Es lo que había. Cualquier XSS lo lee, no se puede revocar antes de su
expiración y el cierre de sesión es puramente cosmético. Se descarta.

**JWT en cookie `HttpOnly`.** Protege frente a XSS, pero mantiene el problema de la revocación:
un token firmado sigue siendo válido hasta que expira, salvo que se agregue una lista de
revocación, que ya es un estado en servidor. Si hace falta ese estado, el JWT deja de aportar.

**Sesión opaca en base de datos, referenciada por cookie.** El identificador de sesión no lleva
información, se puede revocar de inmediato, permite listar y cerrar sesiones, y la invalidación
tras un cambio de contraseña es una sentencia `DELETE`.

**Proveedor gestionado.** Delegar la autenticación resolvería el problema, pero ata el proyecto a
un servicio externo y su plan gratuito para una funcionalidad que aquí es acotada.

## Decisión

Sesiones opacas persistidas en PostgreSQL, referenciadas por una cookie `HttpOnly`, `Secure`,
`SameSite=Lax` y con `Path=/`.

Las contraseñas se almacenan con **Argon2id**, ganador del Password Hashing Competition y opción
recomendada por OWASP. En la base se guarda únicamente el hash del identificador de sesión, no el
identificador en claro, de modo que un volcado de la tabla no permita suplantar sesiones activas.

La autorización se resuelve siempre contra el usuario de la sesión. **Ningún endpoint acepta un
identificador de usuario proveniente del cliente para decidir el acceso.**

## Consecuencias

Cada petición autenticada consulta la sesión en base de datos. Es una lectura por identificador
sobre un índice único; el coste es aceptable y se prefiere sobre la imposibilidad de revocar.

`SameSite=Lax` es suficiente porque la interfaz y la API comparten origen (ver
[0001](0001-application-framework.md)). Las mutaciones sensibles se realizan además con métodos
que no son de navegación.

Un cambio de contraseña elimina todas las sesiones del usuario salvo la actual.

Los tokens de recuperación de contraseña se generan con entropía criptográfica, se almacenan
hasheados, son de un solo uso y expiran. La respuesta a la solicitud de recuperación es idéntica
exista o no la cuenta, para no permitir enumeración.

## Reversión

El mecanismo queda detrás de una interfaz de sesión. Sustituirlo por otro esquema implica
reimplementar esa interfaz sin tocar los casos de uso.
