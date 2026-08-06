# 0001 — Next.js como framework único de aplicación

Estado: aceptado — 6 de agosto de 2026

## Contexto

El sistema previo separa un frontend Create React App de un backend Spring Boot. Esa separación
introduce CORS, duplicación de modelos entre Java y JavaScript, y dos despliegues que hay que
mantener sincronizados.

Un requisito explícito del proyecto es que las colecciones compartidas muestren una vista previa
correcta al pegar el enlace en WhatsApp, Telegram u otras plataformas. Los rastreadores de esas
plataformas **no ejecutan JavaScript**: leen el HTML que devuelve el servidor. Una aplicación de
página única servida como HTML vacío no puede producir esa vista previa, por muchos metadatos
que inyecte en el cliente.

## Problema

Elegir una arquitectura de aplicación que permita renderizar en servidor las páginas públicas,
mantenga el despliegue en Vercel y el dominio actual, y evite sostener dos proyectos separados.

## Alternativas consideradas

**React con Vite y una API Fastify aparte.** Fue la opción preferida inicialmente. Da una
separación nítida entre transporte y presentación y facilita mover la API a otro proveedor. Se
descarta porque no resuelve el renderizado en servidor de las páginas públicas: haría falta un
servicio adicional solo para generar los metadatos sociales, o duplicar el renderizado. También
obliga a mantener CORS y dos despliegues.

**Next.js con la API en el mismo proyecto.** Las páginas públicas se renderizan en servidor y sus
metadatos se generan con datos reales. Frontend y API comparten origen, con lo que CORS deja de
existir como problema. Un único despliegue en Vercel conserva el proyecto y el dominio.

**NestJS como backend separado.** Aporta una estructura de módulos y decoradores familiar para
quien viene de Spring, pero su peso no se justifica en un dominio de tres entidades, y arrastra
los mismos problemas de CORS y doble despliegue que la opción Vite.

## Decisión

Next.js con App Router y TypeScript en modo estricto, alojando tanto la interfaz como la API en
un único proyecto de Vercel.

## Motivos

1. Es la única alternativa que resuelve las vistas previas sociales sin infraestructura extra.
2. Elimina CORS, que en el sistema previo estaba mal configurado y atado a `localhost`.
3. Un solo despliegue conserva el proyecto y el dominio existentes en Vercel.
4. Los tipos del dominio se comparten entre servidor y cliente sin generación de código.

## Consecuencias

La interfaz y la API comparten ciclo de despliegue. Para compensarlo, la lógica de dominio y de
aplicación vive en paquetes independientes de React, de modo que extraer la API a un servicio
propio en el futuro sea mover carpetas y no reescribir.

Las funciones de Vercel imponen un límite de 4,5 MB en el cuerpo de las peticiones. Las imágenes
no pueden subirse a través de la API; ver [0005](0005-image-storage.md).

El plan Hobby de Vercel es de uso no comercial. Si el proyecto incorporara publicidad, pagos o
donaciones, sería necesario el plan Pro.

## Reversión

La lógica de negocio no depende de Next.js. Revertir significa crear un servidor HTTP que exponga
los mismos casos de uso y apuntar la interfaz a su URL. Las páginas públicas perderían las vistas
previas sociales salvo que ese servidor las renderice.
