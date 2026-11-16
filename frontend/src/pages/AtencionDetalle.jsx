import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Cargando, EnlaceBoton, Titulo } from '../components/ui'
import { fechaLegible } from '../utils'

function Bloque({ titulo, children }) {
  return (
    <div>
      <h2 className="text-sm text-tinta/70">{titulo}</h2>
      <p className="whitespace-pre-line font-medium">{children || '—'}</p>
    </div>
  )
}

export default function AtencionDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const { datos, cargando, error } = useCarga(() => api.get(`/atenciones/${id}`), [id])

  if (cargando) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>

  const a = datos.atencion

  return (
    <div className="max-w-3xl space-y-6">
      <Titulo accion={usuario.rol === 'veterinario' && <EnlaceBoton to={`/atenciones/${id}/editar`}>Editar</EnlaceBoton>}>
        Atención del {fechaLegible(a.fecha)}
      </Titulo>

      <div className="space-y-4 rounded-xl bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Bloque titulo="Mascota">{a.mascota}</Bloque>
          <Bloque titulo="Atendió">{a.veterinario}</Bloque>
          <Bloque titulo="Peso">{a.peso != null ? `${a.peso} kg` : null}</Bloque>
        </div>
        <Bloque titulo="Motivo">{a.motivo}</Bloque>
        <Bloque titulo="Diagnóstico">{a.diagnostico}</Bloque>
        <Bloque titulo="Tratamiento">{a.tratamiento}</Bloque>
        <Bloque titulo="Observaciones">{a.observaciones}</Bloque>
      </div>

      {a.imagenes.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Imágenes</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {a.imagenes.map((img) => (
              <li key={img.id} className="rounded-xl bg-white p-3">
                <a href={img.url} target="_blank" rel="noreferrer">
                  <img src={img.url} alt={img.descripcion || 'Imagen de la atención'} className="w-full rounded-lg" />
                </a>
                {img.descripcion && <p className="mt-2 text-tinta/70">{img.descripcion}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to={`/mascotas/${a.mascota_id}`} className="text-mar underline">Volver a la ficha de {a.mascota}</Link>
    </div>
  )
}
