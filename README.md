# NexoVet - Sistema Integral de Gestión Veterinaria

Aplicación web para la gestión integral de una veterinaria que, además, ofrece a
los dueños de mascotas un canal de autogestión para solicitar turnos y consultar
la historia clínica de sus animales.

El sistema conecta dos perfiles de uso sobre una misma base de datos y una misma
API: el **personal de la veterinaria** (gestión interna) y el **cliente**
(acceso desde el navegador del celular, sin instalar nada).

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

El **MVP**  es el conjunto de funcionalidades indispensables para cumplir el objetivo de punta a punta: que la veterinaria
digitalice su gestión y que el cliente pueda autogestionarse. Los módulos se
priorizan en tres niveles, de modo que si por algun contratiempo no se llega a desarrollar la totalidad del proyecto se sabe con
claridad desde dónde recortar sin comprometer el objetivo.

### Núcleo indispensable

Es el flujo mínimo completo y representa el corazón del sistema, el cual logra el objetivo inicial: 

1. El personal da de alta clientes y sus mascotas.
2. El personal configura la **disponibilidad** (días, franjas horarias y duración del turno).
3. El **cliente** solicita un turno eligiendo una de las franjas libres que el sistema calcula automáticamente.
4. **Recepción** confirma el turno.
5. El **Veterinario** atiende y registra la **historia clínica** de esa atención.

Módulos que lo componen: **Usuarios y roles, Clientes, Mascotas, Disponibilidad,
Turnos e Historia clínica**. Con esto, el objetivo del proyecto ya se cumple.

### Módulos secundarios (versión mínima)

Aportan valor, pero el sistema funciona sin ellos. Se desarrollan una vez
terminado el núcleo y son los primeros candidatos a recortar ante falta de
tiempo:

- **Vacunas:** listado por mascota con fechas de aplicación y renovación.
- **Imágenes en la historia clínica:** adjuntar fotos o radiografías a cada atención.
- **Reportes básicos:** consultas de apoyo, como los turnos del día.

### Fuera del alcance (mejoras futuras)

Se excluyen deliberadamente de esta versión para garantizar la viabilidad: pagos en línea, notificaciones y recordatorios automáticos,
reprogramación automática de turnos, mensajería o chat interno, asistentes con
inteligencia artificial, integración con controladores fiscales, disponibilidad
por profesional, gestión de cuentas del personal desde la app y aplicación móvil
nativa.

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

> Las cuentas del personal se cargan manualmente en esta etapa. Las contraseñas se almacenan cifradas (hash), nunca en texto plano.

---

## Características principales

- **Autenticación y roles:** acceso diferenciado para Recepción, Veterinario y Cliente.
- **Clientes y mascotas:** un cliente puede registrar y seleccionar varias mascotas.
- **Disponibilidad configurable:** el personal define los horarios y el sistema genera las franjas de turno automáticamente.
- **Gestión de turnos:** ciclo de vida completo (solicitado → confirmado → atendido / cancelado).
- **Historia clínica:** registro de cada atención, con imágenes adjuntas.
- **Vacunas:** listado por mascota con tipo, fecha de aplicación, fecha de renovación, veterinario y observaciones (el estado se calcula según las fechas).
- **Reportes:** consultas de apoyo a la gestión diaria.

---

## Tecnologías

- **Lenguaje principal:** JavaScript
- **Frontend:** React
- **Backend:** Node.js + Express
- **Base de datos:** MySQL *(a confirmar)*
- **Almacenamiento de imágenes:** *a confirmar*
- **Despliegue:** *a confirmar*
- **Control de versiones:** Git + GitHub

---

## Estructura del repositorio

```
NexoVet/
├── README.md          Documentación del proyecto
├── .gitignore
├── frontend/          Código de la interfaz (React)
├── backend/           Código de la API (Node.js + Express)
├── database/          Scripts SQL, esquema y migraciones
└── docs/              Informes, propuesta y esquemas de avance
```

---

## Instalación y ejecución

> Las instrucciones detalladas se completarán a medida que avance el desarrollo.

**Prerrequisitos previstos:** Node.js (versión a confirmar), npm y acceso a la
base de datos.

**Pasos generales:**

1. Clonar el repositorio
   ```bash
   git clone https://github.com/roangelelli/NexoVet.git
   cd NexoVet
   ```
2. Instalar dependencias en `frontend/` y `backend/`.
3. Configurar las variables de entorno.
4. Levantar el backend y el frontend.
