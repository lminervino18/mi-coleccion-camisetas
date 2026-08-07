# Seguridad

## Reportar un problema

Escribí a lminervino18@gmail.com con los pasos para reproducirlo. No abras un issue público.

## Modelo de seguridad

### Autenticación

Las contraseñas se almacenan con **Argon2id** (19 MiB de memoria, 2 iteraciones, paralelismo 1,
los parámetros recomendados por OWASP). El inicio de sesión compara siempre contra un hash: cuando
el usuario no existe se verifica contra un hash señuelo, de modo que el tiempo de respuesta no
revela qué cuentas están registradas.

Las sesiones son opacas y viven en la base. La cookie es `HttpOnly`, `Secure` en producción y
`SameSite=Lax`. **En la base se guarda solo el hash del identificador de sesión**, así que un
volcado de la tabla no permite suplantar sesiones activas.

Cambiar la contraseña cierra las sesiones de los demás dispositivos. Restablecerla cierra todas.

### Autorización

Cada operación resuelve el propietario a partir de la sesión. **Ningún endpoint acepta un
identificador de usuario enviado por el cliente para decidir el acceso.** Las consultas filtran
por propietario en la misma sentencia SQL que trae el recurso, no en una comprobación aparte.

### Recuperación de contraseña

Los tokens tienen 32 bytes de entropía criptográfica, se almacenan hasheados, vencen en una hora y
son de un solo uso. La solicitud responde igual exista o no la dirección.

### Enlaces compartidos

Un enlace es una credencial: quien lo tiene ve la colección. Por eso el token tiene 32 bytes de
entropía y **solo se guarda su hash**, se muestra una única vez al crearlo, admite vencimiento y se
puede revocar de inmediato. La vista pública expone nombre, foto y camisetas; nunca el correo, el
identificador interno ni las fechas de la cuenta. Las páginas compartidas se marcan `noindex`.

### Imágenes

El tipo declarado por el cliente no se usa: el archivo se valida por su **firma binaria**. Se
aplica la rotación EXIF y se descarta el resto de los metadatos, incluida la geolocalización. Hay
límites de peso y de dimensiones, y el almacenamiento local rechaza cualquier clave que intente
salir de su directorio raíz.

### Límite de tasa

Registro, inicio de sesión, recuperación, cambio de contraseña, subidas y creación de enlaces
tienen límites por dirección de origen. El inicio de sesión además limita por cuenta, de modo que
atacar a un usuario concreto desde muchas direcciones también queda acotado.

El límite es en memoria del proceso: en un despliegue con varias instancias acota el abuso por
instancia, no de forma global. Es una barrera contra el relleno de credenciales, no una cuota
estricta.

### Cabeceras

`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y
`Strict-Transport-Security` se aplican a todas las respuestas.

## Dependencias

`pnpm audit --audit-level high` corre en cada integración y la corta si aparece una
vulnerabilidad alta.

`postcss` y `sharp` llegan como dependencias transitivas de `next`, que las fija en versiones
con vulnerabilidades altas publicadas. Como no se pueden actualizar desde aquí, están forzadas a
la versión parcheada mediante `pnpm.overrides` en el `package.json` raíz. Los overrides se
pueden quitar cuando `next` fije por su cuenta versiones no vulnerables.

## Deuda conocida

- El secreto JWT y las credenciales RDS del sistema anterior están en el historial de Git en texto
  plano. La infraestructura asociada fue dada de baja, pero esos valores deben considerarse
  comprometidos y no reutilizarse.
- El límite de tasa no es compartido entre instancias.
