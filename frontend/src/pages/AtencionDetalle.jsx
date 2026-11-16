import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import SubirImagen from '../components/SubirImagen'
import { Aviso, BotonConfirmar, Cargando, EnlaceBoton, Titulo } from '../components/ui'
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
  const { state } = useLocation()
  const { datos, cargando, error, recargar } = useCarga(() => api.get(`/atenciones/${id}`), [id])
  const [errorImagen, setErrorImagen] = useState('')

  if (cargando) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>

  const a = datos.atencion
  const esVeterinario = usuario.rol === 'veterinario'

  const quitarImagen = async (imagenId) => {
    setErrorImagen('')
    try {
      await api.delete(`/imagenes/${imagenId}`)
      recargar()
    } catch (err) {
      setErrorImagen(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <Titulo accion={usuario.rol === 'veterinario' && <EnlaceBoton to={`/atenciones/${id}/editar`}>Editar</EnlaceBoton>}>
        Atención del {fechaLegible(a.fecha)}
      </Titulo>

      <Aviso tipo="error">{state?.aviso}</Aviso>

      <div className="space-y-4 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Bloque titulo="Mascota">{a.mascota}</Bloque>
          <Bloque titulo="Atendió">{a.veterinario}</Bloque>
          <Bloque titulo="Peso">{a.peso != null ? `${a.peso} kg` : null}</Bloque>
        </div>
        <div className="grid grid-cols-1 gap-4 border-t border-arena pt-4 md:grid-cols-2">
          <Bloque titulo="Motivo">{a.motivo}</Bloque>
          <Bloque titulo="Diagnóstico">{a.diagnostico}</Bloque>
          <Bloque titulo="Tratamiento">{a.tratamiento}</Bloque>
          <Bloque titulo="Observaciones">{a.observaciones}</Bloque>
        </div>
      </div>

      {(a.imagenes.length > 0 || esVeterinario) && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Imágenes</h2>
          <Aviso tipo="error">{errorImagen}</Aviso>
          {a.imagenes.length > 0 && (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {a.imagenes.map((img) => (
                <li key={img.id} className="space-y-2 rounded-xl bg-white shadow-sm ring-1 ring-tinta/5 p-3">
                  <a href={img.url} target="_blank" rel="noreferrer">
                    <img src={img.url} alt={img.descripcion || 'Imagen de la atención'} className="w-full rounded-lg" />
                  </a>
                  {img.descripcion && <p className="text-tinta/70">{img.descripcion}</p>}
                  {esVeterinario && <BotonConfirmar texto="Quitar imagen" textoConfirmar="Sí, quitar" onConfirmar={() => quitarImagen(img.id)} />}
                </li>
              ))}
            </ul>
          )}
          {esVeterinario && <SubirImagen atencionId={id} onSubida={recargar} />}
        </section>
      )}

      <Link to={`/mascotas/${a.mascota_id}`} className="text-mar underline">Volver a la ficha de {a.mascota}</Link>
    </div>
  )
}
