import React, { useEffect, useState } from "react";
import "./Upload.css";
import "./App.css";

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{ id: string; nombre: string; email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [textareaContent, setTextareaContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState("");

  // función para cargar el contenido del archivo en el textarea
  const handlePutText = async (fileName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/download/${fileName}`);
      const text = await response.text();
      setTextareaContent(text);
    } catch (error) {
      console.error("Error al obtener el archivo:", error);
      alert("No se pudo cargar el contenido del archivo.");
    }
  };

  // función para enviar al servidor la modificación del archivo
  const handleEdit = async (fileName: string) => {
    if (!user || !fileName || !textareaContent) {
      alert("Falta información para guardar la edición.");
      return;
    }
  
    await fetch("http://localhost:4000/api/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: user.nombre,
        fileName,
        content: textareaContent,
      }),
    });
  
    alert("Edición guardada correctamente.");
  };
  

  // función para guardar el contenido del textarea en un archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // función para subir el archivo al servidor
  const handleUpload = async () => {
    if (!file) {
      alert("Selecciona un archivo primero.");
      return;
    }

    // **Validación del tamaño (máximo 1MB)**
    if (file.size > 1048576) {
      alert("El archivo es demasiado grande. Máximo permitido: 1MB.");
      return;
    }

    // **Validación del tipo de archivo**
    const extensionesPermitidas = ["text/plain"];
    if (!extensionesPermitidas.includes(file.type)) {
      alert("Formato de archivo no permitido. Solo se acepta texto plano.");
      return;
    }

    // **Validación del nombre del archivo**
    const formData = new FormData();
    formData.append("archivo", file);

    // **Envío del archivo al servidor**
    const response = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    });

    // **Manejo de errores**
    const result = await response.text();
    alert(result);
    fetchFiles();
  };

  // **Conexión al WebSocket**
  useEffect(() => {
    if (user) {
      const ws = new WebSocket("ws://localhost:4000");

      ws.onopen = () => console.log("Conectado al WebSocket");
      ws.onmessage = (event) => {
        setMessages((prev) => [...prev, event.data]);
      };

      setSocket(ws);
      return () => ws.close();
    }
  }, [user]);

  // **Función para obtener la lista de archivos**
  const [files, setFiles] = useState<string[]>([]);

  // **Función para obtener la lista de archivos del servidor**
  const fetchFiles = async () => {
    const response = await fetch("http://localhost:4000/files");
    const data = await response.json();
    setFiles(data);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // **Función para iniciar sesión**
  const handleLogin = async () => {
    if (!email) return;
    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Usuario no encontrado");
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
  };

  // **Función para enviar mensajes al servidor**
  const sendMessage = async () => {
    if (!input || !user) return;

    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, userName: user.nombre }),
    });

    setInput("");
  };

  // **Función para guardar el contenido del textarea en un archivo**
  const handleSaveText = async () => {
    if (!textareaContent) {
      alert("El textarea está vacío.");
      return;
    }
  
    const filename = prompt("Introduce el nombre del archivo (sin extensión):");
    if (!filename) {
      alert("Debes proporcionar un nombre para el archivo.");
      return;
    }
  
    const formattedFilename = `${filename}.txt`;
  
    const response = await fetch("http://localhost:4000/save-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content: textareaContent }),
    });
  
    const result = await response.text();
    alert(result);
  
    // **Registrar edición directamente con el nombre del nuevo archivo**
    handleEdit(formattedFilename);
  
    // **Actualizar lista de archivos**
    fetchFiles();
  };
  

  if (!user) {
    return (
      <div>
        <h1>Iniciar Sesión</h1>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Introduce tu email"
        />
        <button onClick={handleLogin}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 3, padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h2>Chat REST → WebSocket</h2>
        <p>Bienvenido, {user.nombre}</p>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje" />
        <button onClick={sendMessage}>Enviar</button>
        <div style={{
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
          flexDirection: "column"
        }}>
          <div
            style={{
              height: "300px", // Altura fija
              width: "300px", // Ancho completo
              overflowY: "auto", // Habilitar scroll vertical
              border: "1px solid #ccc", // Borde para delimitar la caja
              padding: "10px", // Espaciado interno
              borderRadius: "5px", // Bordes redondeados
            }}>
            {messages.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        </div>
        <hr />
        <div>
          <h3>Archivos Subidos</h3>
          <div className="file-list">
            {files.map((file, index) => (
              <a
                key={index}
                className="file-item"
                href={`http://localhost:4000/download/${file}`}
                download={file}
              >
                {file}
              </a>
            ))}
          </div>
        </div>
        <hr />
        <div>
          <div className="upload-container">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Subir archivo</button>
          </div>
        </div>

      </div>
      {/* Textarea Section */}
      <div style={{ flex: 1, padding: "1rem" }} className="textarea-container">
        <h2>Notas</h2>
        <textarea
          style={{ width: "500px", height: "70%" }}
          placeholder="Escribe tus notas aquí..."
          value={textareaContent}
          onChange={(e) => setTextareaContent(e.target.value)}
        ></textarea>
        <button className="button-textarea" onClick={handleSaveText}>Guardar texto</button>
        <div>
          <h3>Seleccionar archivo</h3>
          <select onChange={(e) => setSelectedFile(e.target.value)}>
            <option value="">Selecciona un archivo...</option>
            {files.map((file, index) => (
              <option key={index} value={file}>{file}</option>
            ))}
          </select>
          <button className="button-textarea" onClick={() => handlePutText(selectedFile)}>
            Cargar contenido</button>
        </div>
      </div>
    </div>
  );
};

export default App;