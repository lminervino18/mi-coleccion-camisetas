# Arquitectura

## Forma general

Un monolito modular en un monorepo `pnpm`. Cuatro paquetes con una dirección de dependencia
estricta:

```
apps/web  ──►  packages/core  ──►  packages/db  ──►  packages/contracts
     └──────────────────────────────────────────────────────┘
```

`contracts` no depende de nada. `core` no conoce Next.js, HTTP ni React. `apps/web` es la única
capa que sabe de peticiones, cookies y renderizado.

La consecuencia práctica: toda la lógica de negocio se prueba sin levantar un servidor, y sacar la
API a un servicio propio sería mover carpetas, no reescribir.

## packages/contracts

Esquemas de Zod como fuente única. Los tipos se derivan con `z.infer`; nunca se declaran por
separado, así que el validador y el tipo no pueden divergir.

Se valida en ejecución toda entrada externa: cuerpo, parámetros de ruta y de consulta, variables
de entorno al arrancar y metadatos de archivos. Los tipos estáticos desaparecen al compilar; la
validación tiene que existir en el límite.

## packages/db

Esquema en Drizzle y migraciones SQL versionadas. Decisiones que importan:

- Los identificadores de sesión y los tokens de compartir se guardan **hasheados**.
- Las imágenes son referencias a objetos, no bytes en la base.
- Cada tabla tiene clave foránea al usuario con borrado en cascada.
- El nombre de usuario es único de forma insensible a mayúsculas mediante un índice sobre
  `lower(username)`.

## packages/core

Casos de uso agrupados por dominio: cuentas, sesiones, recuperación de contraseña, camisetas,
estadísticas y enlaces compartidos.

Todas las funciones reciben la conexión como primer argumento, lo que las hace probables contra una
base real y componibles dentro de una transacción.

Los errores del dominio son `DomainError` con un código estable que la capa HTTP traduce a un
estado. El dominio no conoce códigos de estado.

## apps/web

Next.js con App Router. La interfaz y la API viven en el mismo proyecto, lo que elimina CORS y
permite renderizar en servidor las páginas públicas.

Las páginas de servidor llaman directamente a `core`; no hacen una petición HTTP a su propia API.
Las rutas de `app/api` existen para lo que el navegador necesita hacer después de cargar la página.

### Renderizado en servidor y previsualizaciones

Las colecciones compartidas se renderizan en servidor porque los rastreadores de WhatsApp,
Telegram y similares **no ejecutan JavaScript**. `generateMetadata` produce las etiquetas Open
Graph con datos reales —nombre, cantidad de camisetas, imagen de portada— en el HTML entregado.

Esa restricción fue la que definió el framework: con una aplicación de página única no hay
previsualización posible.

### Imágenes

Las funciones de Vercel limitan el cuerpo de las peticiones a 4,5 MB, así que las imágenes nunca
atraviesan la aplicación. El flujo tiene tres pasos: la API registra la subida y entrega un
destino, el navegador envía los bytes, y la API confirma el alta.

Una subida queda en estado pendiente hasta que una camiseta la reclama, dentro de una transacción.
Si el alta falla no queda nada a medias, y las subidas abandonadas son reconocibles.

El almacenamiento está detrás de una interfaz de cuatro métodos: en producción es Cloudflare R2, y
sin credenciales es una carpeta local. La aplicación no cambia.

### Sesiones

Opacas, en base de datos, referenciadas por cookie `HttpOnly`. Se eligió sobre JWT porque la
revocación inmediata requiere estado en servidor de todos modos, y con ese estado el JWT deja de
aportar. Ver [ADR 0003](adr/0003-authentication.md).

## Manejo de errores

Un único traductor convierte cualquier valor lanzado en una respuesta con forma estable:

```json
{ "code": "validation_failed", "message": "…", "fieldErrors": { "season": ["…"] } }
```

Los errores inesperados se registran en el servidor y se reportan de forma genérica. En el
navegador, un solo cliente HTTP convierte toda falla en `ApiRequestError`, de modo que ningún
componente ramifica sobre códigos de estado crudos.

## Decisiones

Cada una con contexto, alternativas y estrategia de reversión, en [`adr/`](adr/).
