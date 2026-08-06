# 0002 — PostgreSQL en Neon con Drizzle

Estado: aceptado — 6 de agosto de 2026

## Contexto

El sistema previo usa MySQL en Amazon RDS, con el esquema generado por Hibernate mediante
`ddl-auto=update` y sin migraciones versionadas. La instancia fue dada de baja y los datos no son
recuperables, por lo que no existe ninguna restricción de compatibilidad hacia atrás.

## Problema

Elegir un motor de base de datos y una capa de acceso que funcionen en un plan gratuito real,
sin tarjeta de crédito, y que permitan migraciones versionadas y verificables.

## Alternativas consideradas

**Conservar MySQL.** Sin datos que preservar, la única razón para mantenerlo desaparece. La oferta
gratuita de MySQL administrado es además notablemente peor que la de PostgreSQL.

**PostgreSQL en Neon.** Plan gratuito sin tarjeta: 0,5 GB de almacenamiento y 100 horas de cómputo
mensuales. El cómputo se suspende tras cinco minutos de inactividad y despierta en unos cientos de
milisegundos. Es aceptable para esta aplicación y no penaliza como la pausa de siete días de
Supabase.

**PostgreSQL en Supabase.** Incluye almacenamiento de objetos y autenticación, lo que sería
atractivo, pero **pausa los proyectos tras siete días sin actividad** y su almacenamiento gratuito
es de 1 GB, insuficiente para las imágenes. Ver [0005](0005-image-storage.md).

**Cloudflare D1 o Turso.** Ambos ofrecen límites generosos, pero son SQLite y no PostgreSQL. Se
descartan por no ser un reemplazo directo y por limitaciones de tipos y concurrencia.

**PostgreSQL en Render.** Su plan gratuito **expira a los 30 días de creado y luego borra los
datos**. Inaceptable para producción.

## Decisión

PostgreSQL alojado en Neon, con Drizzle como capa de acceso y `drizzle-kit` para migraciones
versionadas en el repositorio.

Se elige Drizzle sobre Prisma porque genera SQL predecible sin un motor de consultas adicional,
su cliente es notablemente más liviano en entornos de función sin servidor, y el esquema se
declara en TypeScript, de modo que los tipos derivan del esquema sin un paso de generación.

## Consecuencias

Las migraciones son archivos SQL versionados que se aplican de forma explícita. **En ningún caso
se sincroniza el esquema automáticamente en producción**, que es precisamente el error del sistema
previo.

La suspensión por inactividad de Neon implica que la primera petición tras un período ocioso
sufre una latencia adicional. Se asume.

Superar las horas de cómputo o el tráfico de salida suspende la base hasta el siguiente ciclo de
facturación. Esto refuerza la decisión de no servir imágenes desde la base de datos.

## Reversión

Drizzle habla SQL estándar. Migrar a otro proveedor de PostgreSQL consiste en volcar la base,
restaurarla en el destino y cambiar la cadena de conexión. El procedimiento queda documentado en
`docs/deployment/backup.md`.
