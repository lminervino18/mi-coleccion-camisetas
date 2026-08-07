# Volver atrás

## Un despliegue rompió algo

Vercel conserva los despliegues anteriores. En el panel, buscá el último que funcionaba y usá
**Promote to Production**. Tarda segundos y no requiere volver a construir.

Esto revierte el código, **no la base de datos**. Si el despliegue incluía una migración, seguí
leyendo.

## Una migración rompió algo

Las migraciones de este proyecto son aditivas: agregan tablas y columnas, no borran datos. Volver
a una versión anterior del código sobre un esquema más nuevo funciona, porque el código viejo
simplemente ignora las columnas que no conoce.

Si alguna vez hace falta una migración destructiva —renombrar o eliminar una columna— hacela en dos
pasos separados por al menos un despliegue:

1. Agregar lo nuevo y escribir en ambos lugares.
2. Cuando ninguna versión activa use lo viejo, recién ahí eliminarlo.

Si ya se ejecutó una migración destructiva y hay que revertirla, la única vía segura es restaurar
la copia ([`backup.md`](backup.md)). Por eso conviene hacerla antes.

## Una credencial quedó comprometida

1. Generá la credencial nueva sin borrar la anterior.
2. Actualizala en Vercel y volvé a desplegar.
3. Comprobá que la funcionalidad afectada sigue andando.
4. Revocá la vieja.

Si lo comprometido fue el acceso a la base, además conviene cerrar todas las sesiones:

```sql
DELETE FROM sessions;
```

Los usuarios tendrán que volver a entrar. Es molesto y es lo correcto.

## Un enlace compartido se filtró

No hace falta desplegar nada: entrá a **Compartir** y revocalo. Deja de funcionar de inmediato
para todos los que lo tengan.

## La aplicación no arranca

La configuración se valida al inicio, así que el mensaje dice cuál variable falta o tiene un
formato inválido. Revisá el log del despliegue en Vercel: el error es explícito y no hay que
adivinar.
