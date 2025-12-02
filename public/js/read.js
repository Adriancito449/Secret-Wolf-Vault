// Función principal para leer y descifrar
async function readAndDecryptSecret() {
  const uuid = window.location.pathname.split("/").pop();
  const urlHash = window.location.hash;
  const errorDiv = document.getElementById("error-message");
  const secretContainer = document.getElementById("secret-container");
  const revealedMessageArea = document.getElementById("revealed-message");

  // 1. Verificar la clave de cifrado en el URL
  if (!urlHash.startsWith("#key=")) {
    errorDiv.textContent =
      "❌ Error: La clave de cifrado está faltando en el enlace. El secreto no puede ser descifrado.";
    return;
  }

  // Extraer la clave de cifrado (todo después de #key=)
  const encryptionKey = urlHash.substring(5);

  try {
    // 2. Petición para obtener el secreto CIFRADO y DESTRUIRLO (Zero-Knowledge)
    const response = await fetch("/api/read-and-burn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent =
        data.error || "Secreto no encontrado o error del servidor.";
      return;
    }

    // 3. Descifrar el mensaje (Lado del Cliente)
    const encryptedMessage = data.encryptedMessage;
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
    const originalMessage = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalMessage) {
      errorDiv.textContent =
        "❌ Error de descifrado. La clave o el mensaje son incorrectos.";
      return;
    }

    // 4. Lógica de archivo adjunto
    const fileContainer = document.getElementById("file-container");
    if (data.fileContent && data.fileMimeType) {
      // Crea la URL de datos (Base64) para la descarga
      const fileUrl = `data:${data.fileMimeType};base64,${data.fileContent}`;

      // Crea el enlace de descarga
      const link = document.createElement("a");
      link.href = fileUrl;
      const fileExtension = data.fileMimeType
        .split("/")
        .pop()
        .replace(
          "vnd.openxmlformats-officedocument.wordprocessingml.document",
          "docx"
        );
      link.download = `secreto-adjunto.${fileExtension}`; // Nombre sugerido
      link.textContent = "⬇️ Descargar Archivo Adjunto (¡Secreto Destruido!)";

      fileContainer.innerHTML = "";
      fileContainer.appendChild(link);
    }

    // 5. Mostrar el mensaje descifrado
    revealedMessageArea.value = originalMessage;
    secretContainer.style.display = "block";
  } catch (error) {
    console.error("Error en el proceso de lectura:", error);
    errorDiv.textContent = "Ocurrió un error al comunicarse con el servidor.";
  }
}

readAndDecryptSecret();
