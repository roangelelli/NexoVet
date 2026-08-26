# NexoVet — Sistema Integral de Gestión Veterinaria

Aplicación web para la gestión integral de una veterinaria que, además, ofrece a
los dueños de mascotas un canal de autogestión para solicitar turnos y consultar
la historia clínica de sus animales.

El sistema conecta dos perfiles de uso sobre una misma base de datos y una misma
API: el **personal de la veterinaria** (gestión interna) y el **cliente**
(acceso desde el navegador del celular, sin instalar nada).

---

## Descripción

Muchas veterinarias gestionan turnos e historias clínicas de forma manual, con
agendas de papel o planillas. NexoVet digitaliza esa operación y, al mismo
tiempo, le da al dueño de la mascota una vía cómoda para pedir turnos y acceder a
la información médica de su animal, que hoy suele quedar inaccesible dentro de la
veterinaria.

---

## Características principales

- **Autenticación y roles:** acceso diferenciado para personal y clientes.
- **Clientes y mascotas:** un cliente puede registrar y seleccionar varias mascotas.
- **Disponibilidad configurable:** el personal define los horarios de atención y el sistema genera automáticamente las franjas de turno.
- **Gestión de turnos:** ciclo de vida completo (solicitado → confirmado → atendido / cancelado).
- **Historia clínica:** registro de cada atención, con imágenes adjuntas (radiografías, fotografías).
- **Carnet de vacunas:** aplicaciones registradas y cálculo de la próxima fecha.
- **Reportes:** consultas de apoyo a la gestión diaria.

---

## Roles de usuario

| Rol | Accede a |
|-----|----------|
| **Personal** (recepción / veterinario) | Panel de gestión: disponibilidad, turnos, clientes, mascotas, historias clínicas, vacunas y reportes. |
| **Cliente** (dueño/a) | Sus mascotas, solicitud y cancelación de turnos, historia clínica y carnet de vacunas. |

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
nexovet/
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
   git clone https://github.com/roangelelli/nexovet.git
   cd nexovet
   ```
2. Instalar dependencias en `frontend/` y `backend/`.
3. Configurar las variables de entorno.
4. Levantar el backend y el frontend.

---

## Estado del proyecto

Trabajo Final Integrador en desarrollo. Instancias de entrega:

- [x] Conformación del equipo y elección de tutora
- [ ] 1.ª Entrega — Propuesta y repositorio (30/08)
- [ ] 2.ª Entrega — Esquema de base de datos y módulos (27/09)
- [ ] Entrega Final — Código, despliegue, informe y video (14/11)
- [ ] Defensa oral

---

## Integrantes

- Angelelli, Rodrigo Martín
- Schneider, Astrid

## Tutora

- María Candela Grosso

---

## Contexto académico

- **Materia:** Trabajo Final Integrador (TFI)
- **Carrera:** Tecnicatura Universitaria en Programación a Distancia (TUPaD)
- **Universidad:** Universidad Tecnológica Nacional (UTN)
