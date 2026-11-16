import { useEffect } from 'react'
import Marca from './Marca'
import Icono from './Icono'
import { Gato, Perro } from './Animales'

// Marco de las pantallas de acceso (login y registro): panel de marca a la izquierda y formulario a la derecha.
// En el celular el panel se oculta y queda solo el formulario con el logo arriba.
export default function PantallaAcceso({ titulo, ancho = 'max-w-sm', children }) {
  useEffect(() => {
    document.title = `${titulo} · NexoVet`
  }, [titulo])

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-mar-oscuro p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* Adornos de fondo */}
        <div aria-hidden="true" className="absolute -right-32 -top-32 size-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-12 -top-12 size-56 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-mar/40" />

        <Marca claro className="relative" />

        <div className="relative space-y-10">
          <div className="space-y-4">
            <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
              Turnos, vacunas e historia clínica en un solo lugar.
            </h2>
            <p className="max-w-md text-lg text-white/75">
              La clínica ordena su agenda y cada familia tiene a mano la salud de sus mascotas.
            </p>
          </div>

          <div className="relative h-64 max-w-md">
            <div className="entrada absolute left-0 top-0 flex w-64 items-center gap-3 rounded-2xl bg-white p-4 text-tinta shadow-xl" style={{ animationDelay: '150ms' }}>
              <span className="grid size-11 place-items-center rounded-xl bg-mar/10 text-mar"><Icono nombre="calendario-ok" className="size-6" /></span>
              <span>
                <span className="block text-sm text-tinta/70">Próximo turno</span>
                <span className="block font-semibold">Luna · Vacunación</span>
                <span className="block text-sm text-mar">Jueves 10:30 hs</span>
              </span>
            </div>

            <div className="entrada absolute left-20 top-24 flex w-64 items-center gap-3 rounded-2xl bg-white p-4 text-tinta shadow-xl" style={{ animationDelay: '350ms' }}>
              <span className="grid size-11 place-items-center rounded-xl bg-ok/15 text-ok"><Icono nombre="escudo" className="size-6" /></span>
              <span>
                <span className="block text-sm text-tinta/70">Carnet de vacunas</span>
                <span className="block font-semibold">Todo al día</span>
                <span className="block text-sm text-ok">Próxima dosis en 5 meses</span>
              </span>
            </div>

            <div className="entrada absolute bottom-0 right-0 flex -space-x-5" style={{ animationDelay: '550ms' }}>
              <span className="grid size-24 place-items-center rounded-full bg-white shadow-xl"><Gato className="size-20" /></span>
              <span className="grid size-24 place-items-center rounded-full bg-white shadow-xl"><Perro className="size-20" /></span>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/60">NexoVet · Sistema integral de gestión veterinaria</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center p-6 sm:p-10 lg:min-h-0">
        <div className={`w-full ${ancho}`}>
          <Marca className="mb-8 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  )
}
