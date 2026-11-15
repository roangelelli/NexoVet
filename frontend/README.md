# NexoVet – Frontend

React + Vite + Tailwind CSS. Habla con la API del backend (`/api/...`) con el token JWT en cada pedido.

## Cómo correrlo

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

El backend debe estar corriendo (`npm run dev` en `backend/`, puerto 3000) y su `CORS_ORIGIN` debe ser `http://localhost:5173`.
Para apuntar a otra API, crear `.env` con `VITE_API_URL=https://...` (ver `.env.example`).

## Estructura

- `src/services/api.js`: único lugar que llama al backend (agrega el token, maneja errores).
- `src/context/AuthContext.jsx`: sesión y rol del usuario.
- `src/components/`: `RutaProtegida` (acceso por rol), `Layout` (menú según rol), `ui.jsx` (botón, campo, avisos, estados).
- `src/pages/`: una pantalla por archivo.
- `src/index.css`: colores y tipografías (`bg-mar`, `text-tinta`, `font-display`).
