# 0004 — Imágenes en Cloudflare R2 con subida directa

Estado: aceptado — 6 de agosto de 2026

## Contexto

El sistema previo almacena las imágenes de camisetas como `LONGBLOB` en la tabla `camisetas` y la
foto de perfil como base64 en una columna `TEXT`. El listado de la colección devuelve todas las
miniaturas embebidas en base64 en una única respuesta, sin paginación.

Esto encarece cada consulta, infla el tráfico de la base de datos y hace imposible cachear las
imágenes en el navegador o en una red de distribución.

## Problema

Almacenar imágenes originales y sus variantes de forma que no penalicen la base de datos, se
sirvan con caché, y quepan en un presupuesto de coste prácticamente nulo.

## Alternativas consideradas

**Mantener las imágenes en la base.** Descartado. Neon ofrece 0,5 GB en su plan gratuito y
superar el tráfico de salida suspende la base hasta el siguiente ciclo. Unas pocas decenas de
fotos agotarían el margen.

**Supabase Storage.** No requiere tarjeta, pero ofrece 1 GB y el salto siguiente cuesta 25 dólares
mensuales. Insuficiente para una colección de fotografías.

**Vercel Blob.** No ofrece un volumen gratuito comparable a esta escala.

**Cloudflare R2.** 10 GB mensuales y **tráfico de salida siempre gratuito**, que es lo decisivo al
servir imágenes. Requiere un medio de pago registrado aunque el uso permanezca dentro del plan
gratuito; el propietario del proyecto lo aceptó explícitamente.

## Decisión

Cloudflare R2 como almacenamiento de objetos, con subida directa desde el navegador mediante URL
prefirmada.

Las funciones de Vercel limitan el cuerpo de las peticiones a 4,5 MB (ver
[0001](0001-application-framework.md)), por lo que retransmitir las imágenes a través de la API no
es viable. La subida directa no es un rodeo a esa limitación sino la forma correcta: la imagen no
atraviesa el servidor de aplicación en ningún momento.

## Consecuencias

El flujo de alta de una camiseta pasa a tener tres pasos: la API entrega una URL prefirmada, el
navegador sube el archivo a R2, y la API confirma el alta registrando la referencia.

Ese flujo introduce la posibilidad de objetos huérfanos si el usuario abandona a mitad de camino.
Se resuelve marcando los objetos como pendientes hasta su confirmación y eliminando los no
confirmados de forma periódica.

La validación no puede confiar en la extensión ni en el tipo declarado por el cliente: se verifica
la firma binaria del archivo y sus dimensiones antes de confirmar el alta.

Se generan variantes de distinto tamaño en el momento de la subida para no servir la imagen
original en la grilla.

## Reversión

El acceso al almacenamiento queda detrás de una interfaz con las operaciones de subida, borrado y
resolución de URL. Cambiar de proveedor implica una implementación nueva de esa interfaz y una
copia de los objetos, sin tocar el dominio.
