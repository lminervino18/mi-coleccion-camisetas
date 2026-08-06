# Comparación de planes gratuitos

Verificado contra documentación oficial el 6 de agosto de 2026. Los planes gratuitos cambian con
frecuencia: **volver a comprobar estos datos antes de cualquier decisión futura.**

## Cómputo

| Servicio           | Plan gratuito                                                                       | Tarjeta | Inactividad                                       | Principal advertencia                                                         |
| ------------------ | ----------------------------------------------------------------------------------- | ------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| Vercel Hobby       | 300 s por invocación, 2 GB de memoria, 1 M de invocaciones, 100 GB de transferencia | No      | No suspende                                       | Cuerpo de petición limitado a 4,5 MB; uso no comercial                        |
| Render             | 512 MB, 750 horas mensuales                                                         | No      | Se apaga a los 15 min, arranque en frío de ~1 min | El PostgreSQL gratuito expira a los 30 días y borra los datos                 |
| Railway            | 5 dólares de crédito por 30 días                                                    | No      | —                                                 | No hay plan gratuito real                                                     |
| Fly.io             | Sin plan gratuito para cuentas nuevas                                               | Sí      | —                                                 | Las asignaciones gratuitas son solo para cuentas anteriores a octubre de 2024 |
| Cloudflare Workers | 100 000 peticiones diarias                                                          | No      | No suspende                                       | 10 ms de CPU por invocación                                                   |

**Elegido: Vercel Hobby.** Sin arranque en frío ni suspensión, y aloja la aplicación completa en
el proyecto existente. Cloudflare Workers se descarta por el límite de 10 ms de CPU, insuficiente
para procesar imágenes.

## Base de datos

| Servicio      | Plan gratuito                                | Tarjeta       | Inactividad                                  | Principal advertencia                                      |
| ------------- | -------------------------------------------- | ------------- | -------------------------------------------- | ---------------------------------------------------------- |
| Neon          | 0,5 GB, 100 horas de cómputo, 5 GB de salida | No            | Escala a cero a los 5 min, despierta en ~1 s | Superar cómputo o salida suspende hasta el siguiente ciclo |
| Supabase      | 500 MB de base, 1 GB de almacenamiento       | No solicitada | **Pausa a los 7 días** sin actividad         | El almacenamiento de 1 GB no alcanza para las imágenes     |
| Cloudflare D1 | 5 GB                                         | No            | No suspende                                  | Es SQLite, no PostgreSQL                                   |
| Turso         | 5 GB, 500 M de filas leídas                  | No            | Documentación contradictoria sobre archivado | Es libSQL, no PostgreSQL                                   |
| Render        | 1 GB                                         | No            | —                                            | **Expira a los 30 días y borra los datos**                 |

**Elegido: Neon.** Es PostgreSQL real, no exige tarjeta y su suspensión por inactividad es de
segundos, frente a la pausa de siete días de Supabase.

## Almacenamiento de imágenes

| Servicio         | Plan gratuito                      | Tarjeta | Principal advertencia                            |
| ---------------- | ---------------------------------- | ------- | ------------------------------------------------ |
| Cloudflare R2    | 10 GB, **salida siempre gratuita** | **Sí**  | Exige medio de pago aunque el uso sea gratuito   |
| Supabase Storage | 1 GB                               | No      | El siguiente escalón cuesta 25 dólares mensuales |
| Vercel Blob      | Sin volumen gratuito a esta escala | —       | —                                                |

**Elegido: Cloudflare R2.** Es la única opción que ofrece varios gigabytes con salida gratuita,
determinante al servir imágenes. Es el único componente del sistema que exige tarjeta.

## Correo transaccional

| Servicio | Plan gratuito                       | Tarjeta           | Dominio propio  | Principal advertencia                                 |
| -------- | ----------------------------------- | ----------------- | --------------- | ----------------------------------------------------- |
| Brevo    | 300 diarios                         | No                | Recomendado     | Marca del proveedor en todos los mensajes             |
| Resend   | 3000 mensuales, tope de 100 diarios | No                | **Obligatorio** | Sin dominio solo entrega a la casilla del titular     |
| Mailgun  | 100 diarios                         | En la práctica sí | Sí              | Sin tarjeta queda en modo aislado con 5 destinatarios |
| SendGrid | Eliminado                           | —                 | —               | Prueba de 60 días y luego 19,95 dólares mensuales     |

**Elegido: Brevo.** El proyecto no tiene dominio propio, lo que descarta Resend: sus mensajes solo
llegarían a la casilla del titular de la cuenta y ningún otro usuario recibiría la recuperación de
contraseña.

## Coste total

Cero dólares facturados, con tarjeta registrada únicamente en Cloudflare R2.

## Puntos a revisar en el futuro

- La documentación de Render indica ahora 5 GB de transferencia saliente frente a los 100 GB que
  figuraban en fuentes previas.
- El archivado de Turso tras 10 días de inactividad aparece solo en documentación antigua de su
  herramienta de línea de comandos y no se menciona en la página de precios.
- Adquirir un dominio propio, entre 10 y 12 dólares anuales, permitiría pasar a Resend y eliminar
  la marca del proveedor en los correos.
