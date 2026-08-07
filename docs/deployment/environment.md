# Variables de entorno

La configuración se valida al arrancar con Zod (`apps/web/src/server/env.ts`). Si falta una
variable obligatoria o tiene un formato inválido, la aplicación **no inicia** y explica cuál es el
problema, en lugar de fallar más tarde con un error confuso.

Copiá `env.example` a `apps/web/.env.local` para desarrollo.

| Nombre                 | Servicio      | Entorno | Obligatoria | Descripción                                                              | Ejemplo                                                        |
| ---------------------- | ------------- | ------- | ----------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL    | todos   | Sí          | Cadena de conexión                                                       | `postgresql://postgres:postgres@127.0.0.1:5433/camisetas`      |
| `APP_URL`              | Aplicación    | todos   | Sí          | URL pública; se usa en enlaces compartidos, correos y metadatos sociales | `https://micoleccioncamisetas.com`                             |
| `R2_ACCOUNT_ID`        | Cloudflare R2 | prod    | No          | Identificador de cuenta                                                  | `a1b2c3d4e5f6`                                                 |
| `R2_ACCESS_KEY_ID`     | Cloudflare R2 | prod    | No          | Clave de acceso                                                          | `AKIA…`                                                        |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | prod    | No          | Clave secreta                                                            | `wJalr…`                                                       |
| `R2_BUCKET`            | Cloudflare R2 | prod    | No          | Nombre del bucket                                                        | `camisetas`                                                    |
| `R2_PUBLIC_URL`        | Cloudflare R2 | prod    | No          | URL pública del bucket                                                   | `https://imagenes.tudominio.com`                               |
| `BREVO_API_KEY`        | Brevo         | prod    | No          | Clave de API para correo transaccional                                   | `xkeysib-…`                                                    |
| `MAIL_FROM`            | Brevo         | todos   | No          | Remitente de los correos                                                 | `no-reply@tudominio.com`                                       |
| `TEST_DATABASE_URL`    | PostgreSQL    | test    | Solo tests  | Base separada para integración                                           | `postgresql://postgres:postgres@127.0.0.1:5433/camisetas_test` |

## Degradación cuando faltan las opcionales

La aplicación arranca y funciona completa sin ninguna credencial externa. Cargarlas cambia el
comportamiento sin tocar código:

| Faltante         | Comportamiento                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Las cuatro de R2 | Las imágenes se guardan en `apps/web/.uploads` y se sirven por `/api/images`                                                   |
| `R2_PUBLIC_URL`  | Las imágenes se sirven por `/api/images` aunque estén en el bucket                                                             |
| `BREVO_API_KEY`  | Los correos de recuperación se escriben en el log del servidor con el enlace real, de modo que el flujo se puede probar entero |

## Públicas y privadas

**Ninguna de estas variables se expone al navegador.** Todas se leen únicamente en código de
servidor. Next.js solo envía al cliente las variables con prefijo `NEXT_PUBLIC_`, y el proyecto no
define ninguna.

## Rotación

1. Generá la credencial nueva en el proveedor sin borrar la anterior.
2. Actualizá la variable en Vercel y volvé a desplegar.
3. Verificá que la funcionalidad afectada siga andando.
4. Recién entonces revocá la credencial vieja.

Las claves del sistema anterior (secreto JWT y credenciales RDS) quedaron en el historial de Git en
texto plano. Están asociadas a infraestructura ya dada de baja, pero **deben considerarse
comprometidas** y no reutilizarse en ningún servicio nuevo.
