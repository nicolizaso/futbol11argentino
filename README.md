# Fútbol 11 Argentino 🎮⚽

Proyecto web interactivo de trivia futbolera con múltiples juegos, basado en equipos, jugadores y cultura futbolística de Argentina.

---

## 🚀 Tecnologías

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Base de Datos:** Firebase Firestore
- **PWA:** Vite Plugin PWA para soporte offline e instalación

---

## 🛠️ Instalación y Ejecución

1. **Clonar el repositorio**
2. **Instalar dependencias**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. **Configurar Variables de Entorno**
   - Crear `.env` en `client` con las credenciales de Firebase.
   - Crear `.env` en `server` con el puerto (opcional).

4. **Desarrollo Local**
   - Frontend: `cd client && npm run dev`
   - Backend: `cd server && node index.js`

5. **Build para Producción**
   ```bash
   cd client && npm run build
   # Los archivos se generarán en client/dist y deben ser copiados a server/public
   cp -r client/dist/* server/public/
   cd ../server && node index.js
   ```

---

## 📱 PWA

La aplicación es instalable en dispositivos móviles y de escritorio. Los assets estáticos se cachean para mejorar la performance.

---

## ✒️ Autor

Nicolás Lizaso
Carrera de Diseño y Programación Web - Tesis Final
Reimaginado por Jules como Full Stack PWA.
