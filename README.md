# NexoVet - Sistema Integral de Gestión Veterinaria

Aplicación web para la gestión integral de una veterinaria que, además, ofrece a
los dueños de mascotas un canal de autogestión para solicitar turnos y consultar
la historia clínica de sus animales.

El sistema conecta dos perfiles de uso sobre una misma base de datos y una misma
API: el **personal de la veterinaria** (gestión interna) y el **cliente**
(acceso desde el navegador del celular, sin instalar nada).

---

## Enlaces y entregables

| Qué | Dónde |
|-----|-------|
| **Aplicación en línea (frontend)** | https://nexo-vet.vercel.app |
| **API en línea (backend)** | https://nexovet-api.onrender.com — estado en [`/api/health`](https://nexovet-api.onrender.com/api/health) |
| **Informe final (PDF)** | [`docs/Informe_Final_NexoVet.pdf`](docs/Informe_Final_NexoVet.pdf) |
| **Video explicativo** | [pendiente] |
| **Repositorio** | https://github.com/roangelelli/NexoVet |

> La API y la base de datos están en planes gratuitos: si estuvieron un rato sin
uso, el primer pedido (por ejemplo, el inicio de sesión) puede tardar hasta un
minuto en responder mientras los servicios se reactivan.

---

## Equipo y contexto académico

**Trabajo Final Integrador (TFI)**
*Tecnicatura Universitaria en Programación a Distancia (TUPaD)*
*Universidad Tecnológica Nacional (UTN)*

**Integrantes**
- Angelelli, Rodrigo Martín
- Schneider, Astrid Elizabeth

**Tutora**
- María Candela Grosso

---

## Descripción

Muchas veterinarias gestionan turnos e historias clínicas de forma manual, con
agendas de papel o planillas. Esto genera turnos superpuestos, información
difícil de recuperar e historias clínicas incompletas. Del lado del cliente, no
hay forma cómoda de pedir un turno ni de consultar el historial médico de su
mascota.

NexoVet digitaliza la operación de la veterinaria y, al mismo tiempo, le da al
dueño de la mascota una vía de autogestión, sobre una arquitectura de tres capas
(frontend, API y base de datos relacional) con vistas diferenciadas según el rol
de quien inicia sesión.

---

## Alcance y MVP

El **MVP** es el conjunto de funcionalidades indispensables para cumplir el objetivo de punta a punta: que la veterinaria
digitalice su gestión y que el cliente pueda autogestionarse. Los módulos se
priorizaron en tres niveles. **En la versión entregada están implementados el núcleo y
los tres módulos secundarios**; lo que quedó fuera es lo listado en «Fuera del alcance».

### Núcleo indispensable

Es el flujo mínimo completo y representa el corazón del sistema, el cual logra el objetivo inicial:

1. El personal da de alta clientes y sus mascotas o el cliente puede auto-registrarse.
2. El personal configura la **disponibilidad** (días, franjas horarias y duración del turno).
3. El **cliente** solicita un turno eligiendo una de las franjas libres que el sistema calcula automáticamente.
4. **Recepción** confirma el turno.
5. El **Veterinario** atiende y registra la **historia clínica** de esa atención.

Módulos que lo componen: **Usuarios y roles, Clientes, Mascotas, Disponibilidad,
Turnos e Historia clínica**. Con esto, el objetivo del proyecto ya se cumple.

### Módulos secundarios (versión mínima)

Aportan valor, pero el sistema funciona sin ellos. Se desarrollaron una vez
terminado el núcleo y **están implementados**:

- **Vacunas:** listado por mascota con fecha de aplicación y próxima fecha calculada, con estado derivado (vigente, por vencer, vencida).
- **Imágenes en la historia clínica:** adjuntar fotos o radiografías a cada atención.
- **Reportes básicos:** consultas de apoyo, como los turnos del día y un resumen del período.

### Fuera del alcance (mejoras futuras)

Se excluyen deliberadamente de esta versión para garantizar la viabilidad: pagos en línea, envío de correos, notificaciones y recordatorios automáticos,
instalación de la app desde el navegador (PWA), reprogramación automática de turnos, mensajería o chat interno, asistentes con
inteligencia artificial, integración con controladores fiscales, disponibilidad
por profesional, gestión de cuentas del personal desde la app y aplicación móvil nativa.

---

## Roles de usuario

| Rol | Accede a |
|-----|----------|
| **Recepción** | Gestión operativa: clientes, mascotas, turnos, horarios de atención y reportes. Ve la información clínica, pero no la modifica. |
| **Veterinario** | Todo lo operativo **más** la carga de la información clínica (historia clínica y vacunas). Es el rol más completo. |
| **Cliente** (dueño/a) | Sus mascotas, solicitud y cancelación de sus turnos, y consulta de la historia clínica y las vacunas de sus mascotas. |

### Matriz de permisos

Resumen del nivel de acceso de cada rol por módulo. Todos los roles inician
sesión; "—" indica que el rol no tiene acceso a ese módulo.

| Módulo | Recepción | Veterinario | Cliente |
|--------|-----------|-------------|---------|
| Clientes | Crear / editar | Crear / editar | Solo sus datos |
| Mascotas | Crear / editar | Crear / editar | Solo las suyas |
| Disponibilidad (horarios) | Configurar | Configurar | — |
| Turnos | Confirmar / cancelar / atender | Confirmar / cancelar / atender | Solicitar y cancelar los suyos |
| Historia clínica | Solo lectura | Crear / editar | Ver (sus mascotas) |
| Imágenes (en la historia clínica) | Ver | Adjuntar | Ver |
| Vacunas | Ver | Ver / registrar | Ver |
| Reportes | Ver | Ver | — |
| Personal | Solo lectura | Solo lectura | — |

> Las cuentas del personal se cargan manualmente en esta etapa. Las contraseñas se almacenan como hash (bcrypt), nunca en texto plano.

---

## Características principales

- **Autenticación y roles:** acceso diferenciado para Recepción, Veterinario y Cliente.
- **Clientes y mascotas:** un cliente puede registrar y seleccionar varias mascotas.
- **Disponibilidad configurable:** el personal define los horarios y el sistema genera las franjas de turno automáticamente.
- **Gestión de turnos:** ciclo de vida completo (solicitado → confirmado → atendido / cancelado), con una franja = un turno.
> La agenda del MVP es **general para la veterinaria**: el cliente no selecciona un
veterinario al solicitar un turno. El profesional que realiza la atención se registra posteriormente en la historia clínica. 
- **Historia clínica:** registro de cada atención, con imágenes adjuntas.
- **Vacunas:** listado por mascota con tipo, fecha de aplicación, veterinario y observaciones. La próxima fecha se calcula según el intervalo definido en el tipo de vacuna, y el estado se deriva de esa fecha.
- **Reportes:** consultas de apoyo a la gestión diaria.
- **Seguridad:** contraseñas con bcrypt, permisos por rol validados siempre en el backend, límite de intentos en login y registro, cabeceras de seguridad (helmet) y consultas SQL parametrizadas.

---

## Arquitectura

NexoVet utiliza una arquitectura **cliente-servidor de tres capas**:

- **Presentación:** una aplicación de página única (SPA) en React que corre en el navegador y se adapta a escritorio y celular.
- **Lógica de negocio:** una API REST en Node.js + Express que concentra las reglas del sistema y es el único componente que accede a los datos.
- **Datos:** una base de datos relacional MySQL.

Las imágenes de la historia clínica se alojan en un servicio externo (Cloudinary);
en la base solo se guarda la URL. El backend se organiza internamente en capas
(rutas, controladores, servicios, acceso a datos y middlewares).

La agenda es general (el turno no reserva veterinario) y la doble reserva de una
franja se previene con validación en el backend más una restricción única en la
base de datos.

El detalle completo está en el [documento de arquitectura](docs/2-arquitectura.md) y en el [informe final](docs/Informe_Final_NexoVet.pdf) (ver [Documentación](#documentación)).

---

## Tecnologías

- **Lenguaje principal:** JavaScript
- **Frontend:** React (desplegado en Vercel)
- **Backend:** Node.js + Express (desplegado en Render)
- **Base de datos:** MySQL (Aiven)
- **Almacenamiento de imágenes:** Cloudinary
- **Autenticación:** JWT (JSON Web Tokens)
- **Hash de contraseñas:** bcrypt
- **Control de versiones:** Git + GitHub

**Despliegue:** frontend en Vercel, backend en Render, base de datos MySQL en Aiven e
imágenes en Cloudinary, publicados automáticamente desde la rama `main` de este repositorio.

| Componente | Servicio | Qué aloja |
|------------|----------|-----------|
| **Frontend (React)** | Vercel | Aplicación web (SPA) servida al navegador del cliente y del personal. |
| **Backend (API REST)** | Render | API Node.js + Express con toda la lógica de negocio. |
| **Base de datos** | Aiven (MySQL) | Datos del sistema (usuarios, mascotas, turnos, historia clínica, etc.). |
| **Imágenes** | Cloudinary | Archivos de las imágenes de la historia clínica (en la base solo se guarda la URL). |

---

## Estructura del repositorio

```
NexoVet/
├── README.md
├── .gitignore
├── frontend/            Aplicación React (SPA)
├── backend/             API REST (Node.js + Express)
│   ├── src/             routes, controllers, services, models, middlewares
│   └── tests/           Pruebas automáticas (node:test)
├── database/            Esquema (schema.sql) y datos iniciales (seed.sql)
└── docs/                Documentación del proyecto
    ├── Informe_Final_NexoVet.pdf
    └── evidencia/       Resultado de la ejecución de las pruebas automáticas
```

---

## Documentación

La documentación se encuentra en la carpeta [`docs/`](docs/):

- [**Informe final (PDF)**](docs/Informe_Final_NexoVet.pdf) — descripción completa del sistema implementado, pruebas y resultados.
- [Propuesta de proyecto](docs/1-propuesta-de-proyecto.md) — 1.ª entrega.
- [Arquitectura del proyecto](docs/2-arquitectura.md)
- [Diseño de la base de datos](docs/3-diseno-base-de-datos.md) — diccionario de datos y convenciones.
- [Listado de módulos](docs/4-listado-de-modulos.md) — 2.ª entrega.
- [Diagrama entidad-relación](docs/diagrama-er.png)
- [Resultado de las pruebas automáticas](docs/evidencia/resultado-tests.txt)

Además, cada parte del código tiene su propio README: [backend](backend/README.md) (incluye la tabla de endpoints), [frontend](frontend/README.md) y [database](database/README.md).

> Los documentos de las entregas 1 y 2 reflejan el diseño original. Ante cualquier diferencia, el informe final describe el sistema tal como quedó implementado.

---

## Instalación y ejecución

**Prerrequisitos:** Node.js 18.11 o superior (se recomienda 20 o más), npm y una base de datos MySQL 8 (la del proyecto está en Aiven, que exige conexión SSL).

1. Clonar el repositorio
   ```bash
   git clone https://github.com/roangelelli/NexoVet.git
   cd NexoVet
   ```
2. **Base de datos:** ejecutar `database/schema.sql` y luego `database/seed.sql` (catálogos, horario de ejemplo y usuarios de prueba). Los comandos para Aiven están en [`database/README.md`](database/README.md).
3. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env     # completar los valores (ver abajo)
   npm run dev              # http://localhost:3000/api/health
   ```
4. **Frontend** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev              # http://localhost:5173
   ```
   Si el backend no corre en `http://localhost:3000`, crear `frontend/.env` con `VITE_API_URL=<url de la API>` (ver `frontend/.env.example`).

**Variables de entorno del backend** (archivo `backend/.env`, que **nunca se sube al repositorio**; la plantilla está en `backend/.env.example`):

| Variable | Para qué sirve |
|----------|----------------|
| `PORT` | Puerto de la API (por defecto 3000). |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a MySQL. |
| `DB_SSL_CA_PATH` o `DB_SSL_CA` | Certificado CA de Aiven: ruta al archivo (local) o su contenido (Render). |
| `JWT_SECRET` | Clave para firmar los tokens de sesión. |
| `CORS_ORIGIN` | Origen permitido del frontend, **sin barra final** (en local, `http://localhost:5173`). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Firma de la subida de imágenes. |

**Cuentas de prueba:** los usuarios de ejemplo (uno por rol) que crea `seed.sql` están descriptos en [`database/README.md`](database/README.md).

---

## Pruebas automáticas

El backend incluye pruebas automáticas con el ejecutor nativo de Node (`node:test`). Levantan la API real con modelos en memoria, por lo que **no necesitan base de datos ni variables de entorno**:

```bash
cd backend
npm test
```

Cubren autenticación y autorización por rol, ownership de recursos, el ciclo de vida de los turnos, la disponibilidad y la prevención de doble reserva, las validaciones, el estado de las vacunas y el límite de intentos de login. El resultado de la última ejecución está en [`docs/evidencia/resultado-tests.txt`](docs/evidencia/resultado-tests.txt) y se analiza en el capítulo 6 del informe.
