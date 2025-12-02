// routes/secretRoutes.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid'; // Importación específica para uuid
import bcrypt from 'bcrypt';
import multer from 'multer';

const router = express.Router();
const saltRounds = 10; 

let pool;
export function initializeSecretRoutes(dbPool) {
    pool = dbPool;
}

// -----------------------------------------------------
// CONFIGURACIÓN DE MULTER
// -----------------------------------------------------
const storage = multer.memoryStorage(); // Almacenar el archivo en memoria (Buffer)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// -----------------------------------------------------------------
// 1. Ruta para crear un nuevo secreto (Zero-Knowledge)
// -----------------------------------------------------------------
router.post('/api/create', upload.single('attachment'), async (req, res) => {
    const { message, password } = req.body; // message ahora es el mensaje cifrado

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'El mensaje secreto es obligatorio.' });
    }

    try {
        const secretUuid = uuidv4(); 
        let passwordHash = null;

        // 💾 Manejo de Archivos (si existe)
        const fileContent = req.file ? req.file.buffer : null; // Buffer binario
        const fileMimeType = req.file ? req.file.mimetype : null; // Tipo de archivo

        // Hashing de Contraseña
        if (password && password.trim() !== '') {
            passwordHash = await bcrypt.hash(password, saltRounds);
        }
        
        // Cálculo de caducidad (1 hora)
        const oneHourInMs = 60 * 60 * 1000; 
        const expiryDate = new Date(Date.now() + oneHourInMs);
        
        // Inserción en Base de Datos
        const query = `
            INSERT INTO secrets (uuid, message, password_hash, expires_at, file_content, file_mime_type)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const [result] = await pool.query(query, [secretUuid, message, passwordHash, expiryDate, fileContent, fileMimeType]);

        res.status(201).json({ 
            message: 'Secreto guardado exitosamente.', 
            uuid: secretUuid 
        });

    } catch (error) {
        console.error('Error al guardar el secreto/archivo en la DB:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'El archivo es demasiado grande. El límite es 5MB.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al crear el secreto.' });
    }
});

// -----------------------------------------------------------------
// 2. Ruta para mostrar la interfaz de lectura (Frontend Zero-Knowledge)
// -----------------------------------------------------------------
router.get('/secret/:uuid', async (req, res) => {
    const secretUuid = req.params.uuid;
    try {
        const [secrets] = await pool.query(
            'SELECT password_hash FROM secrets WHERE uuid = ?',
            [secretUuid]
        );
        const secret = secrets[0];
        
        if (!secret) {
            return res.status(404).send('<h1>🚫 Secreto no encontrado</h1>');
        }
        
        if (secret.password_hash) {
            return res.redirect(`/verify/${secretUuid}`);
        }
        
        // __dirname no funciona en Módulos ES, usamos process.cwd()
        res.sendFile(process.cwd() + '/public/read.html'); 

    } catch (error) {
        console.error('Error al verificar secreto para lectura:', error);
        res.status(500).send('<h1>Error del Servidor</h1>');
    }
});

// -----------------------------------------------------------------
// 3. Ruta de interfaz para pedir la contraseña
// -----------------------------------------------------------------
router.get('/verify/:uuid', (req, res) => {
    res.sendFile(process.cwd() + '/public/verify.html'); 
});


// -----------------------------------------------------------------
// 4. Ruta para verificar la contraseña y liberar/destruir el secreto
// -----------------------------------------------------------------
router.post('/api/verify', async (req, res) => {
    const { uuid, password } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [secrets] = await connection.query(
            'SELECT message, password_hash, file_content, file_mime_type FROM secrets WHERE uuid = ?',
            [uuid]
        );
        const secret = secrets[0];

        if (!secret) {
            await connection.commit();
            return res.status(404).json({ error: 'Secreto no encontrado o ya destruido.' });
        }

        const isMatch = await bcrypt.compare(password, secret.password_hash);

        if (!isMatch) {
            await connection.rollback(); 
            return res.status(401).json({ error: 'Contraseña incorrecta. Inténtalo de nuevo.' });
        }

        // Contraseña Correcta: Lógica "Burn-on-Read"
        await connection.query('DELETE FROM secrets WHERE uuid = ?', [uuid]);
        await connection.commit();

        res.status(200).json({ 
            encryptedMessage: secret.message,
            // El Buffer binario debe convertirse a Base64 para enviarlo en JSON
            fileContent: secret.file_content ? secret.file_content.toString('base64') : null, 
            fileMimeType: secret.file_mime_type,
            success: true
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error durante la verificación y destrucción:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});


// -----------------------------------------------------------------
// 5. Ruta para obtener y destruir un secreto NO protegido (Zero-Knowledge)
// -----------------------------------------------------------------
router.post('/api/read-and-burn', async (req, res) => {
    const { uuid } = req.body;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [secrets] = await connection.query(
            'SELECT message, password_hash FROM secrets WHERE uuid = ?',
            [uuid]
        );
        const secret = secrets[0];

        if (!secret || secret.password_hash) {
            await connection.rollback();
            return res.status(404).json({ error: 'Secreto no encontrado o acceso no autorizado.' });
        }

        // Lógica "Burn-on-Read"
        await connection.query('DELETE FROM secrets WHERE uuid = ?', [uuid]);
        await connection.commit();

        // Devolver el mensaje CIFRADO
        res.status(200).json({ 
            encryptedMessage: secret.message,
            success: true
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error durante la destrucción y lectura:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
});


export {router};