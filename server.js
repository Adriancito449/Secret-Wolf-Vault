// server.js

import express from 'express';
// Nota: Importamos mysql de esta forma para poder acceder a .createPool
import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';
// La sintaxis 'require' no funciona, por lo que usamos 'import' y accedemos a 'router' e 'initializeSecretRoutes'
import { router as secretRouter, initializeSecretRoutes } from './routes/secretRoutes.js'; 
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json()); 
app.use(express.static('public'));


// 2. Configuración y Conexión a la Base de Datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
};

let pool;
try {
    // Ya que importamos mysql, accedemos directamente a la función
    pool = mysql.createPool(dbConfig); 
    console.log('✅ Pool de conexiones a MySQL creado exitosamente.');
} catch (error) {
    console.error('❌ Error al crear el pool de conexiones a MySQL:', error);
    process.exit(1); 
}

// 3. Inicializar las rutas y pasar la conexión
initializeSecretRoutes(pool);

// 4. Usar el router para todas las rutas definidas
app.use('/', secretRouter); 

// -----------------------------------------------------
// 5. Tarea de Limpieza (Temporalización de Caducidad)
// -----------------------------------------------------

// Función para eliminar secretos caducados
async function cleanupExpiredSecrets() {
    try {
        const query = `
            DELETE FROM secrets
            WHERE expires_at < NOW() AND is_read = FALSE;
        `;
        
        const [result] = await pool.query(query);
        
        if (result.affectedRows > 0) {
            console.log(`🧹 Tarea de limpieza: Eliminados ${result.affectedRows} secretos caducados.`);
        }
    } catch (error) {
        console.error('❌ Error en la tarea de limpieza de secretos caducados:', error);
    }
}

const cleanupInterval = 5 * 60 * 1000; 

// Inicia la tarea de limpieza inmediatamente al arrancar y programa repetición
cleanupExpiredSecrets(); 
setInterval(cleanupExpiredSecrets, cleanupInterval); 


// 6. Iniciar el Servidor
app.listen(port, () => {
    console.log(`🚀 Servidor GhostVault escuchando en http://localhost:${port}`);
});