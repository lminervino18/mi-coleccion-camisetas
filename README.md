# Backend para Inventario de Camisetas

Este es el backend del proyecto **Mi Colección de Camisetas**, desarrollado con **Spring Boot** y conectado a una base de datos MySQL. Su propósito es gestionar un inventario de camisetas de fútbol de manera eficiente y sencilla.

---

## **Características principales**

- API RESTful para gestionar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) relacionadas con el inventario.
- Integración con una base de datos relacional MySQL para almacenamiento persistente.
- Uso de Spring Data JPA para interacción con la base de datos.
- Configuración modular y lista para despliegue en cualquier entorno compatible con Java.

---

## **Requisitos previos**

### **Software necesario**

1. **Java Development Kit (JDK)**

   - Versión: 21 o superior
   - [Descargar e instalar JDK](https://www.oracle.com/java/technologies/javase-downloads.html)

2. **Maven**

   - Herramienta de gestión de dependencias.
   - Comando para instalar (en distribuciones Linux basadas en Debian):
     ```bash
     sudo apt install maven
     ```

3. **MySQL**
   - Configurado y en ejecución.
   - Usuario y base de datos creados previamente.

---

## **Configuración inicial**

1. **Clonar el repositorio:**

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd backend-coleccion-camisetas
   ```

2. **Configurar el archivo `application.properties`:**
   Ubicado en `src/main/resources/application.properties`.

   Asegúrate de configurar los datos de conexión a la base de datos:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/<nombre_base_datos>
   spring.datasource.username=<usuario_mysql>
   spring.datasource.password=<contraseña_mysql>
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```

3. **Construir el proyecto:**

   ```bash
   mvn clean install
   ```

4. **Ejecutar el backend:**
   ```bash
   mvn spring-boot:run
   ```

---

## **Endpoints disponibles**

| Método | Endpoint              | Descripción                       |
| ------ | --------------------- | --------------------------------- |
| GET    | `/api/camisetas`      | Obtener todas las camisetas.      |
| GET    | `/api/camisetas/{id}` | Obtener una camiseta por ID.      |
| POST   | `/api/camisetas`      | Crear una nueva camiseta.         |
| PUT    | `/api/camisetas/{id}` | Actualizar datos de una camiseta. |
| DELETE | `/api/camisetas/{id}` | Eliminar una camiseta por ID.     |

---

## **Estructura del proyecto**

El proyecto sigue la estructura estándar de Spring Boot:

```
backend-coleccion-camisetas/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/mi/coleccion/camisetas/
│   │   │       ├── controller/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       └── service/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   └── test/
├── pom.xml
└── README.md
```

---

## **Tecnologías utilizadas**

- **Java 21**: Lenguaje principal.
- **Spring Boot 3.4.1**: Framework para el desarrollo del backend.
- **MySQL**: Base de datos relacional para persistencia.
- **Maven**: Gestión de dependencias y construcción del proyecto.

---

## **Contribuciones**

¡Las contribuciones son bienvenidas! Si tienes ideas, correcciones o mejoras, por favor, abre un **issue** o envía un **pull request**.

---

## **Licencia**

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).
