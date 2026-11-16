// Secciones del sistema y qué rol ve cada una. Las usan el menú lateral y la pantalla de inicio.
const TODOS = ['recepcion', 'veterinario', 'cliente']
const PERSONAL = ['recepcion', 'veterinario']

export const SECCIONES = [
  { ruta: '/', texto: 'Inicio', roles: TODOS, exacta: true },
  { ruta: '/turnos', texto: 'Turnos', roles: TODOS, descripcion: 'Pedí, confirmá o consultá turnos.' },
  { ruta: '/clientes', texto: 'Clientes', roles: PERSONAL, descripcion: 'Buscá clientes, editá sus datos y mirá sus mascotas.' },
  { ruta: '/mascotas', texto: 'Mascotas', roles: PERSONAL, descripcion: 'Buscá mascotas por nombre y mirá su historia clínica.' },
  { ruta: '/mascotas', texto: 'Mis mascotas', roles: ['cliente'], descripcion: 'Mirá y cargá a tus mascotas.' },
  { ruta: '/perfil', texto: 'Mi perfil', roles: ['cliente'], descripcion: 'Actualizá tu nombre y teléfono.' },
  { ruta: '/disponibilidad', texto: 'Disponibilidad', roles: ['recepcion'], descripcion: 'Configurá los horarios de atención y los días sin atención.' },
  { ruta: '/reportes', texto: 'Reportes', roles: PERSONAL, descripcion: 'Turnos del día y vacunas por vencer.' },
]
