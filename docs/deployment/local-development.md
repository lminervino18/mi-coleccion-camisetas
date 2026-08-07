# Desarrollo local

## Puesta en marcha

```bash
pnpm install
docker compose up -d
cp env.example apps/web/.env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

En `http://localhost:3000`, con el usuario `coleccionista` y la contraseña
`una-contrasena-larga`.

## Sin ninguna credencial externa

La aplicación arranca completa sin cuentas de Cloudflare ni de Brevo:

- Las imágenes se guardan en `apps/web/.uploads` y se sirven desde la propia aplicación.
- Los correos de recuperación **se escriben en el log del servidor**, con el enlace real. Buscá la
  línea que empieza con `[mail]`, copiá la URL y abrila: el flujo se prueba entero.

## Base de datos de test

Los tests de integración usan una base separada que se trunca en cada prueba:

```bash
docker exec camisetas-pg psql -U postgres -c "CREATE DATABASE camisetas_test;"
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5433/camisetas_test' pnpm db:migrate
```

Después, `pnpm test` la usa a través de `TEST_DATABASE_URL`.

## Migraciones

```bash
pnpm db:generate   # tras editar packages/db/src/schema.ts
pnpm db:migrate
```

Revisá el SQL generado antes de commitearlo. El esquema no se sincroniza solo en ningún entorno.

## Antes de commitear

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
```

## End to end

```bash
pnpm test:e2e
```

Levanta el servidor si no está corriendo. Necesita la base con el seed aplicado. Usa Chromium en
tres viewports; no hace falta descargar otros navegadores.

## Problemas frecuentes

**La aplicación no arranca y habla de configuración inválida.** Falta una variable o tiene un
formato incorrecto. El mensaje dice cuál.

**Las imágenes del seed no se ven.** El seed crea las filas pero no los archivos. Cargá una
camiseta desde la interfaz para ver el flujo real de subida.

**Los tests fallan con un error de conexión.** El contenedor no está levantado o la base de test
no existe. Revisá `docker compose ps`.
