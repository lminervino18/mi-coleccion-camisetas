# Mi Colección de Camisetas

**Mi Colección de Camisetas** es una aplicación web diseñada para gestionar un inventario personalizado de camisetas de fútbol. La plataforma permite a los usuarios almacenar y organizar su colección personal, con características como subir imágenes, añadir información detallada de cada camiseta y realizar consultas de manera eficiente.

## Tecnologías utilizadas

### Frontend

- **React**: Usado para construir una interfaz de usuario moderna y responsiva. React facilita la creación de componentes reutilizables que mejoran la experiencia del usuario.
- **CSS/Bootstrap**: Para estilizar y diseñar la interfaz.

### Backend

- **Spring Boot**: Un framework robusto de Java que permite construir aplicaciones backend escalables y seguras.
- **Maven**: Para gestionar las dependencias del proyecto y simplificar la construcción del backend.

### Base de datos

- **MySQL**: Base de datos relacional utilizada para almacenar la información de los usuarios y sus camisetas.

---

## Funcionalidades principales

### Usuarios

Cada usuario tiene su propia cuenta con:

- Nombre de usuario
- Contraseña (encriptada para mayor seguridad)
- Foto de perfil

### Colección de camisetas

Cada usuario puede gestionar su propia colección de camisetas, añadiendo detalles como:

- Imagen de la camiseta
- Club al que pertenece
- País de origen
- Número/dorsal de la camiseta
- Talle (S, M, L, etc.)
- Número de equipación (primera, segunda, tercera, etc.)
- Comentarios adicionales

---

## Estructura general de la aplicación

### Frontend

El frontend está desarrollado en React y permite a los usuarios:

1. Registrarse y autenticarse.
2. Subir imágenes y detalles de sus camisetas.
3. Visualizar, editar o eliminar camisetas de su colección.

### Backend

El backend está desarrollado en Spring Boot y provee una API REST para:

1. Gestión de usuarios (registro, autenticación y perfil).
2. Operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para las camisetas.

### Base de datos

El modelo de la base de datos asegura que cada usuario tenga una colección única. Aquí está la estructura simplificada:

- **Usuarios**:

  - ID (clave primaria)
  - Nombre
  - Contraseña (hashed)
  - Foto de perfil

- **Camisetas**:
  - ID (clave primaria)
  - UsuarioID (clave foránea)
  - Imagen
  - Club
  - País
  - Dorsal
  - Talle
  - Número de equipación
  - Comentarios extra

---
