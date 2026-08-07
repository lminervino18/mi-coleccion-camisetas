# 0006 — Contratos con Zod como fuente única

Estado: aceptado — 6 de agosto de 2026

## Contexto

En el sistema previo los modelos se definen dos veces: como DTO de Java en el backend y de forma
implícita en el frontend, donde no existen tipos. Los desajustes solo aparecen en ejecución. El
frontend interpreta la respuesta de cada endpoint de forma distinta y sin validación.

## Problema

Evitar que interfaz y API sostengan modelos incompatibles, y garantizar que toda entrada externa
se valide en ejecución y no solo en tiempo de compilación.

## Alternativas consideradas

**Tipos de TypeScript compartidos.** Al compartir el mismo lenguaje, exportar interfaces es
trivial. Pero los tipos desaparecen al compilar: no validan nada en ejecución, que es justo lo que
hace falta en el límite de entrada.

**OpenAPI con generación de código.** Produce un contrato verificable y legible por herramientas,
a costa de un paso de generación y de mantener el documento sincronizado.

**Esquemas de Zod compartidos.** Un mismo esquema valida en ejecución y deriva el tipo estático.
No hay paso de generación ni posibilidad de divergencia entre el validador y el tipo.

## Decisión

Un paquete `contracts` con esquemas de Zod como fuente única de verdad. Los tipos se derivan de
los esquemas con `z.infer`, nunca se declaran por separado.

Se valida en ejecución **toda** entrada externa: cuerpo, parámetros de ruta y de consulta,
variables de entorno al arrancar, y metadatos de los archivos subidos.

Los modelos de persistencia no se exponen como contrato público: cada respuesta se construye
explícitamente a partir de un esquema de salida, lo que impide filtrar campos por descuido.

## Consecuencias

Un cambio en un esquema rompe la compilación en todos los puntos afectados, que es el
comportamiento deseado.

Los mensajes de error de validación se traducen a una forma de error estable y uniforme, sin
exponer detalles internos.

Si en el futuro hiciera falta un documento OpenAPI, puede derivarse de los esquemas de Zod sin
duplicar las definiciones.

## Reversión

Los esquemas son código TypeScript ordinario. Sustituir Zod por otra biblioteca de validación
implica reescribir el paquete `contracts` manteniendo los tipos exportados.
