Mi Colección de Camisetas

Mi Colección de Camisetas es una aplicación web para gestionar un inventario de camisetas de fútbol. Permite agregar, visualizar, editar y eliminar camisetas con información detallada como equipo, talla, tipo y stock disponible.

Tecnologías Utilizadas

Frontend

Framework: React

Librerías:

Axios (para llamadas HTTP)

React Router DOM (para manejo de rutas)

Backend

Framework: Spring Boot

Lenguaje: Java

Dependencias:

Spring Web

Spring Data JPA

MySQL Driver

Base de Datos

Sistema: MySQL

Estructura: Una tabla para almacenar información de camisetas.

Características Principales

Agregar Camisetas: Permite registrar una nueva camiseta en el inventario.

Listar Camisetas: Visualiza todas las camisetas registradas en el sistema.

Editar Camisetas: Modifica la información de una camiseta existente.

Eliminar Camisetas: Borra camisetas del inventario.

Requisitos Previos

Frontend

Node.js v16 o superior

npm (administrador de paquetes de Node.js)

Backend

Java 17 o superior

Maven (gestor de dependencias para Java)

MySQL Server

Instalación y Configuración

1. Clonar el Repositorio

git clone https://github.com/tu-usuario/mi-coleccion-camisetas.git
cd mi-coleccion-camisetas

2. Configurar el Backend

Ve a la carpeta del backend:

cd backend

Configura la conexión a la base de datos en src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/camisetas_db
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

Ejecuta el backend:

./mvnw spring-boot:run

3. Configurar el Frontend

Ve a la carpeta del frontend:

cd frontend

Instala las dependencias:

npm install

Inicia el servidor de desarrollo:

npm start

4. Probar la Aplicación

El backend estará disponible en http://localhost:8080.

El frontend estará disponible en http://localhost:3000.

Contribución

Realiza un fork del repositorio.

Crea una rama nueva para tus cambios:

git checkout -b mi-nueva-funcionalidad

Haz tus cambios y realiza commits:

git commit -m "Agrega mi nueva funcionalidad"

Envía un pull request.

Licencia

Este proyecto está bajo la licencia MIT. Puedes ver más detalles en el archivo LICENSE.

Autor

Creado por lminervino18.
