import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<{ id: string; nombre: string; email: string } | null>(null);
  const [email, setEmail] = useState("");

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

  const sendMessage = async () => {
    if (!input) return;

    await fetch("http://localhost:4000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    setInput("");
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
    <div>
      <h1>Chat REST → WebSocket</h1>
      <p>Bienvenido, {user.nombre}</p>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe un mensaje" />
      <button onClick={sendMessage}>Enviar</button>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{user.nombre}: {msg}</p>
        ))}
      </div>
    </div>
  );
};

export default App;