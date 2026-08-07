# Copias de seguridad

El sistema anterior se perdió porque existía una sola copia, en un solo lugar, atada a un medio de
pago. Este documento existe para que eso no se repita.

## Base de datos

Neon conserva un historial que permite restaurar a un momento anterior, pero **eso no es una copia
de seguridad**: si perdés acceso a la cuenta, perdés el historial. Hace falta una copia fuera del
proveedor.

### Copia manual

```bash
pg_dump --no-owner --no-privileges \
  --dbname="$DATABASE_URL" \
  --file="camisetas-$(date +%Y%m%d).sql"
```

Guardala fuera del proveedor: tu máquina, un disco externo, o un almacenamiento distinto del que
usás para las imágenes.

### Restauración

```bash
psql --dbname="$DATABASE_URL_DESTINO" --file=camisetas-AAAAMMDD.sql
```

Restaurá **siempre primero en una base vacía de prueba** y comprobá los conteos antes de tocar
producción:

```sql
SELECT
  (SELECT count(*) FROM users)  AS usuarios,
  (SELECT count(*) FROM shirts) AS camisetas,
  (SELECT count(*) FROM share_links) AS enlaces;
```

### Frecuencia sugerida

Mensual, y siempre antes de aplicar una migración que borre o transforme datos.

## Imágenes

Las imágenes viven en R2 y **no están en la copia de la base**. La base guarda solo la referencia,
así que una restauración sin las imágenes deja camisetas con la foto rota.

```bash
rclone sync r2:camisetas ./copia-imagenes
```

Requiere configurar `rclone` con las credenciales de R2. Alternativamente, cualquier cliente
compatible con S3.

## Qué probar de vez en cuando

Una copia que nunca se restauró no es una copia. Al menos una vez:

1. Restaurá el volcado en una base local vacía.
2. Apuntá la aplicación local a esa base.
3. Entrá y comprobá que la colección se ve.

## Antes de una migración destructiva

1. Hacé la copia de la base.
2. Verificá que el archivo tiene un tamaño razonable y no está vacío.
3. Aplicá la migración.
4. Comprobá los conteos.

Si algo sale mal, el procedimiento está en [`rollback.md`](rollback.md).
