# Convenciones

## Antes de un commit

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
```

Lo mismo corre en CI. Una rama con alguno de esos pasos en rojo no se considera lista.

## Commits

Conventional Commits, en inglés, de una sola línea, atómicos:

```
feat(shirts): add owner-scoped shirt service
fix(auth): reject a wrong password
docs(readme): update local setup
```

Sin descripciones largas, sin firmas ni menciones de herramientas.

## Código

Todo el código, los identificadores y los comentarios están en **inglés**. La interfaz está en
**español rioplatense**.

Los comentarios se reservan para lo que el código no puede decir por sí mismo: una restricción no
evidente, una decisión contraintuitiva, una incompatibilidad externa, una condición de seguridad.
Un comentario que describe lo que hace la línea siguiente sobra; en ese caso conviene mejorar el
nombre o extraer una función.

Los docstrings sobre funciones y módulos públicos son bienvenidos cuando explican el contrato.

## Estructura

```
apps/web           interfaz y API
packages/contracts esquemas Zod
packages/core      dominio, sin dependencias de framework
packages/db        esquema y migraciones
```

La lógica de negocio va en `packages/core`. Si una regla se puede probar sin levantar Next.js,
pertenece ahí.

## Tests

Los tests de dominio corren contra una base PostgreSQL real. No se mockea la persistencia: un
mock no habría detectado, por ejemplo, el error de precedencia entre `AND` y `OR` que sí encontró
un test de integración.

Un test debería fallar por una razón entendible. Se evitan las esperas arbitrarias y las
comprobaciones de que una función simulada fue invocada.

## Base de datos

Los cambios de esquema se generan con `pnpm db:generate` y se revisan antes de commitear. El
esquema no se sincroniza automáticamente en ningún entorno.
