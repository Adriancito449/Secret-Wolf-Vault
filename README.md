# 👻 GhostVault: Secreto Destructible Zero-Knowledge

GhostVault es una aplicación web segura para compartir secretos (mensajes o archivos) que se **destruyen después de la primera lectura** o al **expirar el tiempo**. Está construido bajo una arquitectura **Zero-Knowledge**, asegurando que el servidor nunca conozca el contenido del secreto ni la clave de descifrado.

# 🛠️ Estructura del Proyecto

server.js: Punto de entrada del servidor Express y configuración de la base de datos.

routes/secretRoutes.js: Contiene todas las rutas API (/api/create, /api/verify, /api/read-and-burn).

public/: Contiene todos los archivos estáticos (HTML, JS, CSS) accesibles al cliente.


Una vez que subas este archivo a GitHub, tendrás la documentación completa para tu proyecto.

---

# ⚖️ Licencia

Este proyecto está bajo la [**Licencia MIT**](LICENSE). ¡Siéntete libre de usar y contribuir!

---

# 🚀 Cómo Ejecutar el Proyecto Localmente

Para iniciar GhostVault en tu máquina, sigue estos sencillos pasos:

## 1. Requisitos Previos

Asegúrate de tener instalado:

* **Node.js** (versión 16 o superior)
* **MySQL** (o MariaDB)

## 2. Configuración de la Base de Datos

Necesitas crear una base de datos y una tabla para almacenar los secretos cifrados:

1.  Crea una base de datos en MySQL (ej. `ghost_vault_db`).
2.  Ejecuta el siguiente código SQL para crear la tabla `secrets`:


CREATE TABLE secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    message TEXT NOT NULL,
    password_hash VARCHAR(255),
    file_content LONGBLOB,
    file_mime_type VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


## 3. Variables de Entorno
Crea un archivo llamado .env en la raíz del proyecto (la misma carpeta que server.js) y añade tus credenciales de MySQL:

#### Configuración de la Base de Datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_DATABASE=ghost_vault_db
DB_PORT=3306

## 4. Instalación y Ejecución

Ejecuta estos comandos en tu terminal para instalar las dependencias e iniciar el servidor:
### Instalar dependencias (express, mysql2, dotenv, uuid, bcrypt, multer)
npm install
### Iniciar el servidor
node server.js

# 🤝 Flujo de Contribución (Requiere Aprobación)
Agradecemos cualquier contribución. Para mantener la calidad y seguridad del código, todos los cambios deben ser revisados y aprobados por un mantenedor a través de un Pull Request (PR).

## 1. Clonar y Ramificar
Clona el proyecto y crea una rama específica para tu tarea:

Bash

git clone [https://github.com/Adriancito449/Secret-Wolf-Vault.git](https://github.com/Adriancito449/Secret-Wolf-Vault.git)
cd Secret-Wolf-Vault
### Crea una nueva rama para tu feature
git checkout -b feature/nombre-de-tu-cambio
## 2. Escribir Código y Confirmar Cambios
Realiza tus cambios y haz commits descriptivos:

Bash

git add .
git commit -m "feat: Describe tu nueva funcionalidad aquí"
## 3. Proponer el Cambio (Pull Request)
Sube tu rama a tu repositorio remoto:

Bash

git push origin feature/nombre-de-tu-cambio
Ve a GitHub y crea un Pull Request (PR) proponiendo fusionar tu rama con la rama main.

El cambio será revisado por un mantenedor (Adriancito449). Solo después de la aprobación formal, el código será fusionado con el proyecto principal.
