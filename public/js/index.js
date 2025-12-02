document.getElementById('secretForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const message = document.getElementById('message').value;
    // 🚨 ERROR 1 CORREGIDO: Debes obtener la contraseña y el archivo
    const password = document.getElementById('password').value;
    const attachment = document.getElementById('attachment').files[0];

    const resultDiv = document.getElementById('result-link');
    const secretLink = document.getElementById('secretLink');

    // 🚨 ERROR 2 CORREGIDO: Zero-Knowledge - Generar clave y cifrar mensaje
    const encryptionKey = CryptoJS.lib.WordArray.random(16).toString();
    const encryptedMessage = CryptoJS.AES.encrypt(message, encryptionKey).toString();

    // Creación del cuerpo de la petición (FormData)
    const formData = new FormData();
    formData.append('message', encryptedMessage); // Mensaje cifrado
    formData.append('password', password);
    if (attachment) {
        formData.append('attachment', attachment, attachment.name); // Archivo binario con nombre
    }

    try {
        // 1. Envía los datos al servidor
        const response = await fetch('/api/create', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // 2. Muestra el enlace generado
            // ✅ CORRECCIÓN FINAL: Se adjunta la clave al fragmento (#key=)
            const fullLink = `${window.location.origin}/secret/${data.uuid}#key=${encryptionKey}`;

            secretLink.href = fullLink;
            secretLink.textContent = fullLink;
            resultDiv.style.display = 'block';

            // Limpiar formulario
            document.getElementById('secretForm').reset();

        } else {
            alert('Error al crear el secreto: ' + (data.error || 'Error desconocido.'));
        }

    } catch (error) {
        console.error('Error de red:', error);
        alert('Ocurrió un error al intentar comunicarse con el servidor.');
    }
});