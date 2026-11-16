import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useCarga } from '../hooks/useCarga'
import { Aviso, Cargando, EnlaceBoton, Vacio } from './ui'
import { fechaLegible } from '../utils'

// Lista de atenciones de una mascota, de la más reciente a la más antigua.
// Solo el veterinario puede registrar una atención nueva.
export default function HistoriaClinica({ mascotaId, puedeRegistrar }) {
  const { datos, cargando, error } = useCarga(() => api.get(`/atenciones?mascota_id=${mascotaId}`), [mascotaId])

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold">Historia clínica</h2>
        {puedeRegistrar && <EnlaceBoton to={`/mascotas/${mascotaId}/atenciones/nueva`}>Registrar atención</EnlaceBoton>}
      </div>

      <Aviso tipo="error">{error}</Aviso>
      {cargando && <Cargando />}
      {datos && datos.atenciones.length === 0 && <Vacio>Todavía no hay atenciones registradas.</Vacio>}
      {datos && datos.atenciones.length > 0 && (
        <ul className="divide-y divide-arena rounded-xl bg-white shadow-sm ring-1 ring-tinta/5">
          {datos.atenciones.map((a) => (
            <li key={a.id}>
              <Link to={`/atenciones/${a.id}`} className="block px-5 py-4 hover:bg-arena/60">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-mar">{a.motivo}</span>
                  <span className="text-tinta/70">{fechaLegible(a.fecha)} · {a.veterinario}</span>
                </span>
                {a.diagnostico && <span className="mt-1 block truncate text-tinta/70">Diagnóstico: {a.diagnostico}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
