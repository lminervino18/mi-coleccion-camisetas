# Informe de la reconstrucción

## Resumen

Se reemplazó el frontend en Create React App y el backend en Spring Boot por una aplicación
Next.js con TypeScript en modo estricto, conservando las funciones y la identidad visual del
sistema anterior.

**Stack final:** Next.js 15 · TypeScript estricto · PostgreSQL con Drizzle · Zod · Tailwind 4 ·
Vitest · Playwright.

**Arquitectura:** monorepo `pnpm` con cuatro paquetes y una dirección de dependencia estricta.
`contracts` no depende de nada, `core` no conoce Next.js ni HTTP, y `apps/web` es la única capa
que sabe de peticiones y renderizado. Toda la lógica de negocio se prueba sin levantar un
servidor.

**Por qué Next.js:** las previsualizaciones sociales exigen renderizado en servidor. Los
rastreadores de WhatsApp y Telegram no ejecutan JavaScript, así que con una aplicación de página
única no hay preview posible. Esa restricción definió el framework.

**Los datos anteriores no se recuperaron.** La infraestructura de AWS fue dada de baja por falta
de pago y ninguno de los endpoints RDS resuelve.

## Por qué se reconstruyó en vez de parchear

La auditoría (`audit.md`) se hizo ejecutando el sistema anterior. Tres hallazgos verificados con
peticiones reales:

1. **El login no verificaba la contraseña.** Usuario correcto con clave incorrecta devolvía un
   token válido. Como `GET /api/usuarios` era público, los nombres para explotarlo también.
2. **Acceso horizontal total.** Con el token de un usuario se podía leer, editar y borrar la
   colección de otro, y promoverlo a administrador.
3. **Mobile inutilizable.** A 375 px la barra de acciones quedaba fuera de pantalla: no había
   forma de cerrar sesión desde un teléfono.

## Cambios principales

| Área         | Antes                                 | Ahora                                                      |
| ------------ | ------------------------------------- | ---------------------------------------------------------- |
| Contraseñas  | BCrypt, sin verificar en login        | Argon2id, verificada, con hash señuelo contra enumeración  |
| Sesión       | JWT en `localStorage`                 | Opaca en base, cookie `HttpOnly`, revocable                |
| Autorización | Identificador de usuario en la URL    | Siempre desde la sesión                                    |
| Imágenes     | `LONGBLOB` y base64 en cada respuesta | Objetos en R2, subida directa, validadas por firma binaria |
| Enlaces      | Token de 32 bits en texto plano       | 32 bytes hasheados, con expiración y revocación            |
| Filtros      | `localStorage` por usuario            | En la URL: compartibles, sobreviven recarga y botón atrás  |
| Esquema      | `ddl-auto=update`                     | Migraciones versionadas                                    |
| Tests        | 1 vacío                               | 264                                                        |

**Funciones nuevas:** recuperación y cambio de contraseña, perfil con foto y datos, favoritos,
paginación, previsualizaciones sociales, página 404, estados vacíos diferenciados, títulos por
página, health check y limpieza programada.

**Identidad conservada:** fondo fotográfico, tipografía serif en títulos, azul de acción, logo de
la camiseta, tarjetas en escala de grises que toman color al pasar el mouse, y el landing con las
fotos de coleccionistas.

## Validación

```
pnpm format:check   All matched files use Prettier code style
pnpm lint           4/4 paquetes
pnpm typecheck      4/4 paquetes
pnpm test           149  (60 unitarios + 89 integración contra PostgreSQL real)
pnpm test:e2e       115 pasan, 0 fallan, 26 salteados por diseño
pnpm build          Compiled successfully
```

Los E2E cubren tres viewports: escritorio, 320 px y Pixel 7.

### Lighthouse (build de producción)

| Categoría        | Resultado |
| ---------------- | --------- |
| Rendimiento      | 91        |
| Accesibilidad    | 100       |
| Buenas prácticas | 96        |
| SEO              | 91        |

LCP 3,5 s · CLS 0 · TBT 40 ms · bundle compartido 102 kB (antes 212 kB en un único fragmento).

### Carga

60 peticiones simultáneas a `/api/health`: todas correctas, 11 conexiones estables.
`/coleccion` p95 211 ms, `/estadisticas` p95 199 ms.

## Bugs encontrados durante la reconstrucción

Los más significativos, todos detectados por pruebas y no por lectura:

- **Precedencia SQL.** `id <> :u AND username = :x OR email = :y` se agrupaba mal, y guardar el
  perfil sin cambios devolvía conflicto. Ningún mock lo habría detectado.
- **Conexiones sin cachear en producción.** Cada petición abría un pool nuevo y agotaba el
  servidor. Lo encontró la prueba de carga.
- **Contraste insuficiente.** El azul de marca del original daba 3,97:1 con texto blanco cuando
  hace falta 4,5. Se bajó una parada a `#0069d9`, visualmente idéntico.
- **Campo de archivo sin etiqueta.** Un lector de pantalla lo anunciaba vacío.
- **Límite de tasa mal aplicado.** Se contaban también los ingresos exitosos, lo que habría
  bloqueado a un usuario legítimo entrando desde varios dispositivos.

## Historial

Rama `main`, 44 commits desde `723f4de`, convencionales y de una línea.

```
346 archivos · +22.864 / −30.491
20 feat · 7 docs · 5 test · 5 chore · 3 fix · 1 style · 1 refactor · 1 perf
```

Terminó con menos código del que había, incluyendo ahora tests y documentación.

Las ramas `v1-prod` y `testing-aws-bdd` se borraron a pedido, pero quedaron etiquetadas como
`archivo/v1-prod` y `archivo/testing-aws-bdd`: la lista de ramas está limpia y la historia sigue
siendo recuperable.

## Pendientes

### Requieren acción del propietario

1. **Credenciales de Cloudflare R2.** Producción reporta `objectStorage: local`, es decir que las
   imágenes se guardan en disco efímero y se pierden. Es el único componente que exige tarjeta.
2. **DNS:** registro `A micoleccioncamisetas.com → 76.76.21.21`.

### Deuda conocida

- El secreto JWT y las credenciales RDS del sistema anterior están en el historial de Git en texto
  plano. La infraestructura fue dada de baja, pero deben considerarse comprometidos.
- El límite de tasa vive en memoria del proceso: acota el abuso por instancia, no de forma global.
- La contraseña del seed está escrita en el repositorio. Es para desarrollo local, pero conviene
  no reutilizarla en otros servicios.

### Costes

Cero dólares facturados. Tarjeta registrada únicamente en Cloudflare R2, que no cobra por debajo
de 10 GB. El plan Hobby de Vercel es de uso no comercial.

## Instrucciones

### Local

```bash
docker compose up -d
pnpm install
cp env.example apps/web/.env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Usuario `lminervino18`, contraseña `Hermanis123`.

Funciona sin credenciales externas: las imágenes van a disco y los correos de recuperación se
escriben en el log con el enlace real.

### Producción

Procedimiento completo en `deployment/production.md`. Copias de seguridad en `deployment/backup.md`
y vuelta atrás en `deployment/rollback.md`.

### Actualizar las referencias visuales

```bash
pnpm --filter web exec playwright test visual --update-snapshots
```

Revisar el resultado antes de aceptarlo: una referencia regenerada sin mirar convierte la suite en
decoración.
