# Backend de NexoVet

API REST en Node.js + Express que usa MySQL. Se organiza en capas: `routes` → `controllers` → `services` → `models`, más `middlewares` para autenticación, roles y validaciones.

## Cómo ejecutarlo

1. Copiar `.env.example` como `.env` y completar los datos (base de datos de Aiven, ruta del certificado `ca.pem` y `JWT_SECRET`). El `.env` no se sube al repositorio.
2. Instalar y arrancar:

```bash
npm install
npm run dev
```

3. Probar que funciona: `http://localhost:3000/api/health` debe responder `"base_de_datos":"ok"`.

## Endpoints

Todos devuelven JSON. Salvo `login`, `registro` y `health`, hay que enviar el token en el header `Authorization: Bearer <token>`.
"Personal" = rol Recepción o Veterinario.

| Método y ruta | Quién puede | Qué hace |
|---|---|---|
| `GET /api/health` | Todos | Verifica la API y la conexión a la base |
| `POST /api/auth/login` | Todos | Inicia sesión y devuelve el token |
| `POST /api/auth/registro` | Todos | El cliente se registra solo |
| `GET /api/auth/me` | Con sesión | Datos del usuario logueado |
| `GET /api/usuarios/personal` | Personal | Lista del personal (solo lectura) |
| `GET /api/catalogos/especies` | Con sesión | Lista de especies |
| `GET /api/catalogos/razas?especie_id=` | Con sesión | Razas (se puede filtrar por especie) |
| `GET /api/catalogos/tipos-vacuna` | Con sesión | Tipos de vacuna y desparasitación |
| `GET /api/clientes?buscar=` | Personal | Lista y busca clientes |
| `POST /api/clientes` | Personal | Alta de un cliente |
| `GET /api/clientes/:id` | Personal, o el propio cliente | Ver un cliente |
| `PUT /api/clientes/:id` | Personal, o el propio cliente | Editar nombre, apellido y teléfono |
| `DELETE /api/clientes/:id` | Personal | Baja lógica del cliente |
| `GET /api/mascotas?cliente_id=&buscar=` | Con sesión | Lista mascotas (el cliente ve solo las suyas) |
| `POST /api/mascotas` | Con sesión | Alta (el cliente la crea para sí; el personal indica `cliente_id`) |
| `GET /api/mascotas/:id` | Personal, o el dueño | Ver una mascota |
| `PUT /api/mascotas/:id` | Personal, o el dueño | Editar una mascota |
| `DELETE /api/mascotas/:id` | Personal, o el dueño | Baja lógica de la mascota |
| `GET /api/disponibilidad/franjas?fecha=AAAA-MM-DD` | Con sesión | Franjas libres de un día (se calculan, no se guardan) |
| `GET /api/disponibilidad` | Personal | Duración del turno, tramos y días bloqueados |
| `PUT /api/disponibilidad/duracion` | Personal | Cambia la duración del turno (10 a 120 min) |
| `POST /api/disponibilidad/tramos` | Personal | Agrega un tramo horario de un día de la semana |
| `DELETE /api/disponibilidad/tramos/:id` | Personal | Quita un tramo |
| `POST /api/disponibilidad/dias-bloqueados` | Personal | Bloquea un día (feriado, cierre) |
| `DELETE /api/disponibilidad/dias-bloqueados/:id` | Personal | Desbloquea un día |

Los errores siempre tienen el formato `{ "error": "mensaje" }`.
