# 0007 — Despliegue gratuito verificado

Estado: aceptado — 6 de agosto de 2026

## Contexto

El sistema previo estaba en Vercel para el frontend y una instancia EC2 con RDS para el backend,
que se dieron de baja por falta de pago. El requisito es que el proyecto se sostenga con coste
prácticamente nulo y sin sorpresas de facturación.

Los planes gratuitos cambiaron sustancialmente desde que se construyó el sistema original, por lo
que se verificaron contra documentación oficial en la fecha de este documento y no de memoria.

## Hallazgos de la comparación

Detalle completo en [`../deployment/free-tier-comparison.md`](../deployment/free-tier-comparison.md).

Servicios que dejaron de ser viables:

- **Fly.io** ya no ofrece plan gratuito a cuentas nuevas y exige tarjeta.
- **Railway** solo da 5 dólares de crédito por 30 días.
- **Render** hace expirar su PostgreSQL gratuito a los 30 días y luego borra los datos.
- **SendGrid** eliminó su plan gratuito.

## Decisión

| Componente | Servicio | Tarjeta |
|---|---|---|
| Aplicación e interfaz | Vercel Hobby | No |
| Base de datos | Neon | No |
| Imágenes | Cloudflare R2 | Sí |
| Correo transaccional | Brevo | No |

Se elige **Brevo** sobre Resend porque el proyecto no dispone de dominio propio, y Resend sin
dominio verificado solo entrega mensajes a la casilla del titular de la cuenta, lo que impediría
enviar recuperaciones de contraseña a otros usuarios. Brevo permite 300 correos diarios con
verificación de remitente.

## Consecuencias

Los correos del plan gratuito de Brevo incluyen una marca del proveedor, también en los mensajes
de recuperación de contraseña. Se asume como coste de no tener dominio propio.

El envío queda detrás de una interfaz, de modo que adoptar un dominio y pasar a Resend sea un
cambio de configuración y de implementación, sin tocar los casos de uso.

**Cloudflare R2 exige un medio de pago registrado** aunque el uso se mantenga dentro del plan
gratuito. Un impago suspende el acceso al bucket. Es el único punto del sistema con esa
exigencia y fue aceptado explícitamente.

El plan Hobby de Vercel es de uso no comercial.

## Reversión

Cada componente es sustituible de forma independiente. Los procedimientos de copia de seguridad y
de vuelta atrás se documentan en `docs/deployment/backup.md` y `docs/deployment/rollback.md`.
