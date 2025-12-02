
async function verifySecret() {
    const uuid = window.location.pathname.split('/').pop();
    const urlHash = window.location.hash;
    const resultDiv = document.getElementById('result-message');
    const decryptedSecretDiv = document.getElementById('decrypted-secret');

    // 1. Verificar la clave de cifrado (Zero-Knowledge)
    if (!urlHash.startsWith('#key=')) {
        resultDiv.style.color = 'red';
        resultDiv.textContent = '❌ Error: Falta la clave de descifrado en el enlace (Zero-Knowledge).';
        return;
    }
    const encryptionKey = urlHash.substring(5);

    document.getElementById('verifyForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        resultDiv.textContent = 'Verificando...';

        try {
            // 2. Enviar contraseña al servidor para verificación y destrucción
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 3. Descifrar el mensaje si la verificación fue exitosa
                const encryptedMessage = data.encryptedMessage;
                const bytes  = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
                const originalMessage = bytes.toString(CryptoJS.enc.Utf8);

                // 4. Mostrar y marcar como destruido
                resultDiv.style.color = 'green';
                resultDiv.textContent = '✅ Contraseña correcta. Secreto revelado y destruido.';
                
                decryptedSecretDiv.style.display = 'block';
                decryptedSecretDiv.innerHTML = `<strong>Mensaje:</strong> <pre>${originalMessage}</pre>`;

                // Lógica de archivo adjunto (copiada de read.html)
                const fileContainer = document.createElement('div');
                if (data.fileContent && data.fileMimeType) {
                    const fileUrl = `data:${data.fileMimeType};base64,${data.fileContent}`;
                    const link = document.createElement('a');
                    link.href = fileUrl;
                    const fileExtension = data.fileMimeType.split('/').pop().replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx');
                    link.download = `secreto-adjunto.${fileExtension}`;
                    link.textContent = '⬇️ Descargar Archivo Adjunto (¡Secreto Destruido!)';
                    link.style.display = 'block';
                    link.style.marginTop = '15px';
                    fileContainer.appendChild(link);
                }
                decryptedSecretDiv.appendChild(fileContainer);

                document.getElementById('verifyForm').style.display = 'none';

            } else {
                resultDiv.style.color = 'red';
                resultDiv.textContent = data.error || 'Error de verificación.';
            }

        } catch (error) {
            resultDiv.style.color = 'red';
            resultDiv.textContent = 'Error de red o servidor.';
        }
    });
}
verifySecret();
