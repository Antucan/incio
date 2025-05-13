const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Middleware de express-fileupload
app.use(fileUpload());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket solo para emitir mensajes con usuario y hora
wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// Enpoint de login
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email vacío" });

  const dataPath = path.join(__dirname, "data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const user = data.usuarios.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  res.json({ user });
});

// Endpoint para subir archivos
app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No se subió ningún archivo.");
  }

  let archivo = req.files.archivo;

  // **Validación del tamaño del archivo (máximo 1MB = 1048576 bytes)**
  if (archivo.size > 1048576) {
    return res.status(400).send("El archivo es demasiado grande. Máximo permitido: 1MB.");
  }

  // **Validación del tipo de archivo**
  const extensionesPermitidas = ["text/plain"];
  if (!extensionesPermitidas.includes(archivo.mimetype)) {
    return res.status(400).send("Formato de archivo no permitido. Solo se acepta .txt");
  }

  // Ruta de almacenamiento
  const uploadPath = path.join(__dirname, "uploads", archivo.name);

  // Guardar archivo
  archivo.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send("Archivo subido correctamente.");
  });

});

// Endpoint para obtener lista de archivos
app.get("/files", (req, res) => {
  const uploadDir = path.join(__dirname, "uploads");

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send("Error al leer la carpeta de archivos.");
    }
    res.json(files);
  });
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Endpoint para enviar mensaje a todos los WebSocket conectados
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  if (!message) { return res.status(400).json({ error: "Mensaje vacío" }); }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  res.json({ sent: true });
});

// Endpoint para guardar texto como archivo
app.post("/save-text", (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).send("Faltan datos: filename o content.");
  }

  const uploadPath = path.join(__dirname, "uploads", `${filename}.txt`);

  fs.writeFile(uploadPath, content, (err) => {
    if (err) {
      return res.status(500).send("Error al guardar el archivo.");
    }
    res.send("Archivo guardado correctamente.");
  });
});

