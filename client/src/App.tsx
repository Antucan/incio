import React, { useEffect, useState } from "react";
import "./Upload.css";


const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

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
    const extensionesPermitidas = ["application/pdf", "image/jpeg", "image/png"];
    if (!extensionesPermitidas.includes(file.type)) {
      alert("Formato de archivo no permitido. Solo se aceptan .pdf, .jpg y .png.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", file);

    const response = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    alert(result);
  };


  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => console.log("Conectado al WebSocket");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const sendMessage = async () => {
    if (!input) return;
    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    setInput("");
  };

  return (
    <div>
      <h1>Chat REST → WebSocket</h1>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje" />
      <button onClick={sendMessage}>Enviar</button>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <hr />
      <div>
        <div className="upload-container">
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Subir archivo</button>
        </div>
      </div>
    </div>
  );
};

export default App;
