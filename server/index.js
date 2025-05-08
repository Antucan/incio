const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
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

// WebSocket solo para emitir mensajes
wss.on("connection", (ws) => {
  console.log("Cliente conectado");
  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
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
  const extensionesPermitidas = ["application/pdf", "image/jpeg", "image/png"];
  if (!extensionesPermitidas.includes(archivo.mimetype)) {
    return res.status(400).send("Formato de archivo no permitido. Solo se aceptan .pdf, .jpg y .png.");
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

// Endpoint para enviar mensaje a todos los WebSocket conectados
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  res.json({ sent: true });
});

server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

