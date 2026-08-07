# Estrategia de pruebas

## Qué se prueba y dónde

| Nivel       | Dónde                | Contra qué corre                       |
| ----------- | -------------------- | -------------------------------------- |
| Unitario    | `packages/contracts` | Sin dependencias                       |
| Integración | `packages/core`      | PostgreSQL real                        |
| End to end  | `apps/web/e2e`       | La aplicación completa en un navegador |

```bash
pnpm test       # unitarios e integración
pnpm test:e2e   # end to end
```

## Por qué no se mockea la base de datos

Los tests de dominio corren contra PostgreSQL real. No es una preferencia estilística: durante la
reconstrucción, un test de integración encontró que esta condición estaba mal agrupada

```sql
id <> :userId AND lower(username) = :username OR email = :email
```

porque `AND` tiene más precedencia que `OR`. El resultado era que guardar el perfil sin cambiar
nada devolvía conflicto. **Ningún mock habría detectado eso**: el error estaba en cómo PostgreSQL
interpreta la consulta, no en el código TypeScript.

Cada test trunca la tabla de usuarios en cascada antes de correr, de modo que el orden entre tests
no importa.

## Qué cubren los tests de integración

Están escritos alrededor de los fallos concretos que documenta [`audit.md`](audit.md):

- **Autenticación** — que una contraseña incorrecta sea rechazada; que un usuario inexistente
  produzca el mismo error que una contraseña equivocada.
- **Autorización** — que ninguna operación alcance recursos de otro usuario: leer, editar, borrar,
  marcar favorita, estadísticas y valores de filtros.
- **Sesiones** — revocación inmediata, expiración, aislamiento entre usuarios.
- **Recuperación de contraseña** — token de un solo uso, vencimiento, cierre de todas las sesiones,
  y que un token inválido no altere la contraseña.
- **Enlaces compartidos** — entropía del token, almacenamiento hasheado, revocación, y que crear
  uno nuevo no invalide los anteriores en silencio.
- **Imágenes** — que una subida no se pueda reclamar dos veces, ni desde otra cuenta, ni sin bytes.

## End to end

Corren en tres proyectos de Playwright: Chromium de escritorio, un viewport de 320 px y un Pixel 7.
Las dos resoluciones móviles no son decorativas: la aplicación anterior era inutilizable en
teléfono y esos tests lo impiden a futuro.

Además de los flujos, hay comprobaciones que serían fáciles de romper sin darse cuenta:

- La cookie de sesión no es legible desde JavaScript.
- Ninguna página desborda horizontalmente en ninguna de las tres resoluciones.
- La vista pública no contiene el correo del propietario en el HTML.
- Los enlaces compartidos emiten las etiquetas Open Graph con datos reales.

## Dos tests que fallaron por el producto, no por el test

Vale registrarlo porque cambió el código, no la prueba:

1. La suite agotaba el límite de intentos de inicio de sesión. La causa era que **se contaban
   también los ingresos exitosos**, lo que habría bloqueado a un usuario legítimo entrando desde
   varios dispositivos. Ahora solo cuentan los fallidos.
2. El límite de registros era de 5 por hora y por dirección. Detrás de una red compartida —una
   casa, una oficina— eso bloquea a personas reales. Pasó a 20.

## Datos de prueba

`pnpm db:seed` crea el usuario `coleccionista` con ocho camisetas. El script **se niega a correr
con `NODE_ENV=production`**.
