// Secciones del sistema y qué rol ve cada una. Las usan el menú lateral y la pantalla de inicio.
// "icono" es el nombre de un ícono de components/Icono.jsx.
const TODOS = ['recepcion', 'veterinario', 'cliente']
const PERSONAL = ['recepcion', 'veterinario']

export const SECCIONES = [
  { ruta: '/', texto: 'Inicio', icono: 'inicio', roles: TODOS, exacta: true },
  { ruta: '/turnos', texto: 'Turnos', icono: 'calendario', roles: TODOS, descripcion: 'Pedí, confirmá o consultá turnos.' },
  { ruta: '/clientes', texto: 'Clientes', icono: 'usuarios', roles: PERSONAL, descripcion: 'Buscá clientes, editá sus datos y mirá sus mascotas.' },
  { ruta: '/mascotas', texto: 'Mascotas', icono: 'huella', roles: PERSONAL, descripcion: 'Buscá mascotas por nombre y mirá su historia clínica.' },
  { ruta: '/mascotas', texto: 'Mis mascotas', icono: 'huella', roles: ['cliente'], descripcion: 'Mirá y cargá a tus mascotas.' },
  { ruta: '/perfil', texto: 'Mi perfil', icono: 'usuario', roles: ['cliente'], descripcion: 'Actualizá tu nombre y teléfono.' },
  { ruta: '/disponibilidad', texto: 'Disponibilidad', icono: 'reloj', roles: ['recepcion'], descripcion: 'Configurá los horarios de atención y los días sin atención.' },
  { ruta: '/reportes', texto: 'Reportes', icono: 'grafico', roles: PERSONAL, descripcion: 'Turnos del día y vacunas por vencer.' },
]
