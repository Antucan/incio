# 🧩 Chat App con WebSocket + React + Node.js

Una aplicación web de **chat en tiempo real** que utiliza **WebSockets** para comunicación instantánea, con un backend en Express y un frontend en React. Además, permite:

- Autenticación básica por email.
- Envío y visualización de mensajes en tiempo real.
- Subida y descarga de archivos `.txt`.
- Editor de notas con opción de guardar como archivo.

---

## 📁 Estructura del Proyecto

```
/client          → Aplicación React (frontend)
/server          → Servidor Node.js/Express (backend)
/uploads         → Carpeta donde se almacenan los archivos subidos
messages.json    → Historial de mensajes
data.json        → Usuarios permitidos
```

---

## 🚀 ¿Cómo ejecutar el proyecto?

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### 2. Instala las dependencias

#### 🔧 Backend

```bash
cd server
npm install
```

#### 🌐 Frontend

```bash
cd ../client
npm install
```

### 3. Inicia el servidor

```bash
cd ../server
node index.js
```

El servidor escuchará en `http://localhost:4000`.

### 4. Inicia la aplicación React

```bash
cd ../client
npm start
```

Se abrirá automáticamente en `http://localhost:3000`.

---

## 🧪 Funcionalidades

### ✅ Login

- Introduce tu email para iniciar sesión.
- Los emails válidos deben estar listados en `data.json`.

### 💬 Chat en Tiempo Real

- Envía mensajes que se transmiten a todos los usuarios conectados mediante WebSocket.
- Los mensajes se guardan automáticamente en `messages.json`.

### 📤 Subida de Archivos `.txt`

- Selecciona un archivo `.txt` y súbelo (máximo 1MB).
- Se almacenan en la carpeta `/uploads` y son accesibles para descarga.

### 📝 Guardar Notas

- Escribe texto en el área de notas y guárdalo como archivo `.txt`.

---

## 📎 Archivos importantes

- `server/index.js`: Configura endpoints REST, WebSocket y subida de archivos.
- `client/src/App.tsx`: Interfaz principal de usuario con React Hooks.
- `messages.json`: Registro de mensajes del chat.
- `data.json`: Lista de usuarios autorizados.
- `edit.json`: Registro de modificiaciones de los archivos en el textarea.
---

## 🔐 Requisitos

- Node.js ≥ 14
- npm
- React ≥ 17

---

## 💡 Extras

- Puedes modificar el archivo `data.json` para agregar más usuarios con su `email`, `nombre` y `id`.
- Los archivos subidos pueden descargarse desde la interfaz principal.

---

## 🛠️ Posibles mejoras

- Autenticación con contraseña.
- Historial visible de mensajes.
- Notificaciones de nuevos mensajes o archivos.
- Soporte para otros tipos de archivo.

---

¿Listo para empezar a chatear y colaborar en tiempo real? 🚀
