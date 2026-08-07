# Mi Colección de Camisetas

Aplicación web para catalogar, organizar y compartir una colección personal de camisetas de
fútbol.

## Stack

- **Next.js 15** con App Router y TypeScript en modo estricto (interfaz y API en un solo proyecto)
- **PostgreSQL** con **Drizzle** y migraciones versionadas
- **Zod** como fuente única de tipos y validación entre cliente y servidor
- **Tailwind CSS 4**
- **Vitest** y **Playwright**

## Arquitectura

Monorepo con `pnpm`:

```
apps/web           Interfaz y API
packages/contracts Esquemas Zod: tipos y validación compartidos
packages/core      Dominio: cuentas, sesiones, camisetas, estadísticas, enlaces
packages/db        Esquema y migraciones
```

El dominio no depende de Next.js. Las decisiones y sus motivos están en
[`docs/adr/`](docs/adr/); la visión general, en [`docs/architecture.md`](docs/architecture.md).

## Requisitos

- Node.js 20.11 o superior
- pnpm 10
- Docker (para PostgreSQL local)

## Puesta en marcha

```bash
pnpm install
docker compose up -d
cp env.example apps/web/.env.local
pnpm db:migrate
pnpm db:seed        # datos de ejemplo, solo desarrollo
pnpm dev
```

En `http://localhost:3000`. El seed crea el usuario `coleccionista` con la contraseña
`una-contrasena-larga`.

## Variables de entorno

Las obligatorias son `DATABASE_URL` y `APP_URL`. Sin credenciales de Cloudflare R2 ni de Brevo la
aplicación funciona igual: guarda las imágenes en disco y escribe los correos en el log. Detalle
completo en [`docs/deployment/environment.md`](docs/deployment/environment.md).

## Base de datos

```bash
pnpm db:generate    # genera una migración a partir del esquema
pnpm db:migrate     # aplica las migraciones pendientes
```

El esquema nunca se sincroniza de forma automática: las migraciones son archivos SQL versionados
que se aplican de forma explícita.

## Tests

```bash
pnpm test           # unitarios e integración
pnpm test:e2e       # end to end con Playwright
```

Los tests de integración usan una base PostgreSQL real, no mocks. Necesitan
`TEST_DATABASE_URL` apuntando a una base separada. Detalle en
[`docs/testing.md`](docs/testing.md).

## Verificación

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm build
```

## Despliegue

Pensado para funcionar sin coste en Vercel, Neon, Cloudflare R2 y Brevo. Comparación de planes y
procedimiento en [`docs/deployment/`](docs/deployment/).

## Documentación

- [`docs/audit.md`](docs/audit.md) — auditoría del sistema anterior
- [`docs/architecture.md`](docs/architecture.md) — arquitectura
- [`docs/adr/`](docs/adr/) — decisiones y sus motivos
- [`docs/testing.md`](docs/testing.md) — estrategia de pruebas
- [`docs/deployment/`](docs/deployment/) — entorno, despliegue, backup y rollback
- [`SECURITY.md`](SECURITY.md) — modelo de seguridad
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — convenciones
