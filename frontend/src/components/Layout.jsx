import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Boton } from './ui'

const PERSONAL = ['recepcion', 'veterinario']

// Cada rol ve solo las secciones que le corresponden
const SECCIONES = [
  { ruta: '/', texto: 'Inicio', roles: ['recepcion', 'veterinario', 'cliente'], exacta: true },
  { ruta: '/turnos', texto: 'Turnos', roles: ['recepcion', 'veterinario', 'cliente'] },
  { ruta: '/clientes', texto: 'Clientes', roles: PERSONAL },
  { ruta: '/mascotas', texto: 'Mis mascotas', roles: ['cliente'] },
  { ruta: '/disponibilidad', texto: 'Disponibilidad', roles: ['recepcion'] },
  { ruta: '/reportes', texto: 'Reportes', roles: PERSONAL },
]

const NOMBRE_ROL = { recepcion: 'Recepción', veterinario: 'Veterinario/a', cliente: 'Cliente' }

export default function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const secciones = SECCIONES.filter((s) => s.roles.includes(usuario.rol))

  const claseLink = ({ isActive }) =>
    `whitespace-nowrap rounded-lg px-3 py-2 font-medium ${isActive ? 'bg-mar text-white' : 'hover:bg-arena'}`

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-arena bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:py-6">
          <span className="font-display text-2xl font-bold text-mar">NexoVet</span>
          <div className="text-right text-sm md:mt-4 md:text-left">
            <p className="font-semibold">{usuario.nombre} {usuario.apellido}</p>
            <p className="text-tinta/70">{NOMBRE_ROL[usuario.rol]}</p>
          </div>
        </div>
        <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {secciones.map((s) => (
            <NavLink key={s.ruta} to={s.ruta} end={s.exacta} className={claseLink}>{s.texto}</NavLink>
          ))}
        </nav>
        <div className="hidden p-3 md:block">
          <Boton variante="secundario" className="w-full" onClick={cerrarSesion}>Cerrar sesión</Boton>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
          <div className="mt-10 md:hidden">
            <Boton variante="secundario" className="w-full" onClick={cerrarSesion}>Cerrar sesión</Boton>
          </div>
        </div>
      </main>
    </div>
  )
}
