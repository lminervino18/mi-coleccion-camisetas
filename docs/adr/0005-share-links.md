# 0005 — Enlaces compartidos con token hasheado

Estado: aceptado — 6 de agosto de 2026

## Contexto

El sistema previo genera los tokens para compartir como
`UUID.randomUUID().toString().substring(0, 8)`, es decir 32 bits de entropía, y los almacena en
texto plano. La tabla `shared_links` no tiene clave foránea hacia `usuarios`, de modo que quedan
enlaces huérfanos. Además, al generar un enlace nuevo se borran todos los anteriores del usuario,
comportamiento que no se comunica en la interfaz.

Un enlace compartido es una credencial: quien lo posee accede a la colección sin autenticarse.

## Problema

Definir un esquema de enlaces públicos que resista la enumeración, permita revocación y
expiración, y no exponga datos privados del propietario.

## Decisión

Los tokens se generan con 32 bytes de entropía criptográfica codificados en base64url. En la base
se almacena únicamente su hash, igual que con los identificadores de sesión
(ver [0003](0003-authentication.md)).

La tabla tiene clave foránea hacia el usuario con borrado en cascada. Un enlace puede revocarse y
tiene fecha de expiración. Generar un enlace nuevo no invalida los anteriores de forma
silenciosa: la revocación es una acción explícita del usuario.

La vista pública expone el nombre de usuario, la foto de perfil y las camisetas. **No expone el
correo electrónico, el rol, las fechas de la cuenta ni ningún identificador interno.**

## Consecuencias

Al almacenar solo el hash, el token no puede recuperarse ni mostrarse de nuevo tras generarlo. La
interfaz debe presentarlo en el momento de la creación con la opción de copiarlo.

La búsqueda del enlace se hace por el hash del token recibido, sobre un índice único.

Un enlace revocado o expirado devuelve una página con explicación propia, no un error genérico ni
una colección vacía como ocurría antes.

Las peticiones a rutas públicas están sujetas a límite de tasa por dirección de origen para
dificultar el barrido.

## Reversión

El esquema es interno. Volver a tokens en claro sería un retroceso de seguridad y no se contempla.
