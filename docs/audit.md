# Auditoría del sistema previo

Estado auditado: rama `main`, commit `723f4de` (18 de febrero de 2025).
Fecha de auditoría: 6 de agosto de 2026.

La aplicación se ejecutó realmente para producir este documento: backend Spring Boot contra
MySQL 8 en Docker, frontend CRA en el puerto 3000, recorrido con Playwright en 1440×900 y
375×812. Los hallazgos marcados como *verificado* provienen de peticiones o capturas reales,
no de lectura de código.

## Resumen

| Área | Estado |
|---|---|
| Autenticación | Crítico — el login no valida la contraseña |
| Autorización | Crítico — acceso horizontal total entre usuarios |
| Secretos | Crítico — credenciales en el historial de Git |
| Mobile | Crítico — la aplicación no es usable en teléfono |
| Accesibilidad | Ausente |
| Tests | Prácticamente inexistentes |
| Infraestructura | Dada de baja, datos no recuperables |

## 1. Autenticación y autorización

### 1.1 El login no verifica la contraseña (verificado)

`AuthController.login` obtiene el usuario con `usuarioService.findByUsername(username)` y emite
el token sin comparar nunca la contraseña recibida contra el hash almacenado.

```
POST /api/auth/login {"username":"audituser","password":"INCORRECTA"}
→ 200 {"usuarioId":1,"token":"eyJhbGciOiJIUzI1NiJ9..."}
```

Conocer un nombre de usuario equivale a tener la cuenta. Los nombres son públicos porque
`GET /api/usuarios` responde 200 sin autenticación con la lista completa de usuarios.

La rama `v1-prod` corrige esto usando `findByUsernameAndPassword`, por lo que la versión
desplegada probablemente no tenía el fallo. La rama por defecto del repositorio sí.

### 1.2 Acceso horizontal entre usuarios (verificado)

Ningún endpoint compara el identificador de la URL contra el sujeto del token. Con el token del
usuario 1:

| Petición | Resultado |
|---|---|
| `GET /api/camisetas/2` | 200, colección ajena completa |
| `GET /api/usuarios/2` | 200, perfil ajeno |
| `PUT /api/usuarios/2` | 200, se modificó email, contraseña y rol a `ADMIN` |

El `usuarioId` que el frontend interpola en cada URL proviene de `localStorage`, editable desde
las herramientas de desarrollo. `UsuarioDTO` acepta `role` desde el cuerpo de la petición, de
modo que la escalación a administrador es directa.

### 1.3 Gestión de sesión

- El JWT se guarda en `localStorage`, accesible ante cualquier XSS.
- El token se registra en la consola del navegador en `Login.js`.
- El payload del token se decodifica en cliente con `atob` sin verificar la firma.
- No hay refresh, revocación ni cierre de sesión del lado del servidor.
- Expiración fija de 24 horas sin renovación.
- Ante un 401 no hay redirección: la colección queda vacía sin explicación.
- No existe recuperación ni cambio de contraseña.
- No hay límite de intentos ni protección contra fuerza bruta.

### 1.4 Enumeración de cuentas

`GET /api/usuarios/?nombre=` y `?email=` son públicos y `RegisterForm` los consulta en cada
pulsación de tecla. Cualquiera puede enumerar usuarios y correos registrados.

## 2. Secretos

Presentes en el historial de Git en texto plano:

- `jwt.secret` en `application.properties`, con un valor por defecto embebido en `JwtUtil`.
- Credenciales de dos instancias RDS distintas, con usuario y contraseña.
- La misma contraseña repetida en `run_all.sh`.

`backend/target/` estaba versionado: dos JAR de unos 60 MB que incluyen los `.properties` con
los secretos. Se dejaron de rastrear en esta rama, pero **permanecen en el historial**, por lo
que todos esos valores deben considerarse comprometidos y rotarse.

## 3. Frontend

### 3.1 Estructura

`src/` contiene únicamente `components/` y dos archivos sueltos. No hay capa de servicios,
hooks, utilidades ni tipos.

| Archivo | Líneas |
|---|---|
| `Camisetas.js` | 1876 |
| `SharedCollection.js` | 869 |
| `EstadisticasCamisetas.js` | 768 |
| `EditarCamiseta.js` | 706 |
| `AgregarCamiseta.js` | 608 |

`Camisetas.js` declara 42 `useState` y 11 `useEffect` en una sola función y concentra colección,
búsqueda, filtros, ordenamiento, reordenamiento manual, recorte de foto de perfil, menú de
perfil, cierre de sesión, borrado de cuenta y generación de enlaces.

### 3.2 Defectos funcionales

- **El modal de filtros se renderiza dos veces**, ambos condicionados a `showFilters`, con
  identificadores duplicados. El modal de compartir también está duplicado.
- **`camiseta.club.toLowerCase()` sin protección contra nulo**: cualquier camiseta de Selección
  (donde `club` es nulo, caso soportado por el modelo) lanza `TypeError` y deja la página en
  blanco. `ErrorBoundary.js` existe pero nunca se importa, así que nada lo intercepta.
- **La tarjeta de jugadores en estadísticas nunca muestra datos**: `topNombres` se calcula pero
  se omite del `setStats`. El build lo reporta como `no-unused-vars`.
- `EstadisticasCamisetas` accede a `camiseta.temporada.includes('/')` sin protección.
- Aplicar un filtro después de ordenar descarta el orden, pero el botón sigue indicando que el
  ordenamiento está activo.

### 3.3 Duplicación

- El comparador de ordenamiento existe tres veces.
- El predicado de filtrado existe tres veces, con implementaciones divergentes.
- `normalizeColorName` está duplicado y **los dos mapas difieren**, de modo que la misma
  camiseta muestra colores distintos en la vista propia y en la compartida.
- La maquinaria de recorte de imagen está triplicada.
- Las constantes de talles, colores y equipaciones se redeclaran en cuatro archivos.

### 3.4 Red y estado

- 19 URLs con `http://localhost:8080` embebido, pese a existir `proxy` en `package.json`.
- La cabecera de autorización se repite en nueve lugares.
- Ningún `fetch` usa `AbortController`.
- `App.js` consulta `localStorage` con `setInterval` cada segundo durante toda la vida de la app.
- `filteredCamisetasIds_{usuarioId}` se usa como canal entre rutas: entrar directo a
  `/camiseta/5` deja la navegación entre camisetas sin funcionar.
- `localStorage.clear()` en login y registro borra los datos de todos los usuarios del origen.
- `URL.createObjectURL` nunca se libera con `revokeObjectURL`.

### 3.5 Calidad

- 28 llamadas a `console.*` en producción, incluida una que imprime el JWT y otra que vuelca la
  colección completa con las imágenes en base64.
- 13 `alert()` como mecanismo principal de error.
- `ErrorBoundary.js` y `PrivateRoute.js` no se importan en ninguna parte.
- 7 advertencias de ESLint en el build.
- 61 vulnerabilidades declaradas por `npm audit`, 3 críticas y 30 altas.
- Bundle de 212 kB comprimido en un único fragmento, sin división de código.

## 4. Mobile (verificado)

A 375 px de ancho la grilla conserva **tres columnas**: los títulos se cortan y la barra de
acciones —perfil, estadísticas, compartir, cierre de sesión— queda completamente fuera de la
pantalla. **No hay forma de cerrar sesión desde un teléfono.**

No existe ningún manejador táctil en el código: `onTouch`, `touchstart` y `pointerdown` no
aparecen. El reordenamiento por arrastre, el desplazamiento de imagen y el zoom dependen del
ratón y de la rueda con Ctrl. Aun así el código invoca `navigator.vibrate`, lo que indica que la
intención móvil existía sin llegar a implementarse.

Los contenedores de recorte tienen altura fija de 500 px, superior a la de muchos teléfonos.

## 5. Accesibilidad

No hay un solo atributo `aria-*` ni `role=` en todo `src/`.

- Los modales son `div` sin `role="dialog"`, sin captura de foco y sin cierre con Escape.
- Los botones de cierre son un glifo `×` sin nombre accesible.
- Los iconos llevan el `onClick` sobre el propio icono en lugar de un `button`: cerrar sesión,
  compartir y estadísticas no son alcanzables por teclado.
- Las etiquetas de filtro muestran la clave interna del modelo como texto visible.
- Las camisetas son `div` gobernados por eventos de ratón, sin ruta de acceso por teclado.

## 6. Backend

- Sin manejo global de errores: cada controlador arma su propia respuesta.
- Las respuestas de error mezclan texto plano y JSON.
- Los mensajes de excepción interna se devuelven al cliente concatenados.
- `SharedLinkController` construye las URLs con `http://localhost:3000` embebido.
- Sin paginación en ningún listado.
- Sin límite de tamaño ni validación real de las imágenes: no se verifica el tipo MIME ni la
  firma del archivo, solo se confía en lo que envía el cliente.
- `HomeController` redirige a `/login`, una ruta que no existe en el backend.
- Sin identificadores de petición ni logs estructurados.
- Sin health check.
- Configuración sin validación al arranque.
- Un único test, `contextLoads`, sin cuerpo.

## 7. Base de datos

El esquema lo genera Hibernate con `ddl-auto=update`, también en producción. No hay migraciones
versionadas.

Estructura observada:

- `usuarios`: `foto_perfil` es `TEXT` con la imagen en base64.
- `camisetas`: `imagen_completa` e `imagen_recortada` son `LONGBLOB`.
- `camiseta_colores`: tabla de colección con clave foránea a `camisetas`.
- `shared_links`: **sin clave foránea** hacia `usuarios`, lo que permite enlaces huérfanos.

`GET /api/camisetas/{usuarioId}` devuelve la colección entera con las miniaturas embebidas en
base64, sin paginación ni carga diferida.

Los tokens para compartir se generan como `UUID.randomUUID().toString().substring(0, 8)`: 32
bits de entropía, susceptibles de fuerza bruta, y se almacenan en texto plano.

## 8. Producción

Ambos endpoints RDS (`sa-east-1` y `us-east-2`) ya no resuelven en DNS y el host EC2 declarado
en `vercel.json` no responde. La infraestructura fue dada de baja por falta de pago y los datos
no son recuperables, según se confirmó con el propietario del proyecto.

Otros hallazgos:

- CORS restringido a `http://localhost:3000` en el código.
- Sin cabeceras de seguridad.
- Sin backups ni procedimiento de restauración.
- Sin monitoreo ni registro centralizado.

## 9. Detalles de producto

- **Un único título de pestaña** para toda la aplicación: «Mi Coleccion Camisetas», idéntico en
  todas las rutas (verificado).
- **No existe página 404**: cualquier ruta desconocida redirige en silencio a la colección
  (verificado).
- **Un enlace compartido inválido no informa el error**: muestra «Colección de» con el nombre
  vacío y «0 Camisetas», y la carga nunca termina de estabilizarse (verificado).
- **Sin metadatos Open Graph ni Twitter Card**: compartir una colección no genera vista previa.
- `manifest.json` referencia `icono-chico.png` e `icono-grande.png`, que no existen en `public/`.
- Sin URL canónica ni `robots` diferenciado para las páginas públicas.

## 10. Inventario funcional a preservar

Funciones que la reconstrucción debe conservar:

1. Registro de usuario con verificación de disponibilidad de nombre y correo.
2. Inicio y cierre de sesión.
3. Perfil de usuario con foto, edición y borrado de cuenta.
4. Alta de camiseta con imagen completa y recorte.
5. Edición y borrado de camiseta.
6. Detalle de camiseta con navegación entre camisetas y descarga de imagen.
7. Búsqueda por texto libre.
8. Filtros por talle, club, país, colores, equipación, dorsal, tipo y liga.
9. Ordenamiento por club, país, liga, talle y temporada, ascendente y descendente.
10. Reordenamiento manual persistente de la grilla.
11. Estadísticas de la colección con gráficos y rankings.
12. Generación de enlace público para compartir la colección.
13. Vista pública de colección compartida con sus propios filtros y ordenamiento.

Funciones ausentes que la reconstrucción debe incorporar:

- Recuperación de contraseña.
- Cambio de contraseña.
- Página de error y estados vacíos con sentido.
- Metadatos sociales y títulos por página.
