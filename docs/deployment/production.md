# Despliegue a producción

Estado: **preparado, no ejecutado.** Toda la configuración externa depende de credenciales que
solo el propietario del proyecto puede crear. Los pasos están verificados en lo que se pudo
verificar localmente; los que requieren una cuenta están marcados.

## Resumen

| Componente    | Servicio      | Tarjeta |
| ------------- | ------------- | ------- |
| Aplicación    | Vercel Hobby  | No      |
| Base de datos | Neon          | No      |
| Imágenes      | Cloudflare R2 | **Sí**  |
| Correo        | Brevo         | No      |

Detalle de por qué cada uno en [`free-tier-comparison.md`](free-tier-comparison.md) y en el
[ADR 0007](../adr/0007-deployment.md).

## 1. Base de datos (Neon)

1. Crear un proyecto en neon.tech y una base `camisetas`.
2. Copiar la cadena de conexión con `?sslmode=require`.
3. Aplicar las migraciones desde tu máquina:

```bash
DATABASE_URL='postgresql://…' pnpm db:migrate
```

Neon suspende el cómputo tras cinco minutos sin uso y despierta en menos de un segundo. **No
ejecutes el seed contra producción**: el script lo impide si `NODE_ENV=production`, pero conviene
no tentar a la suerte.

## 2. Imágenes (Cloudflare R2)

1. Crear un bucket llamado `camisetas`.
2. Crear un token de API con permiso de lectura y escritura sobre ese bucket.
3. Opcional pero recomendado: conectar un dominio público al bucket para servir las imágenes
   directamente.

R2 exige un medio de pago registrado aunque el uso quede dentro de los 10 GB gratuitos. Es el
único componente con esa exigencia.

**Sin estas credenciales la aplicación funciona igual**, guardando las imágenes en disco. Eso
sirve para una prueba en local, pero no para Vercel, cuyo sistema de archivos es efímero.

## 3. Correo (Brevo)

1. Crear una cuenta y generar una clave de API.
2. Verificar el remitente que vayas a usar en `MAIL_FROM`.

Sin `BREVO_API_KEY` los correos de recuperación se escriben en el log en vez de enviarse.

## 4. Aplicación (Vercel)

1. Importar el repositorio. Vercel detecta Next.js solo.
2. Configurar el directorio raíz en `apps/web`.
3. Cargar las variables de entorno de
   [`environment.md`](environment.md). `APP_URL` tiene que ser la URL pública real: de ahí salen
   los enlaces compartidos, los correos y las previsualizaciones sociales.
4. Desplegar.

El plan Hobby es de uso no comercial.

## 5. Verificación posterior

```bash
# La aplicación responde y la sesión funciona
curl -si https://TU-DOMINIO/ | head -1

# Las cabeceras de seguridad están presentes
curl -sI https://TU-DOMINIO/ | grep -iE 'x-content-type|x-frame|strict-transport|referrer'

# Las previsualizaciones sociales salen con datos reales
curl -s https://TU-DOMINIO/c/UN-TOKEN | grep -oE '<meta property="og:[a-z]+" content="[^"]*"'
```

Además, a mano:

- Registrarse, entrar y salir.
- Cargar una camiseta con foto y comprobar que la imagen se ve.
- Generar un enlace, abrirlo en una ventana privada, revocarlo y comprobar que deja de funcionar.
- Pegar el enlace en WhatsApp y ver que aparece la tarjeta con imagen.
- Pedir una recuperación de contraseña y completar el flujo.
- Recargar una ruta interna directamente, por ejemplo `/estadisticas`.

## Dominio

El dominio se conecta desde el panel de Vercel. Una vez apuntado, hay que actualizar `APP_URL` y
volver a desplegar: los enlaces ya emitidos siguen siendo válidos porque el token no depende del
dominio, pero los enlaces nuevos y los correos usan esa variable.
