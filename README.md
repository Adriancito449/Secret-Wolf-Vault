

#  Wolf Vault: Destructible Zero-Knowledge Secret Sharing

GhostVault is a secure web application for sharing secrets (messages or files) that are **destroyed after the first read** or upon **time expiration**. It is built on a **Zero-Knowledge** architecture, ensuring the server never knows the content of the secret or the decryption key. 




---

## 🛠️ Project Structure

* **`server.js`**: The entry point for the Express server and database configuration.
* **`routes/secretRoutes.js`**: Contains all API routes (`/api/create`, `/api/verify`, `/api/read-and-burn`).
* **`public/`**: Contains all static files (HTML, JS, CSS) accessible to the client.

Once you upload this file to GitHub, you will have complete documentation for your project.

---

## ⚖️ License

This project is released under the [**MIT License**](LICENSE). Feel free to use and contribute!

---

## 🚀 How to Run the Project Locally

To start GhostVault on your machine, follow these simple steps:

### 1. Prerequisites

Make sure you have the following installed:

* **Node.js** (version 16 or higher)
* **MySQL** (or MariaDB)

### 2. Database Configuration

You need to create a database and a table to store the encrypted secrets:

1.  Create a database in MySQL (e.g., `ghost_vault_db`).
2.  Execute the following SQL code to create the `secrets` table:

```sql
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
);
````

### 3\. Environment Variables

Create a file named **`.env`** in the root of the project (the same folder as `server.js`) and add your MySQL credentials:

```
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=ghost_vault_db
DB_PORT=3306
```

### 4\. Installation and Execution

Run these commands in your terminal to install dependencies and start the server:

```bash
# Install dependencies (express, mysql2, dotenv, uuid, bcrypt, multer)
npm install

# Start the server
node server.js
```

The server will start at `http://localhost:3000`.

-----

## 🤝 Contribution Flow (Approval Required)

We welcome all contributions. To maintain code quality and security, **all changes must be reviewed and formally approved** by a maintainer via a **Pull Request (PR)**.

### 1\. Clone and Branch

Clone the project and create a specific branch for your task:

```bash
git clone [https://github.com/Adriancito449/Secret-Wolf-Vault.git](https://github.com/Adriancito449/Secret-Wolf-Vault.git)
cd Secret-Wolf-Vault
# Create a new branch for your feature
git checkout -b feature/your-change-name
```

### 2\. Write Code and Commit Changes

Make your changes and create descriptive commits:

```bash
git add .
git commit -m "feat: Describe your new functionality here"
```

### 3\. Propose the Change (Pull Request)

1.  Push your branch to your remote repository:
    ```bash
    git push origin feature/your-change-name
    ```
2.  Go to GitHub and create a **Pull Request (PR)** proposing to merge your branch into the `main` branch.
3.  **The change will be reviewed by a maintainer (Adriancito449).** Only after formal approval will the code be merged into the main project.

<!-- end list -->

