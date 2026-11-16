import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SECCIONES } from '../secciones'
import Icono from './Icono'
import Marca from './Marca'

const NOMBRE_ROL = { recepcion: 'Recepción', veterinario: 'Veterinario/a', cliente: 'Cliente' }

function Avatar({ usuario }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mar/10 font-display font-semibold text-mar">
      {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
    </span>
  )
}

export default function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const secciones = SECCIONES.filter((s) => s.roles.includes(usuario.rol))

  const claseLink = ({ isActive }) =>
    `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-3 font-medium transition-colors md:py-2.5 ${
      isActive ? 'bg-mar text-white shadow-sm' : 'text-tinta/80 hover:bg-arena'
    }`

  const enlaces = (alElegir) =>
    secciones.map((s) => (
      <NavLink key={s.ruta + s.texto} to={s.ruta} end={s.exacta} className={claseLink} onClick={alElegir}>
        <Icono nombre={s.icono} />
        {s.texto}
      </NavLink>
    ))

  const botonSalir = (
    <button
      type="button"
      onClick={cerrarSesion}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-medium text-tinta/80 transition-colors hover:bg-arena md:py-2.5"
    >
      <Icono nombre="salir" />
      Cerrar sesión
    </button>
  )

  return (
    <div className="min-h-screen md:flex">
      {/* Celular: barra superior fija con menú desplegable */}
      <header className="sticky top-0 z-20 border-b border-arena bg-white md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <Marca />
          <button
            type="button"
            aria-expanded={menuAbierto}
            aria-controls="menu-celular"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="grid size-11 place-items-center rounded-lg border border-arena hover:bg-arena"
          >
            <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} className="size-6" />
          </button>
        </div>

        {menuAbierto && (
          <div id="menu-celular" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-arena px-3 pb-4">
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar usuario={usuario} />
              <div>
                <p className="font-semibold">{usuario.nombre} {usuario.apellido}</p>
                <p className="text-sm text-tinta/70">{NOMBRE_ROL[usuario.rol]}</p>
              </div>
            </div>
            <nav aria-label="Secciones" className="flex flex-col gap-1">{enlaces(() => setMenuAbierto(false))}</nav>
            <div className="mt-2 border-t border-arena pt-2">{botonSalir}</div>
          </div>
        )}
      </header>

      {/* Pantalla ancha: menú lateral que queda fijo al desplazar */}
      <aside className="hidden border-r border-arena bg-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="px-5 py-6"><Marca /></div>
        <nav aria-label="Secciones" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">{enlaces()}</nav>
        <div className="space-y-1 border-t border-arena p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar usuario={usuario} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{usuario.nombre} {usuario.apellido}</p>
              <p className="text-sm text-tinta/70">{NOMBRE_ROL[usuario.rol]}</p>
            </div>
          </div>
          {botonSalir}
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
