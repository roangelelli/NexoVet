import { useEffect } from 'react'
import { EnlaceBoton } from '../components/ui'
import { Perro } from '../components/Animales'

export default function NoEncontrada() {
  useEffect(() => {
    document.title = 'Página no encontrada · NexoVet'
  }, [])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <span className="grid size-32 place-items-center rounded-full bg-mar/10"><Perro className="size-24" /></span>
      <h1 className="font-display text-4xl font-semibold tracking-tight">No encontramos esa página</h1>
      <p className="text-tinta/70">Puede que el enlace esté mal escrito o que la pantalla ya no exista.</p>
      <EnlaceBoton to="/" icono="inicio">Volver al inicio</EnlaceBoton>
    </div>
  )
}
