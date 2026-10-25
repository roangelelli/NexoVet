# Listado de Módulos

**NexoVet — Sistema Integral de Gestión Veterinaria**
Trabajo Final Integrador (TFI) — UTN TUPaD · 2.ª Entrega (Diseño y Módulos)
Integrantes: Angelelli, Rodrigo Martín · Schneider, Astrid Elizabeth | Tutora: María Candela Grosso

---

El sistema se organiza en los siguientes módulos funcionales, clasificados por prioridad dentro del MVP. «Núcleo» indica que el módulo es indispensable para cumplir el objetivo; «Secundario» indica que aporta valor pero se desarrolla después del núcleo.

| Módulo | Prioridad | Descripción |
|---|---|---|
| Usuarios y roles | Núcleo | Inicio de sesión y control de acceso por rol (Recepción, Veterinario, Cliente). |
| Clientes | Núcleo | Alta, edición y listado de los dueños de las mascotas. |
| Mascotas | Núcleo | Alta, edición y selección de mascotas; un cliente puede tener varias. |
| Disponibilidad | Núcleo | Configuración del horario general de atención (agenda general) y cálculo de las franjas. |
| Turnos | Núcleo | Ciclo de vida del turno; franjas calculadas según la disponibilidad; una franja admite un único turno. |
| Historia clínica | Núcleo | Registro de cada atención vinculada a una mascota. |
| Imágenes en historia clínica | Secundario | Imágenes adjuntas a cada atención (URL en la base; archivo externo). |
| Vacunas | Secundario | Listado de vacunas por mascota, con fecha de aplicación y próxima fecha calculada. |
| Reportes | Secundario | Consultas de apoyo a la gestión (por ejemplo, turnos del día). |

## Detalle por módulo

### Usuarios y roles `[Núcleo]`

- Inicio y cierre de sesión.
- Control de acceso según el rol del usuario.
- Listado del personal en modo solo lectura.

### Clientes `[Núcleo]`

- Autorregistro del cliente y alta por parte del personal.
- Edición y listado de clientes.
- Ficha del cliente con sus mascotas asociadas.

### Mascotas `[Núcleo]`

- Alta y edición de mascotas asociadas a un dueño.
- Un cliente puede tener varias mascotas y seleccionarlas.
- Datos: especie, raza, sexo, fecha de nacimiento, microchip, color y esterilizado.

### Disponibilidad `[Núcleo]`

- Configuración de los días y horarios de atención.
- Definición de la duración del turno.
- Registro de días bloqueados (feriados, cierres).
- Cálculo automático de las franjas de turno libres.
- La agenda es general para la veterinaria: el cliente no selecciona un veterinario al solicitar un turno.

### Turnos `[Núcleo]`

- Solicitud de turno por el cliente en una franja libre.
- Confirmación y cancelación por el personal.
- Cancelación de los propios turnos por el cliente.
- Marcado del turno como atendido.
- Estados: solicitado → confirmado → atendido / cancelado.
- Una franja admite un único turno: el backend valida que esté libre antes de crearlo y la base de datos lo garantiza con una restricción única, de modo que dos clientes no pueden reservar la misma franja al mismo tiempo.
- Un turno cancelado libera la franja.

### Historia clínica `[Núcleo]`

- Registro de cada atención: motivo, diagnóstico, tratamiento, peso y observaciones.
- Vinculación opcional al turno que la originó.
- El veterinario que realiza la atención se registra en la historia clínica, no en el turno.
- Consulta de la historia por el dueño de la mascota.

### Imágenes en historia clínica `[Secundario]`

- Adjuntar imágenes (radiografías, fotografías) a una atención.
- Visualización por el personal y por el dueño.
- Almacenamiento en servicio externo; en la base solo la URL.

### Vacunas `[Secundario]`

- Registro de las vacunas aplicadas a cada mascota.
- Cálculo automático de la próxima fecha a partir del intervalo definido en el tipo de vacuna.
- El estado (vigente / por vencer / vencida) se deriva de esa fecha.
- Consulta del historial de vacunas por el dueño.

### Reportes `[Secundario]`

- Consultas de apoyo a la gestión diaria, como los turnos del día.
