import { useAuth } from '../context/AuthContext'
import { PanelCliente, PanelPersonal } from '../components/PanelesInicio'
import { Gato, Perro } from '../components/Animales'
import { EnlaceBoton } from '../components/ui'

const saludo = () => {
  const hora = new Date().getHours()
  if (hora < 6 || hora >= 20) return 'Buenas noches'
  return hora < 13 ? 'Buen día' : 'Buenas tardes'
}

const fechaDeHoy = () => {
  const texto = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Qué dice y qué ofrece la cabecera según el rol
const CABECERA = {
  cliente: {
    texto: 'Pedí turnos y mirá la salud de tus mascotas.',
    principal: { to: '/turnos/nuevo', texto: 'Pedir turno', icono: 'calendario' },
    secundario: { to: '/mascotas', texto: 'Mis mascotas', icono: 'huella' },
  },
  recepcion: {
    texto: 'Esto es lo que hay para hoy en la clínica.',
    principal: { to: '/turnos', texto: 'Ver agenda', icono: 'calendario' },
    secundario: { to: '/clientes/nuevo', texto: 'Nuevo cliente', icono: 'mas' },
  },
  veterinario: {
    texto: 'Tus próximos turnos y la atención espontánea, a un toque.',
    principal: { to: '/mascotas', texto: 'Atención espontánea', icono: 'estetoscopio' },
    secundario: { to: '/turnos', texto: 'Ver agenda', icono: 'calendario' },
  },
}

export default function Inicio() {
  const { usuario } = useAuth()
  const esCliente = usuario.rol === 'cliente'
  const cabecera = CABECERA[usuario.rol]

  return (
    <div className="space-y-8">
      <header
        className={`relative overflow-hidden rounded-2xl p-6 text-white md:p-8 ${
          esCliente ? 'entrada bg-gradient-to-br from-mar to-mar-oscuro' : 'bg-mar-oscuro'
        }`}
      >
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-24 right-24 size-56 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-white/70">{fechaDeHoy()}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{saludo()}, {usuario.nombre}</h1>
            <p className="max-w-md text-white/80">{cabecera.texto}</p>
            <div className="flex flex-wrap gap-3 pt-3">
              <EnlaceBoton to={cabecera.principal.to} variante="claro" icono={cabecera.principal.icono}>{cabecera.principal.texto}</EnlaceBoton>
              <EnlaceBoton to={cabecera.secundario.to} variante="fantasma" icono={cabecera.secundario.icono}>{cabecera.secundario.texto}</EnlaceBoton>
            </div>
          </div>

          {esCliente && (
            <div aria-hidden="true" className="hidden -space-x-4 sm:flex">
              <span className="grid size-24 place-items-center rounded-full bg-white shadow-lg"><Gato className="size-20" /></span>
              <span className="grid size-24 place-items-center rounded-full bg-white shadow-lg"><Perro className="size-20" /></span>
            </div>
          )}
        </div>
      </header>

      {esCliente && <PanelCliente />}
      {usuario.rol === 'recepcion' && <PanelPersonal esRecepcion />}
      {usuario.rol === 'veterinario' && <PanelPersonal />}
    </div>
  )
}
