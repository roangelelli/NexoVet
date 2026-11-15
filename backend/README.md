# Backend de NexoVet

API REST en Node.js + Express que usa MySQL. Se organiza en capas: `routes` → `controllers` → `services` → `models`, más `middlewares` para autenticación, roles y validaciones.

## Cómo ejecutarlo

1. Copiar `.env.example` como `.env` y completar los datos (base de datos de Aiven, ruta del certificado `ca.pem`, `JWT_SECRET` y, para las imágenes, las tres claves de Cloudinary). El `.env` no se sube al repositorio.
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
| `GET /api/turnos?fecha=&estado=&mascota_id=` | Con sesión | Lista turnos (el cliente ve solo los suyos) |
| `POST /api/turnos` | Con sesión | Pide un turno en una franja libre (`mascota_id`, `fecha`, `hora`, `motivo`) |
| `GET /api/turnos/:id` | Personal, o el dueño | Ver un turno |
| `PATCH /api/turnos/:id/confirmar` | Personal | solicitado → confirmado |
| `PATCH /api/turnos/:id/atender` | Personal | confirmado → atendido |
| `PATCH /api/turnos/:id/cancelar` | Personal, o el dueño | solicitado o confirmado → cancelado (libera la franja) |
| `GET /api/atenciones?mascota_id=` | Personal, o el dueño | Historia clínica de una mascota |
| `GET /api/atenciones/:id` | Personal, o el dueño | Una atención con sus imágenes |
| `POST /api/atenciones` | Veterinario | Registra una atención; si trae `turno_id`, el turno pasa a atendido |
| `PUT /api/atenciones/:id` | Veterinario | Corrige una atención (cualquier veterinario) |
| `GET /api/vacunas?mascota_id=` | Personal, o el dueño | Carnet de vacunas con próxima fecha y estado |
| `POST /api/vacunas` | Veterinario | Registra una vacuna aplicada |
| `PUT /api/vacunas/:id` | Veterinario | Corrige una vacuna cargada |
| `GET /api/imagenes/firma` | Veterinario | Datos firmados para subir una imagen directo a Cloudinary |
| `POST /api/imagenes` | Veterinario | Guarda la URL de una imagen ya subida a una atención |
| `DELETE /api/imagenes/:id` | Veterinario | Quita una imagen de la atención |
| `GET /api/reportes/turnos-del-dia?fecha=` | Personal | Turnos de un día (hoy si no se indica) con el total por estado |
| `GET /api/reportes/vacunas-por-vencer?dias=` | Personal | Vacunas vencidas o que vencen en los próximos días (30 por defecto) |

Los errores siempre tienen el formato `{ "error": "mensaje" }`.

## Estados de un turno

`solicitado` → `confirmado` → `atendido`, y `cancelado` desde solicitado o confirmado. Un turno cancelado libera la franja. Una franja admite un único turno: el backend revisa que esté libre y la base lo garantiza con una restricción única.

## Estado de las vacunas

La próxima fecha se calcula (fecha de aplicación + intervalo del tipo de vacuna). Estado: `vencida` (ya pasó), `por_vencer` (vence en los próximos 30 días) o `vigente`. Las vacunas de dosis única no vencen. El estado se calcula solo para la última aplicación de cada vacuna; las anteriores figuran como `anterior`.

## Imágenes (Cloudinary)

El navegador sube la imagen directo a Cloudinary con los datos firmados que da `GET /api/imagenes/firma` (el secreto no sale del backend) y después manda la URL a `POST /api/imagenes`. Variables necesarias en el `.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`.
